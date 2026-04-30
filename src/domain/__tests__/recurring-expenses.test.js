import { describe, expect, it } from "vitest";
import { buildRecurringExpenses } from "../recurring-expenses.js";

const movements = [
  {
    id: "1",
    date: "2026-01-05",
    month: "2026-01",
    type: "expense",
    category: "subscriptions",
    description: "Netflix",
    amount: -32000,
  },
  {
    id: "2",
    date: "2026-02-05",
    month: "2026-02",
    type: "expense",
    category: "subscriptions",
    description: "Netflix",
    amount: -32000,
  },
  {
    id: "3",
    date: "2026-02-10",
    month: "2026-02",
    type: "expense",
    category: "food",
    description: "Restaurante",
    amount: -50000,
  },
  {
    id: "4",
    date: "2026-02-28",
    month: "2026-02",
    type: "income",
    category: "income",
    description: "Salario",
    amount: 3000000,
  },
];

describe("buildRecurringExpenses", () => {
  it("detecta gastos repetidos en al menos dos meses", () => {
    const result = buildRecurringExpenses(movements);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      description: "Netflix",
      category: "subscriptions",
      type: "expense",
      monthsCount: 2,
      movementCount: 2,
      totalAmount: 64000,
      averageMonthlyAmount: 32000,
    });
  });

  it("respeta exclusiones por clave", () => {
    const result = buildRecurringExpenses(movements, {
      excludedKeys: ["NETFLIX"],
    });

    expect(result).toEqual([]);
  });
});
