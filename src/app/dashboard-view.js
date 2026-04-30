import { getCurrentFilters } from "../ui/dashboard-ui.js";
import { getLearnedCategoryRules } from "../services/category-rules-storage.service.js";
import { getRecurringExpenseExclusions } from "../services/recurring-expenses-storage.service.js";
import {
  buildDashboardViewModel,
  buildEmptyDashboardViewModel,
  getDashboardFiles,
  getDashboardMovements,
  hasActiveFilters,
} from "./dashboard-view-model.js";
import {
  clearDashboardSections,
  renderDashboardFilterOptions,
  renderDashboardSections,
} from "./dashboard-renderer.js";

export function renderDashboardView({ elements, state, debugRawText } = {}) {
  if (!state.data) {
    return clearDashboardView({ elements, state });
  }

  const viewContext = getDashboardViewContext();

  renderDashboardFilterOptions(elements, {
    movements: getDashboardMovements(state.data),
    files: getDashboardFiles(state.data),
  });

  const viewModel = buildDashboardViewModel({
    data: state.data,
    filters: getCurrentFilters(elements),
    tablePagination: state.tablePagination,
    tableSort: state.tableSort,
    ...viewContext,
  });

  renderDashboardSections({
    elements,
    viewModel,
    debugRawText,
  });

  return buildDashboardViewResult(viewModel);
}

export function clearDashboardView({
  elements,
  state,
  resetFilters = false,
  resetOutput = false,
} = {}) {
  const viewModel = buildEmptyDashboardViewModel({
    tablePagination: state.tablePagination,
    tableSort: state.tableSort,
    ...getDashboardViewContext(),
  });

  clearDashboardSections({
    elements,
    viewModel,
    resetFilters,
    resetOutput,
  });

  return buildDashboardViewResult(viewModel);
}

export { hasActiveFilters };

function getDashboardViewContext() {
  return {
    learnedCategoryRules: getLearnedCategoryRules(),
    recurringExpenseExclusions: getRecurringExpenseExclusions(),
  };
}

function buildDashboardViewResult(viewModel) {
  return {
    filteredMovements: viewModel.filteredMovements,
    sortedMovements: viewModel.sortedMovements,
    paginatedMovements: viewModel.paginatedMovements,
    pagination: viewModel.pagination,
    filteredSummary: viewModel.filteredSummary,
    filteredStats: viewModel.filteredStats,
    recurringExpenses: viewModel.recurringExpenses,
    recurringExpenseExclusions: viewModel.recurringExpenseExclusions,
  };
}
