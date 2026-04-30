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
      occurrenceIndex: 1,
    });
    expect(movements[1]).toMatchObject({
      date: "2026-02-02",
      month: "2026-02",
      category: "income",
      amount: 3000000,
      type: "income",
      occurrenceIndex: 1,
    });
  });

  it("prioriza el año del nombre del archivo sobre el primer año encontrado en el texto", () => {
    const rawText = [
      "Fecha de generación 2025",
      "Extracto asociado a referencias antiguas 2024",
      "01 feb Enviaste a Restaurante - $ 50.000",
    ].join("\n");

    const movements = parseNuMovements(rawText, "extracto-febrero-2026.pdf");

    expect(movements).toHaveLength(1);
    expect(movements[0]).toMatchObject({
      date: "2026-02-01",
      month: "2026-02",
      statementMonth: "2026-02",
    });
  });

  it("usa el año detectado en el texto cuando el nombre del archivo no contiene año", () => {
    const rawText = [
      "Extracto 2026",
      "01 mar Enviaste a Transporte - $ 20.000",
    ].join("\n");

    const movements = parseNuMovements(rawText, "marzo.pdf");

    expect(movements).toHaveLength(1);
    expect(movements[0]).toMatchObject({
      date: "2026-03-01",
      month: "2026-03",
      statementMonth: "2026-03",
    });
  });

  it("conserva movimientos reales idénticos del mismo PDF usando occurrenceIndex", () => {
    const rawText = [
      "Extracto 2026",
      "01 feb Enviaste a Cafe - $ 10.000",
      "01 feb Enviaste a Cafe - $ 10.000",
    ].join("\n");

    const movements = parseNuMovements(rawText, "febrero-2026.pdf");

    expect(movements).toHaveLength(2);
    expect(movements[0]).toMatchObject({
      description: "Cafe",
      amount: -10000,
      occurrenceIndex: 1,
    });
    expect(movements[1]).toMatchObject({
      description: "Cafe",
      amount: -10000,
      occurrenceIndex: 2,
    });
    expect(movements[0].id).not.toBe(movements[1].id);
    expect(movements[0].dedupeKey).not.toBe(movements[1].dedupeKey);
  });

  it("fusiona la recarga del mismo PDF sin eliminar ocurrencias reales", () => {
    const rawText = [
      "Extracto 2026",
      "01 feb Enviaste a Cafe - $ 10.000",
      "01 feb Enviaste a Cafe - $ 10.000",
    ].join("\n");

    const firstImport = parseNuMovements(rawText, "febrero-2026.pdf");
    const secondImport = parseNuMovements(rawText, "febrero-2026.pdf");
    const mergedMovements = mergeMovementsById(firstImport, secondImport);

    expect(mergedMovements).toHaveLength(2);
    expect(mergedMovements.map((movement) => movement.occurrenceIndex)).toEqual([
      1,
      2,
    ]);
  });

  it("preserva categoría manual al fusionar movimientos repetidos", () => {
    const previousMovement = {
      id: "manual-1",
      dedupeKey: "20260201restaurante50000",
      baseDedupeKey: "20260201restaurante50000",
      occurrenceIndex: 1,
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
    expect(movement.occurrenceIndex).toBe(1);
  });
});
