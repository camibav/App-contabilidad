import { formatCategory, formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderTopExpenses(elements, topExpenses = []) {
  elements.topExpensesList.innerHTML = "";
  const safeTopExpenses = Array.isArray(topExpenses) ? topExpenses : [];

  if (!safeTopExpenses.length) {
    renderTopExpensesEmptyState(elements.topExpensesList);
    return;
  }

  for (const expense of safeTopExpenses) {
    const item = document.createElement("article");
    item.className = "top-expense-item";
    const amount = Math.abs(Number(expense.absoluteAmount ?? expense.amount ?? 0));
    const description = expense.description ?? "Movimiento desconocido";
    const date = expense.date ?? "Fecha desconocida";
    const category = formatCategory(expense.category ?? "uncategorized");
    const source = expense.source ?? "Origen desconocido";

    item.innerHTML = `
      <div class="top-expense-main">
        <strong class="top-expense-description" title="${escapeHtml(description)}">${escapeHtml(description)}</strong>
        <div class="top-expense-meta">
          <span>${escapeHtml(date)}</span><span>·</span><span>${escapeHtml(category)}</span><span>·</span><span title="${escapeHtml(source)}">${escapeHtml(source)}</span>
        </div>
      </div>
      <strong class="top-expense-amount">${formatCurrency(amount)}</strong>
    `;
    elements.topExpensesList.appendChild(item);
  }
}

export function clearTopExpenses(elements) {
  renderTopExpenses(elements, []);
}

function renderTopExpensesEmptyState(container) {
  container.innerHTML = `
    <div class="top-expense-empty-state">
      <strong>No hay mayores gastos disponibles.</strong>
      <p>Carga movimientos de gasto o ajusta los filtros para mostrar los mayores gastos.</p>
    </div>
  `;
}
