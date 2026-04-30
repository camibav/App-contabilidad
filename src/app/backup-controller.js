import {
  clearFilterControls,
  renderBackupButtonState,
  setOutput,
  setStatus,
} from "../ui/dashboard-ui.js";
import { normalizeDashboardData } from "../domain/dashboard-data-schema.js";
import {
  getLearnedCategoryRules,
  saveLearnedCategoryRules,
} from "../services/category-rules-storage.service.js";
import {
  getRecurringExpenseExclusions,
  saveRecurringExpenseExclusions,
} from "../services/recurring-expenses-storage.service.js";
import { formatError } from "../utils/formatters.js";
import { resetDashboardPagination, setDashboardData } from "./dashboard-actions.js";
import { confirmAction } from "./confirm-action.js";
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

  const confirmed = await confirmAction({
    elements,
    title: "Restaurar backup JSON",
    message:
      "Restaurar este backup reemplazará los datos guardados actuales, las reglas de categoría aprendidas y las exclusiones de gastos recurrentes en este navegador.",
    confirmLabel: "Restaurar backup",
    cancelLabel: "Cancelar",
    tone: "warning",
  });

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

    resetDashboardPagination(state);
    clearFilterControls(elements);
    setDashboardData(state, restoredData);
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
      `Backup restaurado correctamente. Archivos: ${state.data.files.length}. Movimientos: ${state.data.movements.length}. Versión de datos: ${state.data.schemaVersion}. Reglas aprendidas: ${learnedCategoryRules.length}. Exclusiones recurrentes: ${recurringExpenseExclusions.length}.`
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
  const { data, validMovements } = normalizeDashboardData(rawData, {
    learnedCategoryRules,
  });

  if (!validMovements.length) {
    throw new Error("El backup no contiene movimientos válidos para restaurar.");
  }

  return data;
}

function getStoredMovementsCount(state) {
  return Array.isArray(state.data?.movements) ? state.data.movements.length : 0;
}
