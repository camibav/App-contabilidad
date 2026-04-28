import { formatCategoría } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderLearnedCategoríaRulesPanel(elements, rules = []) {
  const list = elements.learnedCategoríaRulesList;
  const count = elements.learnedCategoríaRulesCount;

  if (!list || !count) {
    return;
  }

  const safeRules = Array.isArray(rules) ? rules : [];
  const ruleLabel = safeRules.length === 1 ? "regla" : "reglas";

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
    const pattern = rule.pattern ?? "Patrón desconocido";
    const type = rule.type ?? "expense";
    const updatedAt = formatRuleDate(rule.updatedAt ?? rule.createdAt);

    item.innerHTML = `
      <div class="learned-rule-main">
        <strong class="learned-rule-pattern" title="${escapeHtml(pattern)}">
          ${escapeHtml(pattern)}
        </strong>
        <span class="learned-rule-meta">
          Origen: regla aprendida · Tipo: ${escapeHtml(formatRuleType(type))}
        </span>
      </div>

      <div class="learned-rule-category">
        <span class="learned-rule-label">Categoría</span>
        <strong>${escapeHtml(formatCategoría(category))}</strong>
      </div>

      <div class="learned-rule-date">
        <span class="learned-rule-label">Actualizada</span>
        <strong>${escapeHtml(updatedAt)}</strong>
      </div>

      <div class="learned-rule-actions">
        <button
          class="secondary-button learned-rule-delete-button"
          type="button"
          data-delete-learned-rule-id="${escapeHtml(rule.id)}"
        >
          Eliminar
        </button>
      </div>
    `;

    list.appendChild(item);
  }
}

export function clearLearnedCategoríaRulesPanel(elements) {
  renderLearnedCategoríaRulesPanel(elements, []);
}

function renderLearnedRulesEmptyState(container) {
  container.innerHTML = `
    <div class="learned-rules-empty-state">
      <strong>Todavía no hay reglas de categoría aprendidas.</strong>
      <p>
        Cambia manualmente la categoría de un movimiento y elige recordarla para futuros PDF.
      </p>
    </div>
  `;
}

function formatRuleDate(value) {
  if (!value) {
    return "Fecha desconocida";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha desconocida";
  }

  return date.toLocaleString("es-CO");
}

function formatRuleType(type) {
  if (type === "income") {
    return "Ingreso";
  }

  return "Gasto";
}
