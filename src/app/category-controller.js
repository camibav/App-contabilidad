import { setStatus } from "../ui/dashboard-ui.js";
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
import { formatCategory } from "../utils/formatters.js";
import { buildDashboardDataWithMovements, setDashboardData } from "./dashboard-actions.js";
import { confirmAction } from "./confirm-action.js";

export function createCategoryChangeHandler({ elements, state, renderDashboard }) {
  return async function handleCategoryChange(event) {
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

    const shouldApplyToSimilar = await shouldApplyCategoryToSimilarMovements({
      elements,
      targetMovement,
      newCategory,
      similarMovements,
    });

    const shouldRememberRule = await shouldRememberCategoryRule({
      elements,
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

    setDashboardData(
      state,
      buildDashboardDataWithMovements(state.data, updatedMovements, {
        processedAt: new Date().toISOString(),
      })
    );

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

async function shouldApplyCategoryToSimilarMovements({
  elements,
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

  return confirmAction({
    elements,
    title: "Aplicar categoría a movimientos similares",
    message:
      `Categoría: ${formattedCategory}\n` +
      `Movimientos similares detectados: ${similarMovements.length} ${movementLabel}.\n\n` +
      `Movimiento base:\n${description}\n\n` +
      "Si cancelas, solo se actualizará el movimiento seleccionado.",
    confirmLabel: "Aplicar a similares",
    cancelLabel: "Solo este movimiento",
    tone: "warning",
  });
}

async function shouldRememberCategoryRule({ elements, targetMovement, newCategory }) {
  if (!canLearnCategoryRule(newCategory)) {
    return false;
  }

  const learnedRule = buildLearnedCategoryRule(targetMovement, newCategory);

  if (!learnedRule) {
    return false;
  }

  const formattedCategory = formatCategory(newCategory);
  const description = targetMovement.description ?? "Movimiento desconocido";

  return confirmAction({
    elements,
    title: "Guardar regla de categoría aprendida",
    message:
      `Categoría: ${formattedCategory}\n\n` +
      `Patrón:\n${learnedRule.pattern}\n\n` +
      `Movimiento base:\n${description}\n\n` +
      "Si aceptas, los futuros PDF podrán usar esta regla aprendida automáticamente.",
    confirmLabel: "Guardar regla",
    cancelLabel: "No guardar",
    tone: "info",
  });
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
