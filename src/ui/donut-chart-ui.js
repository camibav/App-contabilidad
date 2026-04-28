import { formatCategory, formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

const DONUT_SEGMENT_COLORS = [
  "var(--donut-segment-1)",
  "var(--donut-segment-2)",
  "var(--donut-segment-3)",
  "var(--donut-segment-4)",
  "var(--donut-segment-5)",
  "var(--donut-segment-6)",
];

export function renderExpenseCategoryShareChart(elements, chartData = {}) {
  renderDonutChart(elements.expensesCategoryShareChart, chartData);
}

export function clearExpenseCategoryShareChart(elements) {
  renderExpenseCategoryShareChart(elements, {
    totalExpenses: 0,
    items: [],
  });
}

function renderDonutChart(container, chartData = {}) {
  container.innerHTML = "";

  const items = Array.isArray(chartData.items) ? chartData.items : [];
  const totalExpenses = Number(chartData.totalExpenses ?? 0);

  if (!items.length || totalExpenses <= 0) {
    renderDonutEmptyState(container);
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "donut-chart-content";

  wrapper.innerHTML = `
    <div class="donut-chart-visual">
      <div class="donut-chart-graphic" aria-hidden="true">
        <div class="donut-chart-hole">
          <span>Total</span>
          <strong>${escapeHtml(formatCurrency(totalExpenses))}</strong>
        </div>
      </div>
    </div>

    <div class="donut-chart-legend">
      ${items.map(renderDonutLegendItem).join("")}
    </div>
  `;

  const graphic = wrapper.querySelector(".donut-chart-graphic");
  graphic.style.setProperty("--donut-segments", buildDonutSegments(items));

  container.appendChild(wrapper);
}

function renderDonutLegendItem(item, index) {
  const label = item.label ?? formatCategory(item.key);
  const expenses = Number(item.expenses ?? 0);
  const percentage = Number(item.percentage ?? 0);
  const movementLabel = Number(item.totalMovements) === 1 ? "movement" : "movements";

  return `
    <div class="donut-legend-item">
      <span
        class="donut-legend-marker"
        style="--donut-color: ${getDonutSegmentColor(index)}"
        aria-hidden="true"
      ></span>

      <div class="donut-legend-main">
        <strong class="donut-legend-label" title="${escapeHtml(label)}">
          ${escapeHtml(label)}
        </strong>
        <span class="donut-legend-meta">
          ${escapeHtml(formatCurrency(expenses))} · ${percentage.toFixed(1)}% · ${Number(
            item.totalMovements ?? 0
          )} ${movementLabel}
        </span>
      </div>
    </div>
  `;
}

function buildDonutSegments(items) {
  let cursor = 0;

  return items
    .map((item, index) => {
      const start = cursor;
      const end = index === items.length - 1 ? 100 : cursor + Number(item.percentage ?? 0);

      cursor = end;

      return `${getDonutSegmentColor(index)} ${start}% ${end}%`;
    })
    .join(", ");
}

function getDonutSegmentColor(index) {
  return DONUT_SEGMENT_COLORS[index % DONUT_SEGMENT_COLORS.length];
}

function renderDonutEmptyState(container) {
  container.innerHTML = `
    <div class="chart-empty-state">
      <strong>No expense share available.</strong>
      <p>Load expense movements or adjust filters to display category percentages.</p>
    </div>
  `;
}
