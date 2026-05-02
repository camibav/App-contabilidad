import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addRecurringExpenseExclusion,
  clearRecurringExpenseExclusions,
  deleteRecurringExpenseExclusion,
  getRecurringExpenseExclusions,
  normalizeRecurringExpenseExclusions,
  saveRecurringExpenseExclusions,
} from "../recurring-expenses-storage.service.js";

const STORAGE_KEY = "nubank-dashboard-recurring-expense-exclusions";

describe("recurring-expenses-storage.service", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorageMock();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete globalThis.localStorage;
  });

  it("normaliza exclusiones descartando entradas inválidas y duplicadas", () => {
    const exclusions = normalizeRecurringExpenseExclusions([
      null,
      { key: "" },
      {
        key: "NETFLIX",
        description: "Netflix",
        category: "subscriptions",
        excludedAt: "2026-02-01T00:00:00.000Z",
      },
      {
        key: "NETFLIX",
        description: "Netflix actualizado",
        category: "entertainment",
        excludedAt: "2026-02-02T00:00:00.000Z",
      },
    ]);

    expect(exclusions).toEqual([
      {
        key: "NETFLIX",
        description: "Netflix actualizado",
        category: "entertainment",
        excludedAt: "2026-02-02T00:00:00.000Z",
      },
    ]);
  });

  it("guarda y recupera exclusiones recurrentes", () => {
    const savedExclusions = saveRecurringExpenseExclusions([
      {
        key: "NETFLIX",
        description: "Netflix",
        category: "subscriptions",
      },
    ]);

    expect(savedExclusions).toHaveLength(1);
    expect(getRecurringExpenseExclusions()).toEqual(savedExclusions);
  });

  it("agrega exclusiones recurrentes sin duplicarlas", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-05T12:00:00.000Z"));

    addRecurringExpenseExclusion({
      key: "NETFLIX",
      description: "Netflix",
      category: "subscriptions",
    });

    const result = addRecurringExpenseExclusion({
      key: "NETFLIX",
      description: "Netflix actualizado",
      category: "subscriptions",
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      key: "NETFLIX",
      description: "Netflix actualizado",
      category: "subscriptions",
      excludedAt: "2026-02-05T12:00:00.000Z",
    });
  });

  it("elimina exclusiones por clave", () => {
    saveRecurringExpenseExclusions([
      {
        key: "NETFLIX",
        description: "Netflix",
        category: "subscriptions",
      },
    ]);

    expect(deleteRecurringExpenseExclusion("NETFLIX")).toEqual([]);
    expect(getRecurringExpenseExclusions()).toEqual([]);
  });

  it("limpia datos corruptos y retorna arreglo vacío", () => {
    localStorage.setItem(STORAGE_KEY, "{json inválido");

    expect(getRecurringExpenseExclusions()).toEqual([]);
    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it("permite limpiar todas las exclusiones", () => {
    clearRecurringExpenseExclusions();

    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });
});

function createLocalStorageMock() {
  const store = new Map();

  return {
    getItem: vi.fn((key) => store.get(key) ?? null),
    setItem: vi.fn((key, value) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}
