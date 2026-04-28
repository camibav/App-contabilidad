import { formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderIngresosVsGastosChart(elements, monthlyData = []) {
  const container = elements.incomeVsGastosChart;

  if (!container) {
    return;
  }

  const safeMonthlyData = Array.isArray(monthlyData) ? monthlyData : [];
  container.innerHTML = "";

  if (!safeMonthlyData.length) {
    renderGroupedChartEmptyState(container);
    return;
  }

  const maxValue = Math.max(
    ...safeMonthlyData.flatMap((month) => [
      Number(month.income ?? 0),
      Number(month.expenses ?? 0),
    ])
  );

  if (maxValue <= 0) {
    renderGroupedChartEmptyState(container);
    return;
  }

  for (const month of safeMonthlyData) {
    const group = document.createElement("article");
    group.className = "grouped-bar-group";

    const income = Number(month.income ?? 0);
    const expenses = Number(month.expenses ?? 0);
    const balance = Number(month.balance ?? income - expenses);
    const balanceClass = getBalanceClass(balance);

    group.innerHTML = `
      <div class="grouped-bar-header">
        <strong class="grouped-bar-month">${escapeHtml(month.month)}</strong>
        <span class="grouped-bar-balance ${escapeHtml(balanceClass)}">
          Balance: ${formatCurrency(balance)}
        </span>
      </div>

      ${renderGroupedBarRow({
        label: "Ingresos",
        value: income,
        maxValue,
        type: "income",
      })}

      ${renderGroupedBarRow({
        label: "Gastos",
        value: expenses,
        maxValue,
        type: "expense",
      })}
    `;

    container.appendChild(group);
  }
}

export function clearIngresosVsGastosChart(elements) {
  renderIngresosVsGastosChart(elements, []);
}

function renderGroupedBarRow({ label, value, maxValue, type }) {
  const width = maxValue > 0 ? Math.max((value / maxValue) * 100, 3) : 0;

  return `
    <div class="grouped-bar-row grouped-bar-row--${escapeHtml(type)}">
      <span class="grouped-bar-label">${escapeHtml(label)}</span>

      <div class="grouped-bar-track">
        <div
          class="grouped-bar-fill grouped-bar-fill--${escapeHtml(type)}"
          style="--grouped-bar-width: ${width}%"
        ></div>
      </div>

      <strong class="grouped-bar-value">${formatCurrency(value)}</strong>
    </div>
  `;
}

function renderGroupedChartEmptyState(container) {
  container.innerHTML = `
    <div class="chart-empty-state">
      <strong>No hay comparación mensual disponible.</strong>
      <p>Carga movimientos de ingresos y gastos o ajusta los filtros para comparar meses.</p>
    </div>
  `;
}

function getBalanceClass(balance) {
  if (balance > 0) {
    return "grouped-bar-balance--positive";
  }

  if (balance < 0) {
    return "grouped-bar-balance--negative";
  }

  return "grouped-bar-balance--neutral";
}
