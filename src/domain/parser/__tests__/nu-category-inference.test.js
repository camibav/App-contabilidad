import { describe, expect, it } from "vitest";
import { buildLearnedCategoryRule } from "../../category-learning.js";
import { inferCategoryFromDescription } from "../nu-category-inference.js";

describe("nu-category-inference", () => {
  it("clasifica ingresos automáticamente como income", () => {
    expect(inferCategoryFromDescription("Empresa", "income")).toEqual({
      category: "income",
      source: "auto",
    });
  });

  it("prioriza reglas aprendidas sobre reglas automáticas", () => {
    const movement = {
      description: "Netflix",
      rawLine: "05 feb Netflix - $ 32.000",
      type: "expense",
    };
    const learnedRule = buildLearnedCategoryRule(movement, "entertainment");

    expect(
      inferCategoryFromDescription("Netflix", "expense", {
        learnedCategoryRules: [learnedRule],
        movementLike: movement,
      })
    ).toEqual({
      category: "entertainment",
      source: "manual-learning",
    });
  });

  it("clasifica gastos por reglas automáticas", () => {
    expect(inferCategoryFromDescription("Pago a CENS", "expense")).toEqual({
      category: "services",
      source: "auto",
    });
  });

  it("retorna uncategorized cuando no encuentra coincidencias confiables", () => {
    expect(
      inferCategoryFromDescription("Movimiento desconocido", "expense")
    ).toEqual({
      category: "uncategorized",
      source: "default",
    });
  });
});
