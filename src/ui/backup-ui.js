export function renderBackupButtonState(elements, storedMovementsCount = 0) {
  const button = elements.exportBackupJsonButton;

  if (!button) {
    return;
  }

  const safeCount = Math.max(0, Number(storedMovementsCount) || 0);
  const hasStoredMovements = safeCount > 0;

  button.disabled = !hasStoredMovements;
  button.setAttribute("aria-disabled", String(!hasStoredMovements));
  button.title = hasStoredMovements
    ? `Export a JSON backup with ${safeCount} stored movement(s).`
    : "No stored movements available to back up.";
}
