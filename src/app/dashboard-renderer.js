import {
  clearFilterControls,
  clearOutput,
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

export function renderDashboardFilterOptions(elements, { movements = [], files = [] } = {}) {
  renderFilterOptions(elements, movements, files);
}

export function renderDashboardSections({
  elements,
  viewModel,
  debugRawText,
} = {}) {
  renderSummaryCards(elements, viewModel.filteredSummary);

  renderDataQualityPanel(elements, {
    stats: viewModel.filteredStats,
    files: viewModel.files,
    learnedCategoryRules: viewModel.learnedCategoryRules,
    recurringExpenseExclusions: viewModel.recurringExpenseExclusions,
  });

  renderDashboardInsights(elements, viewModel.filteredStats);
  renderDashboardCharts(elements, viewModel.filteredStats);
  renderIncomeVsExpensesChart(elements, viewModel.incomeVsExpensesData);
  renderExpenseCategoryShareChart(elements, viewModel.expenseCategoryShareData);
  renderCategoryBreakdown(elements, viewModel.filteredStats);
  renderTopExpenses(elements, viewModel.filteredStats.topExpenses);
  renderRecurringExpenses(elements, viewModel.recurringExpenses);
  renderExcludedRecurringExpenses(elements, viewModel.recurringExpenseExclusions);
  renderFixedVariableExpensesSummary(elements, viewModel.fixedVariableExpenses);
  renderUncategorizedMovements(elements, viewModel.filteredStats);
  renderLearnedCategoryRulesPanel(elements, viewModel.learnedCategoryRules);

  renderMovementsTable(elements, viewModel.paginatedMovements, {
    totalMovements: viewModel.movements.length,
    filteredMovements: viewModel.filteredMovements.length,
    page: viewModel.pagination.page,
    pageSize: viewModel.pagination.pageSize,
    hasActiveFilters: viewModel.filtersAreActive,
  });

  renderTableSortIndicators(elements, viewModel.tableSort);
  renderProcessedFilesList(elements, viewModel.files);
  renderCsvExportButtonState(elements, viewModel.sortedMovements.length);
  renderBackupButtonState(elements, viewModel.movements.length);

  if (typeof debugRawText === "string") {
    renderDebugOutput(
      elements,
      debugRawText,
      viewModel.movements,
      viewModel.debugSummary,
      viewModel.files
    );
  }
}

export function clearDashboardSections({
  elements,
  viewModel,
  resetFilters = false,
  resetOutput = false,
} = {}) {
  if (resetFilters) {
    clearFilterControls(elements);
  }

  if (resetOutput) {
    clearOutput(elements);
  }

  renderDashboardFilterOptions(elements, {
    movements: viewModel.movements,
    files: viewModel.files,
  });
  renderDashboardSections({ elements, viewModel });
}
