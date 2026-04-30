import { buildDashboardStats } from "../domain/dashboard-stats.js";
import { removeProcessedFileFromDashboardData } from "../domain/movements.js";
import { saveDashboardData } from "../services/storage.service.js";
import { setStatus } from "../ui/dashboard-ui.js";
import { resetTablePaginationState } from "./dashboard-state.js";

export function setupProcessedFilesListeners({ elements, state, renderDashboard }) {
  if (!elements.processedFilesList) return;

  elements.processedFilesList.addEventListener("click", (event) =>
    handleProcessedFileAction({ elements, state, renderDashboard, event })
  );
}

function handleProcessedFileAction({ elements, state, renderDashboard, event }) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const deleteButton = target.closest("[data-remove-processed-file]");
  if (!deleteButton) return;

  const fileName = deleteButton.dataset.removeProcessedFile;
  if (!fileName || !state.data) return;

  const confirmed = window.confirm(
    `¿Quitar "${fileName}" del dashboard?\n\n` +
      "Esto eliminará el archivo procesado y los movimientos que solo pertenecen a ese archivo. " +
      "Los movimientos que también estén en otros PDF se conservarán."
  );

  if (!confirmed) {
    setStatus(elements, "La eliminación del archivo procesado fue cancelada.");
    return;
  }

  const updatedData = removeProcessedFileFromDashboardData(state.data, fileName);
  const dashboardStats = buildDashboardStats(updatedData.movements);

  state.data = {
    ...updatedData,
    summary: dashboardStats.summary,
  };

  resetTablePaginationState(state);
  state.data = saveDashboardData(state.data);

  renderDashboard({
    debugRawText: `--- ARCHIVO PROCESADO ELIMINADO: ${fileName} ---`,
  });

  setStatus(
    elements,
    `Archivo procesado eliminado: ${fileName}. Archivos: ${state.data.files.length}. Movimientos: ${state.data.movements.length}.`
  );
}
