import {
  renderLearnedCategoryRulesPanel,
  setStatus,
} from "../ui/dashboard-ui.js";
import {
  deleteLearnedCategoryRule,
  getLearnedCategoryRules,
} from "../services/category-rules-storage.service.js";
import { formatCategory } from "../utils/formatters.js";

export function setupLearnedRulesListeners({ elements, renderDashboard }) {
  if (!elements.learnedCategoryRulesList) {
    return;
  }

  elements.learnedCategoryRulesList.addEventListener("click", (event) =>
    handleLearnedRuleAction({ elements, renderDashboard, event })
  );

  renderLearnedCategoryRulesPanel(elements, getLearnedCategoryRules());
}

function handleLearnedRuleAction({ elements, renderDashboard, event }) {
  const deleteButton = event.target.closest("[data-delete-learned-rule-id]");

  if (!deleteButton) {
    return;
  }

  const ruleId = deleteButton.dataset.deleteLearnedRuleId;

  if (!ruleId) {
    return;
  }

  const existingRules = getLearnedCategoryRules();
  const ruleToDelete = existingRules.find((rule) => rule.id === ruleId);

  if (!ruleToDelete) {
    renderLearnedCategoryRulesPanel(elements, existingRules);
    setStatus(elements, "No se encontró la regla aprendida seleccionada.");
    return;
  }

  const confirmed = window.confirm(
    "¿Eliminar esta regla de categoría aprendida?\n\n" +
      `Patrón: ${ruleToDelete.pattern}\n` +
      `Categoría: ${formatCategory(ruleToDelete.category)}\n\n` +
      "Los futuros PDF ya no usarán esta regla aprendida automáticamente."
  );

  if (!confirmed) {
    setStatus(elements, "La eliminación de la regla aprendida fue cancelada.");
    return;
  }

  const updatedRules = deleteLearnedCategoryRule(ruleId);

  renderDashboard({
    debugRawText: "--- REGLA DE CATEGORÍA APRENDIDA ELIMINADA ---",
  });

  setStatus(
    elements,
    `Regla aprendida eliminada. Reglas aprendidas activas: ${updatedRules.length}.`
  );
}
