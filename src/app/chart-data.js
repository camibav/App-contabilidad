const DEFAULT_CATEGORY_SHARE_LIMIT = 6;
const OTHER_CATEGORY_KEY = "other-categories";

export function buildExpenseCategoryShareData(stats = {}, options = {}) {
  const limit = normalizeLimit(options.limit ?? DEFAULT_CATEGORY_SHARE_LIMIT);
  const byCategory = Array.isArray(stats.byCategory) ? stats.byCategory : [];

  const expenseGroups = byCategory
    .filter((group) => Number(group.expenses) > 0)
    .map((group) => ({
      key: group.key ?? "uncategorized",
      expenses: Number(group.expenses ?? 0),
      totalMovements: Number(group.totalMovements ?? 0),
    }))
    .sort((a, b) => b.expenses - a.expenses);

  if (!expenseGroups.length) {
    return {
      totalExpenses: 0,
      items: [],
    };
  }

  const groupedItems = groupSmallCategories(expenseGroups, limit);
  const totalExpenses = groupedItems.reduce(
    (total, item) => total + item.expenses,
    0
  );

  return {
    totalExpenses,
    items: groupedItems.map((item) => ({
      ...item,
      percentage: totalExpenses > 0 ? (item.expenses / totalExpenses) * 100 : 0,
    })),
  };
}

export function buildMonthlyIncomeVsExpensesData(stats = {}) {
  const byMonth = Array.isArray(stats.byMonth) ? stats.byMonth : [];

  return byMonth
    .filter(
      (group) => Number(group.income ?? 0) > 0 || Number(group.expenses ?? 0) > 0
    )
    .map((group) => {
      const income = Number(group.income ?? 0);
      const expenses = Number(group.expenses ?? 0);

      return {
        month: group.key ?? "unknown",
        income,
        expenses,
        balance: income - expenses,
        totalMovements: Number(group.totalMovements ?? 0),
      };
    })
    .sort((a, b) => String(a.month).localeCompare(String(b.month)));
}

function groupSmallCategories(groups, limit) {
  if (groups.length <= limit) {
    return groups;
  }

  const visibleLimit = Math.max(limit - 1, 1);
  const visibleGroups = groups.slice(0, visibleLimit);
  const remainingGroups = groups.slice(visibleLimit);

  const otherExpenses = remainingGroups.reduce(
    (total, group) => total + group.expenses,
    0
  );
  const otherMovements = remainingGroups.reduce(
    (total, group) => total + group.totalMovements,
    0
  );

  if (otherExpenses <= 0) {
    return visibleGroups;
  }

  return [
    ...visibleGroups,
    {
      key: OTHER_CATEGORY_KEY,
      label: "Other",
      expenses: otherExpenses,
      totalMovements: otherMovements,
    },
  ];
}

function normalizeLimit(value) {
  const limit = Number(value);

  if (!Number.isInteger(limit) || limit < 2) {
    return DEFAULT_CATEGORY_SHARE_LIMIT;
  }

  return limit;
}
