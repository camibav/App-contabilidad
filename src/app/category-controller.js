import { setStatus } from "../ui/dashboard-ui.js";
import { buildDashboardStats } from "../domain/dashboard-stats.js";
import {
  buildLearnedCategoryRule,
  canLearnCategoryRule,
  upsertLearnedCategoryRule,
} from "../domain/category-learning.js";
import { findSimilarMovements } from "../domain/movement-similarity.js";
import { canAssignCategoryToMovementType } from "../domain/movement-validation.js";
import {
  getLearnedCategoryRules,
  saveLearnedCategoryRules,
} from "../services/category-rules-storage.service.js";
import { saveDashboardData } from "../services/storage.service.js";
import { formatCategory } from "../utils/formatters.js";

export function createCategoryChangeHandler({ elements, state, renderDashboard }) {
  return function handleCategoryChange(event) {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    if (!target.classList.contains("category-select")) {
      return;
    }

    const movementId = target.dataset.movementId;
    const newCategory = target.value;

    if (!movementId || !newCategory || !state.data) {
      return;
    }

    const movements = Array.isArray(state.data.movements)
      ? state.data.movements
      : [];

    const targetMovement = movements.find((movement) => movement.id === movementId);

    if (!targetMovement) {
      renderDashboard();
      setStatus(elements, "No se encontró el movimiento seleccionado.");
      return;
    }

    if (!canAssignCategoryToMovementType(newCategory, targetMovement.type)) {
      renderDashboard();
      setStatus(
        elements,
        "La categoría seleccionada no es válida para el tipo de movimiento.",
        "error"
      );
      return;
    }

    const similarMovements = findSimilarMovements(movements, targetMovement).filter(
      (movement) => movement.category !== newCategory
    );

    const shouldApplyToSimilar = shouldApplyCategoryToSimilarMovements({
      targetMovement,
      newCategory,
      similarMovements,
    });

    const shouldRememberRule = shouldRememberCategoryRule({
      targetMovement,
      newCategory,
    });

    const movementIdsToUpdate = new Set([
      movementId,
      ...(shouldApplyToSimilar
        ? similarMovements.map((movement) => movement.id)
        : []),
    ]);

    const updatedMovements = movements.map((movement) => {
      if (!movementIdsToUpdate.has(movement.id)) {
        return movement;
      }

      return {
        ...movement,
        category: newCategory,
        categorySource: "manual",
      };
    });

    const learnedRuleWasSaved = shouldRememberRule
      ? saveLearnedRuleFromMovement({ targetMovement, newCategory })
      : false;

    const dashboardStats = buildDashboardStats(updatedMovements);

    state.data = {
      ...state.data,
      processedAt: new Date().toISOString(),
      movements: updatedMovements,
      summary: dashboardStats.summary,
    };

    state.data = saveDashboardData(state.data);

    renderDashboard({
      debugRawText: buildCategoryDebugMessage({
        appliedToSimilar: shouldApplyToSimilar,
        learnedRuleWasSaved,
      }),
    });

    setStatus(
      elements,
      buildCategoryUpdateStatus({
        newCategory,
        updatedCount: movementIdsToUpdate.size,
        appliedToSimilar: shouldApplyToSimilar,
        learnedRuleWasSaved,
      })
    );
  };
}

function shouldApplyCategoryToSimilarMovements({
  targetMovement,
  newCategory,
  similarMovements,
}) {
  if (!similarMovements.length) {
    return false;
  }

  const movementLabel = similarMovements.length === 1 ? "movimiento" : "movimientos";
  const formattedCategory = formatCategory(newCategory);
  const description = targetMovement.description ?? "Movimiento desconocido";

  return window.confirm(
    `¿Aplicar "${formattedCategory}" a ${similarMovements.length} ${movementLabel} similar(es)?\n\n` +
      `Movimiento base:\n${description}\n\n` +
      "Si cancelas, solo se actualizará el movimiento seleccionado."
  );
}

function shouldRememberCategoryRule({ targetMovement, newCategory }) {
  if (!canLearnCategoryRule(newCategory)) {
    return false;
  }

  const learnedRule = buildLearnedCategoryRule(targetMovement, newCategory);

  if (!learnedRule) {
    return false;
  }

  const formattedCategory = formatCategory(newCategory);
  const description = targetMovement.description ?? "Movimiento desconocido";

  return window.confirm(
    `¿Recordar "${formattedCategory}" para futuros movimientos con una descripción similar?\n\n` +
      `Patrón:\n${learnedRule.pattern}\n\n` +
      `Movimiento base:\n${description}\n\n` +
      "Si aceptas, los futuros PDF podrán usar esta regla aprendida automáticamente."
  );
}

function saveLearnedRuleFromMovement({ targetMovement, newCategory }) {
  const learnedRule = buildLearnedCategoryRule(targetMovement, newCategory);

  if (!learnedRule) {
    return false;
  }

  const existingRules = getLearnedCategoryRules();
  const updatedRules = upsertLearnedCategoryRule(existingRules, learnedRule);

  saveLearnedCategoryRules(updatedRules);

  return true;
}

function buildCategoryDebugMessage({ appliedToSimilar, learnedRuleWasSaved }) {
  if (appliedToSimilar && learnedRuleWasSaved) {
    return "--- CATEGORÍA ACTUALIZADA EN MOVIMIENTOS SIMILARES Y REGLA APRENDIDA GUARDADA ---";
  }

  if (appliedToSimilar) {
    return "--- CATEGORÍA ACTUALIZADA EN MOVIMIENTOS SIMILARES ---";
  }

  if (learnedRuleWasSaved) {
    return "--- CATEGORÍA ACTUALIZADA Y REGLA APRENDIDA GUARDADA ---";
  }

  return "--- CATEGORÍA ACTUALIZADA DESDE EL SELECTOR ---";
}

function buildCategoryUpdateStatus({
  newCategory,
  updatedCount,
  appliedToSimilar,
  learnedRuleWasSaved,
}) {
  const formattedCategory = formatCategory(newCategory);
  const movementLabel = updatedCount === 1 ? "movimiento" : "movimientos";
  const baseMessage = appliedToSimilar
    ? `Categoría actualizada: ${formattedCategory}. Se actualizaron ${updatedCount} ${movementLabel} similares.`
    : `Categoría actualizada: ${formattedCategory}.`;

  if (!learnedRuleWasSaved) {
    return baseMessage;
  }

  return `${baseMessage} Regla aprendida guardada para futuros PDF.`;
}
