import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearFilterControls,
  clearImportDiagnosticsPanel,
  resetFileInput,
  setStatus,
} from "../../ui/dashboard-ui.js";
import {
  clearLastDashboardStorageError,
  clearSavedDashboardData,
} from "../../services/storage.service.js";
import { clearLearnedCategoryRules } from "../../services/category-rules-storage.service.js";
import { clearRecurringExpenseExclusions } from "../../services/recurring-expenses-storage.service.js";
import { resetDashboardDataState } from "../dashboard-actions.js";
import { clearDashboardView } from "../dashboard-view.js";
import { confirmAction } from "../confirm-action.js";
import { createClearSavedDataHandler } from "../storage-controller.js";

vi.mock("../../ui/dashboard-ui.js", () => ({
  clearFilterControls: vi.fn(),
  clearImportDiagnosticsPanel: vi.fn(),
  resetFileInput: vi.fn(),
  setOutput: vi.fn(),
  setStatus: vi.fn(),
}));

vi.mock("../../services/storage.service.js", () => ({
  clearLastDashboardStorageError: vi.fn(),
  clearSavedDashboardData: vi.fn(),
  getSavedDashboardData: vi.fn(),
}));

vi.mock("../../services/category-rules-storage.service.js", () => ({
  clearLearnedCategoryRules: vi.fn(),
  getLearnedCategoryRules: vi.fn(() => []),
}));

vi.mock("../../services/recurring-expenses-storage.service.js", () => ({
  clearRecurringExpenseExclusions: vi.fn(),
}));

vi.mock("../dashboard-actions.js", () => ({
  resetDashboardDataState: vi.fn(),
  setDashboardData: vi.fn(),
}));

vi.mock("../dashboard-view.js", () => ({
  clearDashboardView: vi.fn(),
}));

vi.mock("../confirm-action.js", () => ({
  confirmAction: vi.fn(),
}));

describe("storage-controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("elimina datos persistidos, reglas, exclusiones y diagnóstico visible", async () => {
    confirmAction.mockResolvedValue(true);

    const elements = {
      importDiagnosticsPanel: {},
      pdfInput: { value: "archivo.pdf" },
    };
    const state = {
      data: { movements: [{ id: "mov-1" }] },
      tablePagination: { page: 3, pageSize: 50 },
    };

    const handler = createClearSavedDataHandler({ elements, state });

    await handler();

    expect(clearSavedDashboardData).toHaveBeenCalledOnce();
    expect(clearLearnedCategoryRules).toHaveBeenCalledOnce();
    expect(clearRecurringExpenseExclusions).toHaveBeenCalledOnce();
    expect(clearLastDashboardStorageError).toHaveBeenCalledOnce();
    expect(resetDashboardDataState).toHaveBeenCalledWith(state);
    expect(clearFilterControls).toHaveBeenCalledWith(elements);
    expect(clearDashboardView).toHaveBeenCalledWith({
      elements,
      state,
      resetFilters: true,
      resetOutput: true,
    });
    expect(clearImportDiagnosticsPanel).toHaveBeenCalledWith(elements);
    expect(resetFileInput).toHaveBeenCalledWith(elements);
    expect(setStatus).toHaveBeenCalledWith(
      elements,
      expect.stringContaining("diagnóstico de importación")
    );
  });

  it("no elimina nada cuando el usuario cancela", async () => {
    confirmAction.mockResolvedValue(false);

    const elements = {};
    const state = {};

    const handler = createClearSavedDataHandler({ elements, state });

    await handler();

    expect(clearSavedDashboardData).not.toHaveBeenCalled();
    expect(clearLearnedCategoryRules).not.toHaveBeenCalled();
    expect(clearRecurringExpenseExclusions).not.toHaveBeenCalled();
    expect(clearImportDiagnosticsPanel).not.toHaveBeenCalled();
    expect(setStatus).toHaveBeenCalledWith(
      elements,
      "La eliminación de los datos guardados fue cancelada."
    );
  });
});
