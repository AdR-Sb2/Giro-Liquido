export const QUICK_FUEL_VALUES_KEY = "giro_liquido_quick_fuel_values";
export const QUICK_EARNING_VALUES_KEY = "giro_liquido_quick_earning_values";

const defaultFuelValues = [10, 15, 20, 30, 50];
const defaultEarningValues = [5, 10, 15, 20, 30];

export function getStoredQuickValues(storageKey: string, fallback: number[]) {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw) as number[];
    const filtered = parsed.filter((value) => Number.isFinite(value) && value > 0).map((value) => Number(value));
    return filtered.length > 0 ? filtered : fallback;
  } catch {
    return fallback;
  }
}

export function persistQuickValues(storageKey: string, values: number[]) {
  if (typeof window === "undefined") {
    return;
  }

  const sanitized = [...new Set(values.filter((value) => Number.isFinite(value) && value > 0).map((value) => Number(value)))];
  window.localStorage.setItem(storageKey, JSON.stringify(sanitized));
}

export function getDefaultFuelValues() {
  return [...defaultFuelValues];
}

export function getDefaultEarningValues() {
  return [...defaultEarningValues];
}
