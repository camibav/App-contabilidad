import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLearnedCategoryRules,
  deleteLearnedCategoryRule,
  getLearnedCategoryRules,
  saveLearnedCategoryRules,
} from "../category-rules-storage.service.js";

const STORAGE_KEY = "nubank-dashboard-learned-category-rules";

describe("category-rules-storage.service", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorageMock();
  });

  afterEach(() => {
    delete globalThis.localStorage;
  });

  it("guarda y recupera reglas aprendidas normalizadas", () => {
    const savedRules = saveLearnedCategoryRules([
      {
        pattern: "NETFLIX",
        category: "subscriptions",
        type: "expense",
      },
    ]);

    expect(savedRules).toHaveLength(1);
    expect(savedRules[0]).toMatchObject({
      id: "expense-netflix",
      pattern: "NETFLIX",
      category: "subscriptions",
      type: "expense",
    });
    expect(getLearnedCategoryRules()).toEqual(savedRules);
  });

  it("elimina una regla aprendida por id", () => {
    const [rule] = saveLearnedCategoryRules([
      {
        pattern: "NETFLIX",
        category: "subscriptions",
        type: "expense",
      },
    ]);

    const result = deleteLearnedCategoryRule(rule.id);

    expect(result).toEqual([]);
    expect(getLearnedCategoryRules()).toEqual([]);
  });

  it("retorna las reglas actuales cuando el id a eliminar es inválido", () => {
    const savedRules = saveLearnedCategoryRules([
      {
        pattern: "NETFLIX",
        category: "subscriptions",
        type: "expense",
      },
    ]);

    expect(deleteLearnedCategoryRule("   ")).toEqual(savedRules);
  });

  it("limpia reglas corruptas y retorna arreglo vacío", () => {
    localStorage.setItem(STORAGE_KEY, "{json inválido");

    expect(getLearnedCategoryRules()).toEqual([]);
    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it("permite limpiar todas las reglas aprendidas", () => {
    clearLearnedCategoryRules();

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
