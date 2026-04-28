export function getDashboardElements() {
  const elements = {
    pdfInput: document.getElementById("pdfInput"),
    statusElement: document.getElementById("status"),
    outputElement: document.getElementById("output"),

    incomeSummaryElement: document.getElementById("incomeSummary"),
    expensesSummaryElement: document.getElementById("expensesSummary"),
    balanceSummaryElement: document.getElementById("balanceSummary"),
    totalMovementsSummaryElement: document.getElementById(
      "totalMovementsSummary"
    ),

    processedFilesList: document.getElementById("processedFilesList"),
    dashboardInsightsList: document.getElementById("dashboardInsightsList"),

    expensesByMonthChart: document.getElementById("expensesByMonthChart"),
    expensesByCategoryChart: document.getElementById("expensesByCategoryChart"),
    expensesCategoryShareChart: document.getElementById(
      "expensesCategoryShareChart"
    ),
    incomeVsExpensesChart: document.getElementById("incomeVsExpensesChart"),

    categoryBreakdownList: document.getElementById("categoryBreakdownList"),

    topExpensesList: document.getElementById("topExpensesList"),
    recurringExpensesList: document.getElementById("recurringExpensesList"),
    excludedRecurringExpensesList: document.getElementById(
      "excludedRecurringExpensesList"
    ),
    fixedVariableExpensesSummary: document.getElementById(
      "fixedVariableExpensesSummary"
    ),
    uncategorizedMovementsList: document.getElementById(
      "uncategorizedMovementsList"
    ),

    learnedCategoryRulesList: document.getElementById(
      "learnedCategoryRulesList"
    ),
    learnedCategoryRulesCount: document.getElementById(
      "learnedCategoryRulesCount"
    ),

    monthFilter: document.getElementById("monthFilter"),
    sourceFilter: document.getElementById("sourceFilter"),
    typeFilter: document.getElementById("typeFilter"),
    categoryFilter: document.getElementById("categoryFilter"),
    descriptionSearch: document.getElementById("descriptionSearch"),
    clearFiltersButton: document.getElementById("clearFiltersButton"),

    movementsTable: document.querySelector(".movements-table"),
    movementsTableBody: document.getElementById("movementsTableBody"),
    movementsTableStatus: document.getElementById("movementsTableStatus"),
    pageSizeSelect: document.getElementById("pageSizeSelect"),
    previousPageButton: document.getElementById("previousPageButton"),
    nextPageButton: document.getElementById("nextPageButton"),
    tablePaginationStatus: document.getElementById("tablePaginationStatus"),

    exportFilteredCsvButton: document.getElementById("exportFilteredCsvButton"),
    exportBackupJsonButton: document.getElementById("exportBackupJsonButton"),
    importBackupJsonButton: document.getElementById("importBackupJsonButton"),
    backupJsonInput: document.getElementById("backupJsonInput"),

    clearSavedDataButton: document.getElementById("clearSavedDataButton"),
  };

  const requiredElements = [
    elements.pdfInput,
    elements.statusElement,
    elements.outputElement,

    elements.incomeSummaryElement,
    elements.expensesSummaryElement,
    elements.balanceSummaryElement,
    elements.totalMovementsSummaryElement,

    elements.processedFilesList,
    elements.dashboardInsightsList,
    elements.expensesByMonthChart,
    elements.expensesByCategoryChart,
    elements.expensesCategoryShareChart,
    elements.incomeVsExpensesChart,
    elements.categoryBreakdownList,
    elements.topExpensesList,
    elements.recurringExpensesList,
    elements.excludedRecurringExpensesList,
    elements.fixedVariableExpensesSummary,
    elements.uncategorizedMovementsList,
    elements.learnedCategoryRulesList,
    elements.learnedCategoryRulesCount,

    elements.monthFilter,
    elements.sourceFilter,
    elements.typeFilter,
    elements.categoryFilter,
    elements.descriptionSearch,
    elements.clearFiltersButton,

    elements.movementsTable,
    elements.movementsTableBody,
    elements.movementsTableStatus,
    elements.pageSizeSelect,
    elements.previousPageButton,
    elements.nextPageButton,
    elements.tablePaginationStatus,

    elements.exportFilteredCsvButton,
    elements.exportBackupJsonButton,
    elements.importBackupJsonButton,
    elements.backupJsonInput,
  ];

  if (requiredElements.some((element) => !element)) {
    throw new Error("Required HTML elements were not found.");
  }

  return elements;
}
