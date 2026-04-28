import {
  formatCurrency,
  formatMovementType,
} from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";
import { renderCategorySelect } from "./category-select-ui.js";

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
    renderEmptyMovementsRow(elements, {
      totalMovements,
      hasActiveFilters,
    });

    return;
  }

  for (const movement of safeMovements) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${escapeHtml(movement.date)}</td>
      <td class="source-cell">${escapeHtml(movement.source ?? "Unknown source")}</td>
      <td>${escapeHtml(movement.description)}</td>
      <td class="category-cell">${renderCategorySelect(movement)}</td>
      <td>
        <span class="movement-badge movement-badge--${escapeHtml(movement.type)}">
          ${formatMovementType(movement.type)}
        </span>
      </td>
      <td class="amount amount--${escapeHtml(movement.type)}">
        ${formatCurrency(movement.amount)}
      </td>
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

    if (sortKey !== sortState.key) {
      indicator.textContent = "";
      continue;
    }

    indicator.textContent = sortState.direction === "asc" ? "↑" : "↓";
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
    elements.movementsTableStatus.textContent = "No movements loaded yet.";
    return;
  }

  const totalLabel = totalMovements === 1 ? "movement" : "movements";
  const filteredLabel = filteredMovements === 1 ? "movement" : "movements";

  if (hasActiveFilters) {
    elements.movementsTableStatus.textContent = `${filteredMovements} filtered ${filteredLabel} from ${totalMovements} stored ${totalLabel}.`;
    return;
  }

  elements.movementsTableStatus.textContent = `Showing ${visibleMovements} of ${totalMovements} ${totalLabel}.`;
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

  const totalPages = filteredMovements
    ? Math.ceil(filteredMovements / pageSize)
    : 0;

  elements.pageSizeSelect.value = String(pageSize);

  if (!filteredMovements) {
    elements.tablePaginationStatus.textContent = "Page 0 of 0";
    elements.previousPageButton.disabled = true;
    elements.nextPageButton.disabled = true;
    return;
  }

  const start = (page - 1) * pageSize + 1;
  const end = start + visibleMovements - 1;

  elements.tablePaginationStatus.textContent = `Showing ${start}-${end} of ${filteredMovements}. Page ${page} of ${totalPages}.`;
  elements.previousPageButton.disabled = page <= 1;
  elements.nextPageButton.disabled = page >= totalPages;
}

function renderEmptyMovementsRow(elements, { totalMovements, hasActiveFilters }) {
  const row = document.createElement("tr");

  const title =
    totalMovements > 0 && hasActiveFilters
      ? "No movements match the current filters."
      : "No movements loaded yet.";

  const description =
    totalMovements > 0 && hasActiveFilters
      ? "Adjust or clear the filters to display stored movements again."
      : "Upload one or more Nu Bank PDF statements to start building the dashboard.";

  row.innerHTML = `
    <td colspan="6" class="movements-empty-state">
      <div class="empty-state">
        <strong class="empty-state-title">${escapeHtml(title)}</strong>
        <p class="empty-state-description">${escapeHtml(description)}</p>
      </div>
    </td>
  `;

  elements.movementsTableBody.appendChild(row);
}
