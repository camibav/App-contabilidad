const RECURRING_EXPENSE_EXCLUSIONS_STORAGE_KEY =
  "nubank-dashboard-recurring-expense-exclusions";

export function getRecurringExpenseExclusions() {
  const storedExclusions = localStorage.getItem(
    RECURRING_EXPENSE_EXCLUSIONS_STORAGE_KEY
  );

  if (!storedExclusions) {
    return [];
  }

  try {
    return normalizeRecurringExpenseExclusions(JSON.parse(storedExclusions));
  } catch {
    clearRecurringExpenseExclusions();
    return [];
  }
}

export function saveRecurringExpenseExclusions(exclusions = []) {
  const normalizedExclusions = normalizeRecurringExpenseExclusions(exclusions);

  localStorage.setItem(
    RECURRING_EXPENSE_EXCLUSIONS_STORAGE_KEY,
    JSON.stringify(normalizedExclusions)
  );

  return normalizedExclusions;
}

export function addRecurringExpenseExclusion(recurringExpense) {
  const exclusion = normalizeRecurringExpenseExclusion({
    key: recurringExpense?.key,
    description: recurringExpense?.description,
    category: recurringExpense?.category,
    excludedAt: new Date().toISOString(),
  });

  if (!exclusion) {
    return getRecurringExpenseExclusions();
  }

  const exclusionsMap = new Map(
    getRecurringExpenseExclusions().map((currentExclusion) => [
      currentExclusion.key,
      currentExclusion,
    ])
  );

  exclusionsMap.set(exclusion.key, exclusion);

  return saveRecurringExpenseExclusions(Array.from(exclusionsMap.values()));
}

export function deleteRecurringExpenseExclusion(exclusionKey) {
  const safeExclusionKey = normalizeRecurringExpenseKey(exclusionKey);

  if (!safeExclusionKey) {
    return getRecurringExpenseExclusions();
  }

  return saveRecurringExpenseExclusions(
    getRecurringExpenseExclusions().filter(
      (exclusion) => exclusion.key !== safeExclusionKey
    )
  );
}

export function clearRecurringExpenseExclusions() {
  localStorage.removeItem(RECURRING_EXPENSE_EXCLUSIONS_STORAGE_KEY);
}

export function normalizeRecurringExpenseExclusions(exclusions = []) {
  if (!Array.isArray(exclusions)) {
    return [];
  }

  const exclusionsMap = new Map();

  for (const exclusion of exclusions) {
    const normalizedExclusion = normalizeRecurringExpenseExclusion(exclusion);

    if (!normalizedExclusion) {
      continue;
    }

    exclusionsMap.set(normalizedExclusion.key, normalizedExclusion);
  }

  return Array.from(exclusionsMap.values()).sort((firstExclusion, secondExclusion) =>
    String(firstExclusion.description).localeCompare(
      String(secondExclusion.description)
    )
  );
}

function normalizeRecurringExpenseExclusion(exclusion) {
  const key = normalizeRecurringExpenseKey(exclusion?.key);

  if (!key) {
    return null;
  }

  return {
    key,
    description: String(exclusion.description ?? key).trim() || key,
    category: String(exclusion.category ?? "uncategorized").trim() || "uncategorized",
    excludedAt: exclusion.excludedAt ?? new Date().toISOString(),
  };
}

function normalizeRecurringExpenseKey(key) {
  return String(key ?? "").trim();
}
