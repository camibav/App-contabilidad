import { buildRecurringExpenses } from "./recurring-expenses.js";

const DEFAULT_MINIMUM_MONTHS = 2;
const ALL_RECURRING_EXPENSES_LIMIT = Number.MAX_SAFE_INTEGER;

export function buildFixedVariableExpensesSummary(movements = [], options = {}) {
  const safeMovements = Array.isArray(movements) ? movements : [];
  const expenseMovements = safeMovements.filter(
    (movement) => movement?.type === "expense"
  );

  const totalExpenses = expenseMovements.reduce(
    (total, movement) => total + Math.abs(Number(movement.amount ?? 0)),
    0
  );

  const recurringExpenses = Array.isArray(options.recurringExpenses)
    ? options.recurringExpenses
    : buildRecurringExpenses(expenseMovements, {
        minimumMonths: options.minimumMonths ?? DEFAULT_MINIMUM_MONTHS,
        limit: options.limit ?? ALL_RECURRING_EXPENSES_LIMIT,
      });

  const fixedExpenses = recurringExpenses.reduce(
    (total, recurringExpense) =>
      total + Math.abs(Number(recurringExpense.totalAmount ?? 0)),
    0
  );

  const normalizedFixedExpenses = Math.min(fixedExpenses, totalExpenses);
  const variableExpenses = Math.max(totalExpenses - normalizedFixedExpenses, 0);
  const fixedPercentage = calculatePercentage(
    normalizedFixedExpenses,
    totalExpenses
  );
  const variablePercentage = calculatePercentage(variableExpenses, totalExpenses);
  const estimatedMonthlyFixedExpenses = recurringExpenses.reduce(
    (total, recurringExpense) =>
      total + Math.abs(Number(recurringExpense.averageMonthlyAmount ?? 0)),
    0
  );

  const activeExpenseMonths = getActiveExpenseMonths(expenseMovements);

  return {
    totalExpenses,
    fixedExpenses: normalizedFixedExpenses,
    variableExpenses,
    fixedPercentage,
    variablePercentage,
    estimatedMonthlyFixedExpenses,
    recurringPatternsCount: recurringExpenses.length,
    activeExpenseMonths,
    activeExpenseMonthsCount: activeExpenseMonths.length,
  };
}

function calculatePercentage(value, total) {
  if (!total) {
    return 0;
  }

  return (Number(value) / Number(total)) * 100;
}

function getActiveExpenseMonths(expenseMovements) {
  return Array.from(
    new Set(expenseMovements.map((movement) => movement.month).filter(Boolean))
  ).sort();
}
