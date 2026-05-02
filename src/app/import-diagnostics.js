const DEFAULT_FILE_NAME = "Archivo desconocido";

export function buildPdfImportDiagnostics({
  fileName = DEFAULT_FILE_NAME,
  rawText = "",
  detectedMovements = [],
  validMovements = [],
  invalidMovements = [],
  totalMovements = 0,
  parserDiagnostics = null,
} = {}) {
  const readableLines = getReadableLines(rawText);
  const safeDetectedMovements = Array.isArray(detectedMovements)
    ? detectedMovements
    : [];
  const safeValidMovements = Array.isArray(validMovements) ? validMovements : [];
  const safeInvalidMovements = Array.isArray(invalidMovements)
    ? invalidMovements
    : [];

  return {
    fileName: normalizeFileName(fileName),
    readableLinesCount: readableLines.length,
    detectedMovementsCount: safeDetectedMovements.length,
    validMovementsCount: safeValidMovements.length,
    invalidMovementsCount: safeInvalidMovements.length,
    totalMovements: Math.max(0, Number(totalMovements) || 0),
    validationErrors: summarizeValidationErrors(safeInvalidMovements),
    invalidMovementSamples: buildInvalidMovementSamples(safeInvalidMovements),
    parserDiagnostics: normalizeParserDiagnostics(parserDiagnostics),
  };
}

export function summarizePdfImportDiagnostics(diagnostics = []) {
  const safeDiagnostics = Array.isArray(diagnostics) ? diagnostics : [];

  return safeDiagnostics.reduce(
    (summary, diagnostic) => ({
      filesCount: summary.filesCount + 1,
      readableLinesCount:
        summary.readableLinesCount + normalizeCount(diagnostic.readableLinesCount),
      detectedMovementsCount:
        summary.detectedMovementsCount + normalizeCount(diagnostic.detectedMovementsCount),
      validMovementsCount:
        summary.validMovementsCount + normalizeCount(diagnostic.validMovementsCount),
      invalidMovementsCount:
        summary.invalidMovementsCount + normalizeCount(diagnostic.invalidMovementsCount),
    }),
    {
      filesCount: 0,
      readableLinesCount: 0,
      detectedMovementsCount: 0,
      validMovementsCount: 0,
      invalidMovementsCount: 0,
    }
  );
}

export function formatPdfImportDiagnostics(diagnostic = {}) {
  const validationSummary = formatValidationErrorSummary(
    diagnostic.validationErrors
  );
  const invalidSamples = formatInvalidMovementSamples(
    diagnostic.invalidMovementSamples
  );

  return [
    `--- DIAGNÓSTICO DE IMPORTACIÓN: ${diagnostic.fileName ?? DEFAULT_FILE_NAME} ---`,
    `Líneas legibles analizadas: ${normalizeCount(diagnostic.readableLinesCount)}`,
    `Movimientos detectados por el parser: ${normalizeCount(diagnostic.detectedMovementsCount)}`,
    `Movimientos válidos importados: ${normalizeCount(diagnostic.validMovementsCount)}`,
    `Movimientos descartados por validación: ${normalizeCount(diagnostic.invalidMovementsCount)}`,
    `Movimientos acumulados en el dashboard: ${normalizeCount(diagnostic.totalMovements)}`,
    validationSummary,
    invalidSamples,
    formatParserDiagnostics(diagnostic.parserDiagnostics),
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildImportStatusMessage({
  diagnostics = [],
  processingErrorsCount = 0,
  filesCount = 0,
  totalMovements = 0,
  storageError = null,
} = {}) {
  const summary = summarizePdfImportDiagnostics(diagnostics);
  const baseMessage = processingErrorsCount
    ? `Procesamiento finalizado con ${processingErrorsCount} error(es).`
    : "Procesamiento finalizado.";

  const storageWarning = storageError
    ? " Los datos se procesaron, pero no pudieron guardarse en este navegador."
    : "";

  return (
    `${baseMessage} Archivos: ${normalizeCount(filesCount)}. ` +
    `Total de movimientos: ${normalizeCount(totalMovements)}. ` +
    `Importados en esta carga: ${summary.validMovementsCount}. ` +
    `Descartados: ${summary.invalidMovementsCount}.` +
    storageWarning
  );
}

function getReadableLines(rawText) {
  return String(rawText ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function summarizeValidationErrors(invalidMovements = []) {
  const errorsMap = new Map();

  for (const invalidMovement of invalidMovements) {
    const errors = Array.isArray(invalidMovement?.errors)
      ? invalidMovement.errors
      : [];

    for (const error of errors) {
      const normalizedError = String(error ?? "").trim();

      if (!normalizedError) {
        continue;
      }

      errorsMap.set(normalizedError, (errorsMap.get(normalizedError) ?? 0) + 1);
    }
  }

  return Array.from(errorsMap.entries())
    .map(([message, count]) => ({ message, count }))
    .sort((firstError, secondError) => {
      const countComparison = secondError.count - firstError.count;

      if (countComparison !== 0) {
        return countComparison;
      }

      return firstError.message.localeCompare(secondError.message, "es-CO");
    });
}

function buildInvalidMovementSamples(invalidMovements = [], limit = 3) {
  return invalidMovements.slice(0, limit).map((invalidMovement) => {
    const movement = invalidMovement?.movement ?? {};

    return {
      date: String(movement.date ?? "Sin fecha").trim() || "Sin fecha",
      description:
        String(movement.description ?? "Movimiento sin descripción").trim() ||
        "Movimiento sin descripción",
      amount: Number(movement.amount ?? 0),
      errors: Array.isArray(invalidMovement?.errors)
        ? invalidMovement.errors
        : [],
    };
  });
}

function formatValidationErrorSummary(validationErrors = []) {
  if (!Array.isArray(validationErrors) || !validationErrors.length) {
    return "";
  }

  return [
    "Motivos de descarte:",
    ...validationErrors.map(
      (error) => `- ${error.message}: ${normalizeCount(error.count)}`
    ),
  ].join("\n");
}

function formatInvalidMovementSamples(samples = []) {
  if (!Array.isArray(samples) || !samples.length) {
    return "";
  }

  return [
    "Muestras descartadas:",
    ...samples.map((sample) => {
      const errors = Array.isArray(sample.errors) ? sample.errors.join(" | ") : "";

      return `- ${sample.date} · ${sample.description} · ${sample.amount} · ${errors}`;
    }),
  ].join("\n");
}


function normalizeParserDiagnostics(parserDiagnostics) {
  if (!parserDiagnostics || typeof parserDiagnostics !== "object") {
    return null;
  }

  return {
    statementYear: String(parserDiagnostics.statementYear ?? "").trim(),
    statementMonth: String(parserDiagnostics.statementMonth ?? "").trim(),
    readableLinesCount: normalizeCount(parserDiagnostics.readableLinesCount),
    candidateGroupsCount: normalizeCount(parserDiagnostics.candidateGroupsCount),
    candidatesWithAmountCount: normalizeCount(
      parserDiagnostics.candidatesWithAmountCount
    ),
    parsedMovementsCount: normalizeCount(parserDiagnostics.parsedMovementsCount),
    discardedIncompleteCandidatesCount: normalizeCount(
      parserDiagnostics.discardedIncompleteCandidatesCount
    ),
    discardedParsedCandidatesCount: normalizeCount(
      parserDiagnostics.discardedParsedCandidatesCount
    ),
    ignoredPageMarkerLinesCount: normalizeCount(
      parserDiagnostics.ignoredPageMarkerLinesCount
    ),
    orphanLinesCount: normalizeCount(parserDiagnostics.orphanLinesCount),
    discardedCandidateSamples: Array.isArray(
      parserDiagnostics.discardedCandidateSamples
    )
      ? parserDiagnostics.discardedCandidateSamples.slice(0, 5)
      : [],
  };
}

function formatParserDiagnostics(parserDiagnostics) {
  if (!parserDiagnostics) {
    return "";
  }

  const discardedTotal =
    parserDiagnostics.discardedIncompleteCandidatesCount +
    parserDiagnostics.discardedParsedCandidatesCount;
  const sampleLines = formatParserDiscardedSamples(
    parserDiagnostics.discardedCandidateSamples
  );

  return [
    "Diagnóstico avanzado del parser:",
    `- Año inferido: ${parserDiagnostics.statementYear || "Desconocido"}`,
    `- Mes del extracto inferido: ${parserDiagnostics.statementMonth || "No detectado"}`,
    `- Candidatos detectados: ${parserDiagnostics.candidateGroupsCount}`,
    `- Candidatos con monto: ${parserDiagnostics.candidatesWithAmountCount}`,
    `- Movimientos parseados: ${parserDiagnostics.parsedMovementsCount}`,
    `- Candidatos descartados por parser: ${discardedTotal}`,
    `- Marcadores de página ignorados: ${parserDiagnostics.ignoredPageMarkerLinesCount}`,
    `- Líneas fuera de movimientos: ${parserDiagnostics.orphanLinesCount}`,
    sampleLines,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatParserDiscardedSamples(samples = []) {
  if (!Array.isArray(samples) || !samples.length) {
    return "";
  }

  return [
    "Muestras descartadas por parser:",
    ...samples.map((sample) => {
      const reason = String(sample.reason ?? "unknown_reason").trim();
      const rawLines = Array.isArray(sample.rawLines)
        ? sample.rawLines.join(" | ")
        : "";

      return `- ${reason}: ${rawLines}`;
    }),
  ].join("\n");
}

function normalizeFileName(fileName) {
  return String(fileName ?? DEFAULT_FILE_NAME).trim() || DEFAULT_FILE_NAME;
}

function normalizeCount(value) {
  return Math.max(0, Number(value) || 0);
}
