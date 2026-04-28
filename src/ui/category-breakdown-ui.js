import { formatCategory, formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderCategoryBreakdown(elements, stats = {}) {
  elements.categoryBreakdownList.innerHTML = "";

  const categoryGroups = Array.isArray(stats.byCategory) ? stats.byCategory : [];

  const visibleCategoryGroups = categoryGroups
    .filter((group) => Number(group.totalMovements) > 0)
    .sort((a, b) => Number(b.expenses) - Number(a.expenses));

  if (!visibleCategoryGroups.length) {
    renderCategoryBreakdownEmptyState(elements.categoryBreakdownList);
    return;
  }

  for (const group of visibleCategoryGroups) {
    const item = document.createElement("article");
    item.className = "category-breakdown-item";

    const category = group.key ?? "uncategorized";
    const income = Number(group.income ?? 0);
    const expenses = Number(group.expenses ?? 0);
    const balance = Number(group.balance ?? 0);
    const totalMovements = Number(group.totalMovements ?? 0);
    const movementLabel = totalMovements === 1 ? "movement" : "movements";
    const balanceClass = getCategoryBreakdownBalanceClass(balance);

    item.innerHTML = `
      <div class="category-breakdown-main">
        <strong
          class="category-breakdown-name"
          title="${escapeHtml(formatCategory(category))}"
        >
          ${escapeHtml(formatCategory(category))}
        </strong>

        <span class="category-breakdown-meta">
          ${totalMovements} ${movementLabel} in current filtered view
        </span>
      </div>

      <div class="category-breakdown-metric">
        <span class="category-breakdown-label">Income</span>
        <strong class="category-breakdown-value category-breakdown-value--income">
          ${formatCurrency(income)}
        </strong>
      </div>

      <div class="category-breakdown-metric">
        <span class="category-breakdown-label">Expenses</span>
        <strong class="category-breakdown-value category-breakdown-value--expense">
          ${formatCurrency(expenses)}
        </strong>
      </div>

      <div class="category-breakdown-metric">
        <span class="category-breakdown-label">Balance</span>
        <strong class="category-breakdown-value ${escapeHtml(balanceClass)}">
          ${formatCurrency(balance)}
        </strong>
      </div>

      <div class="category-breakdown-metric">
        <span class="category-breakdown-label">Movements</span>
        <strong class="category-breakdown-value category-breakdown-value--neutral">
          ${totalMovements}
        </strong>
      </div>
    `;

    elements.categoryBreakdownList.appendChild(item);
  }
}

export function clearCategoryBreakdown(elements) {
  renderCategoryBreakdown(elements, {
    byCategory: [],
  });
}

function renderCategoryBreakdownEmptyState(container) {
  container.innerHTML = `
    <div class="category-breakdown-empty-state">
      <strong>No category breakdown available.</strong>
      <p>Load movements or adjust filters to display category totals.</p>
    </div>
  `;
}

function getCategoryBreakdownBalanceClass(balance) {
  if (balance > 0) {
    return "category-breakdown-value--income";
  }

  if (balance < 0) {
    return "category-breakdown-value--expense";
  }

  return "category-breakdown-value--neutral";
}
