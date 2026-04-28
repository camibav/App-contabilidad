import { formatCurrency, formatMovementType } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";
import { renderCategorySelect } from "./category-select-ui.js";

export function renderUncategorizedMovements(elements, stats = {}) {
  elements.uncategorizedMovementsList.innerHTML = "";
  const uncategorizedMovements = Array.isArray(stats.uncategorizedMovements) ? stats.uncategorizedMovements : [];
  const uncategorizedTotal = Number(stats.uncategorizedTotal ?? uncategorizedMovements.length);

  if (!uncategorizedTotal) {
    renderUncategorizedMovementsEmptyState(elements.uncategorizedMovementsList);
    return;
  }

  const movementLabel = uncategorizedTotal === 1 ? "movimiento" : "movimientos";
  const summary = document.createElement("p");
  summary.className = "uncategorized-movement-summary";
  summary.textContent = `Mostrando ${uncategorizedMovements.length} de ${uncategorizedTotal} ${movementLabel} sin clasificar.`;
  elements.uncategorizedMovementsList.appendChild(summary);

  for (const movement of uncategorizedMovements) {
    const item = document.createElement("article");
    item.className = "uncategorized-movement-item";
    const description = movement.description ?? "Movimiento desconocido";
    const date = movement.date ?? "Fecha desconocida";
    const source = movement.source ?? "Origen desconocido";
    const type = movement.type ?? "expense";
    const amount = Number(movement.amount ?? 0);
    const amountClass = type === "income" ? "amount--income" : "amount--expense";

    item.innerHTML = `
      <div class="uncategorized-movement-main">
        <strong class="uncategorized-movement-description" title="${escapeHtml(description)}">${escapeHtml(description)}</strong>
        <div class="uncategorized-movement-meta">
          <span>${escapeHtml(date)}</span><span>·</span><span>${escapeHtml(formatMovementType(type))}</span><span>·</span><span title="${escapeHtml(source)}">${escapeHtml(source)}</span>
        </div>
        <strong class="uncategorized-movement-amount ${escapeHtml(amountClass)}">${formatCurrency(amount)}</strong>
      </div>
      <div class="uncategorized-movement-actions">
        <span class="uncategorized-action-label">Asignar categoría</span>
        ${renderCategorySelect(movement)}
      </div>
    `;
    elements.uncategorizedMovementsList.appendChild(item);
  }
}

export function clearUncategorizedMovements(elements) {
  renderUncategorizedMovements(elements, { uncategorizedMovements: [], uncategorizedTotal: 0 });
}

function renderUncategorizedMovementsEmptyState(container) {
  container.innerHTML = `
    <div class="uncategorized-movement-empty-state">
      <strong>No hay movimientos sin clasificar.</strong>
      <p>Todos los movimientos de la vista filtrada actual ya tienen una categoría.</p>
    </div>
  `;
}
