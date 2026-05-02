import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSavedDashboardData,
  getSavedDashboardData,
  saveDashboardData,
} from "../storage.service.js";
import { STORAGE_KEY } from "../../config/storage.js";

describe("storage.service", () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorageMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.localStorage;
  });

  it("guarda datos versionados en localStorage", () => {
    const result = saveDashboardData({
      movements: [],
    });

    expect(result).toMatchObject({
      app: "nubank-dashboard",
      schemaVersion: 1,
      movements: [],
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      JSON.stringify(result)
    );
  });

  it("retorna datos guardados", () => {
    const data = {
      app: "nubank-dashboard",
      schemaVersion: 1,
      movements: [{ id: "mov-1" }],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    expect(getSavedDashboardData()).toEqual(data);
  });

  it("retorna null cuando no hay datos guardados", () => {
    expect(getSavedDashboardData()).toBeNull();
  });

  it("elimina datos guardados", () => {
    clearSavedDashboardData();

    expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
  });

  it("mantiene el retorno versionado aunque localStorage falle al guardar", () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem.mockImplementation(() => {
      throw new Error("Quota exceeded");
    });

    const result = saveDashboardData({ movements: [] });

    expect(result.schemaVersion).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledOnce();
  });
});

function createLocalStorageMock() {
  const store = new Map();

  return {
    getItem: vi.fn((key) => store.get(key) ?? null),
    setItem: vi.fn((key, value) => {
      store.set(key, String(value));
    }),
    removeItem: vi.fn((key) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}
