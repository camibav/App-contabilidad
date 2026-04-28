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
    `Filas por página cambiadas a ${state.tablePagination.pageSize}. Mostrando ${paginatedMovements.length} de ${filteredMovements.length} movimientos.`
  );
}

function handlePreviousPage({ elements, state, renderDashboard }) {
  state.tablePagination.page -= 1;

  const { pagination } = renderDashboard();

  setStatus(elements, `Página ${pagination.page} de ${pagination.totalPages}.`);
}

function handleNextPage({ elements, state, renderDashboard }) {
  state.tablePagination.page += 1;

  const { pagination } = renderDashboard();

  setStatus(elements, `Página ${pagination.page} de ${pagination.totalPages}.`);
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
    `Table sorted by ${sortKey} ${state.tableSort.direction}. Página ${pagination.page} de ${pagination.totalPages}.`
  );
}
