import {
  CATEGORY_LABELS_ES,
  MOVEMENT_TYPE_LABELS_ES,
} from "../config/translations.js";

export function formatCurrency(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export function formatMovementType(type) {
  const normalizedType = String(type ?? "").trim().toLowerCase();

  return MOVEMENT_TYPE_LABELS_ES[normalizedType] ?? "Desconocido";
}

export function formatCategory(category) {
  const normalizedCategory = String(category ?? "").trim();

  if (!normalizedCategory) {
    return CATEGORY_LABELS_ES.uncategorized;
  }

  return CATEGORY_LABELS_ES[normalizedCategory] ?? formatFallbackLabel(normalizedCategory);
}

export function formatError(error) {
  if (error instanceof Error) {
    return `Error: ${error.message}\n\nRevisa la consola del navegador para más detalles.`;
  }

  return String(error);
}

function formatFallbackLabel(value) {
  return String(value)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "Desconocido";
}
