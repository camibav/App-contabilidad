import { describe, expect, it } from "vitest";
import {
  buildMovementCandidatesWithDiagnostics,
  parseMovementCandidateWithDiagnostics,
} from "../nu-movement-parser.js";


describe("nu parser diagnostics", () => {
  it("reporta candidatos incompletos, marcadores de página y líneas huérfanas", () => {
    const result = buildMovementCandidatesWithDiagnostics([
      "Extracto 2026",
      "01 feb Enviaste a Restaurante",
      "--- PÁGINA 2 ---",
      "02 feb Compra en Cafe - $ 10.000",
    ]);

    expect(result.candidates).toHaveLength(1);
    expect(result.diagnostics).toMatchObject({
      readableLinesCount: 4,
      candidateGroupsCount: 2,
      candidatesWithAmountCount: 1,
      discardedIncompleteCandidatesCount: 1,
      ignoredPageMarkerLinesCount: 1,
      orphanLinesCount: 1,
    });
    expect(result.diagnostics.discardedCandidateSamples[0]).toMatchObject({
      reason: "missing_amount",
    });
  });

  it("reporta candidatos con descripción vacía", () => {
    const result = parseMovementCandidateWithDiagnostics(
      {
        lines: ["01 feb - $ 10.000"],
      },
      "2026"
    );

    expect(result.movement).toBeNull();
    expect(result.discardedCandidate).toMatchObject({
      reason: "empty_description",
    });
  });
});
