import { setStatus } from "../ui/dashboard-ui.js";
import { clearDashboardView, renderDashboardView } from "./dashboard-view.js";
import { createPdfInputChangeHandler } from "./pdf-processing.js";
import {
  createClearSavedDataHandler,
  loadSavedData,
} from "./storage-controller.js";
import { setupFilterListeners } from "./filters-controller.js";
import {
  setupTablePaginationListeners,
  setupTableSortingListeners,
} from "./table-controller.js";
import { createCategoryChangeHandler } from "./category-controller.js";
import { setupCsvExportListener } from "./csv-export-controller.js";
import { setupBackupListeners } from "./backup-controller.js";
import { setupLearnedRulesListeners } from "./learned-rules-controller.js";
import { setupRecurringExpensesListeners } from "./recurring-expenses-controller.js";
import { setupProcessedFilesListeners } from "./processed-files-controller.js";

export function initializeDashboardApp({ elements, state }) {
  const renderDashboard = (options = {}) =>
    renderDashboardView({ elements, state, ...options });

  setStatus(elements, "Listo. Selecciona uno o varios archivos PDF.");
  clearDashboardView({ elements, state });
  loadSavedData({ elements, state, renderDashboard });

  elements.pdfInput.addEventListener(
    "change",
    createPdfInputChangeHandler({ elements, state, renderDashboard })
  );

  if (elements.clearSavedDataButton) {
    elements.clearSavedDataButton.addEventListener(
      "click",
      createClearSavedDataHandler({ elements, state })
    );
  }

  const handleCategoryChange = createCategoryChangeHandler({
    elements,
    state,
    renderDashboard,
  });

  if (elements.movementsTableBody) {
    elements.movementsTableBody.addEventListener("change", handleCategoryChange);
  }

  if (elements.uncategorizedMovementsList) {
    elements.uncategorizedMovementsList.addEventListener(
      "change",
      handleCategoryChange
    );
  }

  setupFilterListeners({ elements, state, renderDashboard });
  setupTablePaginationListeners({ elements, state, renderDashboard });
  setupTableSortingListeners({ elements, state, renderDashboard });
  setupProcessedFilesListeners({ elements, state, renderDashboard });
  setupCsvExportListener({ elements, state });
  setupBackupListeners({ elements, state, renderDashboard });
  setupLearnedRulesListeners({ elements, state, renderDashboard });
  setupRecurringExpensesListeners({ elements, renderDashboard });
}
