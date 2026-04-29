import { formatCategory, formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderRecurringExpenses(elements, recurringExpenses = []) {
  const container = elements.recurringExpensesList;

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const safeRecurringExpenses = Array.isArray(recurringExpenses)
    ? recurringExpenses
    : [];

  if (!safeRecurringExpenses.length) {
    renderRecurringExpensesEmptyState(container);
    return;
  }

  const summary = document.createElement("p");
  const recurringLabel =
    safeRecurringExpenses.length === 1
      ? "patrón recurrente"
      : "patrones recurrentes";

  summary.className = "recurring-expenses-summary";
  summary.textContent = `Mostrando ${safeRecurringExpenses.length} ${recurringLabel} detectado(s) en la vista filtrada actual.`;

  container.appendChild(summary);

  for (const recurringExpense of safeRecurringExpenses) {
    const item = document.createElement("article");
    item.className = "recurring-expense-item";

    const key = recurringExpense.key ?? "";
    const description = recurringExpense.description ?? "Movimiento desconocido";
    const categoryValue = recurringExpense.category ?? "uncategorized";
    const category = formatCategory(categoryValue);
    const months = Array.isArray(recurringExpense.months)
      ? recurringExpense.months
      : [];
    const monthsLabel = recurringExpense.monthsCount === 1 ? "mes" : "meses";
    const movementsLabel =
      recurringExpense.movementCount === 1 ? "movimiento" : "movimientos";

    item.innerHTML = `
      <div class="recurring-expense-main">
        <strong
          class="recurring-expense-description"
          title="${escapeHtml(description)}"
        >
          ${escapeHtml(description)}
        </strong>

        <div class="recurring-expense-meta">
          <span>${escapeHtml(category)}</span>
          <span>·</span>
          <span>${recurringExpense.monthsCount} ${monthsLabel}</span>
          <span>·</span>
          <span>${recurringExpense.movementCount} ${movementsLabel}</span>
        </div>

        <p class="recurring-expense-months" title="${escapeHtml(months.join(", "))}">
          ${escapeHtml(formatDetectedMonths(months))}
        </p>
      </div>

      <div class="recurring-expense-side">
        <div class="recurring-expense-metrics">
          <div class="recurring-expense-metric">
            <span class="recurring-expense-label">Promedio mensual</span>
            <strong class="recurring-expense-value recurring-expense-value--primary">
              ${formatCurrency(Number(recurringExpense.averageMonthlyAmount ?? 0))}
            </strong>
          </div>

          <div class="recurring-expense-metric">
            <span class="recurring-expense-label">Total detectado</span>
            <strong class="recurring-expense-value">
              ${formatCurrency(Number(recurringExpense.totalAmount ?? 0))}
            </strong>
          </div>
        </div>

        <button
          class="secondary-button recurring-expense-action"
          type="button"
          data-recurring-exclude-key="${escapeHtml(key)}"
          data-recurring-description="${escapeHtml(description)}"
          data-recurring-category="${escapeHtml(categoryValue)}"
        >
          Excluir
        </button>
      </div>
    `;

    container.appendChild(item);
  }
}

export function clearRecurringExpenses(elements) {
  renderRecurringExpenses(elements, []);
}

function renderRecurringExpensesEmptyState(container) {
  container.innerHTML = `
    <div class="recurring-expense-empty-state">
      <strong>No hay gastos recurrentes detectados.</strong>
      <p>
        Carga al menos dos meses de movimientos o limpia los filtros para detectar gastos repetidos.
      </p>
    </div>
  `;
}

function formatDetectedMonths(months) {
  if (!months.length) {
    return "Sin meses detectados.";
  }

  if (months.length <= 4) {
    return `Meses detectados: ${months.join(", ")}`;
  }

  return `Meses detectados: ${months.slice(0, 4).join(", ")} +${months.length - 4} más`;
}
