"use client";

export interface WeightLog {
  date: string;
  weight: number;
}

export interface PredictionResult {
  currentBmi: number;
  bmiCategory: string;
  weeklyRateKg: number; // e.g. -0.5 (losing 0.5kg/week)
  targetWeeksRemaining: number | null;
  predictedDate: string | null;
  statusMessage: string;
}

const HEIGHT_METERS = 1.905; // 190.5 cm

export function calculateBmi(weightKg: number): { bmi: number; category: string } {
  const bmi = weightKg / (HEIGHT_METERS * HEIGHT_METERS);
  const roundedBmi = parseFloat(bmi.toFixed(1));

  let category = "Normal";
  if (roundedBmi < 18.5) category = "Underweight";
  else if (roundedBmi < 25) category = "Normal weight";
  else if (roundedBmi < 30) category = "Overweight";
  else category = "Obese";

  return { bmi: roundedBmi, category };
}

export function generateWeightPrediction(
  logs: WeightLog[],
  targetWeight: number = 86.0
): PredictionResult {
  const latestLog = logs[0]; // assuming sorted newest first
  if (!latestLog) {
    return {
      currentBmi: 0,
      bmiCategory: "N/A",
      weeklyRateKg: 0,
      targetWeeksRemaining: null,
      predictedDate: null,
      statusMessage: "Log weight entries to enable goal forecast."
    };
  }

  const { bmi, category } = calculateBmi(latestLog.weight);

  if (logs.length < 2) {
    return {
      currentBmi: bmi,
      bmiCategory: category,
      weeklyRateKg: 0,
      targetWeeksRemaining: null,
      predictedDate: null,
      statusMessage: "Log at least 2 weight entries over separate days to analyze rate of change."
    };
  }

  // Linear Regression: y = mx + c
  // x = days elapsed since the oldest log
  // y = weight in kg
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDateTime = new Date(sortedLogs[0].date).getTime();

  const dataPoints = sortedLogs.map(log => {
    const elapsedDays = (new Date(log.date).getTime() - firstDateTime) / (1000 * 60 * 60 * 24);
    return { x: elapsedDays, y: log.weight };
  });

  const n = dataPoints.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += dataPoints[i].x;
    sumY += dataPoints[i].y;
    sumXY += dataPoints[i].x * dataPoints[i].y;
    sumXX += dataPoints[i].x * dataPoints[i].x;
  }

  // Slope: m = (n*sumXY - sumX*sumY) / (n*sumXX - sumX^2)
  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0; // kg/day

  const weeklyRate = parseFloat((slope * 7).toFixed(2));
  
  if (slope >= 0) {
    return {
      currentBmi: bmi,
      bmiCategory: category,
      weeklyRateKg: weeklyRate,
      targetWeeksRemaining: null,
      predictedDate: null,
      statusMessage: "Weight trend is currently stable or increasing. Maintain calorie deficit of 500kcal/day to trigger weight reduction forecasting."
    };
  }

  // Weight is decreasing: slope is negative
  // Days to reach target = (target - current) / slope
  const currentWeight = latestLog.weight;
  const distanceToTarget = targetWeight - currentWeight; // negative number since target < current
  const daysRequired = distanceToTarget / slope; // negative / negative = positive days

  const weeksRemaining = parseFloat((daysRequired / 7).toFixed(1));
  const targetDateObj = new Date();
  targetDateObj.setTime(targetDateObj.getTime() + daysRequired * 24 * 60 * 60 * 1000);

  const predictedDateStr = targetDateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  return {
    currentBmi: bmi,
    bmiCategory: category,
    weeklyRateKg: weeklyRate,
    targetWeeksRemaining: weeksRemaining,
    predictedDate: predictedDateStr,
    statusMessage: `Based on your recent trend, you are shedding weight at a rate of ${Math.abs(weeklyRate)}kg/week. Hitting your 86kg goal is forecast for ${predictedDateStr} (~${weeksRemaining} weeks).`
  };
}
