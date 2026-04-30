import {
  clearFilterControls,
  setOutput,
  setStatus,
} from "../ui/dashboard-ui.js";
import {
  clearSavedDashboardData,
  getSavedDashboardData,
  saveDashboardData,
} from "../services/storage.service.js";
import { getLearnedCategoryRules } from "../services/category-rules-storage.service.js";
import { normalizeDashboardData } from "../domain/dashboard-data-schema.js";
import {
  resetDashboardData,
  resetTablePaginationState,
} from "./dashboard-state.js";
import { clearDashboardView } from "./dashboard-view.js";

export function loadSavedData({ elements, state, renderDashboard }) {
  try {
    const parsedData = getSavedDashboardData();

    if (!hasStoredMovements(parsedData)) {
      clearEmptySavedDashboardData({ elements, state });
      return;
    }

    const learnedCategoryRules = getLearnedCategoryRules();
    const {
      data: normalizedData,
      validMovements,
      invalidMovements,
      wasMigrated,
      previousSchemaVersion,
    } = normalizeDashboardData(parsedData, {
      learnedCategoryRules,
    });

    if (!validMovements.length) {
      clearEmptySavedDashboardData({ elements, state });
      return;
    }

    state.data = saveDashboardData(normalizedData);
    renderDashboard();

    setOutput(
      elements,
      "--- DATOS GUARDADOS ---\n" + JSON.stringify(state.data, null, 2)
    );

    setStatus(
      elements,
      buildSavedDataStatus({
        filesCount: state.data.files.length,
        validMovementsCount: validMovements.length,
        invalidMovementsCount: invalidMovements.length,
        wasMigrated,
        previousSchemaVersion,
        schemaVersion: state.data.schemaVersion,
      })
    );
  } catch (error) {
    console.error(error);

    clearSavedDashboardData();
    resetDashboardData(state);
    resetTablePaginationState(state);
    clearFilterControls(elements);
    clearDashboardView({ elements, state, resetFilters: true, resetOutput: true });

    setStatus(elements, "Los datos guardados estaban corruptos y fueron eliminados.");
  }
}

function buildSavedDataStatus({
  filesCount,
  validMovementsCount,
  invalidMovementsCount,
  wasMigrated,
  previousSchemaVersion,
  schemaVersion,
}) {
  const baseMessage = `Datos guardados cargados. Archivos: ${filesCount}. Movimientos: ${validMovementsCount}. Versión de datos: ${schemaVersion}.`;
  const details = [];

  if (wasMigrated) {
    details.push(`Migración aplicada desde versión ${previousSchemaVersion}.`);
  }

  if (invalidMovementsCount) {
    details.push(`Movimientos descartados por validación: ${invalidMovementsCount}.`);
  }

  if (!details.length) {
    return baseMessage;
  }

  return `${baseMessage} ${details.join(" ")}`;
}

function hasStoredMovements(parsedData) {
  return Array.isArray(parsedData?.movements) && parsedData.movements.length > 0;
}

function clearEmptySavedDashboardData({ elements, state }) {
  clearSavedDashboardData();
  resetDashboardData(state);
  resetTablePaginationState(state);
  clearFilterControls(elements);
  clearDashboardView({ elements, state, resetFilters: true, resetOutput: true });
}

export function createClearSavedDataHandler({ elements, state }) {
  return function handleClearSavedData() {
    const confirmed = window.confirm(
      "Esta acción eliminará permanentemente todos los datos guardados del dashboard en este navegador. ¿Deseas continuar?"
    );

    if (!confirmed) {
      setStatus(elements, "La eliminación de los datos guardados fue cancelada.");
      return;
    }

    clearSavedDashboardData();
    resetDashboardData(state);
    resetTablePaginationState(state);
    clearFilterControls(elements);
    clearDashboardView({ elements, state, resetFilters: true, resetOutput: true });

    setStatus(elements, "Los datos guardados del dashboard fueron eliminados.");
  };
}
