import { CATEGORY_OPTIONS } from "../config/categories.js";

const VALID_MOVEMENT_TYPES = ["income", "expense"];

export function validateMovement(movement) {
  const errors = [];

  if (!movement || typeof movement !== "object") {
    return {
      isValid: false,
      errors: ["El movimiento no es un objeto válido."],
    };
  }

  const id = String(movement.id ?? "").trim();
  const date = String(movement.date ?? "").trim();
  const month = String(movement.month ?? "").trim();
  const description = String(movement.description ?? "").trim();
  const amount = Number(movement.amount);
  const type = String(movement.type ?? "").trim();
  const category = String(movement.category ?? "").trim();

  if (!id) {
    errors.push("El movimiento no tiene id.");
  }

  if (!isValidIsoDate(date)) {
    errors.push("La fecha del movimiento no tiene formato válido YYYY-MM-DD.");
  }

  if (month && !isValidIsoMonth(month)) {
    errors.push("El mes del movimiento no tiene formato válido YYYY-MM.");
  }

  if (!description) {
    errors.push("El movimiento no tiene descripción.");
  }

  if (!Number.isFinite(amount)) {
    errors.push("El monto del movimiento no es válido.");
  }

  if (!isValidMovementType(type)) {
    errors.push("El tipo del movimiento no es válido.");
  }

  if (!isValidMovementCategory(category)) {
    errors.push("La categoría del movimiento no es válida.");
  }

  if (
    isValidMovementType(type) &&
    isValidMovementCategory(category) &&
    !canAssignCategoryToMovementType(category, type)
  ) {
    errors.push("La categoría no corresponde con el tipo del movimiento.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function partitionMovementsByValidation(movements = []) {
  const validMovements = [];
  const invalidMovements = [];

  if (!Array.isArray(movements)) {
    return {
      validMovements,
      invalidMovements,
    };
  }

  for (const movement of movements) {
    const validation = validateMovement(movement);

    if (validation.isValid) {
      validMovements.push(movement);
      continue;
    }

    invalidMovements.push({
      movement,
      errors: validation.errors,
    });
  }

  return {
    validMovements,
    invalidMovements,
  };
}

export function isValidMovementType(type) {
  return VALID_MOVEMENT_TYPES.includes(String(type ?? "").trim());
}

export function isValidMovementCategory(category) {
  return CATEGORY_OPTIONS.includes(String(category ?? "").trim());
}

export function canAssignCategoryToMovementType(category, type) {
  const normalizedCategory = String(category ?? "").trim();
  const normalizedType = String(type ?? "").trim();

  if (!isValidMovementCategory(normalizedCategory)) {
    return false;
  }

  if (normalizedType === "income") {
    return normalizedCategory === "income";
  }

  if (normalizedType === "expense") {
    return normalizedCategory !== "income";
  }

  return false;
}

export function normalizeMovementCategory(category, type) {
  const normalizedCategory = String(category ?? "").trim();
  const normalizedType = String(type ?? "").trim();

  if (canAssignCategoryToMovementType(normalizedCategory, normalizedType)) {
    return normalizedCategory;
  }

  if (normalizedType === "income") {
    return "income";
  }

  return "uncategorized";
}

export function getMovementCategoryOptions(type) {
  const normalizedType = String(type ?? "").trim();

  if (normalizedType === "income") {
    return ["income"];
  }

  if (normalizedType === "expense") {
    return CATEGORY_OPTIONS.filter((category) => category !== "income");
  }

  return CATEGORY_OPTIONS;
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === value;
}

function isValidIsoMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return false;
  }

  const month = Number(value.slice(5, 7));

  return month >= 1 && month <= 12;
}
