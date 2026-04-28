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

    if (!parsedData || !Array.isArray(parsedData.movements)) {
      clearDashboardView({ elements, state });
      return;
    }

    const normalizedFiles = normalizeProcessedFiles(parsedData);
    const fallbackSource =
      parsedData.fileName ?? normalizedFiles.at(-1)?.name ?? "Unknown source";

    const learnedCategoryRules = getLearnedCategoryRules();
    const normalizedMovements = parsedData.movements.map((movement) =>
      normalizeStoredMovement(movement, fallbackSource, {
        learnedCategoryRules,
      })
    );

    const deduplicatedMovements = mergeMovementsById([], normalizedMovements);
    const dashboardStats = buildDashboardStats(deduplicatedMovements);

    state.data = {
      ...parsedData,
      fileName: fallbackSource,
      files: normalizedFiles,
      processedAt: parsedData.processedAt ?? new Date().toISOString(),
      movements: deduplicatedMovements,
      summary: dashboardStats.summary,
    };

    saveDashboardData(state.data);
    renderDashboard();

    setOutput(
      elements,
      "--- SAVED DATA ---\n" + JSON.stringify(state.data, null, 2)
    );

    setStatus(
      elements,
      `Saved data loaded. Files: ${state.data.files.length}. Movements: ${deduplicatedMovements.length}.`
    );
  } catch (error) {
    console.error(error);

    clearSavedDashboardData();
    resetDashboardData(state);
    resetTablePaginationState(state);
    clearFilterControls(elements);
    clearDashboardView({
      elements,
      state,
      resetFilters: true,
      resetOutput: true,
    });

    setStatus(elements, "Saved data was corrupted and has been removed.");
  }
}

export function createClearSavedDataHandler({ elements, state }) {
  return function handleClearSavedData() {
    const confirmed = window.confirm(
      "This action will permanently remove all saved dashboard data from this browser. Do you want to continue?"
    );

    if (!confirmed) {
      setStatus(elements, "Delete saved dashboard data action was cancelled.");
      return;
    }

    clearSavedDashboardData();
    resetDashboardData(state);
    resetTablePaginationState(state);
    clearFilterControls(elements);
    clearDashboardView({
      elements,
      state,
      resetFilters: true,
      resetOutput: true,
    });

    setStatus(elements, "Saved dashboard data was removed.");
  };
}
