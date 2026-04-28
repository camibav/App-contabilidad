import { getEmptySummary } from "../domain/summary.js";
import { formatCategory, formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderDashboardInsights(elements, stats = {}) {
  elements.dashboardInsightsList.innerHTML = "";
  const insights = buildDashboardInsights(stats);

  for (const insight of insights) {
    const card = document.createElement("article");
    card.className = insight.isEmpty ? "insight-card insight-card--empty" : "insight-card";
    card.innerHTML = `
      <span class="insight-label">${escapeHtml(insight.label)}</span>
      <strong class="insight-value">${escapeHtml(insight.value)}</strong>
      <p class="insight-description">${escapeHtml(insight.description)}</p>
    `;
    elements.dashboardInsightsList.appendChild(card);
  }
}

export function clearDashboardInsights(elements) {
  renderDashboardInsights(elements, {
    summary: getEmptySummary(),
    byMonth: [],
    byCategory: [],
    bySource: [],
    topExpenses: [],
    uncategorizedMovements: [],
    uncategorizedTotal: 0,
  });
}

function buildDashboardInsights(stats = {}) {
  const summary = stats.summary ?? getEmptySummary();

  if (!summary.totalMovements) {
    return [{
      label: "No hay indicadores disponibles",
      value: "0 movimientos",
      description: "Carga extractos PDF o ajusta los filtros para analizar movimientos.",
      isEmpty: true,
    }];
  }

  const insights = [buildBalanceInsight(summary)];
  const uncategorizedTotal = Number(stats.uncategorizedTotal ?? 0);

  if (uncategorizedTotal > 0) {
    const movementLabel = uncategorizedTotal === 1 ? "movimiento" : "movimientos";
    insights.push({
      label: "Requiere categorización",
      value: `${uncategorizedTotal} ${movementLabel}`,
      description: "Revisa el panel de movimientos sin clasificar antes de mejorar las reglas automáticas de categoría.",
    });
  }

  const topExpense = Array.isArray(stats.topExpenses) ? stats.topExpenses[0] : null;

  if (topExpense) {
    insights.push({
      label: "Mayor gasto",
      value: formatCurrency(Math.abs(Number(topExpense.amount ?? 0))),
      description: `${topExpense.description ?? "Movimiento desconocido"} · ${topExpense.date ?? "Fecha desconocida"}`,
    });
  }

  const topCategory = getHighestExpenseGroup(stats.byCategory);

  if (topCategory) {
    insights.push({
      label: "Categoría principal de gasto",
      value: formatCategory(topCategory.key),
      description: `${formatCurrency(topCategory.expenses)} en ${topCategory.totalMovements} movimiento(s).`,
    });
  }

  const topMonth = getHighestExpenseGroup(stats.byMonth);

  if (topMonth) {
    insights.push({
      label: "Mes con mayor gasto",
      value: topMonth.key,
      description: `${formatCurrency(topMonth.expenses)} en gastos para esta vista filtrada.`,
    });
  }

  const topSource = getHighestExpenseGroup(stats.bySource);

  if (topSource) {
    insights.push({
      label: "Archivo con mayor gasto",
      value: topSource.key,
      description: `${formatCurrency(topSource.expenses)} detectados desde esta fuente.`,
    });
  }

  return insights;
}

function buildBalanceInsight(summary) {
  if (summary.balance >= 0) {
    return {
      label: "Balance filtrado",
      value: formatCurrency(summary.balance),
      description: "Los ingresos son iguales o superiores a los gastos en la vista actual.",
    };
  }

  return {
    label: "Balance filtrado",
    value: formatCurrency(summary.balance),
    description: "Los gastos son mayores que los ingresos en la vista actual.",
  };
}

function getHighestExpenseGroup(groups = []) {
  if (!Array.isArray(groups)) return null;
  return [...groups]
    .filter((group) => Number(group.expenses) > 0)
    .sort((a, b) => Number(b.expenses) - Number(a.expenses))[0] ?? null;
}
