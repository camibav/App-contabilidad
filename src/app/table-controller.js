import { setStatus } from "../ui/dashboard-ui.js";
import { normalizePageSize, updateTableSortState } from "./table-utils.js";

const SORT_KEY_LABELS_ES = {
  date: "fecha",
  type: "tipo",
  amount: "monto",
};

const SORT_DIRECTION_LABELS_ES = {
  asc: "ascendente",
  desc: "descendente",
};

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
  const sortLabel = SORT_KEY_LABELS_ES[sortKey] ?? sortKey;
  const directionLabel =
    SORT_DIRECTION_LABELS_ES[state.tableSort.direction] ?? state.tableSort.direction;

  setStatus(
    elements,
    `Tabla ordenada por ${sortLabel} en orden ${directionLabel}. Página ${pagination.page} de ${pagination.totalPages}.`
  );
}
