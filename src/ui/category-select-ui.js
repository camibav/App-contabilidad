import { CATEGORY_OPTIONS } from "../config/categories.js";
import { formatCategory } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

const CATEGORY_SOURCE_LABELS = {
  manual: "Manual",
  "manual-learning": "Learned rule",
  auto: "Auto rule",
  default: "Uncategorized",
};

const CATEGORY_SOURCE_TITLES = {
  manual: "This category was assigned manually.",
  "manual-learning": "This category was assigned from a learned manual rule.",
  auto: "This category was assigned by the automatic category rules.",
  default: "No reliable category rule has been applied yet.",
};

export function renderCategorySelect(movement, options = {}) {
  const selectedCategory = movement.category ?? "uncategorized";
  const showSourceBadge = options.showSourceBadge !== false;

  const categoryOptions = CATEGORY_OPTIONS.map((category) => {
    const selected = category === selectedCategory ? "selected" : "";

    return `
      <option value="${escapeHtml(category)}" ${selected}>
        ${formatCategory(category)}
      </option>
    `;
  }).join("");

  return `
    <div class="category-control">
      <select class="category-select" data-movement-id="${escapeHtml(movement.id)}">
        ${categoryOptions}
      </select>
      ${showSourceBadge ? renderCategorySourceBadge(movement.categorySource) : ""}
    </div>
  `;
}

function renderCategorySourceBadge(categorySource) {
  const normalizedSource = normalizeCategorySource(categorySource);
  const label = CATEGORY_SOURCE_LABELS[normalizedSource];
  const title = CATEGORY_SOURCE_TITLES[normalizedSource];

  return `
    <span
      class="category-source-badge category-source-badge--${escapeHtml(normalizedSource)}"
      title="${escapeHtml(title)}"
    >
      ${escapeHtml(label)}
    </span>
  `;
}

function normalizeCategorySource(categorySource) {
  if (categorySource === "manual") {
    return "manual";
  }

  if (categorySource === "manual-learning") {
    return "manual-learning";
  }

  if (categorySource === "auto") {
    return "auto";
  }

  return "default";
}
