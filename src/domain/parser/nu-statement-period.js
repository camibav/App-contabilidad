import { extractStatementYear, normalizeText } from "../../utils/text.js";

const MONTH_ENTRIES = [
  ["ENERO", "01"],
  ["ENE", "01"],
  ["FEBRERO", "02"],
  ["FEB", "02"],
  ["MARZO", "03"],
  ["MAR", "03"],
  ["ABRIL", "04"],
  ["ABR", "04"],
  ["MAYO", "05"],
  ["MAY", "05"],
  ["JUNIO", "06"],
  ["JUN", "06"],
  ["JULIO", "07"],
  ["JUL", "07"],
  ["AGOSTO", "08"],
  ["AGO", "08"],
  ["SEPTIEMBRE", "09"],
  ["SETIEMBRE", "09"],
  ["SEP", "09"],
  ["OCTUBRE", "10"],
  ["OCT", "10"],
  ["NOVIEMBRE", "11"],
  ["NOV", "11"],
  ["DICIEMBRE", "12"],
  ["DIC", "12"],
];

export function inferStatementYear({ rawText, sourceFileName }) {
  return extractStatementYearFromFileName(sourceFileName) ?? extractStatementYear(rawText);
}

export function extractStatementYearFromFileName(fileName) {
  const normalizedFileName = normalizeText(fileName);

  return normalizedFileName.match(/\b(20\d{2})\b/)?.[1] ?? null;
}

export function inferStatementMonthFromFileName(fileName, fallbackYear) {
  const normalizedFileName = normalizeText(fileName);
  const year = extractStatementYearFromFileName(fileName) ?? fallbackYear;

  if (!year) {
    return null;
  }

  const matchedMonth = MONTH_ENTRIES.find(([monthName]) =>
    normalizedFileName.includes(monthName)
  );

  if (!matchedMonth) {
    return null;
  }

  return `${year}-${matchedMonth[1]}`;
}
