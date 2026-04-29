import { CATEGORY_SOURCE_LABELS_ES } from "../config/translations.js";
import { formatCategory, formatMovementType } from "../utils/formatters.js";

const CSV_DELIMITER = ";";

const MOVEMENT_CSV_COLUMNS = [
  {
    header: "fecha",
    getValue: (movement) => movement.date ?? "",
  },
  {
    header: "mes",
    getValue: (movement) => movement.month ?? "",
  },
  {
    header: "archivo",
    getValue: (movement) => movement.source ?? "Origen desconocido",
  },
  {
    header: "descripcion",
    getValue: (movement) => movement.description ?? "Movimiento desconocido",
  },
  {
    header: "categoria",
    getValue: (movement) => formatCategory(movement.category ?? "uncategorized"),
  },
  {
    header: "origen_categoria",
    getValue: (movement) => formatCategorySource(movement.categorySource),
  },
  {
    header: "tipo",
    getValue: (movement) => formatMovementType(movement.type),
  },
  {
    header: "monto",
    getValue: (movement) => Number(movement.amount ?? 0),
  },
  {
    header: "id",
    getValue: (movement) => movement.id ?? "",
  },
];

export function buildMovementsCsv(movements = []) {
  const safeMovements = Array.isArray(movements) ? movements : [];
  const headerRow = MOVEMENT_CSV_COLUMNS.map((column) => column.header);

  const dataRows = safeMovements.map((movement) =>
    MOVEMENT_CSV_COLUMNS.map((column) => column.getValue(movement))
  );

  return [headerRow, ...dataRows]
    .map((row) => row.map(escapeCsvCell).join(CSV_DELIMITER))
    .join("\r\n");
}

export function downloadCsvFile({ csvContent, fileName }) {
  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(objectUrl);
}

export function buildCsvFileName(prefix = "nubank-movimientos-filtrados") {
  const timestamp = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", "-")
    .replaceAll(":", "-");

  return `${prefix}-${timestamp}.csv`;
}

function escapeCsvCell(value) {
  const normalizedValue = normalizeCsvValue(value);
  const mustBeQuoted = normalizedValue.includes(CSV_DELIMITER)
    || normalizedValue.includes('"')
    || normalizedValue.includes("\n")
    || normalizedValue.includes("\r");

  if (!mustBeQuoted) {
    return normalizedValue;
  }

  return `"${normalizedValue.replaceAll('"', '""')}"`;
}

function normalizeCsvValue(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "0";
  }

  const stringValue = String(value ?? "")
    .replace(/\r?\n/g, " ")
    .trim();

  if (startsLikeSpreadsheetFormula(stringValue)) {
    return `'${stringValue}`;
  }

  return stringValue;
}

function startsLikeSpreadsheetFormula(value) {
  return /^[=+@]/.test(value);
}

function formatCategorySource(categorySource) {
  const normalizedSource = String(categorySource ?? "default").trim();

  return CATEGORY_SOURCE_LABELS_ES[normalizedSource] ?? "Desconocido";
}
