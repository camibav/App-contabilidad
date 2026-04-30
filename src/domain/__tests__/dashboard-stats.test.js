import { describe, expect, it } from "vitest";
import { buildDashboardStats } from "../dashboard-stats.js";

describe("buildDashboardStats", () => {
  it("calcula resumen, agrupaciones y mayores gastos", () => {
    const stats = buildDashboardStats([
      {
        id: "income-1",
        date: "2026-02-01",
        month: "2026-02",
        category: "income",
        source: "febrero.pdf",
        description: "Salario",
        amount: 3000000,
        type: "income",
      },
      {
        id: "expense-1",
        date: "2026-02-02",
        month: "2026-02",
        category: "food",
        source: "febrero.pdf",
        description: "Restaurante",
        amount: -50000,
        type: "expense",
      },
      {
        id: "expense-2",
        date: "2026-03-03",
        month: "2026-03",
        category: "transport",
        source: "marzo.pdf",
        description: "Uber",
        amount: -30000,
        type: "expense",
      },
    ]);

    expect(stats.summary).toEqual({
      totalMovements: 3,
      income: 3000000,
      expenses: 80000,
      balance: 2920000,
    });
    expect(stats.byMonth).toHaveLength(2);
    expect(stats.byCategory.map((group) => group.key)).toContain("food");
    expect(stats.bySource.map((group) => group.key)).toContain("febrero.pdf");
    expect(stats.topExpenses[0].description).toBe("Restaurante");
  });

  it("calcula calidad de datos con movimientos sin clasificar", () => {
    const stats = buildDashboardStats([
      {
        id: "expense-1",
        date: "2026-02-02",
        month: "2026-02",
        category: "uncategorized",
        source: "febrero.pdf",
        description: "Movimiento sin clasificar",
        amount: -50000,
        type: "expense",
      },
      {
        id: "expense-2",
        date: "2026-02-03",
        month: "2026-02",
        category: "food",
        source: "febrero.pdf",
        description: "Restaurante",
        amount: -20000,
        type: "expense",
      },
    ]);

    expect(stats.uncategorizedTotal).toBe(1);
    expect(stats.dataQuality.totalMovements).toBe(2);
    expect(stats.dataQuality.classifiedMovements).toBe(1);
    expect(stats.dataQuality.classifiedPercentage).toBe(50);
    expect(stats.dataQuality.isComplete).toBe(false);
  });
});
