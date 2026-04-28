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
import { saveDashboardData } from "../services/storage.service.js";
import { getLearnedCategoryRules } from "../services/category-rules-storage.service.js";
import { formatError } from "../utils/formatters.js";

export function createPdfInputChangeHandler({ elements, state, renderDashboard }) {
  return async function handlePdfInputChange(event) {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (!selectedFiles.length) {
      setStatus(elements, "No PDF selected. Saved data remains loaded.");
      return;
    }

    const pdfFiles = selectedFiles.filter(isPdfFile);
    const rejectedFiles = selectedFiles.filter((file) => !isPdfFile(file));

    if (!pdfFiles.length) {
      setStatus(
        elements,
        "No valid PDF files were selected. Saved data remains loaded."
      );
      setOutput(
        elements,
        "Rejected files:\n" +
          rejectedFiles.map((file) => `- ${file.name}`).join("\n")
      );
      resetFileInput(elements);
      return;
    }

    const rawTextByFile = [];
    const processingErrors = [];

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
            `Processing PDF ${fileNumber} of ${totalFiles}: ${file.name}`
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
              `\nNo readable text was detected in: ${file.name}\n`
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

          appendOutput(
            elements,
            "\n" +
              `Processed file: ${file.name}\n` +
              `Detected movements in this file: ${result.newMovementsCount}\n` +
              `Accumulated movements: ${result.totalMovements}\n`
          );
        } catch (error) {
          console.error(error);

          processingErrors.push({
            fileName: file.name,
            error,
          });

          appendOutput(
            elements,
            "\n" +
              `Error processing file: ${file.name}\n` +
              formatError(error) +
              "\n"
          );
        }
      }

      renderFinalDashboardState({
        state,
        rawTextByFile,
        renderDashboard,
      });

      if (!state.data) {
        setStatus(elements, "Processing completed, but no movements were detected.");
        return;
      }

      if (processingErrors.length) {
        setStatus(
          elements,
          `Processing completed with ${processingErrors.length} error(s). Files: ${state.data.files.length}. Total movements: ${state.data.movements.length}.`
        );
        return;
      }

      setStatus(
        elements,
        `Processing completed. Files: ${state.data.files.length}. Total movements: ${state.data.movements.length}.`
      );
    } finally {
      resetFileInput(elements);
    }
  };
}

async function extractTextFromPdfFile({ elements, file, fileNumber, totalFiles }) {
  appendOutput(
    elements,
    "\n" +
      `--- PROCESSING FILE ${fileNumber} OF ${totalFiles} ---\n` +
      `File: ${file.name}\n`
  );

  setStatus(elements, `Loading PDF ${fileNumber} of ${totalFiles}: ${file.name}`);

  const pdf = await loadPdfFromFile(file);

  appendOutput(elements, `PDF loaded successfully.\nPages: ${pdf.numPages}\n`);

  setStatus(elements, `Trying embedded text extraction: ${file.name}`);

  const embeddedText = await extractEmbeddedPdfText(pdf, (message) =>
    setStatus(elements, `[${file.name}] ${message}`)
  );

  if (embeddedText.trim()) {
    setStatus(elements, `Embedded text extraction completed: ${file.name}`);
    return embeddedText;
  }

  appendOutput(
    elements,
    "No embedded text was found.\n" +
      "This PDF appears to be image-based.\n" +
      "Starting OCR extraction...\n"
  );

  setStatus(elements, `Loading OCR engine: ${file.name}`);

  const ocrText = await extractTextWithOcr(pdf, (message) =>
    setStatus(elements, `[${file.name}] ${message}`)
  );

  if (!ocrText.trim()) {
    setStatus(
      elements,
      `OCR completed, but no readable text was detected: ${file.name}`
    );
    return "";
  }

  setStatus(elements, `OCR extraction completed: ${file.name}`);

  return ocrText;
}

function applyParsedResult({ state, rawText, fileName, renderDashboard }) {
  const learnedCategoryRules = getLearnedCategoryRules();
  const newMovements = parseNuMovements(rawText, fileName, {
    learnedCategoryRules,
  });

  const previousMovements = Array.isArray(state.data?.movements)
    ? state.data.movements
    : [];

  const mergedMovements = mergeMovementsById(previousMovements, newMovements);
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

  return {
    newMovementsCount: newMovements.length,
    totalMovements: mergedMovements.length,
  };
}

function renderFinalDashboardState({ state, rawTextByFile, renderDashboard }) {
  if (!state.data) {
    return;
  }

  const debugRawText = rawTextByFile.length
    ? rawTextByFile.join("\n\n")
    : "--- NO NEW RAW TEXT AVAILABLE ---";

  renderDashboard({ debugRawText });
}

function buildInitialProcessingMessage({ pdfFiles, rejectedFiles }) {
  const selectedFilesMessage =
    "Selected PDF files:\n" + pdfFiles.map((file) => `- ${file.name}`).join("\n");

  if (!rejectedFiles.length) {
    return selectedFilesMessage + "\n";
  }

  return (
    selectedFilesMessage +
    "\n\nRejected files:\n" +
    rejectedFiles.map((file) => `- ${file.name}`).join("\n") +
    "\n"
  );
}

function buildRawTextBlock(fileName, rawText) {
  return `--- RAW TEXT FROM FILE: ${fileName} ---\n${rawText}`;
}

function isPdfFile(file) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}
