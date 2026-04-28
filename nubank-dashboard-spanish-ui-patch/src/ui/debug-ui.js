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

export function setStatus(elements, message) {
  elements.statusElement.textContent = message;
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
