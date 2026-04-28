import { setStatus } from "../ui/dashboard-ui.js";
import { normalizePageSize, updateTableSortState } from "./table-utils.js";

export function setupTablePaginationListeners({ elements, state, renderDashboard }) {
  elements.pageSizeSelect.addEventListener("change", (event) =>
    handlePageSizeChange({ event, elements, state, renderDashboard })
  );

  elements.previousPageButton.addEventListener("click", () =>
    handlePreviousPage({ elements, state, renderDashboard })
  );

  elements.nextPageButton.addEventListener("click", () =>
    handleNextPage({ elements, state, renderDashboard })
  );
}

export function setupTableSortingListeners({ elements, state, renderDashboard }) {
  elements.movementsTable.addEventListener("click", (event) =>
    handleTableSortChange({ event, elements, state, renderDashboard })
  );
}

function handlePageSizeChange({ event, elements, state, renderDashboard }) {
  const target = event.target;

  if (!(target instanceof HTMLSelectElement)) {
    return;
  }

  state.tablePagination.pageSize = normalizePageSize(target.value);
  state.tablePagination.page = 1;

  const { filteredMovements, paginatedMovements } = renderDashboard();

  setStatus(
    elements,
    `Rows per page changed to ${state.tablePagination.pageSize}. Showing ${paginatedMovements.length} of ${filteredMovements.length} movements.`
  );
}

function handlePreviousPage({ elements, state, renderDashboard }) {
  state.tablePagination.page -= 1;

  const { pagination } = renderDashboard();

  setStatus(elements, `Page ${pagination.page} of ${pagination.totalPages}.`);
}

function handleNextPage({ elements, state, renderDashboard }) {
  state.tablePagination.page += 1;

  const { pagination } = renderDashboard();

  setStatus(elements, `Page ${pagination.page} of ${pagination.totalPages}.`);
}

function handleTableSortChange({ event, elements, state, renderDashboard }) {
  const target = event.target;

  if (!(target instanceof Element)) {
    return;
  }

  const sortButton = target.closest("[data-sort-key]");

  if (!sortButton) {
    return;
  }

  const sortKey = sortButton.dataset.sortKey;
  const wasUpdated = updateTableSortState(state.tableSort, sortKey);

  if (!wasUpdated) {
    return;
  }

  state.tablePagination.page = 1;

  const { pagination } = renderDashboard();

  setStatus(
    elements,
    `Table sorted by ${sortKey} ${state.tableSort.direction}. Page ${pagination.page} of ${pagination.totalPages}.`
  );
}
