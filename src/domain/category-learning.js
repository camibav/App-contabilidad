import { buildMovementSimilarityKey } from "./movement-similarity.js";

export const LEARNED_CATEGORY_RULE_SOURCE = "manual-learning";

export function buildLearnedCategoryRule(movement, category) {
  const pattern = buildMovementSimilarityKey(movement);
  const normalizedCategory = String(category ?? "").trim();
  const type = movement?.type ?? "expense";

  if (!pattern || !normalizedCategory || !canLearnCategoryRule(normalizedCategory)) {
    return null;
  }

  const now = new Date().toISOString();

  return {
    id: buildLearnedCategoryRuleId({ pattern, type }),
    pattern,
    category: normalizedCategory,
    type,
    source: LEARNED_CATEGORY_RULE_SOURCE,
    createdAt: now,
    updatedAt: now,
  };
}

export function upsertLearnedCategoryRule(rules = [], incomingRule) {
  const normalizedIncomingRule = normalizeLearnedCategoryRule(incomingRule);

  if (!normalizedIncomingRule) {
    return normalizeLearnedCategoryRules(rules);
  }

  const normalizedRules = normalizeLearnedCategoryRules(rules);
  const ruleIndex = normalizedRules.findIndex(
    (rule) => rule.id === normalizedIncomingRule.id
  );

  if (ruleIndex === -1) {
    return [...normalizedRules, normalizedIncomingRule].sort(sortLearnedRules);
  }

  const existingRule = normalizedRules[ruleIndex];

  normalizedRules[ruleIndex] = {
    ...existingRule,
    ...normalizedIncomingRule,
    createdAt: existingRule.createdAt ?? normalizedIncomingRule.createdAt,
    updatedAt: new Date().toISOString(),
  };

  return normalizedRules.sort(sortLearnedRules);
}

export function inferCategoryFromLearnedRules(movementLike, rules = []) {
  const normalizedRules = normalizeLearnedCategoryRules(rules);

  if (!normalizedRules.length) {
    return null;
  }

  const movementType = movementLike?.type ?? "expense";

  if (movementType === "income") {
    return null;
  }

  const movementKey = buildMovementSimilarityKey(movementLike);

  if (!movementKey) {
    return null;
  }

  return (
    normalizedRules.find((rule) => {
      if (rule.type && rule.type !== movementType) {
        return false;
      }

      return rule.pattern === movementKey;
    }) ?? null
  );
}

export function normalizeLearnedCategoryRules(rules = []) {
  if (!Array.isArray(rules)) {
    return [];
  }

  const rulesMap = new Map();

  for (const rule of rules) {
    const normalizedRule = normalizeLearnedCategoryRule(rule);

    if (!normalizedRule) {
      continue;
    }

    rulesMap.set(normalizedRule.id, normalizedRule);
  }

  return Array.from(rulesMap.values()).sort(sortLearnedRules);
}

export function normalizeLearnedCategoryRule(rule) {
  if (!rule || typeof rule !== "object") {
    return null;
  }

  const pattern = String(rule.pattern ?? "").trim();
  const category = String(rule.category ?? "").trim();
  const type = String(rule.type ?? "expense").trim() || "expense";

  if (!pattern || !category || !canLearnCategoryRule(category)) {
    return null;
  }

  const now = new Date().toISOString();

  return {
    id: rule.id ?? buildLearnedCategoryRuleId({ pattern, type }),
    pattern,
    category,
    type,
    source: rule.source ?? LEARNED_CATEGORY_RULE_SOURCE,
    createdAt: rule.createdAt ?? now,
    updatedAt: rule.updatedAt ?? rule.createdAt ?? now,
  };
}

export function canLearnCategoryRule(category) {
  return category !== "uncategorized";
}

function buildLearnedCategoryRuleId({ pattern, type }) {
  return `${type}-${pattern}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sortLearnedRules(a, b) {
  const typeComparison = String(a.type).localeCompare(String(b.type));

  if (typeComparison !== 0) {
    return typeComparison;
  }

  return String(a.pattern).localeCompare(String(b.pattern));
}
