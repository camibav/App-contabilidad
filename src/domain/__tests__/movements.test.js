import { describe, expect, it } from "vitest";
import {
  mergeMovementsById,
  normalizeStoredMovement,
  parseNuMovements,
} from "../movements.js";

describe("movements", () => {
  it("parsea movimientos de Nu Bank desde texto bruto", () => {
    const rawText = `Extracto 2026\n01 feb Enviaste a Restaurante - $ 50.000\n02 feb Recibiste de Empresa + $ 3.000.000`;
    const movements = parseNuMovements(rawText, "febrero-2026.pdf");

    expect(movements).toHaveLength(2);
    expect(movements[0]).toMatchObject({
      date: "2026-02-01",
      month: "2026-02",
      description: "Restaurante",
      amount: -50000,
      type: "expense",
    });
    expect(movements[1]).toMatchObject({
      date: "2026-02-02",
      month: "2026-02",
      category: "income",
      amount: 3000000,
      type: "income",
    });
  });

  it("preserva categoría manual al fusionar movimientos repetidos", () => {
    const previousMovement = {
      id: "manual-1",
      dedupeKey: "20260201restaurante50000",
      date: "2026-02-01",
      month: "2026-02",
      description: "Restaurante",
      category: "food",
      categorySource: "manual",
      amount: -50000,
      type: "expense",
      source: "febrero.pdf",
      sources: ["febrero.pdf"],
    };

    const incomingMovement = {
      ...previousMovement,
      id: "auto-1",
      category: "uncategorized",
      categorySource: "default",
      source: "febrero-copia.pdf",
      sources: ["febrero-copia.pdf"],
    };

    const result = mergeMovementsById([previousMovement], [incomingMovement]);

    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("food");
    expect(result[0].categorySource).toBe("manual");
    expect(result[0].sources).toEqual(["febrero.pdf", "febrero-copia.pdf"]);
  });

  it("normaliza categorías incompatibles al cargar movimientos guardados", () => {
    const movement = normalizeStoredMovement(
      {
        id: "stored-1",
        date: "2026-02-01",
        month: "2026-02",
        description: "Ingreso mal categorizado",
        category: "food",
        categorySource: "manual",
        amount: 100000,
        type: "income",
        source: "febrero.pdf",
      },
      "febrero.pdf"
    );

    expect(movement.category).toBe("income");
  });
});
