import { describe, expect, it } from "vitest";
import {
  buildMovementCandidates,
  parseMovementCandidate,
} from "../nu-movement-parser.js";

const statementYear = "2026";

describe("nu-movement-parser", () => {
  it("construye candidatos de movimientos en una o varias líneas", () => {
    const candidates = buildMovementCandidates([
      "Extracto 2026",
      "01 feb Enviaste a Restaurante - $ 50.000",
      "02 feb",
      "Recibiste de Empresa",
      "+ $ 3.000.000",
    ]);

    expect(candidates).toEqual([
      {
        lines: ["01 feb Enviaste a Restaurante - $ 50.000"],
      },
      {
        lines: ["02 feb", "Recibiste de Empresa", "+ $ 3.000.000"],
      },
    ]);
  });

  it("ignora marcadores de página dentro de un movimiento", () => {
    const candidates = buildMovementCandidates([
      "01 feb",
      "Enviaste a Cafe",
      "--- PÁGINA 2 ---",
      "- $ 10.000",
    ]);

    expect(candidates).toEqual([
      {
        lines: ["01 feb", "Enviaste a Cafe", "- $ 10.000"],
      },
    ]);
  });

  it("parsea un candidato válido a movimiento normalizado parcial", () => {
    const parsedCandidate = parseMovementCandidate(
      {
        lines: ["01 feb", "Enviaste a Restaurante", "- $ 50.000"],
      },
      statementYear
    );

    expect(parsedCandidate).toMatchObject({
      date: "2026-02-01",
      monthKey: "2026-02",
      description: "Enviaste a Restaurante",
      cleanMovementDescription: "Restaurante",
      signedAmount: -50000,
      type: "expense",
      rawLine: "01 feb Enviaste a Restaurante - $ 50.000",
    });
  });

  it("retorna null cuando el candidato no tiene monto válido", () => {
    expect(
      parseMovementCandidate(
        {
          lines: ["01 feb Enviaste a Restaurante"],
        },
        statementYear
      )
    ).toBeNull();
  });
});
