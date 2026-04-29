export function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMovementType(type) {
  if (type === "income") {
    return "Income";
  }

  return "Expense";
}

export function formatCategory(category) {
  if (!category) {
    return "Uncategorized";
  }

  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatError(error) {
  if (error instanceof Error) {
    return `Error: ${error.message}\n\nCheck the browser console for more details.`;
  }

  return String(error);
}
