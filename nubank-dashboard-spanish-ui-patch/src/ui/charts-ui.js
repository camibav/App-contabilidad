import { formatCategory, formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderDashboardCharts(elements, stats = {}) {
  const byMonth = Array.isArray(stats.byMonth) ? stats.byMonth : [];
  const byCategory = Array.isArray(stats.byCategory) ? stats.byCategory : [];

  const monthlyExpenses = byMonth
    .filter((group) => Number(group.expenses) > 0)
    .sort((a, b) => String(a.key).localeCompare(String(b.key)))
    .map((group) => ({ label: group.key, value: Number(group.expenses) }));

  const categoryExpenses = byCategory
    .filter((group) => Number(group.expenses) > 0)
    .sort((a, b) => Number(b.expenses) - Number(a.expenses))
    .slice(0, 8)
    .map((group) => ({ label: formatCategory(group.key), value: Number(group.expenses) }));

  renderBarChart(elements.expensesByMonthChart, monthlyExpenses, {
    emptyTitle: "No hay gastos mensuales disponibles.",
    emptyDescription: "Carga movimientos o ajusta los filtros para mostrar los gastos por mes.",
  });

  renderBarChart(elements.expensesByCategoryChart, categoryExpenses, {
    emptyTitle: "No hay gastos por categoría disponibles.",
    emptyDescription: "Asigna categorías o ajusta los filtros para mostrar los gastos por categoría.",
  });
}

export function clearDashboardCharts(elements) {
  renderDashboardCharts(elements, { byMonth: [], byCategory: [] });
}

function renderBarChart(container, items = [], emptyState) {
  container.innerHTML = "";

  if (!items.length) {
    renderChartEmptyState(container, emptyState);
    return;
  }

  const maxValue = Math.max(...items.map((item) => item.value));

  for (const item of items) {
    const safeValue = Number(item.value);
    const width = maxValue > 0 ? Math.max((safeValue / maxValue) * 100, 4) : 0;
    const row = document.createElement("div");
    row.className = "chart-bar-row";
    row.innerHTML = `
      <div class="chart-bar-meta">
        <span class="chart-bar-label" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span>
        <span class="chart-bar-value">${formatCurrency(safeValue)}</span>
      </div>
      <div class="chart-bar-track"><div class="chart-bar-fill"></div></div>
    `;
    const fill = row.querySelector(".chart-bar-fill");
    fill.style.setProperty("--bar-width", `${width}%`);
    container.appendChild(row);
  }
}

function renderChartEmptyState(container, { emptyTitle, emptyDescription }) {
  container.innerHTML = `
    <div class="chart-empty-state">
      <strong>${escapeHtml(emptyTitle)}</strong>
      <p>${escapeHtml(emptyDescription)}</p>
    </div>
  `;
}
