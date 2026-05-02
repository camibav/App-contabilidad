import { describe, expect, it } from "vitest";
import {
  buildPdfImportDiagnostics,
  formatPdfImportDiagnostics,
} from "../import-diagnostics.js";


describe("import diagnostics with parser details", () => {
  it("incluye diagnóstico avanzado del parser en el debug", () => {
    const diagnostics = buildPdfImportDiagnostics({
      fileName: "febrero-2026.pdf",
      rawText: "Extracto 2026\n01 feb Enviaste a Restaurante - $ 50.000",
      detectedMovements: [],
      validMovements: [],
      invalidMovements: [],
      totalMovements: 0,
      parserDiagnostics: {
        statementYear: "2026",
        statementMonth: "2026-02",
        readableLinesCount: 2,
        candidateGroupsCount: 1,
        candidatesWithAmountCount: 1,
        parsedMovementsCount: 1,
        discardedIncompleteCandidatesCount: 0,
        discardedParsedCandidatesCount: 0,
        ignoredPageMarkerLinesCount: 0,
        orphanLinesCount: 1,
        discardedCandidateSamples: [],
      },
    });

    const output = formatPdfImportDiagnostics(diagnostics);

    expect(output).toContain("Diagnóstico avanzado del parser:");
    expect(output).toContain("Año inferido: 2026");
    expect(output).toContain("Movimientos parseados: 1");
  });
});
