import { formatCurrency, formatMovementType } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";
import { renderCategorySelect } from "./category-select-ui.js";

const MOVEMENTS_TABLE_COLUMNS_COUNT = 6;

export function renderMovementsTable(elements, movements = [], options = {}) {
  const safeMovements = Array.isArray(movements) ? movements : [];
  const totalMovements = Number(options.totalMovements ?? safeMovements.length);
  const filteredMovements = Number(
    options.filteredMovements ?? safeMovements.length
  );
  const hasActiveFilters = Boolean(options.hasActiveFilters);
  const page = Number(options.page ?? 1);
  const pageSize = Number(options.pageSize ?? 10);

  renderMovementsTableStatus(elements, {
    visibleMovements: safeMovements.length,
    totalMovements,
    filteredMovements,
    hasActiveFilters,
  });
  renderPaginationControls(elements, {
    visibleMovements: safeMovements.length,
    filteredMovements,
    page,
    pageSize,
  });

  elements.movementsTableBody.innerHTML = "";

  if (!safeMovements.length) {
    renderEmptyMovementsRow(elements, { totalMovements, hasActiveFilters });
    return;
  }

  for (const movement of safeMovements) {
    const row = document.createElement("tr");
    row.className = "movement-table-row";

    row.innerHTML = `
      <td data-label="Fecha" class="date-cell">${escapeHtml(movement.date)}</td>
      <td data-label="Origen" class="source-cell" title="${escapeHtml(
        movement.source ?? "Origen desconocido"
      )}">${escapeHtml(movement.source ?? "Origen desconocido")}</td>
      <td data-label="Descripción" class="description-cell" title="${escapeHtml(
        movement.description
      )}">${escapeHtml(movement.description)}</td>
      <td data-label="Categoría" class="category-cell">${renderCategorySelect(
        movement
      )}</td>
      <td data-label="Tipo" class="type-cell"><span class="movement-badge movement-badge--${escapeHtml(
        movement.type
      )}">${formatMovementType(movement.type)}</span></td>
      <td data-label="Monto" class="amount amount--${escapeHtml(
        movement.type
      )}">${formatCurrency(movement.amount)}</td>
    `;

    elements.movementsTableBody.appendChild(row);
  }
}

export function clearMovementsTable(elements) {
  renderMovementsTable(elements, [], {
    totalMovements: 0,
    filteredMovements: 0,
    page: 1,
    pageSize: 10,
    hasActiveFilters: false,
  });
}

export function renderTableSortIndicators(elements, sortState = {}) {
  const indicators = elements.movementsTable.querySelectorAll(
    "[data-sort-indicator]"
  );

  for (const indicator of indicators) {
    const sortKey = indicator.dataset.sortIndicator;
    indicator.textContent =
      sortKey === sortState.key ? (sortState.direction === "asc" ? "↑" : "↓") : "";
  }
}

function renderMovementsTableStatus(
  elements,
  { visibleMovements, totalMovements, filteredMovements, hasActiveFilters }
) {
  if (!elements.movementsTableStatus) {
    return;
  }

  if (!totalMovements) {
    elements.movementsTableStatus.textContent = "Aún no hay movimientos cargados.";
    return;
  }

  const totalLabel = totalMovements === 1 ? "movimiento" : "movimientos";
  const filteredLabel = filteredMovements === 1 ? "movimiento" : "movimientos";

  elements.movementsTableStatus.textContent = hasActiveFilters
    ? `${filteredMovements} ${filteredLabel} filtrado(s) de ${totalMovements} ${totalLabel} guardado(s).`
    : `Mostrando ${visibleMovements} de ${totalMovements} ${totalLabel}.`;
}

function renderPaginationControls(
  elements,
  { visibleMovements, filteredMovements, page, pageSize }
) {
  if (
    !elements.tablePaginationStatus ||
    !elements.previousPageButton ||
    !elements.nextPageButton ||
    !elements.pageSizeSelect
  ) {
    return;
  }

  const totalPages = filteredMovements ? Math.ceil(filteredMovements / pageSize) : 0;
  elements.pageSizeSelect.value = String(pageSize);

  if (!filteredMovements) {
    elements.tablePaginationStatus.textContent = "Página 0 de 0";
    elements.previousPageButton.disabled = true;
    elements.nextPageButton.disabled = true;
    return;
  }

  const start = (page - 1) * pageSize + 1;
  const end = start + visibleMovements - 1;

  elements.tablePaginationStatus.textContent = `Mostrando ${start}-${end} de ${filteredMovements}. Página ${page} de ${totalPages}.`;
  elements.previousPageButton.disabled = page <= 1;
  elements.nextPageButton.disabled = page >= totalPages;
}

function renderEmptyMovementsRow(elements, { totalMovements, hasActiveFilters }) {
  const row = document.createElement("tr");
  row.className = "movement-table-row movement-table-row--empty";

  const title =
    totalMovements > 0 && hasActiveFilters
      ? "Ningún movimiento coincide con los filtros actuales."
      : "Aún no hay movimientos cargados.";
  const description =
    totalMovements > 0 && hasActiveFilters
      ? "Ajusta o limpia los filtros para volver a ver los movimientos guardados."
      : "Carga uno o varios extractos PDF de Nu Bank para comenzar a construir el dashboard.";

  row.innerHTML = `
    <td colspan="${MOVEMENTS_TABLE_COLUMNS_COUNT}" class="movements-empty-state">
      <div class="empty-state">
        <strong class="empty-state-title">${escapeHtml(title)}</strong>
        <p class="empty-state-description">${escapeHtml(description)}</p>
      </div>
    </td>
  `;

  elements.movementsTableBody.appendChild(row);
}
