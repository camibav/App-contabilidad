import {
  appendOutput,
  resetFileInput,
  setOutput,
  setStatus,
} from "../ui/dashboard-ui.js";
import {
  extractEmbeddedPdfText,
  extractTextWithOcr,
  loadPdfFromFile,
} from "../services/pdf.service.js";
import {
  mergeMovementsById,
  mergeProcessedFiles,
  parseNuMovements,
} from "../domain/movements.js";
import { buildDashboardStats } from "../domain/dashboard-stats.js";
import { partitionMovementsByValidation } from "../domain/movement-validation.js";
import { saveDashboardData } from "../services/storage.service.js";
import { getLearnedCategoryRules } from "../services/category-rules-storage.service.js";
import { formatError } from "../utils/formatters.js";
import {
  buildImportStatusMessage,
  buildPdfImportDiagnostics,
  formatPdfImportDiagnostics,
  summarizePdfImportDiagnostics,
} from "./import-diagnostics.js";

export function createPdfInputChangeHandler({ elements, state, renderDashboard }) {
  return async function handlePdfInputChange(event) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (!selectedFiles.length) {
      setStatus(
        elements,
        "No se seleccionó ningún PDF. Los datos guardados permanecen cargados.",
        "idle"
      );
      return;
    }

    const pdfFiles = selectedFiles.filter(isPdfFile);
    const rejectedFiles = selectedFiles.filter((file) => !isPdfFile(file));

    if (!pdfFiles.length) {
      setStatus(
        elements,
        "No se seleccionaron archivos PDF válidos. Los datos guardados permanecen cargados.",
        "warning"
      );
      setOutput(
        elements,
        "Archivos rechazados:\n" +
          rejectedFiles.map((file) => `- ${file.name}`).join("\n")
      );
      resetFileInput(elements);
      return;
    }

    const rawTextByFile = [];
    const importDiagnostics = [];
    const processingErrors = [];

    setStatus(
      elements,
      `Preparando procesamiento de ${pdfFiles.length} archivo(s) PDF...`,
      "loading"
    );

    setOutput(
      elements,
      buildInitialProcessingMessage({
        pdfFiles,
        rejectedFiles,
      })
    );

    try {
      for (const [index, file] of pdfFiles.entries()) {
        const fileNumber = index + 1;
        const totalFiles = pdfFiles.length;

        try {
          setStatus(
            elements,
            `Procesando PDF ${fileNumber} de ${totalFiles}: ${file.name}`,
            "loading"
          );

          const rawText = await extractTextFromPdfFile({
            elements,
            file,
            fileNumber,
            totalFiles,
          });

          if (!rawText.trim()) {
            appendOutput(
              elements,
              `\nNo se detectó texto legible en: ${file.name}\n`
            );
            setStatus(
              elements,
              `No se detectó texto legible en: ${file.name}`,
              "warning"
            );
            continue;
          }

          rawTextByFile.push(buildRawTextBlock(file.name, rawText));

          const result = applyParsedResult({
            state,
            rawText,
            fileName: file.name,
            renderDashboard,
          });

          importDiagnostics.push(result.diagnostics);

          appendOutput(
            elements,
            "\n" + formatPdfImportDiagnostics(result.diagnostics) + "\n"
          );
        } catch (error) {
          console.error(error);

          processingErrors.push({
            fileName: file.name,
            error,
          });

          setStatus(
            elements,
            `Error al procesar el archivo: ${file.name}`,
            "error"
          );

          appendOutput(
            elements,
            "\n" +
              `Error al procesar el archivo: ${file.name}\n` +
              formatError(error) +
              "\n"
          );
        }
      }

      renderFinalDashboardState({
        state,
        rawTextByFile,
        importDiagnostics,
        renderDashboard,
      });

      if (!state.data) {
        setStatus(
          elements,
          "El procesamiento finalizó, pero no se detectaron movimientos.",
          "warning"
        );
        return;
      }

      const statusMessage = buildImportStatusMessage({
        diagnostics: importDiagnostics,
        processingErrorsCount: processingErrors.length,
        filesCount: state.data.files.length,
        totalMovements: state.data.movements.length,
      });
      const importSummary = summarizePdfImportDiagnostics(importDiagnostics);
      const hasDiscardedMovements = importSummary.invalidMovementsCount > 0;
      const hasNoImportedMovements = importSummary.validMovementsCount === 0;

      if (processingErrors.length || hasDiscardedMovements || hasNoImportedMovements) {
        setStatus(elements, statusMessage, "warning");
        return;
      }

      setStatus(elements, statusMessage, "success");
    } finally {
      resetFileInput(elements);
    }
  };
}

async function extractTextFromPdfFile({ elements, file, fileNumber, totalFiles }) {
  appendOutput(
    elements,
    "\n" +
      `--- PROCESANDO ARCHIVO ${fileNumber} DE ${totalFiles} ---\n` +
      `Archivo: ${file.name}\n`
  );

  setStatus(
    elements,
    `Cargando PDF ${fileNumber} de ${totalFiles}: ${file.name}`,
    "loading"
  );

  const pdf = await loadPdfFromFile(file);

  appendOutput(elements, `PDF cargado correctamente.\nPáginas: ${pdf.numPages}\n`);

  setStatus(elements, `Intentando extraer texto embebido: ${file.name}`, "loading");

  const embeddedText = await extractEmbeddedPdfText(pdf, (message) =>
    setStatus(elements, `[${file.name}] ${message}`, "loading")
  );

  if (embeddedText.trim()) {
    setStatus(elements, `Extracción de texto embebido finalizada: ${file.name}`, "loading");
    return embeddedText;
  }

  appendOutput(
    elements,
    "No se encontró texto embebido.\n" +
      "Este PDF parece estar basado en imágenes.\n" +
      "Iniciando extracción OCR...\n"
  );

  setStatus(elements, `Cargando motor OCR: ${file.name}`, "loading");

  const ocrText = await extractTextWithOcr(pdf, (message) =>
    setStatus(elements, `[${file.name}] ${message}`, "loading")
  );

  if (!ocrText.trim()) {
    setStatus(
      elements,
      `El OCR finalizó, pero no detectó texto legible: ${file.name}`,
      "warning"
    );
    return "";
  }

  setStatus(elements, `Extracción OCR finalizada: ${file.name}`, "loading");

  return ocrText;
}

function applyParsedResult({ state, rawText, fileName, renderDashboard }) {
  const learnedCategoryRules = getLearnedCategoryRules();
  const newMovements = parseNuMovements(rawText, fileName, {
    learnedCategoryRules,
  });
  const { validMovements, invalidMovements } = partitionMovementsByValidation(
    newMovements
  );

  const previousMovements = Array.isArray(state.data?.movements)
    ? state.data.movements
    : [];

  const mergedMovements = mergeMovementsById(previousMovements, validMovements);
  const dashboardStats = buildDashboardStats(mergedMovements);
  const processedAt = new Date().toISOString();

  state.data = {
    ...state.data,
    fileName,
    files: mergeProcessedFiles(state.data?.files, fileName, {
      legacyFileName: state.data?.fileName,
      legacyProcessedAt: state.data?.processedAt,
      currentProcessedAt: processedAt,
    }),
    processedAt,
    movements: mergedMovements,
    summary: dashboardStats.summary,
  };

  saveDashboardData(state.data);

  state.tablePagination.page = 1;

  renderDashboard();

  const diagnostics = buildPdfImportDiagnostics({
    fileName,
    rawText,
    detectedMovements: newMovements,
    validMovements,
    invalidMovements,
    totalMovements: mergedMovements.length,
  });

  return {
    newMovementsCount: newMovements.length,
    validMovementsCount: validMovements.length,
    invalidMovementsCount: invalidMovements.length,
    invalidMovements,
    diagnostics,
    totalMovements: mergedMovements.length,
  };
}

function renderFinalDashboardState({
  state,
  rawTextByFile,
  importDiagnostics,
  renderDashboard,
}) {
  if (!state.data) {
    return;
  }

  const rawTextDebugBlock = rawTextByFile.length
    ? rawTextByFile.join("\n\n")
    : "--- NO HAY TEXTO BRUTO NUEVO DISPONIBLE ---";
  const diagnosticsDebugBlock = Array.isArray(importDiagnostics) && importDiagnostics.length
    ? importDiagnostics.map(formatPdfImportDiagnostics).join("\n\n")
    : "--- NO HAY DIAGNÓSTICO DE IMPORTACIÓN DISPONIBLE ---";

  renderDashboard({
    debugRawText: `${diagnosticsDebugBlock}\n\n${rawTextDebugBlock}`,
  });
}

function buildInitialProcessingMessage({ pdfFiles, rejectedFiles }) {
  const selectedFilesMessage =
    "Archivos PDF seleccionados:\n" + pdfFiles.map((file) => `- ${file.name}`).join("\n");

  if (!rejectedFiles.length) {
    return selectedFilesMessage + "\n";
  }

  return (
    selectedFilesMessage +
    "\n\nArchivos rechazados:\n" +
    rejectedFiles.map((file) => `- ${file.name}`).join("\n") +
    "\n"
  );
}

function buildRawTextBlock(fileName, rawText) {
  return `--- TEXTO BRUTO DEL ARCHIVO: ${fileName} ---\n${rawText}`;
}

function isPdfFile(file) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}
