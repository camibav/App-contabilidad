import {
  addRecurringExpenseExclusion,
  deleteRecurringExpenseExclusion,
} from "../services/recurring-expenses-storage.service.js";
import { setStatus } from "../ui/dashboard-ui.js";
import { formatCategory } from "../utils/formatters.js";

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

  const confirmed = window.confirm(
    `Exclude "${description}" from recurring expense calculations? This will also update Fixed vs variable expenses.`
  );

  if (!confirmed) {
    setStatus(elements, "Recurring expense exclusion was cancelled.");
    return;
  }

  const exclusions = addRecurringExpenseExclusion({
    key,
    description,
    category,
  });

  renderDashboard({
    debugRawText: "--- RECURRING EXPENSE PATTERN EXCLUDED ---",
  });

  setStatus(
    elements,
    `Recurring expense excluded: ${description}. Active exclusions: ${exclusions.length}.`
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
    debugRawText: "--- RECURRING EXPENSE PATTERN RESTORED ---",
  });

  setStatus(
    elements,
    `Recurring expense restored: ${description}. Active exclusions: ${exclusions.length}.`
  );
}
