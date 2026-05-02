import { describe, expect, it, vi } from "vitest";
import {
  buildLearnedCategoryRule,
  canLearnCategoryRule,
  inferCategoryFromLearnedRules,
  normalizeLearnedCategoryRules,
  upsertLearnedCategoryRule,
} from "../category-learning.js";

describe("category-learning", () => {
  it("construye una regla aprendida desde un movimiento de gasto", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-05T12:00:00.000Z"));

    const rule = buildLearnedCategoryRule(
      {
        description: "Enviaste a Netflix",
        rawLine: "05 feb Enviaste a Netflix - $ 32.000",
        type: "expense",
      },
      "subscriptions"
    );

    expect(rule).toMatchObject({
      id: "expense-netflix",
      pattern: "NETFLIX",
      category: "subscriptions",
      type: "expense",
      source: "manual-learning",
      createdAt: "2026-02-05T12:00:00.000Z",
      updatedAt: "2026-02-05T12:00:00.000Z",
    });

    vi.useRealTimers();
  });

  it("no permite aprender reglas para la categoría sin clasificar", () => {
    expect(canLearnCategoryRule("uncategorized")).toBe(false);
    expect(
      buildLearnedCategoryRule(
        {
          description: "Netflix",
          type: "expense",
        },
        "uncategorized"
      )
    ).toBeNull();
  });

  it("inserta y actualiza reglas sin duplicarlas", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-05T12:00:00.000Z"));

    const initialRule = buildLearnedCategoryRule(
      {
        description: "Netflix",
        type: "expense",
      },
      "subscriptions"
    );

    const createdRules = upsertLearnedCategoryRule([], initialRule);

    vi.setSystemTime(new Date("2026-02-06T12:00:00.000Z"));

    const incomingRule = {
      ...initialRule,
      category: "entertainment",
    };

    const updatedRules = upsertLearnedCategoryRule(createdRules, incomingRule);

    expect(updatedRules).toHaveLength(1);
    expect(updatedRules[0]).toMatchObject({
      id: "expense-netflix",
      pattern: "NETFLIX",
      category: "entertainment",
      createdAt: "2026-02-05T12:00:00.000Z",
      updatedAt: "2026-02-06T12:00:00.000Z",
    });

    vi.useRealTimers();
  });

  it("infiere categoría desde reglas aprendidas solo para movimientos de gasto", () => {
    const rules = normalizeLearnedCategoryRules([
      {
        pattern: "NETFLIX",
        category: "subscriptions",
        type: "expense",
      },
    ]);

    expect(
      inferCategoryFromLearnedRules(
        {
          description: "Enviaste a Netflix",
          type: "expense",
        },
        rules
      )
    ).toMatchObject({
      pattern: "NETFLIX",
      category: "subscriptions",
    });

    expect(
      inferCategoryFromLearnedRules(
        {
          description: "Netflix",
          type: "income",
        },
        rules
      )
    ).toBeNull();
  });

  it("normaliza reglas descartando entradas inválidas y duplicadas", () => {
    const rules = normalizeLearnedCategoryRules([
      null,
      {
        pattern: "",
        category: "food",
        type: "expense",
      },
      {
        pattern: "CAFE",
        category: "uncategorized",
        type: "expense",
      },
      {
        pattern: "NETFLIX",
        category: "subscriptions",
        type: "expense",
        createdAt: "2026-02-01T00:00:00.000Z",
      },
      {
        pattern: "NETFLIX",
        category: "entertainment",
        type: "expense",
        updatedAt: "2026-02-02T00:00:00.000Z",
      },
    ]);

    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({
      id: "expense-netflix",
      pattern: "NETFLIX",
      category: "entertainment",
      type: "expense",
      updatedAt: "2026-02-02T00:00:00.000Z",
    });
  });
});
