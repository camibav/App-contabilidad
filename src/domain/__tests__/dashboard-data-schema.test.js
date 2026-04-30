import { describe, expect, it } from "vitest";
import {
  DASHBOARD_DATA_SCHEMA_VERSION,
  hasDashboardDataSchemaVersion,
  normalizeDashboardData,
  stampDashboardDataVersion,
} from "../dashboard-data-schema.js";

const legacyMovement = {
  id: "legacy-1",
  date: "2026-02-01",
  month: "2026-02",
  description: "Restaurante",
  category: "food",
  categorySource: "manual",
  amount: -50000,
  type: "expense",
  source: "febrero-2026.pdf",
};

describe("dashboard-data-schema", () => {
  it("agrega metadatos de versión a los datos guardados", () => {
    const result = stampDashboardDataVersion({ movements: [] });

    expect(result.app).toBe("nubank-dashboard");
    expect(result.schemaVersion).toBe(DASHBOARD_DATA_SCHEMA_VERSION);
    expect(hasDashboardDataSchemaVersion(result)).toBe(true);
  });

  it("migra datos legados sin schemaVersion a la versión actual", () => {
    const result = normalizeDashboardData({
      fileName: "febrero-2026.pdf",
      files: [
        {
          name: "febrero-2026.pdf",
          processedAt: "2026-02-28T00:00:00.000Z",
        },
      ],
      processedAt: "2026-02-28T00:00:00.000Z",
      movements: [legacyMovement],
      summary: null,
    });

    expect(result.wasMigrated).toBe(true);
    expect(result.previousSchemaVersion).toBe(0);
    expect(result.data.schemaVersion).toBe(DASHBOARD_DATA_SCHEMA_VERSION);
    expect(result.data.movements).toHaveLength(1);
    expect(result.data.summary.totalMovements).toBe(1);
  });

  it("descarta movimientos inválidos durante la normalización", () => {
    const result = normalizeDashboardData({
      fileName: "febrero-2026.pdf",
      movements: [
        legacyMovement,
        {
          ...legacyMovement,
          id: "invalid-1",
          date: "2026-02-31",
        },
      ],
    });

    expect(result.data.movements).toHaveLength(1);
    expect(result.invalidMovements).toHaveLength(1);
  });

  it("rechaza datos sin arreglo de movimientos", () => {
    expect(() => normalizeDashboardData({ fileName: "febrero.pdf" })).toThrow(
      "arreglo de movimientos"
    );
  });
});
