import { removeProcessedFileFromDashboardData } from "../domain/movements.js";
import { clearImportDiagnosticsPanel, setStatus } from "../ui/dashboard-ui.js";
import {
  buildDashboardDataWithMovements,
  resetDashboardPagination,
  setDashboardData,
} from "./dashboard-actions.js";
import { confirmAction } from "./confirm-action.js";

export function setupProcessedFilesListeners({ elements, state, renderDashboard }) {
  if (!elements.processedFilesList) return;

  elements.processedFilesList.addEventListener("click", (event) =>
    handleProcessedFileAction({ elements, state, renderDashboard, event })
  );
}

async function handleProcessedFileAction({ elements, state, renderDashboard, event }) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const deleteButton = target.closest("[data-remove-processed-file]");
  if (!deleteButton) return;

  const fileName = deleteButton.dataset.removeProcessedFile;
  if (!fileName || !state.data) return;

  const confirmed = await confirmAction({
    elements,
    title: "Quitar archivo procesado",
    message:
      `Archivo: ${fileName}\n\n` +
      "Esto eliminará el archivo procesado y los movimientos que solo pertenecen a ese archivo. Los movimientos que también estén en otros PDF se conservarán.",
    confirmLabel: "Quitar archivo",
    cancelLabel: "Cancelar",
    tone: "danger",
  });

  if (!confirmed) {
    setStatus(elements, "La eliminación del archivo procesado fue cancelada.");
    return;
  }

  const updatedData = removeProcessedFileFromDashboardData(state.data, fileName);
  const nextData = buildDashboardDataWithMovements(
    updatedData,
    updatedData.movements
  );

  resetDashboardPagination(state);
  setDashboardData(state, nextData);

  if (!state.data.movements.length) {
    clearImportDiagnosticsPanel(elements);
  }

  renderDashboard({
    debugRawText: `--- ARCHIVO PROCESADO ELIMINADO: ${fileName} ---`,
  });

  setStatus(
    elements,
    `Archivo procesado eliminado: ${fileName}. Archivos: ${state.data.files.length}. Movimientos: ${state.data.movements.length}.`
  );
}
