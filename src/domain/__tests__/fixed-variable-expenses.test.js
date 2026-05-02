import { describe, expect, it } from "vitest";
import { buildFixedVariableExpensesSummary } from "../fixed-variable-expenses.js";

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
    amount: -36000,
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

describe("buildFixedVariableExpensesSummary", () => {
  it("calcula gastos fijos y variables desde patrones recurrentes", () => {
    const summary = buildFixedVariableExpensesSummary(movements, {
      recurringExpenses: [
        {
          key: "NETFLIX",
          totalAmount: 64000,
          averageMonthlyAmount: 32000,
        },
      ],
    });

    expect(summary).toMatchObject({
      totalExpenses: 100000,
      fixedExpenses: 64000,
      variableExpenses: 36000,
      fixedPercentage: 64,
      variablePercentage: 36,
      estimatedMonthlyFixedExpenses: 32000,
      recurringPatternsCount: 1,
      activeExpenseMonths: ["2026-01", "2026-02"],
      activeExpenseMonthsCount: 2,
    });
  });

  it("limita los gastos fijos al total de gastos filtrados", () => {
    const summary = buildFixedVariableExpensesSummary(movements, {
      recurringExpenses: [
        {
          key: "PATRON-EXCESIVO",
          totalAmount: 999999,
          averageMonthlyAmount: 999999,
        },
      ],
    });

    expect(summary.fixedExpenses).toBe(100000);
    expect(summary.variableExpenses).toBe(0);
    expect(summary.fixedPercentage).toBe(100);
    expect(summary.variablePercentage).toBe(0);
  });

  it("retorna resumen vacío cuando no hay gastos", () => {
    const summary = buildFixedVariableExpensesSummary([
      {
        id: "income-1",
        month: "2026-02",
        type: "income",
        amount: 3000000,
      },
    ]);

    expect(summary).toMatchObject({
      totalExpenses: 0,
      fixedExpenses: 0,
      variableExpenses: 0,
      fixedPercentage: 0,
      variablePercentage: 0,
      estimatedMonthlyFixedExpenses: 0,
      recurringPatternsCount: 0,
      activeExpenseMonths: [],
      activeExpenseMonthsCount: 0,
    });
  });
});
