import { buildMovementSimilarityKey } from "./movement-similarity.js";

const DEFAULT_MINIMUM_MONTHS = 2;
const DEFAULT_LIMIT = 10;

export function buildRecurringExpenses(movements = [], options = {}) {
  const safeMovements = Array.isArray(movements) ? movements : [];
  const minimumMonths = Number(options.minimumMonths ?? DEFAULT_MINIMUM_MONTHS);
  const limit = Number(options.limit ?? DEFAULT_LIMIT);
  const excludedKeys = normalizeExcludedKeys(options.excludedKeys);

  const expenseGroups = groupExpenseMovementsBySimilarity(safeMovements);

  return Array.from(expenseGroups.values())
    .filter((group) => !excludedKeys.has(group.key))
    .map(buildRecurringExpenseSummary)
    .filter((expense) => expense.monthsCount >= minimumMonths)
    .sort(sortRecurringExpensesByImpact)
    .slice(0, limit);
}

function groupExpenseMovementsBySimilarity(movements) {
  const groups = new Map();

  for (const movement of movements) {
    if (!movement || movement.type !== "expense") {
      continue;
    }

    const similarityKey = buildMovementSimilarityKey(movement);

    if (!similarityKey) {
      continue;
    }

    if (!groups.has(similarityKey)) {
      groups.set(similarityKey, {
        key: similarityKey,
        movements: [],
        months: new Set(),
      });
    }

    const group = groups.get(similarityKey);

    group.movements.push(movement);

    if (movement.month) {
      group.months.add(movement.month);
    }
  }

  return groups;
}

function buildRecurringExpenseSummary(group) {
  const movements = group.movements;
  const months = Array.from(group.months).sort();
  const totalAmount = movements.reduce(
    (total, movement) => total + Math.abs(Number(movement.amount ?? 0)),
    0
  );

  const monthsCount = months.length;
  const movementCount = movements.length;
  const averageMonthlyAmount = monthsCount ? totalAmount / monthsCount : 0;
  const averageMovementAmount = movementCount ? totalAmount / movementCount : 0;
  const representativeMovement = getRepresentativeMovement(movements);

  return {
    key: group.key,
    description: representativeMovement?.description ?? group.key,
    category: getMostCommonValue(movements, "category") ?? "uncategorized",
    categorySource: getMostCommonValue(movements, "categorySource") ?? "default",
    type: "expense",
    months,
    monthsCount,
    movementCount,
    totalAmount,
    averageMonthlyAmount,
    averageMovementAmount,
    lastDate: getLatestDate(movements),
    movementIds: movements.map((movement) => movement.id).filter(Boolean),
  };
}

function getRepresentativeMovement(movements) {
  return [...movements].sort((firstMovement, secondMovement) => {
    const amountComparison =
      Math.abs(Number(secondMovement.amount ?? 0)) -
      Math.abs(Number(firstMovement.amount ?? 0));

    if (amountComparison !== 0) {
      return amountComparison;
    }

    return String(secondMovement.date ?? "").localeCompare(
      String(firstMovement.date ?? "")
    );
  })[0];
}

function getMostCommonValue(movements, fieldName) {
  const counts = new Map();

  for (const movement of movements) {
    const value = movement?.[fieldName];

    if (!value) {
      continue;
    }

    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return (
    Array.from(counts.entries()).sort((firstEntry, secondEntry) => {
      const countComparison = secondEntry[1] - firstEntry[1];

      if (countComparison !== 0) {
        return countComparison;
      }

      return String(firstEntry[0]).localeCompare(String(secondEntry[0]));
    })[0]?.[0] ?? null
  );
}

function getLatestDate(movements) {
  return (
    movements
      .map((movement) => movement.date)
      .filter(Boolean)
      .sort()
      .at(-1) ?? ""
  );
}

function sortRecurringExpensesByImpact(firstExpense, secondExpense) {
  const monthlyComparison =
    Number(secondExpense.averageMonthlyAmount) -
    Number(firstExpense.averageMonthlyAmount);

  if (monthlyComparison !== 0) {
    return monthlyComparison;
  }

  const totalComparison =
    Number(secondExpense.totalAmount) - Number(firstExpense.totalAmount);

  if (totalComparison !== 0) {
    return totalComparison;
  }

  return String(firstExpense.description).localeCompare(
    String(secondExpense.description)
  );
}

function normalizeExcludedKeys(excludedKeys = []) {
  if (excludedKeys instanceof Set) {
    return new Set(Array.from(excludedKeys).map(normalizeExcludedKey).filter(Boolean));
  }

  if (!Array.isArray(excludedKeys)) {
    return new Set();
  }

  return new Set(excludedKeys.map(normalizeExcludedKey).filter(Boolean));
}

function normalizeExcludedKey(value) {
  return String(value ?? "").trim();
}
