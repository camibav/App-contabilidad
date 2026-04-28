import {
  clearFilterControls,
  setStatus,
} from "../ui/dashboard-ui.js";

export function setupFilterListeners({ elements, state, renderDashboard }) {
  const filterSelects = [
    elements.monthFilter,
    elements.sourceFilter,
    elements.typeFilter,
    elements.categoryFilter,
  ];

  for (const filterSelect of filterSelects) {
    filterSelect.addEventListener("change", () =>
      handleFiltersChange({ elements, state, renderDashboard })
    );
  }

  elements.descriptionSearch.addEventListener("input", () =>
    handleFiltersChange({ elements, state, renderDashboard })
  );

  elements.clearFiltersButton.addEventListener("click", () =>
    handleClearFilters({ elements, state, renderDashboard })
  );
}

function handleFiltersChange({ elements, state, renderDashboard }) {
  state.tablePagination.page = 1;

  const { filteredMovements, paginatedMovements } = renderDashboard();
  const totalMovements = state.data?.movements?.length ?? 0;

  setStatus(
    elements,
    `Filters applied. Showing ${paginatedMovements.length} of ${filteredMovements.length} filtered movements. Total stored: ${totalMovements}.`
  );
}

function handleClearFilters({ elements, state, renderDashboard }) {
  clearFilterControls(elements);
  state.tablePagination.page = 1;

  const { filteredMovements, paginatedMovements } = renderDashboard();

  setStatus(
    elements,
    `Filters cleared. Showing ${paginatedMovements.length} of ${filteredMovements.length} movements.`
  );
}
