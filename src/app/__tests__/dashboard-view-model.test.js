import { describe, expect, it } from "vitest";
import {
  buildDashboardViewModel,
  buildEmptyDashboardViewModel,
  getDashboardFiles,
  getDashboardMovements,
  hasActiveFilters,
} from "../dashboard-view-model.js";

const files = [
  {
    name: "enero-2026.pdf",
    processedAt: "2026-01-31T00:00:00.000Z",
  },
  {
    name: "febrero-2026.pdf",
    processedAt: "2026-02-28T00:00:00.000Z",
  },
];

const movements = [
  {
    id: "1",
    date: "2026-01-30",
    month: "2026-01",
    source: "enero-2026.pdf",
    sources: ["enero-2026.pdf"],
    category: "income",
    categorySource: "auto",
    type: "income",
    description: "Pago nomina",
    amount: 3000000,
  },
  {
    id: "2",
    date: "2026-02-10",
    month: "2026-02",
    source: "febrero-2026.pdf",
    sources: ["febrero-2026.pdf"],
    category: "food",
    categorySource: "manual",
    type: "expense",
    description: "Restaurante Centro",
    amount: -25000,
  },
  {
    id: "3",
    date: "2026-01-05",
    month: "2026-01",
    source: "enero-2026.pdf",
    sources: ["enero-2026.pdf"],
    category: "subscriptions",
    categorySource: "auto",
    type: "expense",
    description: "Netflix",
    amount: -100000,
  },
  {
    id: "4",
    date: "2026-02-05",
    month: "2026-02",
    source: "febrero-2026.pdf",
    sources: ["febrero-2026.pdf"],
    category: "subscriptions",
    categorySource: "auto",
    type: "expense",
    description: "Netflix",
    amount: -50000,
  },
];

const data = {
  fileName: "febrero-2026.pdf",
  files,
  movements,
  summary: {
    totalMovements: 4,
    income: 3000000,
    expenses: 175000,
    balance: 2825000,
  },
};

describe("dashboard-view-model", () => {
  it("construye vista filtrada, ordenada, paginada y con métricas derivadas", () => {
    const viewModel = buildDashboardViewModel({
      data,
      filters: {
        type: "expense",
      },
      tablePagination: {
        page: 1,
        pageSize: 5,
      },
      tableSort: {
        key: "amount",
        direction: "asc",
      },
      learnedCategoryRules: [],
      recurringExpenseExclusions: [],
    });

    expect(viewModel.movements).toHaveLength(4);
    expect(viewModel.files).toHaveLength(2);
    expect(viewModel.filtersAreActive).toBe(true);

    expect(viewModel.filteredMovements.map((movement) => movement.id)).toEqual([
      "2",
      "3",
      "4",
    ]);

    expect(viewModel.sortedMovements.map((movement) => movement.id)).toEqual([
      "3",
      "4",
      "2",
    ]);

    expect(viewModel.paginatedMovements.map((movement) => movement.id)).toEqual([
      "3",
      "4",
      "2",
    ]);

    expect(viewModel.pagination).toEqual({
      page: 1,
      pageSize: 5,
      totalPages: 1,
    });

    expect(viewModel.filteredSummary).toEqual({
      totalMovements: 3,
      income: 0,
      expenses: 175000,
      balance: -175000,
    });

    expect(viewModel.filteredStats.topExpenses.map((movement) => movement.id)).toEqual([
      "3",
      "4",
      "2",
    ]);
    expect(viewModel.recurringExpenses).toHaveLength(1);
    expect(viewModel.recurringExpenses[0]).toMatchObject({
      key: "NETFLIX",
      monthsCount: 2,
      totalAmount: 150000,
    });
    expect(viewModel.fixedVariableExpenses).toMatchObject({
      totalExpenses: 175000,
      fixedExpenses: 150000,
      variableExpenses: 25000,
      recurringPatternsCount: 1,
    });
    expect(viewModel.incomeVsExpensesData.map((month) => month.month)).toEqual([
      "2026-01",
      "2026-02",
    ]);
    expect(viewModel.expenseCategoryShareData.totalExpenses).toBe(175000);
  });

  it("respeta exclusiones de gastos recurrentes al construir métricas derivadas", () => {
    const viewModel = buildDashboardViewModel({
      data,
      filters: {
        type: "expense",
      },
      tablePagination: {
        page: 1,
        pageSize: 5,
      },
      tableSort: {
        key: "date",
        direction: "desc",
      },
      learnedCategoryRules: [],
      recurringExpenseExclusions: [
        {
          key: "NETFLIX",
          description: "Netflix",
          category: "subscriptions",
          excludedAt: "2026-02-28T00:00:00.000Z",
        },
      ],
    });

    expect(viewModel.recurringExpenses).toEqual([]);
    expect(viewModel.fixedVariableExpenses.recurringPatternsCount).toBe(0);
    expect(viewModel.fixedVariableExpenses.fixedExpenses).toBe(0);
    expect(viewModel.fixedVariableExpenses.variableExpenses).toBe(175000);
  });

  it("construye un view model vacío con valores seguros", () => {
    const viewModel = buildEmptyDashboardViewModel({
      tablePagination: {
        page: 1,
        pageSize: 10,
      },
      tableSort: {
        key: "date",
        direction: "desc",
      },
      learnedCategoryRules: [],
      recurringExpenseExclusions: [],
    });

    expect(viewModel.movements).toEqual([]);
    expect(viewModel.files).toEqual([]);
    expect(viewModel.filteredSummary).toEqual({
      income: 0,
      expenses: 0,
      balance: 0,
      totalMovements: 0,
    });
    expect(viewModel.pagination).toEqual({
      page: 1,
      pageSize: 10,
      totalPages: 1,
    });
    expect(viewModel.expenseCategoryShareData).toEqual({
      totalExpenses: 0,
      items: [],
    });
  });

  it("expone utilidades seguras para movimientos, archivos y filtros activos", () => {
    expect(getDashboardMovements(data)).toEqual(movements);
    expect(getDashboardMovements(null)).toEqual([]);
    expect(getDashboardFiles(data)).toEqual(files);
    expect(getDashboardFiles(null)).toEqual([]);
    expect(hasActiveFilters({ type: "expense" })).toBe(true);
    expect(hasActiveFilters({ type: "", category: "   " })).toBe(false);
  });
});
