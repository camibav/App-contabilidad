import { buildDashboardStats } from "../domain/dashboard-stats.js";
import { buildRecurringExpenses } from "../domain/recurring-expenses.js";
import { buildFixedVariableExpensesSummary } from "../domain/fixed-variable-expenses.js";
import { filterMovements } from "../domain/movement-filters.js";
import { getEmptySummary } from "../domain/summary.js";
import {
  buildExpenseCategoryShareData,
  buildMonthlyIncomeVsExpensesData,
} from "./chart-data.js";
import {
  getPaginationState,
  paginateMovements,
  sortMovements,
} from "./table-utils.js";

const DEFAULT_TABLE_PAGE_SIZE = 10;

export function buildDashboardViewModel({
  data,
  filters = {},
  tablePagination,
  tableSort,
  learnedCategoryRules = [],
  recurringExpenseExclusions = [],
} = {}) {
  const movements = getDashboardMovements(data);
  const files = getDashboardFiles(data);
  const excludedRecurringExpenseKeys = recurringExpenseExclusions.map(
    (exclusion) => exclusion.key
  );

  const filteredMovements = filterMovements(movements, filters);
  const sortedMovements = sortMovements(filteredMovements, tableSort);
  const filteredStats = buildDashboardStats(filteredMovements);
  const recurringExpenses = buildRecurringExpenses(filteredMovements, {
    excludedKeys: excludedRecurringExpenseKeys,
  });
  const fixedVariableExpenses = buildFixedVariableExpensesSummary(
    filteredMovements,
    {
      recurringExpenses,
    }
  );
  const pagination = getPaginationState(
    sortedMovements.length,
    tablePagination
  );
  const paginatedMovements = paginateMovements(sortedMovements, pagination);
  const incomeVsExpensesData = buildMonthlyIncomeVsExpensesData(filteredStats);
  const expenseCategoryShareData = buildExpenseCategoryShareData(filteredStats);

  return {
    movements,
    files,
    filters,
    filtersAreActive: hasActiveFilters(filters),
    learnedCategoryRules,
    recurringExpenseExclusions,
    filteredMovements,
    sortedMovements,
    paginatedMovements,
    pagination,
    filteredSummary: filteredStats.summary,
    filteredStats,
    recurringExpenses,
    fixedVariableExpenses,
    incomeVsExpensesData,
    expenseCategoryShareData,
    tableSort: tableSort ?? {},
    debugSummary: data?.summary ?? filteredStats.summary,
  };
}

export function buildEmptyDashboardViewModel({
  tablePagination,
  tableSort,
  learnedCategoryRules = [],
  recurringExpenseExclusions = [],
} = {}) {
  const filteredStats = buildDashboardStats([]);
  const pageSize = Number(tablePagination?.pageSize) || DEFAULT_TABLE_PAGE_SIZE;

  return {
    movements: [],
    files: [],
    filters: {},
    filtersAreActive: false,
    learnedCategoryRules,
    recurringExpenseExclusions,
    filteredMovements: [],
    sortedMovements: [],
    paginatedMovements: [],
    pagination: {
      page: 1,
      pageSize,
      totalPages: 1,
    },
    filteredSummary: getEmptySummary(),
    filteredStats,
    recurringExpenses: [],
    fixedVariableExpenses: {
      totalExpenses: 0,
      fixedExpenses: 0,
      variableExpenses: 0,
      fixedPercentage: 0,
      variablePercentage: 0,
      estimatedMonthlyFixedExpenses: 0,
      recurringPatternsCount: 0,
      activeExpenseMonths: [],
      activeExpenseMonthsCount: 0,
    },
    incomeVsExpensesData: [],
    expenseCategoryShareData: {
      totalExpenses: 0,
      items: [],
    },
    tableSort: tableSort ?? {},
    debugSummary: getEmptySummary(),
  };
}

export function getDashboardMovements(data) {
  return Array.isArray(data?.movements) ? data.movements : [];
}

export function getDashboardFiles(data) {
  return Array.isArray(data?.files) ? data.files : [];
}

export function hasActiveFilters(filters = {}) {
  return Object.values(filters).some(
    (value) => String(value ?? "").trim() !== ""
  );
}
