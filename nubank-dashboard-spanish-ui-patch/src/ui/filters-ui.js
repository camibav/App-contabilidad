import { CATEGORY_OPTIONS } from "../config/categories.js";
import { formatCategory } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderFilterOptions(elements, movements = [], files = []) {
  renderMonthFilterOptions(elements, movements);
  renderSourceFilterOptions(elements, movements, files);
  renderCategoryFilterOptions(elements);
}

export function getCurrentFilters(elements) {
  return {
    month: elements.monthFilter.value,
    source: elements.sourceFilter.value,
    type: elements.typeFilter.value,
    category: elements.categoryFilter.value,
    description: elements.descriptionSearch.value.trim(),
  };
}

export function clearFilterControls(elements) {
  elements.monthFilter.value = "";
  elements.sourceFilter.value = "";
  elements.typeFilter.value = "";
  elements.categoryFilter.value = "";
  elements.descriptionSearch.value = "";
}

function renderMonthFilterOptions(elements, movements) {
  const currentValue = elements.monthFilter.value;
  const months = Array.from(new Set(movements.map((movement) => movement.month).filter(Boolean))).sort();

  elements.monthFilter.innerHTML = `
    <option value="">Todos los meses</option>
    ${months.map((month) => {
      const selected = month === currentValue ? "selected" : "";
      return `<option value="${escapeHtml(month)}" ${selected}>${escapeHtml(month)}</option>`;
    }).join("")}
  `;
}

function renderSourceFilterOptions(elements, movements, files) {
  const currentValue = elements.sourceFilter.value;
  const sourcesFromFiles = files.map((file) => file.name).filter(Boolean);
  const sourcesFromMovements = movements.map((movement) => movement.source).filter(Boolean);
  const sources = Array.from(new Set([...sourcesFromFiles, ...sourcesFromMovements])).sort();

  elements.sourceFilter.innerHTML = `
    <option value="">Todos los archivos</option>
    ${sources.map((source) => {
      const selected = source === currentValue ? "selected" : "";
      return `<option value="${escapeHtml(source)}" ${selected}>${escapeHtml(source)}</option>`;
    }).join("")}
  `;
}

function renderCategoryFilterOptions(elements) {
  const currentValue = elements.categoryFilter.value;

  elements.categoryFilter.innerHTML = `
    <option value="">Todas las categorías</option>
    ${CATEGORY_OPTIONS.map((category) => {
      const selected = category === currentValue ? "selected" : "";
      return `<option value="${escapeHtml(category)}" ${selected}>${formatCategory(category)}</option>`;
    }).join("")}
  `;
}
