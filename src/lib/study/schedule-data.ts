export const SCHEDULE_START = '2026-06-29';
export const CAT_EXAM_DATE = '2026-11-29';

export interface WeeklyTask {
  week: number;
  start: string;
  end: string;
  quant: string;
  dilr: string;
  varc: string;
}

export const WEEKLY_SCHEDULE: WeeklyTask[] = [
  {
    week: 1,
    start: '2026-06-29',
    end: '2026-07-05',
    quant: 'Percentages + Ratio & Proportion + Averages + Profit & Loss',
    dilr: 'Cubes + Linear Arrangements',
    varc: 'Science RCs'
  },
  {
    week: 2,
    start: '2026-07-06',
    end: '2026-07-12',
    quant: 'Mixtures + SI & CI + Time-Speed-Distance + Work, Time & Pipes',
    dilr: 'Circular Arrangements + Venn Diagrams',
    varc: 'Philosophy RCs'
  },
  {
    week: 3,
    start: '2026-07-13',
    end: '2026-07-19',
    quant: 'Full Arithmetic Revision + Sectionals',
    dilr: 'Games & Tournaments + Distribution Sets',
    varc: 'History + Tone-Based RCs'
  },
  {
    week: 4,
    start: '2026-07-20',
    end: '2026-07-26',
    quant: 'Base System + Divisibility + Remainders + LCM/HCF',
    dilr: 'Tables + Binary Logic',
    varc: 'Business RCs'
  },
  {
    week: 5,
    start: '2026-07-27',
    end: '2026-08-02',
    quant: 'Factors + Factorials + Surds & Indices',
    dilr: 'Caselets',
    varc: 'Critical Reasoning'
  },
  {
    week: 6,
    start: '2026-08-03',
    end: '2026-08-09',
    quant: 'Linear Equations + Functions & Graphs',
    dilr: 'Scheduling Sets',
    varc: 'Summary Questions'
  },
  {
    week: 7,
    start: '2026-08-10',
    end: '2026-08-16',
    quant: 'Quadratic Equations + Polynomials + Logarithms',
    dilr: 'Advanced Arrangements',
    varc: 'Main Idea + Author Tone'
  },
  {
    week: 8,
    start: '2026-08-17',
    end: '2026-08-23',
    quant: 'Inequalities + Modulus + Sequences + Maxima/Minima',
    dilr: 'Mixed Difficult Sets',
    varc: 'Inference Questions'
  },
  {
    week: 9,
    start: '2026-08-24',
    end: '2026-08-30',
    quant: 'Triangles (basics + advanced) + Circles',
    dilr: 'DI Sets',
    varc: 'Sociology RCs'
  },
  {
    week: 10,
    start: '2026-08-31',
    end: '2026-09-06',
    quant: 'Polygons + Quadrilaterals + Trigonometry',
    dilr: 'DI + Logic Combos',
    varc: 'Para Completion'
  },
  {
    week: 11,
    start: '2026-09-07',
    end: '2026-09-13',
    quant: 'Mensuration + Coordinate Geometry',
    dilr: 'Hard Arrangement Sets',
    varc: 'Dense RCs'
  },
  {
    week: 12,
    start: '2026-09-14',
    end: '2026-09-20',
    quant: 'Permutation & Combination + Probability + Set Theory',
    dilr: 'Set Selection',
    varc: 'Long RCs'
  },
  {
    week: 13,
    start: '2026-09-21',
    end: '2026-09-27',
    quant: 'Full Quant Revision Round 1',
    dilr: 'Previous CAT Sets',
    varc: 'RC Accuracy Drills'
  },
  {
    week: 14,
    start: '2026-09-28',
    end: '2026-10-04',
    quant: 'Sectional Tests + Weak-Area Repair',
    dilr: 'DI Heavy Sets',
    varc: 'VA Drills (PJ, Para Summary, Odd-One-Out)'
  },
  {
    week: 15,
    start: '2026-10-05',
    end: '2026-10-11',
    quant: 'Mocks 1–2 + Deep Analysis',
    dilr: 'Timed Set Solving',
    varc: 'Mixed RCs'
  },
  {
    week: 16,
    start: '2026-10-12',
    end: '2026-10-18',
    quant: 'Mocks 3–4 + Analysis',
    dilr: 'Previous CAT Sets',
    varc: 'Mixed VA'
  },
  {
    week: 17,
    start: '2026-10-19',
    end: '2026-10-25',
    quant: 'Mocks 5–6 + Analysis',
    dilr: 'Sectionals',
    varc: 'Weak-Area RC Repair'
  },
  {
    week: 18,
    start: '2026-10-26',
    end: '2026-11-01',
    quant: 'Mocks 7–8 + Analysis',
    dilr: 'High Difficulty Sets',
    varc: 'Accuracy Building'
  },
  {
    week: 19,
    start: '2026-11-02',
    end: '2026-11-08',
    quant: 'Mocks 9–10 + Analysis',
    dilr: 'Set Selection',
    varc: 'RC Speed Drills'
  },
  {
    week: 20,
    start: '2026-11-09',
    end: '2026-11-15',
    quant: 'Mocks 11–12 + Analysis',
    dilr: 'Timed Solving',
    varc: 'Final VA'
  },
  {
    week: 21,
    start: '2026-11-16',
    end: '2026-11-22',
    quant: 'Speed Optimization + Final Quant Review',
    dilr: 'Set-Selection Drills',
    varc: 'RC Accuracy'
  },
  {
    week: 22,
    start: '2026-11-23',
    end: '2026-11-29',
    quant: 'Light revision + Error book review + Rest',
    dilr: 'Light sets, set-pick practice',
    varc: 'Light RCs, no new content'
  }
];

export const QUANT_TOPIC_MAP: Record<string, string> = {
  'Percentages + Ratio & Proportion + Averages + Profit & Loss': 'Arithmetic',
  'Mixtures + SI & CI + Time-Speed-Distance + Work, Time & Pipes': 'Arithmetic',
  'Full Arithmetic Revision + Sectionals': 'Arithmetic',
  'Base System + Divisibility + Remainders + LCM/HCF': 'Number System',
  'Factors + Factorials + Surds & Indices': 'Number System',
  'Linear Equations + Functions & Graphs': 'Algebra',
  'Quadratic Equations + Polynomials + Logarithms': 'Algebra',
  'Inequalities + Modulus + Sequences + Maxima/Minima': 'Algebra',
  'Triangles (basics + advanced) + Circles': 'Geometry',
  'Polygons + Quadrilaterals + Trigonometry': 'Geometry',
  'Mensuration + Coordinate Geometry': 'Geometry',
  'Permutation & Combination + Probability + Set Theory': 'Modern Math',
  'Full Quant Revision Round 1': 'Arithmetic',
  'Sectional Tests + Weak-Area Repair': 'Algebra',
  'Mocks 1–2 + Deep Analysis': 'Modern Math',
  'Mocks 3–4 + Analysis': 'Arithmetic',
  'Mocks 5–6 + Analysis': 'Algebra',
  'Mocks 7–8 + Analysis': 'Number System',
  'Mocks 9–10 + Analysis': 'Geometry',
  'Mocks 11–12 + Analysis': 'Modern Math',
  'Speed Optimization + Final Quant Review': 'Arithmetic',
  'Light revision + Error book review + Rest': 'Algebra'
};
