import { formatCategory } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderLearnedCategoryRulesPanel(elements, rules = []) {
  const list = elements.learnedCategoryRulesList;
  const count = elements.learnedCategoryRulesCount;

  if (!list || !count) {
    return;
  }

  const safeRules = Array.isArray(rules) ? rules : [];
  const ruleLabel = safeRules.length === 1 ? "rule" : "rules";

  count.textContent = `${safeRules.length} ${ruleLabel}`;
  list.innerHTML = "";

  if (!safeRules.length) {
    renderLearnedRulesEmptyState(list);
    return;
  }

  for (const rule of safeRules) {
    const item = document.createElement("article");
    item.className = "learned-rule-item";

    const category = rule.category ?? "uncategorized";
    const pattern = rule.pattern ?? "Unknown pattern";
    const type = rule.type ?? "expense";
    const updatedAt = formatRuleDate(rule.updatedAt ?? rule.createdAt);

    item.innerHTML = `
      <div class="learned-rule-main">
        <strong class="learned-rule-pattern" title="${escapeHtml(pattern)}">
          ${escapeHtml(pattern)}
        </strong>
        <span class="learned-rule-meta">
          Source: manual-learning · Type: ${escapeHtml(formatRuleType(type))}
        </span>
      </div>

      <div class="learned-rule-category">
        <span class="learned-rule-label">Category</span>
        <strong>${escapeHtml(formatCategory(category))}</strong>
      </div>

      <div class="learned-rule-date">
        <span class="learned-rule-label">Updated</span>
        <strong>${escapeHtml(updatedAt)}</strong>
      </div>

      <div class="learned-rule-actions">
        <button
          class="secondary-button learned-rule-delete-button"
          type="button"
          data-delete-learned-rule-id="${escapeHtml(rule.id)}"
        >
          Delete
        </button>
      </div>
    `;

    list.appendChild(item);
  }
}

export function clearLearnedCategoryRulesPanel(elements) {
  renderLearnedCategoryRulesPanel(elements, []);
}

function renderLearnedRulesEmptyState(container) {
  container.innerHTML = `
    <div class="learned-rules-empty-state">
      <strong>No learned category rules yet.</strong>
      <p>
        Change a movement category manually and choose to remember it for future PDFs.
      </p>
    </div>
  `;
}

function formatRuleDate(value) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString("es-CO");
}

function formatRuleType(type) {
  if (type === "income") {
    return "Income";
  }

  return "Expense";
}
