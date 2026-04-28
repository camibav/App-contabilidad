import { formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderFixedVariableExpensesSummary(elements, summary = {}) {
  const container = elements.fixedVariableExpensesSummary;

  if (!container) {
    return;
  }

  const totalExpenses = Number(summary.totalExpenses ?? 0);

  if (!totalExpenses) {
    renderFixedVariableExpensesEmptyState(container);
    return;
  }

  const fixedExpenses = Number(summary.fixedExpenses ?? 0);
  const variableExpenses = Number(summary.variableExpenses ?? 0);
  const fixedPercentage = normalizePercentage(summary.fixedPercentage);
  const variablePercentage = normalizePercentage(summary.variablePercentage);
  const estimatedMonthlyFixedExpenses = Number(
    summary.estimatedMonthlyFixedExpenses ?? 0
  );
  const recurringPatternsCount = Number(summary.recurringPatternsCount ?? 0);
  const activeExpenseMonthsCount = Number(summary.activeExpenseMonthsCount ?? 0);

  container.innerHTML = `
    <div class="fixed-variable-overview">
      <div class="fixed-variable-chart" aria-hidden="true">
        <div
          class="fixed-variable-bar"
          style="--fixed-width: ${escapeHtml(fixedPercentage.toFixed(2))}%"
        >
          <span class="fixed-variable-bar-segment fixed-variable-bar-segment--fixed"></span>
          <span class="fixed-variable-bar-segment fixed-variable-bar-segment--variable"></span>
        </div>
      </div>

      <div class="fixed-variable-grid">
        ${renderMetricCard({
          label: "Gastos fijos",
          value: formatCurrency(fixedExpenses),
          description: `${fixedPercentage.toFixed(1)}% de los gastos filtrados`,
          modifier: "fixed",
        })}

        ${renderMetricCard({
          label: "Gastos variables",
          value: formatCurrency(variableExpenses),
          description: `${variablePercentage.toFixed(1)}% de los gastos filtrados`,
          modifier: "variable",
        })}

        ${renderMetricCard({
          label: "Fijo mensual estimado",
          value: formatCurrency(estimatedMonthlyFixedExpenses),
          description: "Basado en promedios de gastos recurrentes",
          modifier: "estimate",
        })}

        ${renderMetricCard({
          label: "Patrones recurrentes",
          value: String(recurringPatternsCount),
          description: `${activeExpenseMonthsCount} mes(es) activo(s) analizados`,
          modifier: "neutral",
        })}
      </div>
    </div>
  `;
}

export function clearFixedVariableExpensesSummary(elements) {
  renderFixedVariableExpensesSummary(elements, {
    totalExpenses: 0,
    fixedExpenses: 0,
    variableExpenses: 0,
    fixedPercentage: 0,
    variablePercentage: 0,
    estimatedMonthlyFixedExpenses: 0,
    recurringPatternsCount: 0,
    activeExpenseMonths: [],
    activeExpenseMonthsCount: 0,
  });
}

function renderMetricCard({ label, value, description, modifier }) {
  return `
    <article class="fixed-variable-card fixed-variable-card--${escapeHtml(
      modifier
    )}">
      <span class="fixed-variable-label">${escapeHtml(label)}</span>
      <strong class="fixed-variable-value">${escapeHtml(value)}</strong>
      <p class="fixed-variable-description">${escapeHtml(description)}</p>
    </article>
  `;
}

function renderFixedVariableExpensesEmptyState(container) {
  container.innerHTML = `
    <div class="fixed-variable-empty-state">
      <strong>No hay resumen de gastos fijos vs variables disponible.</strong>
      <p>Carga movimientos de gasto o ajusta los filtros para calcular la distribución.</p>
    </div>
  `;
}

function normalizePercentage(value) {
  const percentage = Number(value);

  if (!Number.isFinite(percentage)) {
    return 0;
  }

  return Math.min(Math.max(percentage, 0), 100);
}
