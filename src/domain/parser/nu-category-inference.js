import { CATEGORY_RULES } from "../../config/categories.js";
import { normalizeText } from "../../utils/text.js";
import { inferCategoryFromLearnedRules } from "../category-learning.js";

export function inferCategoryFromDescription(description, type, options = {}) {
  if (type === "income") {
    return {
      category: "income",
      source: "auto",
    };
  }

  const learnedRule = inferCategoryFromLearnedRules(
    options.movementLike ?? {
      description,
      type,
    },
    options.learnedCategoryRules
  );

  if (learnedRule) {
    return {
      category: learnedRule.category,
      source: "manual-learning",
    };
  }

  const normalizedDescription = normalizeText(description);

  for (const rule of CATEGORY_RULES) {
    const hasMatch = rule.keywords.some((keyword) =>
      normalizedDescription.includes(normalizeText(keyword))
    );

    if (hasMatch) {
      return {
        category: rule.category,
        source: "auto",
      };
    }
  }

  return {
    category: "uncategorized",
    source: "default",
  };
}
