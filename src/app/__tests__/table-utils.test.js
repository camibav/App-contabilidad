import { describe, expect, it } from "vitest";
import {
  getPaginationState,
  normalizePageSize,
  paginateMovements,
  sortMovements,
  updateTableSortState,
} from "../table-utils.js";

const movements = [
  { id: "1", date: "2026-02-02", type: "expense", amount: -50000 },
  { id: "2", date: "2026-02-01", type: "income", amount: 3000000 },
  { id: "3", date: "2026-02-03", type: "expense", amount: -10000 },
];

describe("table-utils", () => {
  it("normaliza tamaños de página permitidos", () => {
    expect(normalizePageSize(5)).toBe(5);
    expect(normalizePageSize("50")).toBe(50);
    expect(normalizePageSize(25)).toBe(10);
  });

  it("calcula estado de paginación dentro de límites", () => {
    const paginationState = { page: 99, pageSize: 10 };
    const result = getPaginationState(25, paginationState);

    expect(result).toEqual({ page: 3, pageSize: 10, totalPages: 3 });
    expect(paginationState.page).toBe(3);
  });

  it("pagina movimientos", () => {
    expect(paginateMovements(movements, { page: 2, pageSize: 2 })).toEqual([
      movements[2],
    ]);
  });

  it("ordena movimientos por fecha descendente", () => {
    const result = sortMovements(movements, { key: "date", direction: "desc" });

    expect(result.map((movement) => movement.id)).toEqual(["3", "1", "2"]);
  });

  it("ordena movimientos por monto ascendente", () => {
    const result = sortMovements(movements, { key: "amount", direction: "asc" });

    expect(result.map((movement) => movement.id)).toEqual(["1", "3", "2"]);
  });

  it("actualiza estado de ordenamiento", () => {
    const sortState = { key: "date", direction: "desc" };

    expect(updateTableSortState(sortState, "amount")).toBe(true);
    expect(sortState).toEqual({ key: "amount", direction: "asc" });

    expect(updateTableSortState(sortState, "amount")).toBe(true);
    expect(sortState).toEqual({ key: "amount", direction: "desc" });

    expect(updateTableSortState(sortState, "description")).toBe(false);
  });
});
