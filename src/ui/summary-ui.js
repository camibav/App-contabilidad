import { getEmptySummary } from "../domain/summary.js";
import { formatCurrency } from "../utils/formatters.js";

export function renderSummaryCards(elements, summary) {
  elements.incomeSummaryElement.textContent = formatCurrency(summary.income);
  elements.expensesSummaryElement.textContent = formatCurrency(summary.expenses);
  elements.balanceSummaryElement.textContent = formatCurrency(summary.balance);
  elements.totalMovementsSummaryElement.textContent = String(
    summary.totalMovements
  );
}

export function clearSummaryCards(elements) {
  renderSummaryCards(elements, getEmptySummary());
}
