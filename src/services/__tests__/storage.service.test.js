import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearLastDashboardStorageError,
  clearSavedDashboardData,
  getLastDashboardStorageError,
  getSavedDashboardData,
  saveDashboardData,
} from "../storage.service.js";

const storage = new Map();

beforeEach(() => {
  storage.clear();
  clearLastDashboardStorageError();
  globalThis.localStorage = {
    getItem: vi.fn((key) => storage.get(key) ?? null),
    setItem: vi.fn((key, value) => storage.set(key, value)),
    removeItem: vi.fn((key) => storage.delete(key)),
  };
});

describe("storage.service", () => {
  it("guarda y recupera datos versionados", () => {
    const saved = saveDashboardData({ movements: [] });
    const loaded = getSavedDashboardData();

    expect(saved.schemaVersion).toBeGreaterThanOrEqual(1);
    expect(loaded.schemaVersion).toBe(saved.schemaVersion);
    expect(getLastDashboardStorageError()).toBeNull();
  });

  it("mantiene los datos en memoria y registra error cuando localStorage falla", () => {
    const storageError = new Error("Quota exceeded");
    globalThis.localStorage.setItem = vi.fn(() => {
      throw storageError;
    });

    const saved = saveDashboardData({ movements: [] });

    expect(saved.schemaVersion).toBeGreaterThanOrEqual(1);
    expect(getLastDashboardStorageError()).toBe(storageError);
  });

  it("limpia datos guardados y error de persistencia", () => {
    saveDashboardData({ movements: [] });
    clearSavedDashboardData();

    expect(getSavedDashboardData()).toBeNull();
    expect(getLastDashboardStorageError()).toBeNull();
  });
});
