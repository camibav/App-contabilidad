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
import {
  mergeMovementsById,
  normalizeProcessedFiles,
  normalizeStoredMovement,
} from "../domain/movements.js";
import { buildDashboardStats } from "../domain/dashboard-stats.js";
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

    const normalizedFiles = normalizeProcessedFiles(parsedData);
    const fallbackSource =
      normalizedFiles.at(-1)?.name ?? parsedData.fileName ?? "Origen desconocido";

    const learnedCategoryRules = getLearnedCategoryRules();
    const normalizedMovements = parsedData.movements.map((movement) =>
      normalizeStoredMovement(movement, fallbackSource, {
        learnedCategoryRules,
      })
    );

    const deduplicatedMovements = mergeMovementsById([], normalizedMovements);

    if (!deduplicatedMovements.length) {
      clearEmptySavedDashboardData({ elements, state });
      return;
    }

    const dashboardStats = buildDashboardStats(deduplicatedMovements);

    state.data = {
      ...parsedData,
      fileName: normalizedFiles.at(-1)?.name ?? fallbackSource,
      files: normalizedFiles,
      processedAt: parsedData.processedAt ?? new Date().toISOString(),
      movements: deduplicatedMovements,
      summary: dashboardStats.summary,
    };

    saveDashboardData(state.data);
    renderDashboard();

    setOutput(
      elements,
      "--- DATOS GUARDADOS ---\n" + JSON.stringify(state.data, null, 2)
    );

    setStatus(
      elements,
      `Datos guardados cargados. Archivos: ${state.data.files.length}. Movimientos: ${deduplicatedMovements.length}.`
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
