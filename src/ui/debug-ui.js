export function renderDebugOutput(elements, rawText, movements, summary, files = []) {
  setOutput(
    elements,
    rawText +
      "\n\n\n--- PARSED MOVEMENTS ---\n" +
      JSON.stringify(movements, null, 2) +
      "\n\n--- SUMMARY ---\n" +
      JSON.stringify(summary, null, 2) +
      "\n\n--- PROCESSED FILES ---\n" +
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
