import { normalizeLearnedCategoryRules } from "../domain/category-learning.js";
import { stampDashboardDataVersion } from "../domain/dashboard-data-schema.js";
import { normalizeRecurringExpenseExclusions } from "../services/recurring-expenses-storage.service.js";

const BACKUP_APP_NAME = "nubank-dashboard";
const BACKUP_VERSION = 3;

export function buildDashboardBackup(data, options = {}) {
  const learnedCategoryRules = normalizeLearnedCategoryRules(
    options.learnedCategoryRules
  );
  const recurringExpenseExclusions = normalizeRecurringExpenseExclusions(
    options.recurringExpenseExclusions
  );

  return {
    app: BACKUP_APP_NAME,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: normalizeBackupData(data),
    learnedCategoryRules,
    recurringExpenseExclusions,
  };
}

export function getDashboardDataFromBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("El archivo seleccionado no contiene un objeto JSON válido.");
  }

  const data = payload.data ?? payload;

  if (!data || typeof data !== "object") {
    throw new Error("El archivo de backup no contiene datos del dashboard.");
  }

  if (!Array.isArray(data.movements)) {
    throw new Error("El archivo de backup no contiene un arreglo de movimientos válido.");
  }

  return data;
}

export function getLearnedCategoryRulesFromBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  return normalizeLearnedCategoryRules(
    payload.learnedCategoryRules ?? payload.data?.learnedCategoryRules ?? []
  );
}

export function getRecurringExpenseExclusionsFromBackupPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  return normalizeRecurringExpenseExclusions(
    payload.recurringExpenseExclusions ??
      payload.data?.recurringExpenseExclusions ??
      []
  );
}

export async function readJsonFile(file) {
  const fileText = await file.text();

  if (!fileText.trim()) {
    throw new Error("El archivo de backup seleccionado está vacío.");
  }

  try {
    return JSON.parse(fileText);
  } catch {
    throw new Error("El archivo seleccionado no es un JSON válido.");
  }
}

export function downloadJsonFile({ data, fileName }) {
  const jsonContent = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}

export function buildBackupFileName(prefix = "nubank-dashboard-backup") {
  const timestamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", "-")
    .replaceAll(":", "-");

  return `${prefix}-${timestamp}.json`;
}

function normalizeBackupData(data) {
  const files = Array.isArray(data?.files) ? data.files : [];
  const movements = Array.isArray(data?.movements) ? data.movements : [];

  return stampDashboardDataVersion({
    ...data,
    fileName: data?.fileName ?? files.at(-1)?.name ?? "Origen desconocido",
    files,
    processedAt: data?.processedAt ?? new Date().toISOString(),
    movements,
    summary: data?.summary ?? null,
  });
}
