import { formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/html.js";

export function renderImportDiagnosticsPanel(elements, diagnostics = [], options = {}) {
  const container = elements.importDiagnosticsPanel;

  if (!container) {
    return;
  }

  const safeDiagnostics = Array.isArray(diagnostics) ? diagnostics : [];
  const processingErrors = Array.isArray(options.processingErrors)
    ? options.processingErrors
    : [];
  const rejectedFiles = Array.isArray(options.rejectedFiles) ? options.rejectedFiles : [];
  const storageError = options.storageError ?? null;
  const isProcessing = options.status === "processing";

  container.innerHTML = "";

  if (!safeDiagnostics.length && !processingErrors.length && !rejectedFiles.length) {
    renderImportDiagnosticsEmptyState(container, { isProcessing });
    return;
  }

  const summary = buildImportDiagnosticsSummary({
    diagnostics: safeDiagnostics,
    processingErrors,
    rejectedFiles,
    storageError,
  });

  const wrapper = document.createElement("div");
  wrapper.className = "import-diagnostics-content";
  wrapper.innerHTML = `
    ${renderImportDiagnosticsSummary(summary)}
    ${renderImportDiagnosticsIssues({ processingErrors, rejectedFiles, storageError })}
    ${renderImportDiagnosticsFiles(safeDiagnostics)}
  `;

  container.appendChild(wrapper);
}

export function clearImportDiagnosticsPanel(elements) {
  renderImportDiagnosticsPanel(elements, []);
}

export function buildImportDiagnosticsSummary({
  diagnostics = [],
  processingErrors = [],
  rejectedFiles = [],
  storageError = null,
} = {}) {
  const safeDiagnostics = Array.isArray(diagnostics) ? diagnostics : [];
  const safeProcessingErrors = Array.isArray(processingErrors) ? processingErrors : [];
  const safeRejectedFiles = Array.isArray(rejectedFiles) ? rejectedFiles : [];

  return safeDiagnostics.reduce(
    (summary, diagnostic) => {
      const parserDiagnostics = diagnostic.parserDiagnostics ?? {};

      return {
        filesCount: summary.filesCount + 1,
        readableLinesCount:
          summary.readableLinesCount + normalizeCount(diagnostic.readableLinesCount),
        candidateGroupsCount:
          summary.candidateGroupsCount + normalizeCount(parserDiagnostics.candidateGroupsCount),
        parsedMovementsCount:
          summary.parsedMovementsCount + normalizeCount(parserDiagnostics.parsedMovementsCount),
        validMovementsCount:
          summary.validMovementsCount + normalizeCount(diagnostic.validMovementsCount),
        invalidMovementsCount:
          summary.invalidMovementsCount + normalizeCount(diagnostic.invalidMovementsCount),
        discardedCandidatesCount:
          summary.discardedCandidatesCount +
          normalizeCount(parserDiagnostics.discardedIncompleteCandidatesCount) +
          normalizeCount(parserDiagnostics.discardedParsedCandidatesCount),
        ignoredPageMarkerLinesCount:
          summary.ignoredPageMarkerLinesCount +
          normalizeCount(parserDiagnostics.ignoredPageMarkerLinesCount),
        orphanLinesCount:
          summary.orphanLinesCount + normalizeCount(parserDiagnostics.orphanLinesCount),
        processingErrorsCount: safeProcessingErrors.length,
        rejectedFilesCount: safeRejectedFiles.length,
        hasStorageError: Boolean(storageError),
      };
    },
    {
      filesCount: 0,
      readableLinesCount: 0,
      candidateGroupsCount: 0,
      parsedMovementsCount: 0,
      validMovementsCount: 0,
      invalidMovementsCount: 0,
      discardedCandidatesCount: 0,
      ignoredPageMarkerLinesCount: 0,
      orphanLinesCount: 0,
      processingErrorsCount: safeProcessingErrors.length,
      rejectedFilesCount: safeRejectedFiles.length,
      hasStorageError: Boolean(storageError),
    }
  );
}

function renderImportDiagnosticsSummary(summary) {
  const statusTone = getSummaryTone(summary);
  const statusLabel = getSummaryLabel(summary);

  return `
    <div class="import-diagnostics-summary import-diagnostics-summary--${escapeHtml(statusTone)}">
      <div class="import-diagnostics-summary-main">
        <span class="import-diagnostics-eyebrow">Última importación</span>
        <strong>${escapeHtml(statusLabel)}</strong>
        <p>
          ${escapeHtml(String(summary.validMovementsCount))} movimiento(s) válido(s) desde
          ${escapeHtml(String(summary.filesCount))} archivo(s) procesado(s).
        </p>
      </div>

      <div class="import-diagnostics-metrics">
        ${renderMetric("Líneas leídas", summary.readableLinesCount)}
        ${renderMetric("Candidatos", summary.candidateGroupsCount)}
        ${renderMetric("Parseados", summary.parsedMovementsCount)}
        ${renderMetric("Válidos", summary.validMovementsCount)}
        ${renderMetric("Descartes", summary.invalidMovementsCount + summary.discardedCandidatesCount)}
        ${renderMetric("Errores", summary.processingErrorsCount)}
      </div>
    </div>
  `;
}

function renderMetric(label, value) {
  return `
    <article class="import-diagnostics-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(normalizeCount(value)))}</strong>
    </article>
  `;
}

function renderImportDiagnosticsIssues({ processingErrors, rejectedFiles, storageError }) {
  const issues = [];

  if (storageError) {
    issues.push({
      title: "Persistencia local",
      description:
        "Los datos se procesaron, pero el navegador no permitió guardarlos en localStorage.",
      detail: storageError instanceof Error ? storageError.message : String(storageError),
    });
  }

  for (const file of rejectedFiles) {
    issues.push({
      title: "Archivo rechazado",
      description: file?.name ?? "Archivo desconocido",
      detail: "El archivo no corresponde a un PDF válido.",
    });
  }

  for (const processingError of processingErrors) {
    issues.push({
      title: "Error de procesamiento",
      description: processingError.fileName ?? "Archivo desconocido",
      detail:
        processingError.error instanceof Error
          ? processingError.error.message
          : String(processingError.error ?? "Error desconocido"),
    });
  }

  if (!issues.length) {
    return "";
  }

  return `
    <div class="import-diagnostics-issues">
      ${issues.map(renderIssue).join("")}
    </div>
  `;
}

function renderIssue(issue) {
  return `
    <article class="import-diagnostics-issue">
      <strong>${escapeHtml(issue.title)}</strong>
      <span>${escapeHtml(issue.description)}</span>
      <p>${escapeHtml(issue.detail)}</p>
    </article>
  `;
}

function renderImportDiagnosticsFiles(diagnostics) {
  if (!diagnostics.length) {
    return "";
  }

  return `
    <div class="import-diagnostics-files">
      ${diagnostics.map(renderImportDiagnosticFile).join("")}
    </div>
  `;
}

function renderImportDiagnosticFile(diagnostic) {
  const parserDiagnostics = diagnostic.parserDiagnostics ?? {};
  const discardedSamples = Array.isArray(parserDiagnostics.discardedCandidateSamples)
    ? parserDiagnostics.discardedCandidateSamples
    : [];
  const validationErrors = Array.isArray(diagnostic.validationErrors)
    ? diagnostic.validationErrors
    : [];

  return `
    <article class="import-diagnostics-file">
      <div class="import-diagnostics-file-header">
        <div>
          <span class="import-diagnostics-file-label">Archivo</span>
          <strong title="${escapeHtml(diagnostic.fileName ?? "Archivo desconocido")}">
            ${escapeHtml(diagnostic.fileName ?? "Archivo desconocido")}
          </strong>
        </div>
        <span class="import-diagnostics-file-period">
          ${escapeHtml(parserDiagnostics.statementMonth || parserDiagnostics.statementYear || "Periodo no detectado")}
        </span>
      </div>

      <div class="import-diagnostics-file-grid">
        ${renderFileMetric("Líneas", diagnostic.readableLinesCount)}
        ${renderFileMetric("Candidatos", parserDiagnostics.candidateGroupsCount)}
        ${renderFileMetric("Con monto", parserDiagnostics.candidatesWithAmountCount)}
        ${renderFileMetric("Válidos", diagnostic.validMovementsCount)}
        ${renderFileMetric("Val. descartados", diagnostic.invalidMovementsCount)}
        ${renderFileMetric("Acumulados", diagnostic.totalMovements)}
      </div>

      ${renderValidationErrors(validationErrors)}
      ${renderDiscardedSamples(discardedSamples)}
    </article>
  `;
}

function renderFileMetric(label, value) {
  return `
    <div class="import-diagnostics-file-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(normalizeCount(value)))}</strong>
    </div>
  `;
}

function renderValidationErrors(validationErrors) {
  if (!validationErrors.length) {
    return "";
  }

  return `
    <div class="import-diagnostics-detail-list">
      <strong>Motivos de descarte por validación</strong>
      <ul>
        ${validationErrors
          .map(
            (error) => `
              <li>
                ${escapeHtml(error.message ?? "Error desconocido")}
                <span>${escapeHtml(String(normalizeCount(error.count)))}</span>
              </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
}

function renderDiscardedSamples(samples) {
  if (!samples.length) {
    return "";
  }

  return `
    <div class="import-diagnostics-detail-list">
      <strong>Muestras descartadas por el parser</strong>
      <ul>
        ${samples.map(renderDiscardedSample).join("")}
      </ul>
    </div>
  `;
}

function renderDiscardedSample(sample) {
  const reason = sample.reason ?? "Motivo no especificado";
  const rawLines = Array.isArray(sample.rawLines) ? sample.rawLines : [];

  return `
    <li>
      ${escapeHtml(reason)}
      <span title="${escapeHtml(rawLines.join(" | "))}">
        ${escapeHtml(rawLines.slice(0, 2).join(" · ") || "Sin líneas")}
      </span>
    </li>
  `;
}

function renderImportDiagnosticsEmptyState(container, { isProcessing } = {}) {
  container.innerHTML = `
    <div class="import-diagnostics-empty-state">
      <strong>${escapeHtml(
        isProcessing ? "Procesamiento en curso." : "Todavía no hay diagnóstico de importación."
      )}</strong>
      <p>
        ${escapeHtml(
          isProcessing
            ? "El diagnóstico aparecerá cuando termine la lectura del primer PDF."
            : "Carga uno o varios extractos PDF para revisar candidatos, movimientos válidos y descartes."
        )}
      </p>
    </div>
  `;
}

function getSummaryTone(summary) {
  if (
    summary.processingErrorsCount ||
    summary.invalidMovementsCount ||
    summary.discardedCandidatesCount ||
    summary.hasStorageError
  ) {
    return "warning";
  }

  if (summary.validMovementsCount > 0) {
    return "success";
  }

  return "neutral";
}

function getSummaryLabel(summary) {
  if (summary.hasStorageError) {
    return "Importación procesada con advertencia de almacenamiento";
  }

  if (summary.processingErrorsCount) {
    return "Importación finalizada con errores";
  }

  if (summary.invalidMovementsCount || summary.discardedCandidatesCount) {
    return "Importación finalizada con descartes";
  }

  if (summary.validMovementsCount > 0) {
    return "Importación finalizada correctamente";
  }

  return "Sin movimientos importados";
}

function normalizeCount(value) {
  const count = Number(value);

  if (!Number.isFinite(count) || count < 0) {
    return 0;
  }

  return count;
}
