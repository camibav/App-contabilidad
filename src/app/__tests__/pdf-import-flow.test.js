import { describe, expect, it } from "vitest";
import { buildDashboardDataWithMovements } from "../dashboard-actions.js";
import { buildDashboardViewModel } from "../dashboard-view-model.js";
import { parseNuMovementsWithDiagnostics } from "../../domain/movements.js";
import { mergeMovementsById } from "../../domain/movements.js";
import { partitionMovementsByValidation } from "../../domain/movement-validation.js";


describe("pdf import flow", () => {
  it("integra parseo, validación, merge, datos del dashboard y view model", () => {
    const rawText = [
      "Extracto 2026",
      "01 feb Enviaste a Restaurante - $ 50.000",
      "02 feb Recibiste de Empresa + $ 3.000.000",
      "02 feb Enviaste a Cafe - $ 10.000",
    ].join("\n");

    const parsed = parseNuMovementsWithDiagnostics(rawText, "febrero-2026.pdf");
    const { validMovements, invalidMovements } = partitionMovementsByValidation(
      parsed.movements
    );
    const movements = mergeMovementsById([], validMovements);
    const dashboardData = buildDashboardDataWithMovements(
      {
        fileName: "febrero-2026.pdf",
        files: [{ name: "febrero-2026.pdf", processedAt: "2026-02-28T00:00:00.000Z" }],
      },
      movements,
      {
        processedAt: "2026-02-28T00:00:00.000Z",
      }
    );
    const viewModel = buildDashboardViewModel({
      data: dashboardData,
      filters: { type: "expense" },
      tablePagination: { page: 1, pageSize: 5 },
      tableSort: { key: "amount", direction: "asc" },
      learnedCategoryRules: [],
      recurringExpenseExclusions: [],
    });

    expect(parsed.parserDiagnostics).toMatchObject({
      statementYear: "2026",
      statementMonth: "2026-02",
      parsedMovementsCount: 3,
    });
    expect(invalidMovements).toEqual([]);
    expect(dashboardData.summary).toMatchObject({
      totalMovements: 3,
      income: 3000000,
      expenses: 60000,
      balance: 2940000,
    });
    expect(viewModel.filteredMovements).toHaveLength(2);
    expect(viewModel.filteredSummary.expenses).toBe(60000);
    expect(viewModel.paginatedMovements.map((movement) => movement.description)).toEqual([
      "Restaurante",
      "Cafe",
    ]);
  });
});
