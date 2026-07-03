"use client";

// Auto-migration service from version 1 standalone trackers to Atlas
export interface MigrationResult {
  migrated: boolean;
  studyData?: {
    mocks: any[];
    errors: any[];
    quantByTopic: any;
    dilrByCategory: any;
    varc: any;
  };
  financeData?: {
    accounts: any[];
    transactions: any[];
    budgets: any[];
    investments: any[];
    recurring: any[];
    savingsBuckets: any[];
  };
}

export function checkAndRunMigration(): MigrationResult {
  if (typeof window === "undefined") return { migrated: false };

  const migrationFlagKey = "atlas.migration_completed";
  const isMigrated = localStorage.getItem(migrationFlagKey) === "true";
  if (isMigrated) {
    return { migrated: false };
  }

  const legacyCatKey = "cat2026.v1";
  const legacyFinanceKey = "finance-tracker:v1";

  const catRaw = localStorage.getItem(legacyCatKey);
  const financeRaw = localStorage.getItem(legacyFinanceKey);

  let studyData: any = null;
  let financeData: any = null;
  let hasMigrated = false;

  // 1. Migrate CAT 2026 Tracker Data
  if (catRaw) {
    try {
      const catParsed = JSON.parse(catRaw);
      studyData = {
        mocks: catParsed.mocks || [],
        errors: catParsed.errors || [],
        quantByTopic: catParsed.quantByTopic || {
          'Arithmetic':    { solved: 0, correct: 0 },
          'Algebra':       { solved: 0, correct: 0 },
          'Number System': { solved: 0, correct: 0 },
          'Geometry':      { solved: 0, correct: 0 },
          'Modern Math':   { solved: 0, correct: 0 }
        },
        dilrByCategory: catParsed.dilrByCategory || {
          'Arrangements': { sets: 0, correct: 0 },
          'Games & Tournaments': { sets: 0, correct: 0 },
          'Data Interpretation': { sets: 0, correct: 0 },
          'Binary Logic': { sets: 0, correct: 0 },
          'Venn Diagrams': { sets: 0, correct: 0 },
          'Mixed Sets': { sets: 0, correct: 0 }
        },
        varc: catParsed.varc || { rcCount: 0, vaCount: 0, readingHabitDays: 0 }
      };

      // Save under new Atlas keys
      localStorage.setItem("atlas.study.mocks", JSON.stringify(studyData.mocks));
      localStorage.setItem("atlas.study.errors", JSON.stringify(studyData.errors));
      localStorage.setItem("atlas.study.quant", JSON.stringify(studyData.quantByTopic));
      localStorage.setItem("atlas.study.dilr", JSON.stringify(studyData.dilrByCategory));
      localStorage.setItem("atlas.study.varc", JSON.stringify(studyData.varc));
      hasMigrated = true;
    } catch (e) {
      console.error("Error migrating CAT Tracker data:", e);
    }
  }

  // 2. Migrate Finance Tracker Data
  if (financeRaw) {
    try {
      const finParsed = JSON.parse(financeRaw);
      financeData = {
        accounts: finParsed.accounts || [],
        transactions: finParsed.transactions || [],
        budgets: finParsed.budgets || [],
        investments: finParsed.investments || [],
        recurring: finParsed.recurring || [],
        savingsBuckets: finParsed.savingsBuckets || []
      };

      // Save under new Atlas keys
      localStorage.setItem("atlas.finance.accounts", JSON.stringify(financeData.accounts));
      localStorage.setItem("atlas.finance.transactions", JSON.stringify(financeData.transactions));
      localStorage.setItem("atlas.finance.budgets", JSON.stringify(financeData.budgets));
      localStorage.setItem("atlas.finance.investments", JSON.stringify(financeData.investments));
      localStorage.setItem("atlas.finance.recurring", JSON.stringify(financeData.recurring));
      localStorage.setItem("atlas.finance.savingsBuckets", JSON.stringify(financeData.savingsBuckets));
      hasMigrated = true;
    } catch (e) {
      console.error("Error migrating Finance Tracker data:", e);
    }
  }

  if (hasMigrated) {
    localStorage.setItem(migrationFlagKey, "true");
    return {
      migrated: true,
      studyData,
      financeData
    };
  }

  return { migrated: false };
}
