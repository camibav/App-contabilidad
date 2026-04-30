import {
  addRecurringExpenseExclusion,
  deleteRecurringExpenseExclusion,
} from "../services/recurring-expenses-storage.service.js";
import { setStatus } from "../ui/dashboard-ui.js";
import { confirmAction } from "./confirm-action.js";

export function setupRecurringExpensesListeners({ elements, renderDashboard }) {
  if (elements.recurringExpensesList) {
    elements.recurringExpensesList.addEventListener("click", (event) =>
      handleExcludeRecurringExpense({ elements, renderDashboard, event })
    );
  }

  if (elements.excludedRecurringExpensesList) {
    elements.excludedRecurringExpensesList.addEventListener("click", (event) =>
      handleRestoreRecurringExpense({ elements, renderDashboard, event })
    );
  }
}

function handleExcludeRecurringExpense({ elements, renderDashboard, event }) {
  const button = event.target.closest("[data-recurring-exclude-key]");

  if (!button) {
    return;
  }

  const key = button.dataset.recurringExcludeKey;
  const description = button.dataset.recurringDescription ?? key;
  const category = button.dataset.recurringCategory ?? "uncategorized";

  if (!key) {
    return;
  }

  const confirmed = confirmAction(
    `¿Excluir "${description}" de los cálculos de gastos recurrentes? Esto también actualizará los gastos fijos vs variables.`
  );

  if (!confirmed) {
    setStatus(elements, "La exclusión del gasto recurrente fue cancelada.");
    return;
  }

  const exclusions = addRecurringExpenseExclusion({
    key,
    description,
    category,
  });

  renderDashboard({
    debugRawText: "--- PATRÓN DE GASTO RECURRENTE EXCLUIDO ---",
  });

  setStatus(
    elements,
    `Gasto recurrente excluido: ${description}. Exclusiones activas: ${exclusions.length}.`
  );
}

function handleRestoreRecurringExpense({ elements, renderDashboard, event }) {
  const button = event.target.closest("[data-recurring-restore-key]");

  if (!button) {
    return;
  }

  const key = button.dataset.recurringRestoreKey;
  const description = button.dataset.recurringDescription ?? key;

  if (!key) {
    return;
  }

  const exclusions = deleteRecurringExpenseExclusion(key);

  renderDashboard({
    debugRawText: "--- PATRÓN DE GASTO RECURRENTE RESTAURADO ---",
  });

  setStatus(
    elements,
    `Gasto recurrente restaurado: ${description}. Exclusiones activas: ${exclusions.length}.`
  );
}
