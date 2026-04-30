import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildDashboardDataWithMovements,
  getDashboardFilesFromState,
  getDashboardMovementsFromState,
  resetDashboardDataState,
  resetDashboardPagination,
  setDashboardData,
  updateDashboardMovements,
} from "../dashboard-actions.js";
import { saveDashboardData } from "../../services/storage.service.js";

vi.mock("../../services/storage.service.js", () => ({
  saveDashboardData: vi.fn((data) => ({
    ...data,
    schemaVersion: 1,
  })),
}));

describe("dashboard-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("construye datos del dashboard recalculando el resumen", () => {
    const result = buildDashboardDataWithMovements(
      { fileName: "enero.pdf" },
      [
        { type: "income", amount: 100000 },
        { type: "expense", amount: -25000 },
      ],
      { processedAt: "2026-01-01T00:00:00.000Z" }
    );

    expect(result).toMatchObject({
      fileName: "enero.pdf",
      processedAt: "2026-01-01T00:00:00.000Z",
      summary: {
        totalMovements: 2,
        income: 100000,
        expenses: 25000,
        balance: 75000,
      },
    });
  });

  it("setDashboardData persiste datos por defecto", () => {
    const state = { data: null };
    const result = setDashboardData(state, { movements: [] });

    expect(saveDashboardData).toHaveBeenCalledOnce();
    expect(result.schemaVersion).toBe(1);
    expect(state.data).toBe(result);
  });

  it("setDashboardData permite omitir persistencia", () => {
    const state = { data: null };
    const data = { movements: [] };
    const result = setDashboardData(state, data, { persist: false });

    expect(saveDashboardData).not.toHaveBeenCalled();
    expect(result).toBe(data);
    expect(state.data).toBe(data);
  });

  it("updateDashboardMovements actualiza movimientos y resumen", () => {
    const state = {
      data: {
        fileName: "enero.pdf",
        movements: [],
      },
    };

    const result = updateDashboardMovements(
      state,
      [{ type: "expense", amount: -15000 }],
      {
        processedAt: "2026-01-02T00:00:00.000Z",
      }
    );

    expect(result.summary.expenses).toBe(15000);
    expect(result.processedAt).toBe("2026-01-02T00:00:00.000Z");
  });

  it("expone movimientos y archivos seguros desde el estado", () => {
    const state = {
      data: {
        movements: [{ id: "one" }],
        files: [{ name: "enero.pdf" }],
      },
    };

    expect(getDashboardMovementsFromState(state)).toHaveLength(1);
    expect(getDashboardFilesFromState(state)).toHaveLength(1);
    expect(getDashboardMovementsFromState({ data: null })).toEqual([]);
    expect(getDashboardFilesFromState({ data: null })).toEqual([]);
  });

  it("resetea datos y paginación", () => {
    const state = {
      data: { movements: [{ id: "one" }] },
      tablePagination: {
        page: 5,
        pageSize: 50,
      },
    };

    resetDashboardDataState(state);

    expect(state.data).toBeNull();
    expect(state.tablePagination).toEqual({ page: 1, pageSize: 10 });
  });

  it("resetea solo la paginación cuando se solicita", () => {
    const state = {
      tablePagination: {
        page: 3,
        pageSize: 100,
      },
    };

    resetDashboardPagination(state);

    expect(state.tablePagination).toEqual({ page: 1, pageSize: 10 });
  });
});
