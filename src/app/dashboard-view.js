import {
  clearCategoryBreakdown,
  clearDashboardCharts,
  clearDashboardInsights,
  clearDataQualityPanel,
  clearExcludedRecurringExpenses,
  clearExpenseCategoryShareChart,
  clearFilterControls,
  clearFixedVariableExpensesSummary,
  clearIncomeVsExpensesChart,
  clearMovementsTable,
  clearOutput,
  clearProcessedFilesList,
  clearRecurringExpenses,
  clearSummaryCards,
  clearTopExpenses,
  clearUncategorizedMovements,
  getCurrentFilters,
  renderBackupButtonState,
  renderCategoryBreakdown,
  renderCsvExportButtonState,
  renderDashboardCharts,
  renderDashboardInsights,
  renderDataQualityPanel,
  renderDebugOutput,
  renderExcludedRecurringExpenses,
  renderExpenseCategoryShareChart,
  renderFilterOptions,
  renderFixedVariableExpensesSummary,
  renderIncomeVsExpensesChart,
  renderLearnedCategoryRulesPanel,
  renderMovementsTable,
  renderProcessedFilesList,
  renderRecurringExpenses,
  renderSummaryCards,
  renderTableSortIndicators,
  renderTopExpenses,
  renderUncategorizedMovements,
} from "../ui/dashboard-ui.js";
import { buildDashboardStats } from "../domain/dashboard-stats.js";
import { buildRecurringExpenses } from "../domain/recurring-expenses.js";
import { buildFixedVariableExpensesSummary } from "../domain/fixed-variable-expenses.js";
import {
  buildExpenseCategoryShareData,
  buildMonthlyIncomeVsExpensesData,
} from "./chart-data.js";
import { filterMovements } from "../domain/movement-filters.js";
import { getEmptySummary } from "../domain/summary.js";
import { getLearnedCategoryRules } from "../services/category-rules-storage.service.js";
import { getRecurringExpenseExclusions } from "../services/recurring-expenses-storage.service.js";
import {
  getPaginationState,
  paginateMovements,
  sortMovements,
} from "./table-utils.js";

export function renderDashboardView({ elements, state, debugRawText } = {}) {
  if (!state.data) {
    return clearDashboardView({ elements, state });
  }

  const movements = Array.isArray(state.data.movements)
    ? state.data.movements
    : [];

  const files = Array.isArray(state.data.files) ? state.data.files : [];
  const learnedCategoryRules = getLearnedCategoryRules();
  const recurringExpenseExclusions = getRecurringExpenseExclusions();
  const excludedRecurringExpenseKeys = recurringExpenseExclusions.map(
    (exclusion) => exclusion.key
  );

  renderFilterOptions(elements, movements, files);

  const filters = getCurrentFilters(elements);
  const filteredMovements = filterMovements(movements, filters);
  const sortedMovements = sortMovements(filteredMovements, state.tableSort);
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
  const filtersAreActive = hasActiveFilters(filters);
  const pagination = getPaginationState(
    sortedMovements.length,
    state.tablePagination
  );
  const paginatedMovements = paginateMovements(sortedMovements, pagination);

  renderSummaryCards(elements, filteredStats.summary);
  renderDataQualityPanel(elements, {
    stats: filteredStats,
    files,
    learnedCategoryRules,
    recurringExpenseExclusions,
  });
  renderDashboardInsights(elements, filteredStats);
  renderDashboardCharts(elements, filteredStats);
  renderIncomeVsExpensesChart(
    elements,
    buildMonthlyIncomeVsExpensesData(filteredStats)
  );
  renderExpenseCategoryShareChart(
    elements,
    buildExpenseCategoryShareData(filteredStats)
  );
  renderCategoryBreakdown(elements, filteredStats);
  renderTopExpenses(elements, filteredStats.topExpenses);
  renderRecurringExpenses(elements, recurringExpenses);
  renderExcludedRecurringExpenses(elements, recurringExpenseExclusions);
  renderFixedVariableExpensesSummary(elements, fixedVariableExpenses);
  renderUncategorizedMovements(elements, filteredStats);
  renderLearnedCategoryRulesPanel(elements, learnedCategoryRules);
  renderMovementsTable(elements, paginatedMovements, {
    totalMovements: movements.length,
    filteredMovements: filteredMovements.length,
    page: pagination.page,
    pageSize: pagination.pageSize,
    hasActiveFilters: filtersAreActive,
  });
  renderTableSortIndicators(elements, state.tableSort);
  renderProcessedFilesList(elements, files);
  renderCsvExportButtonState(elements, sortedMovements.length);
  renderBackupButtonState(elements, movements.length);

  if (typeof debugRawText === "string") {
    renderDebugOutput(
      elements,
      debugRawText,
      movements,
      state.data.summary,
      files
    );
  }

  return {
    filteredMovements,
    sortedMovements,
    paginatedMovements,
    pagination,
    filteredSummary: filteredStats.summary,
    filteredStats,
    recurringExpenses,
    recurringExpenseExclusions,
  };
}

export function clearDashboardView({
  elements,
  state,
  resetFilters = false,
  resetOutput = false,
} = {}) {
  if (resetFilters) {
    clearFilterControls(elements);
  }

  if (resetOutput) {
    clearOutput(elements);
  }

  clearSummaryCards(elements);
  clearDataQualityPanel(elements);
  clearDashboardInsights(elements);
  clearDashboardCharts(elements);
  clearIncomeVsExpensesChart(elements);
  clearExpenseCategoryShareChart(elements);
  clearCategoryBreakdown(elements);
  clearTopExpenses(elements);
  clearRecurringExpenses(elements);
  renderExcludedRecurringExpenses(elements, getRecurringExpenseExclusions());
  clearFixedVariableExpensesSummary(elements);
  clearUncategorizedMovements(elements);
  clearMovementsTable(elements);
  clearProcessedFilesList(elements);
  renderLearnedCategoryRulesPanel(elements, getLearnedCategoryRules());
  renderFilterOptions(elements, [], []);
  renderTableSortIndicators(elements, state.tableSort);
  renderCsvExportButtonState(elements, 0);
  renderBackupButtonState(elements, 0);

  return {
    filteredMovements: [],
    sortedMovements: [],
    paginatedMovements: [],
    pagination: {
      page: 1,
      pageSize: state.tablePagination.pageSize,
      totalPages: 1,
    },
    filteredSummary: getEmptySummary(),
    filteredStats: buildDashboardStats([]),
    recurringExpenses: [],
    recurringExpenseExclusions: getRecurringExpenseExclusions(),
  };
}

export function hasActiveFilters(filters = {}) {
  return Object.values(filters).some(
    (value) => String(value ?? "").trim() !== ""
  );
}
