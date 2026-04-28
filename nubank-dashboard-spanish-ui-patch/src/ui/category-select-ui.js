import { CATEGORY_OPTIONS } from "../config/categories.js";
import {
  CATEGORY_SOURCE_LABELS_ES,
  CATEGORY_SOURCE_TITLES_ES,
} from "../config/translations.js";
import { formatCategory } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

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
  const label = CATEGORY_SOURCE_LABELS_ES[normalizedSource];
  const title = CATEGORY_SOURCE_TITLES_ES[normalizedSource];

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
  if (categorySource === "manual") return "manual";
  if (categorySource === "manual-learning") return "manual-learning";
  if (categorySource === "auto") return "auto";
  return "default";
}
