import { normalizeText } from "../utils/text.js";

const DESCRIPTION_PREFIX_PATTERNS = [
  /^ENVIASTE A\s+/,
  /^RECIBISTE DE\s+/,
  /^RECIBISTE\s+DE\s+/,
  /^PAGO A\s+/,
  /^PAGO EN\s+/,
  /^COMPRA EN\s+/,
  /^TRANSFERENCIA A\s+/,
  /^TRANSFERENCIA DE\s+/,
];

export function findSimilarMovements(movements = [], targetMovement) {
  const safeMovements = Array.isArray(movements) ? movements : [];

  if (!targetMovement) {
    return [];
  }

  const targetKey = buildMovementSimilarityKey(targetMovement);
  const targetType = targetMovement.type ?? "";

  if (!targetKey) {
    return [];
  }

  return safeMovements.filter((movement) => {
    if (!movement || movement.id === targetMovement.id) {
      return false;
    }

    if ((movement.type ?? "") !== targetType) {
      return false;
    }

    return buildMovementSimilarityKey(movement) === targetKey;
  });
}

export function buildMovementSimilarityKey(movement) {
  let normalizedDescription = normalizeText(movement?.description ?? "");

  for (const pattern of DESCRIPTION_PREFIX_PATTERNS) {
    normalizedDescription = normalizedDescription.replace(pattern, "");
  }

  return normalizedDescription.replace(/\s+/g, " ").trim();
}
