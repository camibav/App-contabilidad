import { escapeHtml } from "../utils/html.js";

export function renderProcessedFilesList(elements, files = []) {
  elements.processedFilesList.innerHTML = "";

  if (!files.length) {
    const item = document.createElement("li");
    item.className = "processed-file-item processed-file-item--empty";
    item.textContent = "No hay archivos procesados todavía.";

    elements.processedFilesList.appendChild(item);
    return;
  }

  for (const file of files) {
    const item = document.createElement("li");
    item.className = "processed-file-item";

    const processedAt = file.processedAt
      ? new Date(file.processedAt).toLocaleString("es-CO")
      : "Fecha desconocida";

    item.innerHTML = `
      <span class="processed-file-name">${escapeHtml(file.name)}</span>
      <span class="processed-file-date">${escapeHtml(processedAt)}</span>
      <button
        class="secondary-button processed-file-delete-button"
        type="button"
        data-remove-processed-file="${escapeHtml(file.name)}"
        title="Quitar este archivo procesado del dashboard"
      >
        Eliminar
      </button>
    `;

    elements.processedFilesList.appendChild(item);
  }
}

export function clearProcessedFilesList(elements) {
  renderProcessedFilesList(elements, []);
}
