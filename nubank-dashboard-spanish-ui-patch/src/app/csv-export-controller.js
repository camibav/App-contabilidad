import {
  getCurrentFilters,
  renderCsvExportButtonState,
  setStatus,
} from "../ui/dashboard-ui.js";
import { filterMovements } from "../domain/movement-filters.js";
import { sortMovements } from "./table-utils.js";
import {
  buildCsvFileName,
  buildMovementsCsv,
  downloadCsvFile,
} from "./csv-export.js";

export function setupCsvExportListener({ elements, state }) {
  if (!elements.exportFilteredCsvButton) {
    return;
  }

  elements.exportFilteredCsvButton.addEventListener("click", () =>
    handleExportFilteredCsv({ elements, state })
  );
}

function handleExportFilteredCsv({ elements, state }) {
  const sortedFilteredMovements = getSortedFilteredMovements({ elements, state });

  if (!sortedFilteredMovements.length) {
    renderCsvExportButtonState(elements, 0);
    setStatus(
      elements,
      "No hay movimientos que coincidan con los filtros actuales para exportar."
    );
    return;
  }

  const csvContent = buildMovementsCsv(sortedFilteredMovements);
  const fileName = buildCsvFileName();

  downloadCsvFile({
    csvContent,
    fileName,
  });

  renderCsvExportButtonState(elements, sortedFilteredMovements.length);

  setStatus(
    elements,
    `CSV exportado correctamente. Movimientos exportados: ${sortedFilteredMovements.length}.`
  );
}

function getSortedFilteredMovements({ elements, state }) {
  const movements = Array.isArray(state.data?.movements)
    ? state.data.movements
    : [];

  if (!movements.length) {
    return [];
  }

  const filters = getCurrentFilters(elements);
  const filteredMovements = filterMovements(movements, filters);

  return sortMovements(filteredMovements, state.tableSort);
}
