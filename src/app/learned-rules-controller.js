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
    setStatus(elements, "The selected learned rule could not be found.");
    return;
  }

  const confirmed = window.confirm(
    "Delete this learned category rule?\n\n" +
      `Pattern: ${ruleToDelete.pattern}\n` +
      `Category: ${formatCategory(ruleToDelete.category)}\n\n` +
      "Future PDFs will no longer use this learned rule automatically."
  );

  if (!confirmed) {
    setStatus(elements, "Delete learned rule action was cancelled.");
    return;
  }

  const updatedRules = deleteLearnedCategoryRule(ruleId);

  renderDashboard({
    debugRawText: "--- LEARNED CATEGORY RULE DELETED ---",
  });

  setStatus(
    elements,
    `Learned rule deleted. Active learned rules: ${updatedRules.length}.`
  );
}
