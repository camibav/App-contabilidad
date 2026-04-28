import { formatCategory } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderExcludedRecurringExpenses(elements, exclusions = []) {
  const container = elements.excludedRecurringExpensesList;
  if (!container) return;
  container.innerHTML = "";
  const safeExclusions = Array.isArray(exclusions) ? exclusions : [];
  if (!safeExclusions.length) {
    renderExcludedRecurringExpensesEmptyState(container);
    return;
  }
  const summary = document.createElement("p");
  const exclusionLabel = safeExclusions.length === 1 ? "exclusión" : "exclusiones";
  summary.className = "excluded-recurring-expenses-summary";
  summary.textContent = `${safeExclusions.length} ${exclusionLabel} de gastos recurrentes activa(s).`;
  container.appendChild(summary);

  for (const exclusion of safeExclusions) {
    const item = document.createElement("article");
    item.className = "excluded-recurring-expense-item";
    const key = exclusion.key ?? "";
    const description = exclusion.description ?? key;
    const category = formatCategory(exclusion.category ?? "uncategorized");
    const excludedAt = exclusion.excludedAt ? new Date(exclusion.excludedAt).toLocaleString("es-CO") : "Fecha desconocida";
    item.innerHTML = `
      <div class="excluded-recurring-expense-main">
        <strong class="excluded-recurring-expense-description" title="${escapeHtml(description)}">${escapeHtml(description)}</strong>
        <div class="excluded-recurring-expense-meta"><span>${escapeHtml(category)}</span><span>·</span><span>Excluido el ${escapeHtml(excludedAt)}</span></div>
      </div>
      <button class="secondary-button excluded-recurring-expense-action" type="button" data-recurring-restore-key="${escapeHtml(key)}" data-recurring-description="${escapeHtml(description)}">Restaurar</button>
    `;
    container.appendChild(item);
  }
}

export function clearExcludedRecurringExpenses(elements) {
  renderExcludedRecurringExpenses(elements, []);
}

function renderExcludedRecurringExpensesEmptyState(container) {
  container.innerHTML = `
    <div class="excluded-recurring-expense-empty-state">
      <strong>No hay gastos recurrentes excluidos.</strong>
      <p>Usa Excluir en el panel de gastos recurrentes cuando un movimiento repetido no sea realmente un gasto fijo.</p>
    </div>
  `;
}
