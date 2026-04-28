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
    setStatus(elements, "No hay datos del dashboard disponibles para respaldar.");
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
    `Backup JSON exportado correctamente. Movimientos incluidos: ${movementsCount}. Reglas aprendidas incluidas: ${learnedCategoryRules.length}. Exclusiones recurrentes incluidas: ${recurringExpenseExclusions.length}.`
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
    "Restaurar este backup reemplazará los datos guardados actuales, las reglas de categoría aprendidas y las exclusiones de gastos recurrentes en este navegador. ¿Deseas continuar?"
  );

  if (!confirmed) {
    input.value = "";
    setStatus(elements, "La restauración del backup fue cancelada.");
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
      debugRawText: "--- DATOS DEL DASHBOARD RESTAURADOS DESDE BACKUP JSON ---",
    });

    setOutput(
      elements,
      "--- DATOS DE BACKUP RESTAURADOS ---\n" +
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
      `Backup restaurado correctamente. Archivos: ${state.data.files.length}. Movimientos: ${state.data.movements.length}. Reglas aprendidas: ${learnedCategoryRules.length}. Exclusiones recurrentes: ${recurringExpenseExclusions.length}.`
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
    rawData.fileName ?? normalizedFiles.at(-1)?.name ?? "Origen desconocido";

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
