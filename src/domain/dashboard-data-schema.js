import { buildDashboardStats } from "./dashboard-stats.js";
import { partitionMovementsByValidation } from "./movement-validation.js";
import {
  mergeMovementsById,
  normalizeProcessedFiles,
  normalizeStoredMovement,
} from "./movements.js";

export const DASHBOARD_DATA_APP_NAME = "nubank-dashboard";
export const DASHBOARD_DATA_SCHEMA_VERSION = 1;

export function stampDashboardDataVersion(data = {}) {
  if (!data || typeof data !== "object") {
    return data;
  }

  return {
    ...data,
    app: data.app ?? DASHBOARD_DATA_APP_NAME,
    schemaVersion: DASHBOARD_DATA_SCHEMA_VERSION,
  };
}

export function normalizeDashboardData(rawData, options = {}) {
  if (!rawData || typeof rawData !== "object") {
    throw new Error("Los datos del dashboard no contienen un objeto válido.");
  }

  if (!Array.isArray(rawData.movements)) {
    throw new Error("Los datos del dashboard no contienen un arreglo de movimientos válido.");
  }

  const learnedCategoryRules = Array.isArray(options.learnedCategoryRules)
    ? options.learnedCategoryRules
    : [];
  const normalizedFiles = normalizeProcessedFiles(rawData);
  const fallbackSource =
    normalizedFiles.at(-1)?.name ?? rawData.fileName ?? "Origen desconocido";

  const normalizedMovements = rawData.movements.map((movement) =>
    normalizeStoredMovement(movement, fallbackSource, {
      learnedCategoryRules,
    })
  );
  const deduplicatedMovements = mergeMovementsById([], normalizedMovements);
  const { validMovements, invalidMovements } = partitionMovementsByValidation(
    deduplicatedMovements
  );
  const dashboardStats = buildDashboardStats(validMovements);
  const currentSchemaVersion = normalizeSchemaVersion(rawData.schemaVersion);
  const wasMigrated = currentSchemaVersion !== DASHBOARD_DATA_SCHEMA_VERSION;

  return {
    data: stampDashboardDataVersion({
      ...rawData,
      fileName: normalizedFiles.at(-1)?.name ?? fallbackSource,
      files: normalizedFiles,
      processedAt: rawData.processedAt ?? new Date().toISOString(),
      movements: validMovements,
      summary: dashboardStats.summary,
    }),
    validMovements,
    invalidMovements,
    wasMigrated,
    previousSchemaVersion: currentSchemaVersion,
  };
}

export function hasDashboardDataSchemaVersion(data) {
  return normalizeSchemaVersion(data?.schemaVersion) === DASHBOARD_DATA_SCHEMA_VERSION;
}

function normalizeSchemaVersion(value) {
  const schemaVersion = Number(value ?? 0);

  if (!Number.isInteger(schemaVersion) || schemaVersion < 0) {
    return 0;
  }

  return schemaVersion;
}
