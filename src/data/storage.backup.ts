import type { Speculation } from "./mockData";
import type { Expense } from "./expenseData";
import type { Sale } from "./saleData";
import type { AppSettings } from "./settingsData";

import {
  defaultSettings,
} from "./settingsData";

const SPECULATIONS_STORAGE_KEY =
  "mon-champ-speculations";

const EXPENSES_STORAGE_KEY =
  "mon-champ-expenses";

const SALES_STORAGE_KEY =
  "mon-champ-sales";

const SETTINGS_STORAGE_KEY =
  "mon-champ-settings";

/* =========================
   SPÉCULATIONS
========================= */

export function getSavedSpeculations(): Speculation[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem(
    SPECULATIONS_STORAGE_KEY
  );

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveSpeculation(
  speculation: Speculation
) {
  const current =
    getSavedSpeculations();

  const normalizedSpeculation = {
    ...speculation,
    id: Number(speculation.id),
  };

  const withoutDuplicate =
    current.filter(
      (item) =>
        Number(item.id) !==
        normalizedSpeculation.id
    );

  const updated = [
    ...withoutDuplicate,
    normalizedSpeculation,
  ];

  localStorage.setItem(
    SPECULATIONS_STORAGE_KEY,
    JSON.stringify(updated)
  );
}
/*
  Cette fonction permet de modifier
  une spéculation créée par l'utilisateur
  MAIS AUSSI une spéculation provenant
  de mockData.ts.

  Si elle n'existe pas encore dans
  localStorage, on la crée comme
  version personnalisée.
*/
export function updateSpeculation(
  updatedSpeculation: Speculation
) {
  const current =
    getSavedSpeculations();

  const exists = current.some(
    (speculation) =>
      speculation.id ===
      updatedSpeculation.id
  );

  const updated = exists
    ? current.map(
        (speculation) =>
          speculation.id ===
          updatedSpeculation.id
            ? updatedSpeculation
            : speculation
      )
    : [
        ...current,
        updatedSpeculation,
      ];

  localStorage.setItem(
    SPECULATIONS_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

/*
  Fusion entre :
  - les spéculations par défaut
  - les versions sauvegardées

  Si le même ID existe dans localStorage,
  la version sauvegardée prend priorité.
*/
export function mergeSpeculations(
  defaultSpeculations: Speculation[],
  savedSpeculations: Speculation[]
): Speculation[] {
  /*
    On utilise une Map pour garantir
    UN SEUL élément par ID.
  */
  const mergedMap = new Map<
    number,
    Speculation
  >();

  /*
    1. Ajouter les spéculations par défaut
  */
  defaultSpeculations.forEach(
    (speculation) => {
      mergedMap.set(
        Number(speculation.id),
        {
          ...speculation,
          id: Number(speculation.id),
        }
      );
    }
  );

  /*
    2. Ajouter les versions sauvegardées.

    Elles remplacent automatiquement
    les versions par défaut ayant
    le même ID.
  */
  savedSpeculations.forEach(
    (speculation) => {
      const normalizedId =
        Number(speculation.id);

      mergedMap.set(
        normalizedId,
        {
          ...speculation,
          id: normalizedId,
        }
      );
    }
  );

  /*
    La Map garantit qu'il n'existe
    qu'une seule spéculation par ID.
  */
  return Array.from(
    mergedMap.values()
  );
}

export function deleteSavedSpeculation(
  id: number
) {
  const current =
    getSavedSpeculations();

  const updated = current.filter(
    (item) => item.id !== id
  );

  localStorage.setItem(
    SPECULATIONS_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

/*
  Suppression complète :
  - spéculation
  - dépenses liées
  - ventes liées
*/
export function deleteSpeculationCompletely(
  speculationId: number
) {
  if (typeof window === "undefined") {
    return;
  }

  const speculations =
    getSavedSpeculations();

  const updatedSpeculations =
    speculations.filter(
      (item) =>
        item.id !== speculationId
    );

  localStorage.setItem(
    SPECULATIONS_STORAGE_KEY,
    JSON.stringify(
      updatedSpeculations
    )
  );

  const expenses =
    getSavedExpenses();

  const updatedExpenses =
    expenses.filter(
      (expense) =>
        expense.speculationId !==
        speculationId
    );

  localStorage.setItem(
    EXPENSES_STORAGE_KEY,
    JSON.stringify(
      updatedExpenses
    )
  );

  const sales =
    getSavedSales();

  const updatedSales =
    sales.filter(
      (sale) =>
        sale.speculationId !==
        speculationId
    );

  localStorage.setItem(
    SALES_STORAGE_KEY,
    JSON.stringify(
      updatedSales
    )
  );
}

/* =========================
   DÉPENSES
========================= */

export function getSavedExpenses(): Expense[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem(
    EXPENSES_STORAGE_KEY
  );

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveExpense(
  expense: Expense
) {
  const current =
    getSavedExpenses();

  const updated = [
    ...current,
    expense,
  ];

  localStorage.setItem(
    EXPENSES_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

export function updateExpense(
  updatedExpense: Expense
) {
  const current =
    getSavedExpenses();

  const updated = current.map(
    (expense) =>
      expense.id ===
      updatedExpense.id
        ? updatedExpense
        : expense
  );

  localStorage.setItem(
    EXPENSES_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

export function deleteSavedExpense(
  id: number
) {
  const current =
    getSavedExpenses();

  const updated = current.filter(
    (item) => item.id !== id
  );

  localStorage.setItem(
    EXPENSES_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

/* =========================
   VENTES
========================= */

export function getSavedSales(): Sale[] {
  if (typeof window === "undefined") {
    return [];
  }

  const saved = localStorage.getItem(
    SALES_STORAGE_KEY
  );

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveSale(
  sale: Sale
) {
  const current =
    getSavedSales();

  const updated = [
    ...current,
    sale,
  ];

  localStorage.setItem(
    SALES_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

export function updateSale(
  updatedSale: Sale
) {
  const current =
    getSavedSales();

  const updated = current.map(
    (sale) =>
      sale.id ===
      updatedSale.id
        ? updatedSale
        : sale
  );

  localStorage.setItem(
    SALES_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

export function deleteSavedSale(
  id: number
) {
  const current =
    getSavedSales();

  const updated = current.filter(
    (item) => item.id !== id
  );

  localStorage.setItem(
    SALES_STORAGE_KEY,
    JSON.stringify(updated)
  );
}

/* =========================
   PARAMÈTRES
========================= */

export function getSettings(): AppSettings {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  const saved = localStorage.getItem(
    SETTINGS_STORAGE_KEY
  );

  if (!saved) {
    return defaultSettings;
  }

  try {
    return {
      ...defaultSettings,
      ...JSON.parse(saved),
    };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(
  settings: AppSettings
) {
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(settings)
  );
}