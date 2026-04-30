import { describe, expect, it } from "vitest";
import {
  buildImportStatusMessage,
  buildPdfImportDiagnostics,
  formatPdfImportDiagnostics,
  summarizePdfImportDiagnostics,
} from "../import-diagnostics.js";

const validMovement = {
  id: "mov-1",
  date: "2026-02-01",
  month: "2026-02",
  description: "Restaurante",
  category: "food",
  amount: -50000,
  type: "expense",
};

const invalidMovement = {
  movement: {
    id: "mov-2",
    date: "2026-02-31",
    description: "Movimiento inválido",
    amount: -10000,
    type: "expense",
  },
  errors: ["La fecha del movimiento no tiene formato válido YYYY-MM-DD."],
};

describe("import-diagnostics", () => {
  it("construye diagnóstico de importación para un PDF", () => {
    const diagnostics = buildPdfImportDiagnostics({
      fileName: "febrero-2026.pdf",
      rawText: "Extracto 2026\n01 feb Enviaste a Restaurante - $ 50.000\n\n",
      detectedMovements: [validMovement, invalidMovement.movement],
      validMovements: [validMovement],
      invalidMovements: [invalidMovement],
      totalMovements: 10,
    });

    expect(diagnostics).toMatchObject({
      fileName: "febrero-2026.pdf",
      readableLinesCount: 2,
      detectedMovementsCount: 2,
      validMovementsCount: 1,
      invalidMovementsCount: 1,
      totalMovements: 10,
    });
    expect(diagnostics.validationErrors).toEqual([
      {
        message: "La fecha del movimiento no tiene formato válido YYYY-MM-DD.",
        count: 1,
      },
    ]);
  });

  it("resume varios diagnósticos de importación", () => {
    const summary = summarizePdfImportDiagnostics([
      {
        readableLinesCount: 10,
        detectedMovementsCount: 5,
        validMovementsCount: 4,
        invalidMovementsCount: 1,
      },
      {
        readableLinesCount: 20,
        detectedMovementsCount: 8,
        validMovementsCount: 8,
        invalidMovementsCount: 0,
      },
    ]);

    expect(summary).toEqual({
      filesCount: 2,
      readableLinesCount: 30,
      detectedMovementsCount: 13,
      validMovementsCount: 12,
      invalidMovementsCount: 1,
    });
  });

  it("formatea el diagnóstico para el panel debug", () => {
    const diagnostics = buildPdfImportDiagnostics({
      fileName: "febrero-2026.pdf",
      rawText: "Extracto 2026\n01 feb Enviaste a Restaurante - $ 50.000",
      detectedMovements: [validMovement, invalidMovement.movement],
      validMovements: [validMovement],
      invalidMovements: [invalidMovement],
      totalMovements: 10,
    });

    const output = formatPdfImportDiagnostics(diagnostics);

    expect(output).toContain("DIAGNÓSTICO DE IMPORTACIÓN: febrero-2026.pdf");
    expect(output).toContain("Líneas legibles analizadas: 2");
    expect(output).toContain("Movimientos válidos importados: 1");
    expect(output).toContain("Motivos de descarte:");
  });

  it("construye mensaje de estado con importados y descartados", () => {
    const message = buildImportStatusMessage({
      diagnostics: [
        {
          readableLinesCount: 10,
          detectedMovementsCount: 5,
          validMovementsCount: 4,
          invalidMovementsCount: 1,
        },
      ],
      processingErrorsCount: 0,
      filesCount: 1,
      totalMovements: 20,
    });

    expect(message).toBe(
      "Procesamiento finalizado. Archivos: 1. Total de movimientos: 20. Importados en esta carga: 4. Descartados: 1."
    );
  });
});
