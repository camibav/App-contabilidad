import { normalizeLearnedCategoryRules } from "../domain/category-learning.js";

const LEARNED_CATEGORY_RULES_STORAGE_KEY =
  "nubank-dashboard-learned-category-rules";

export function saveLearnedCategoryRules(rules = []) {
  const normalizedRules = normalizeLearnedCategoryRules(rules);

  localStorage.setItem(
    LEARNED_CATEGORY_RULES_STORAGE_KEY,
    JSON.stringify(normalizedRules)
  );

  return normalizedRules;
}

export function getLearnedCategoryRules() {
  const storedRules = localStorage.getItem(LEARNED_CATEGORY_RULES_STORAGE_KEY);

  if (!storedRules) {
    return [];
  }

  try {
    return normalizeLearnedCategoryRules(JSON.parse(storedRules));
  } catch {
    clearLearnedCategoryRules();
    return [];
  }
}

export function deleteLearnedCategoryRule(ruleId) {
  const safeRuleId = String(ruleId ?? "").trim();

  if (!safeRuleId) {
    return getLearnedCategoryRules();
  }

  const updatedRules = getLearnedCategoryRules().filter(
    (rule) => rule.id !== safeRuleId
  );

  return saveLearnedCategoryRules(updatedRules);
}

export function clearLearnedCategoryRules() {
  localStorage.removeItem(LEARNED_CATEGORY_RULES_STORAGE_KEY);
}
