import {
  CATEGORY_LABELS_ES,
  MOVEMENT_TYPE_LABELS_ES,
} from "../config/translations.js";

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMovementType(type) {
  return MOVEMENT_TYPE_LABELS_ES[type] ?? "Gasto";
}

export function formatCategory(category) {
  if (!category) {
    return CATEGORY_LABELS_ES.uncategorized;
  }

  if (CATEGORY_LABELS_ES[category]) {
    return CATEGORY_LABELS_ES[category];
  }

  return String(category)
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatError(error) {
  if (error instanceof Error) {
    return `Error: ${error.message}\n\nRevisa la consola del navegador para ver más detalles.`;
  }

  return String(error);
}
