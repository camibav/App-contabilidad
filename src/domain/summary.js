export function buildSummary(movements) {
  const income = movements
    .filter((movement) => movement.type === "income")
    .reduce((total, movement) => total + movement.amount, 0);

  const expenses = movements
    .filter((movement) => movement.type === "expense")
    .reduce((total, movement) => total + Math.abs(movement.amount), 0);

  return {
    totalMovements: movements.length,
    income,
    expenses,
    balance: income - expenses,
  };
}

export function getEmptySummary() {
  return {
    income: 0,
    expenses: 0,
    balance: 0,
    totalMovements: 0,
  };
}
