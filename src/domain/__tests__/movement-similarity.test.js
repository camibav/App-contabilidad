import { describe, expect, it } from "vitest";
import {
  buildMovementSimilarityKey,
  findSimilarMovements,
} from "../movement-similarity.js";

describe("movement-similarity", () => {
  it("normaliza descripciones quitando prefijos operativos", () => {
    expect(
      buildMovementSimilarityKey({
        description: "Enviaste a Café Central",
      })
    ).toBe("CAFE CENTRAL");

    expect(
      buildMovementSimilarityKey({
        description: "Compra en Netflix",
      })
    ).toBe("NETFLIX");
  });

  it("encuentra movimientos similares del mismo tipo sin incluir el movimiento base", () => {
    const targetMovement = {
      id: "1",
      type: "expense",
      description: "Netflix",
    };

    const movements = [
      targetMovement,
      {
        id: "2",
        type: "expense",
        description: "Enviaste a Netflix",
      },
      {
        id: "3",
        type: "income",
        description: "Netflix",
      },
      {
        id: "4",
        type: "expense",
        description: "Spotify",
      },
    ];

    expect(findSimilarMovements(movements, targetMovement).map((movement) => movement.id)).toEqual([
      "2",
    ]);
  });

  it("retorna arreglo vacío cuando no hay movimiento base válido", () => {
    expect(findSimilarMovements([], null)).toEqual([]);
    expect(findSimilarMovements([{ id: "1", type: "expense" }], {})).toEqual([]);
  });
});
