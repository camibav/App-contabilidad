import { getEmptySummary } from "../domain/summary.js";
import { formatCategory, formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderDashboardInsights(elements, stats = {}) {
  elements.dashboardInsightsList.innerHTML = "";

  const insights = buildDashboardInsights(stats);

  for (const insight of insights) {
    const card = document.createElement("article");

    card.className = insight.isEmpty
      ? "insight-card insight-card--empty"
      : "insight-card";

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
    return [
      {
        label: "No insights available",
        value: "0 movements",
        description:
          "Load PDF statements or adjust the filters to analyze movements.",
        isEmpty: true,
      },
    ];
  }

  const insights = [buildBalanceInsight(summary)];

  const uncategorizedTotal = Number(stats.uncategorizedTotal ?? 0);

  if (uncategorizedTotal > 0) {
    const movementLabel = uncategorizedTotal === 1 ? "movement" : "movements";

    insights.push({
      label: "Needs categorization",
      value: `${uncategorizedTotal} ${movementLabel}`,
      description:
        "Review the uncategorized movements panel before improving automatic category rules.",
    });
  }

  const topExpense = Array.isArray(stats.topExpenses)
    ? stats.topExpenses[0]
    : null;

  if (topExpense) {
    insights.push({
      label: "Highest expense",
      value: formatCurrency(Math.abs(Number(topExpense.amount ?? 0))),
      description: `${topExpense.description ?? "Unknown movement"} · ${
        topExpense.date ?? "Unknown date"
      }`,
    });
  }

  const topCategory = getHighestExpenseGroup(stats.byCategory);

  if (topCategory) {
    insights.push({
      label: "Main expense category",
      value: formatCategory(topCategory.key),
      description: `${formatCurrency(topCategory.expenses)} across ${
        topCategory.totalMovements
      } movement(s).`,
    });
  }

  const topMonth = getHighestExpenseGroup(stats.byMonth);

  if (topMonth) {
    insights.push({
      label: "Highest spending month",
      value: topMonth.key,
      description: `${formatCurrency(
        topMonth.expenses
      )} in expenses for this filtered view.`,
    });
  }

  const topSource = getHighestExpenseGroup(stats.bySource);

  if (topSource) {
    insights.push({
      label: "Highest spending file",
      value: topSource.key,
      description: `${formatCurrency(
        topSource.expenses
      )} detected from this source.`,
    });
  }

  return insights;
}

function buildBalanceInsight(summary) {
  if (summary.balance >= 0) {
    return {
      label: "Filtered balance",
      value: formatCurrency(summary.balance),
      description:
        "Income is equal to or higher than expenses in the current view.",
    };
  }

  return {
    label: "Filtered balance",
    value: formatCurrency(summary.balance),
    description: "Expenses are higher than income in the current view.",
  };
}

function getHighestExpenseGroup(groups = []) {
  if (!Array.isArray(groups)) {
    return null;
  }

  return (
    [...groups]
      .filter((group) => Number(group.expenses) > 0)
      .sort((a, b) => Number(b.expenses) - Number(a.expenses))[0] ?? null
  );
}
