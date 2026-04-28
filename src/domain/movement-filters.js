import { normalizeText } from "../utils/text.js";

export function filterMovements(movements = [], filters = {}) {
  const safeMovements = Array.isArray(movements) ? movements : [];
  const normalizedDescriptionQuery = normalizeText(filters.description ?? "");

  return safeMovements.filter((movement) => {
    if (filters.month && movement.month !== filters.month) {
      return false;
    }

    if (filters.source && !movementMatchesSource(movement, filters.source)) {
      return false;
    }

    if (filters.type && movement.type !== filters.type) {
      return false;
    }

    if (filters.category && movement.category !== filters.category) {
      return false;
    }

    if (normalizedDescriptionQuery) {
      const normalizedDescription = normalizeText(movement.description ?? "");

      if (!normalizedDescription.includes(normalizedDescriptionQuery)) {
        return false;
      }
    }

    return true;
  });
}

function movementMatchesSource(movement, selectedSource) {
  const source = String(selectedSource ?? "").trim();

  if (!source) {
    return true;
  }

  if (movement.source === source) {
    return true;
  }

  if (!Array.isArray(movement.sources)) {
    return false;
  }

  return movement.sources.includes(source);
}
