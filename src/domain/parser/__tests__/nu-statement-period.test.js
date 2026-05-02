import { describe, expect, it } from "vitest";
import {
  extractStatementYearFromFileName,
  inferStatementMonthFromFileName,
  inferStatementYear,
} from "../nu-statement-period.js";

describe("nu-statement-period", () => {
  it("extrae el año desde el nombre del archivo", () => {
    expect(extractStatementYearFromFileName("extracto-febrero-2026.pdf")).toBe(
      "2026"
    );
  });

  it("prioriza el año del archivo sobre el año del texto", () => {
    expect(
      inferStatementYear({
        rawText: "Extracto 2025",
        sourceFileName: "extracto-marzo-2026.pdf",
      })
    ).toBe("2026");
  });

  it("infiere el mes del extracto desde el nombre del archivo", () => {
    expect(inferStatementMonthFromFileName("extracto-marzo-2026.pdf")).toBe(
      "2026-03"
    );
    expect(inferStatementMonthFromFileName("extracto-abr-2026.pdf")).toBe(
      "2026-04"
    );
  });

  it("usa el año de respaldo cuando el archivo solo contiene el mes", () => {
    expect(inferStatementMonthFromFileName("marzo.pdf", "2026")).toBe(
      "2026-03"
    );
  });

  it("retorna null si no puede inferir mes", () => {
    expect(inferStatementMonthFromFileName("extracto.pdf", "2026")).toBeNull();
  });
});
