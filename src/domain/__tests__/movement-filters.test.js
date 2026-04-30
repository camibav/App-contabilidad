import { describe, expect, it } from "vitest";
import { filterMovements } from "../movement-filters.js";

const movements = [
  {
    id: "1",
    date: "2026-02-01",
    month: "2026-02",
    source: "febrero.pdf",
    sources: ["febrero.pdf"],
    type: "expense",
    category: "food",
    description: "Restaurante Centro",
    amount: -50000,
  },
  {
    id: "2",
    date: "2026-03-01",
    month: "2026-03",
    source: "marzo.pdf",
    sources: ["marzo.pdf", "respaldo.pdf"],
    type: "income",
    category: "income",
    description: "Pago nomina",
    amount: 3000000,
  },
];

describe("filterMovements", () => {
  it("filtra por mes", () => {
    expect(filterMovements(movements, { month: "2026-02" })).toEqual([
      movements[0],
    ]);
  });

  it("filtra por fuente principal o fuente acumulada", () => {
    expect(filterMovements(movements, { source: "respaldo.pdf" })).toEqual([
      movements[1],
    ]);
  });

  it("filtra por tipo y categoría", () => {
    expect(
      filterMovements(movements, { type: "expense", category: "food" })
    ).toEqual([movements[0]]);
  });

  it("filtra por descripción ignorando mayúsculas y tildes", () => {
    expect(filterMovements(movements, { description: "nómina" })).toEqual([
      movements[1],
    ]);
  });
});
