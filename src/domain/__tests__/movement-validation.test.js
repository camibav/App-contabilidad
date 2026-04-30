import { describe, expect, it } from "vitest";
import {
  canAssignCategoryToMovementType,
  getMovementCategoryOptions,
  normalizeMovementCategory,
  partitionMovementsByValidation,
  validateMovement,
} from "../movement-validation.js";

const baseMovement = {
  id: "2026-02-01-cafe-10000-febrero",
  date: "2026-02-01",
  month: "2026-02",
  description: "Cafe",
  category: "food",
  amount: -10000,
  type: "expense",
  source: "febrero.pdf",
};

describe("movement-validation", () => {
  it("valida un movimiento de gasto correctamente formado", () => {
    const validation = validateMovement(baseMovement);

    expect(validation.isValid).toBe(true);
    expect(validation.errors).toEqual([]);
  });

  it("rechaza un ingreso con categoría de gasto", () => {
    const validation = validateMovement({
      ...baseMovement,
      amount: 100000,
      type: "income",
      category: "food",
    });

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain(
      "La categoría no corresponde con el tipo del movimiento."
    );
  });

  it("rechaza un gasto con categoría income", () => {
    const validation = validateMovement({
      ...baseMovement,
      type: "expense",
      category: "income",
    });

    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain(
      "La categoría no corresponde con el tipo del movimiento."
    );
  });

  it("normaliza categorías incompatibles según el tipo", () => {
    expect(normalizeMovementCategory("food", "income")).toBe("income");
    expect(normalizeMovementCategory("income", "expense")).toBe("uncategorized");
    expect(normalizeMovementCategory("transport", "expense")).toBe("transport");
  });

  it("expone opciones de categoría según tipo de movimiento", () => {
    expect(getMovementCategoryOptions("income")).toEqual(["income"]);
    expect(getMovementCategoryOptions("expense")).not.toContain("income");
    expect(getMovementCategoryOptions("expense")).toContain("uncategorized");
  });

  it("separa movimientos válidos e inválidos", () => {
    const result = partitionMovementsByValidation([
      baseMovement,
      {
        ...baseMovement,
        id: "",
        date: "2026-02-31",
      },
    ]);

    expect(result.validMovements).toHaveLength(1);
    expect(result.invalidMovements).toHaveLength(1);
    expect(result.invalidMovements[0].errors.length).toBeGreaterThan(0);
  });

  it("verifica compatibilidad entre categoría y tipo", () => {
    expect(canAssignCategoryToMovementType("income", "income")).toBe(true);
    expect(canAssignCategoryToMovementType("food", "income")).toBe(false);
    expect(canAssignCategoryToMovementType("food", "expense")).toBe(true);
    expect(canAssignCategoryToMovementType("income", "expense")).toBe(false);
  });
});
