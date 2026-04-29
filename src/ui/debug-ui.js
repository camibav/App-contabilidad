const STATUS_TYPES = ["idle", "info", "loading", "success", "warning", "error"];

export function renderDebugOutput(elements, rawText, movements, summary, files = []) {
  setOutput(
    elements,
    rawText +
      "\n\n\n--- MOVIMIENTOS PROCESADOS ---\n" +
      JSON.stringify(movements, null, 2) +
      "\n\n--- RESUMEN ---\n" +
      JSON.stringify(summary, null, 2) +
      "\n\n--- ARCHIVOS PROCESADOS ---\n" +
      JSON.stringify(files, null, 2)
  );
}

export function setStatus(elements, message, type = "info") {
  const statusElement = elements?.statusElement;

  if (!statusElement) {
    return;
  }

  const statusType = normalizeStatusType(type);

  statusElement.textContent = message;
  statusElement.classList.add("status");
  statusElement.classList.remove(
    ...STATUS_TYPES.map((currentType) => `status--${currentType}`)
  );
  statusElement.classList.add(`status--${statusType}`);
}

export function setOutput(elements, message) {
  elements.outputElement.textContent = message;
}

export function appendOutput(elements, message) {
  elements.outputElement.textContent += message;
}

export function clearOutput(elements) {
  elements.outputElement.textContent = "";
}

export function resetFileInput(elements) {
  elements.pdfInput.value = "";
}

function normalizeStatusType(type) {
  const normalizedType = String(type ?? "info").trim().toLowerCase();

  if (STATUS_TYPES.includes(normalizedType)) {
    return normalizedType;
  }

  return "info";
}
