import { describe, expect, it } from "vitest";
import { buildMovementsCsv } from "../csv-export.js";

describe("buildMovementsCsv", () => {
  it("construye CSV con encabezados y movimiento", () => {
    const csv = buildMovementsCsv([
      {
        id: "mov-1",
        date: "2026-02-01",
        month: "2026-02",
        source: "febrero.pdf",
        description: "Restaurante Centro",
        category: "food",
        categorySource: "manual",
        type: "expense",
        amount: -50000,
      },
    ]);

    expect(csv.split("\r\n")[0]).toBe(
      "fecha;mes;archivo;descripcion;categoria;origen_categoria;tipo;monto;id"
    );
    expect(csv).toContain("2026-02-01;2026-02;febrero.pdf;Restaurante Centro");
    expect(csv).toContain("Alimentación;Manual;Gasto;-50000;mov-1");
  });

  it("escapa delimitadores, comillas y saltos de línea", () => {
    const csv = buildMovementsCsv([
      {
        id: "mov-1",
        date: "2026-02-01",
        month: "2026-02",
        source: "febrero.pdf",
        description: 'Restaurante; "Centro"\nNorte',
        category: "food",
        categorySource: "manual",
        type: "expense",
        amount: -50000,
      },
    ]);

    expect(csv).toContain('"Restaurante; ""Centro"" Norte"');
  });

  it("protege textos que parecen fórmulas de hoja de cálculo", () => {
    const csv = buildMovementsCsv([
      {
        id: "mov-1",
        date: "2026-02-01",
        month: "2026-02",
        source: "febrero.pdf",
        description: "=IMPORTXML(\"https://example.com\")",
        category: "food",
        categorySource: "manual",
        type: "expense",
        amount: -50000,
      },
      {
        id: "mov-2",
        date: "2026-02-02",
        month: "2026-02",
        source: "febrero.pdf",
        description: "-POTENCIAL_FORMULA",
        category: "food",
        categorySource: "manual",
        type: "expense",
        amount: -10000,
      },
    ]);

    expect(csv).toContain("'=IMPORTXML");
    expect(csv).toContain("'-POTENCIAL_FORMULA");
  });
});
