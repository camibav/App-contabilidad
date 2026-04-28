import { buildSummary } from "./summary.js";

const DEFAULT_TOP_EXPENSES_LIMIT = 10;
const DEFAULT_UNCATEGORIZED_LIMIT = 10;

export function buildDashboardStats(movements = []) {
  const safeMovements = Array.isArray(movements) ? movements : [];
  const uncategorizedMovements = getUncategorizedMovements(safeMovements);

  return {
    summary: buildSummary(safeMovements),
    byMonth: buildGroupedStats(safeMovements, "month"),
    byCategory: buildGroupedStats(safeMovements, "category"),
    bySource: buildGroupedStats(safeMovements, "source"),
    topExpenses: buildTopExpenses(safeMovements),
    uncategorizedTotal: uncategorizedMovements.length,
    uncategorizedMovements: buildUncategorizedMovements(uncategorizedMovements),
  };
}

function buildGroupedStats(movements, fieldName) {
  const groupedStats = new Map();

  for (const movement of movements) {
    const key = movement[fieldName] || "unknown";

    if (!groupedStats.has(key)) {
      groupedStats.set(key, {
        key,
        income: 0,
        expenses: 0,
        balance: 0,
        totalMovements: 0,
      });
    }

    const currentStats = groupedStats.get(key);

    if (movement.type === "income") {
      currentStats.income += movement.amount;
    }

    if (movement.type === "expense") {
      currentStats.expenses += Math.abs(movement.amount);
    }

    currentStats.balance = currentStats.income - currentStats.expenses;
    currentStats.totalMovements += 1;
  }

  return Array.from(groupedStats.values()).sort((a, b) =>
    a.key.localeCompare(b.key)
  );
}

function buildTopExpenses(movements, limit = DEFAULT_TOP_EXPENSES_LIMIT) {
  return movements
    .filter((movement) => movement.type === "expense")
    .map((movement) => ({
      ...movement,
      absoluteAmount: Math.abs(Number(movement.amount ?? 0)),
    }))
    .sort((a, b) => b.absoluteAmount - a.absoluteAmount)
    .slice(0, limit);
}

function getUncategorizedMovements(movements) {
  return movements.filter(isUncategorizedMovement);
}

function buildUncategorizedMovements(
  uncategorizedMovements,
  limit = DEFAULT_UNCATEGORIZED_LIMIT
) {
  return uncategorizedMovements
    .map((movement) => ({
      ...movement,
      absoluteAmount: Math.abs(Number(movement.amount ?? 0)),
    }))
    .sort((a, b) => {
      const amountComparison = b.absoluteAmount - a.absoluteAmount;

      if (amountComparison !== 0) {
        return amountComparison;
      }

      return String(b.date ?? "").localeCompare(String(a.date ?? ""));
    })
    .slice(0, limit);
}

function isUncategorizedMovement(movement) {
  const category = String(movement.category ?? "").trim().toLowerCase();

  return !category || category === "uncategorized";
}