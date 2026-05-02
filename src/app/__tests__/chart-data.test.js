import { describe, expect, it } from "vitest";
import {
  buildExpenseCategoryShareData,
  buildMonthlyIncomeVsExpensesData,
} from "../chart-data.js";

describe("chart-data", () => {
  it("construye participación de gastos agrupando categorías pequeñas", () => {
    const result = buildExpenseCategoryShareData(
      {
        byCategory: [
          { key: "food", expenses: 50000, totalMovements: 2 },
          { key: "transport", expenses: 30000, totalMovements: 1 },
          { key: "subscriptions", expenses: 20000, totalMovements: 1 },
          { key: "income", expenses: 0, totalMovements: 1 },
          { key: "health", expenses: 10000, totalMovements: 1 },
        ],
      },
      { limit: 3 }
    );

    expect(result.totalExpenses).toBe(110000);
    expect(result.items).toHaveLength(3);
    expect(result.items[0]).toMatchObject({
      key: "food",
      expenses: 50000,
      totalMovements: 2,
    });
    expect(result.items[1]).toMatchObject({
      key: "transport",
      expenses: 30000,
      totalMovements: 1,
    });
    expect(result.items[2]).toMatchObject({
      key: "other-categories",
      label: "Otras categorías",
      expenses: 30000,
      totalMovements: 2,
    });
    expect(result.items[0].percentage).toBeCloseTo(45.45, 2);
  });

  it("retorna estado vacío cuando no hay gastos por categoría", () => {
    expect(
      buildExpenseCategoryShareData({
        byCategory: [{ key: "income", expenses: 0, totalMovements: 1 }],
      })
    ).toEqual({
      totalExpenses: 0,
      items: [],
    });
  });

  it("construye datos mensuales de ingresos contra gastos", () => {
    const result = buildMonthlyIncomeVsExpensesData({
      byMonth: [
        {
          key: "2026-03",
          income: 1000000,
          expenses: 300000,
          totalMovements: 3,
        },
        {
          key: "2026-02",
          income: 0,
          expenses: 500000,
          totalMovements: 2,
        },
        {
          key: "2026-01",
          income: 0,
          expenses: 0,
          totalMovements: 0,
        },
      ],
    });

    expect(result).toEqual([
      {
        month: "2026-02",
        income: 0,
        expenses: 500000,
        balance: -500000,
        totalMovements: 2,
      },
      {
        month: "2026-03",
        income: 1000000,
        expenses: 300000,
        balance: 700000,
        totalMovements: 3,
      },
    ]);
  });
});
