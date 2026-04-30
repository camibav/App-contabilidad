import { describe, expect, it } from "vitest";
import {
  buildBackupFileName,
  buildDashboardBackup,
  getDashboardDataFromBackupPayload,
  getLearnedCategoryRulesFromBackupPayload,
  getRecurringExpenseExclusionsFromBackupPayload,
} from "../backup.js";

describe("backup", () => {
  it("construye payload de backup con metadatos", () => {
    const data = {
      fileName: "febrero.pdf",
      files: [{ name: "febrero.pdf", processedAt: "2026-02-28T00:00:00.000Z" }],
      processedAt: "2026-02-28T00:00:00.000Z",
      movements: [
        {
          id: "mov-1",
          date: "2026-02-01",
          month: "2026-02",
          description: "Restaurante",
          category: "food",
          amount: -50000,
          type: "expense",
        },
      ],
      summary: null,
    };

    const backup = buildDashboardBackup(data, {
      learnedCategoryRules: [],
      recurringExpenseExclusions: [],
    });

    expect(backup.app).toBe("nubank-dashboard");
    expect(backup.version).toBeGreaterThanOrEqual(1);
    expect(backup.data.movements).toHaveLength(1);
    expect(backup.learnedCategoryRules).toEqual([]);
    expect(backup.recurringExpenseExclusions).toEqual([]);
  });

  it("extrae data desde payload nuevo o legado", () => {
    const data = { movements: [] };

    expect(getDashboardDataFromBackupPayload({ data })).toBe(data);
    expect(getDashboardDataFromBackupPayload(data)).toBe(data);
  });

  it("rechaza payloads sin arreglo de movimientos", () => {
    expect(() => getDashboardDataFromBackupPayload({ data: {} })).toThrow(
      "arreglo de movimientos"
    );
  });

  it("normaliza reglas aprendidas y exclusiones recurrentes desde backup", () => {
    const payload = {
      learnedCategoryRules: [
        {
          pattern: "NETFLIX",
          category: "subscriptions",
          type: "expense",
        },
      ],
      recurringExpenseExclusions: [
        {
          key: "TRANSFERENCIA A JUAN",
          description: "Transferencia a Juan",
          category: "transfers",
        },
      ],
    };

    expect(getLearnedCategoryRulesFromBackupPayload(payload)).toHaveLength(1);
    expect(getRecurringExpenseExclusionsFromBackupPayload(payload)).toHaveLength(1);
  });

  it("construye nombre de archivo json", () => {
    expect(buildBackupFileName("backup-test")).toMatch(
      /^backup-test-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.json$/
    );
  });
});
