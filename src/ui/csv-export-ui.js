export function renderCsvExportButtonState(elements, exportableMovementsCount = 0) {
  const button = elements.exportFilteredCsvButton;

  if (!button) {
    return;
  }

  const safeCount = Math.max(0, Number(exportableMovementsCount) || 0);
  const hasExportableMovements = safeCount > 0;

  button.disabled = !hasExportableMovements;
  button.setAttribute("aria-disabled", String(!hasExportableMovements));
  button.title = hasExportableMovements
    ? `Export ${safeCount} filtered movement(s) to CSV.`
    : "No filtered movements available to export.";
}
