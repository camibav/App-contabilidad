# AGENTS.md

## Contexto del proyecto

- Este proyecto es un dashboard contable y financiero personal.
- Usa HTML, CSS modular y JavaScript vanilla.
- La lógica JavaScript ya está modularizada.
- El rediseño visual debe tocar principalmente `index.html` y archivos CSS.
- No se deben modificar parsers de PDF, servicios de storage, dominio financiero, filtros, backup, CSV ni categorización salvo necesidad justificada.
- No se deben cambiar los IDs usados por JavaScript.
- No se deben eliminar secciones existentes.
- No se deben hardcodear datos del mockup visual.
- Los valores de ingresos, gastos, balance, movimientos, categorías y gráficas deben seguir viniendo del JavaScript actual.
- El CSS debe mantenerse modular.
- El objetivo visual es un dashboard moderno con sidebar morado oscuro, contenido claro, tarjetas blancas, grillas simétricas, bordes suaves y acentos morados.

## IDs que deben conservarse

```text
pdfInput
status
incomeSummary
expensesSummary
balanceSummary
totalMovementsSummary
dataQualityPanel
processedFilesList
monthFilter
sourceFilter
typeFilter
categoryFilter
descriptionSearch
clearFiltersButton
dashboardInsightsList
expensesByMonthChart
expensesByCategoryChart
incomeVsExpensesChart
expensesCategoryShareChart
categoryBreakdownList
topExpensesList
recurringExpensesList
excludedRecurringExpensesList
fixedVariableExpensesSummary
uncategorizedMovementsList
learnedCategoryRulesCount
learnedCategoryRulesList
exportFilteredCsvButton
exportBackupJsonButton
importBackupJsonButton
backupJsonInput
clearSavedDataButton
movementsTableStatus
pageSizeSelect
tablePaginationStatus
previousPageButton
nextPageButton
movementsTableBody
output
confirmDialog
confirmDialogTitle
confirmDialogMessage
confirmDialogCancelButton
confirmDialogConfirmButton