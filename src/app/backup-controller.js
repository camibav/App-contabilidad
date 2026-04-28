import {
  clearFilterControls,
  renderBackupButtonState,
  setOutput,
  setStatus,
} from "../ui/dashboard-ui.js";
import { buildDashboardStats } from "../domain/dashboard-stats.js";
import {
  mergeMovementsById,
  normalizeProcessedFiles,
  normalizeStoredMovement,
} from "../domain/movements.js";
import {
  getLearnedCategoryRules,
  saveLearnedCategoryRules,
} from "../services/category-rules-storage.service.js";
import {
  getRecurringExpenseExclusions,
  saveRecurringExpenseExclusions,
} from "../services/recurring-expenses-storage.service.js";
import { saveDashboardData } from "../services/storage.service.js";
import { formatError } from "../utils/formatters.js";
import { resetTablePaginationState } from "./dashboard-state.js";
import {
  buildBackupFileName,
  buildDashboardBackup,
  downloadJsonFile,
  getDashboardDataFromBackupPayload,
  getLearnedCategoryRulesFromBackupPayload,
  getRecurringExpenseExclusionsFromBackupPayload,
  readJsonFile,
} from "./backup.js";

export function setupBackupListeners({ elements, state, renderDashboard }) {
  if (elements.exportBackupJsonButton) {
    elements.exportBackupJsonButton.addEventListener("click", () =>
      handleExportBackupJson({ elements, state })
    );
  }

  if (elements.importBackupJsonButton && elements.backupJsonInput) {
    elements.importBackupJsonButton.addEventListener("click", () =>
      elements.backupJsonInput.click()
    );

    elements.backupJsonInput.addEventListener("change", (event) =>
      handleRestoreBackupJson({
        elements,
        state,
        renderDashboard,
        event,
      })
    );
  }

  renderBackupButtonState(elements, getStoredMovementsCount(state));
}

function handleExportBackupJson({ elements, state }) {
  const movementsCount = getStoredMovementsCount(state);

  if (!movementsCount) {
    renderBackupButtonState(elements, 0);
    setStatus(elements, "There is no dashboard data available to back up.");
    return;
  }

  const learnedCategoryRules = getLearnedCategoryRules();
  const recurringExpenseExclusions = getRecurringExpenseExclusions();
  const backup = buildDashboardBackup(state.data, {
    learnedCategoryRules,
    recurringExpenseExclusions,
  });
  const fileName = buildBackupFileName();

  downloadJsonFile({
    data: backup,
    fileName,
  });

  renderBackupButtonState(elements, movementsCount);

  setStatus(
    elements,
    `Backup JSON exported successfully. Movements included: ${movementsCount}. Learned rules included: ${learnedCategoryRules.length}. Recurring exclusions included: ${recurringExpenseExclusions.length}.`
  );
}

async function handleRestoreBackupJson({
  elements,
  state,
  renderDashboard,
  event,
}) {
  const input = event.target;

  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  const file = input.files?.[0];

  if (!file) {
    return;
  }

  const confirmed = window.confirm(
    "Restoring this backup will replace the current saved dashboard data, learned category rules and recurring expense exclusions in this browser. Do you want to continue?"
  );

  if (!confirmed) {
    input.value = "";
    setStatus(elements, "Restore backup action was cancelled.");
    return;
  }

  try {
    const payload = await readJsonFile(file);
    const learnedCategoryRules = getLearnedCategoryRulesFromBackupPayload(payload);
    const recurringExpenseExclusions =
      getRecurringExpenseExclusionsFromBackupPayload(payload);
    const restoredData = normalizeRestoredDashboardData(
      getDashboardDataFromBackupPayload(payload),
      learnedCategoryRules
    );

    state.data = restoredData;

    resetTablePaginationState(state);
    clearFilterControls(elements);
    saveDashboardData(state.data);
    saveLearnedCategoryRules(learnedCategoryRules);
    saveRecurringExpenseExclusions(recurringExpenseExclusions);

    renderDashboard({
      debugRawText: "--- DASHBOARD DATA RESTORED FROM JSON BACKUP ---",
    });

    setOutput(
      elements,
      "--- RESTORED BACKUP DATA ---\n" +
        JSON.stringify(
          {
            data: state.data,
            learnedCategoryRules,
            recurringExpenseExclusions,
          },
          null,
          2
        )
    );

    setStatus(
      elements,
      `Backup restored successfully. Files: ${state.data.files.length}. Movements: ${state.data.movements.length}. Learned rules: ${learnedCategoryRules.length}. Recurring exclusions: ${recurringExpenseExclusions.length}.`
    );
  } catch (error) {
    console.error(error);

    setStatus(elements, formatError(error));
  } finally {
    input.value = "";
    renderBackupButtonState(elements, getStoredMovementsCount(state));
  }
}

function normalizeRestoredDashboardData(rawData, learnedCategoryRules = []) {
  const normalizedFiles = normalizeProcessedFiles(rawData);
  const fallbackSource =
    rawData.fileName ?? normalizedFiles.at(-1)?.name ?? "Unknown source";

  const normalizedMovements = rawData.movements.map((movement) =>
    normalizeStoredMovement(movement, fallbackSource, {
      learnedCategoryRules,
    })
  );

  const deduplicatedMovements = mergeMovementsById([], normalizedMovements);
  const dashboardStats = buildDashboardStats(deduplicatedMovements);

  return {
    ...rawData,
    fileName: fallbackSource,
    files: normalizedFiles,
    processedAt: rawData.processedAt ?? new Date().toISOString(),
    movements: deduplicatedMovements,
    summary: dashboardStats.summary,
  };
}

function getStoredMovementsCount(state) {
  return Array.isArray(state.data?.movements) ? state.data.movements.length : 0;
}
