export function extractStatementYear(rawText) {
  const yearMatch = rawText.match(/\b(20\d{2})\b/);

  if (!yearMatch) {
    return String(new Date().getFullYear());
  }

  return yearMatch[1];
}

export function normalizeLine(line) {
  return line
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();
}

export function normalizeText(value) {
  return String(value)
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseColombianCurrency(value) {
  return Number(value.replace(/\./g, "").replace(",", "."));
}

export function cleanDescription(description) {
  return description
    .replace(/^Enviaste a\s+/i, "")
    .replace(/^Recibiste de\s+/i, "")
    .replace(/^Recibiste\s+de\s+/i, "")
    .trim();
}

export function getMonthNumber(monthText) {
  const months = {
    ene: "01",
    feb: "02",
    mar: "03",
    abr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    ago: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dic: "12",
  };

  const normalizedMonth = monthText.toLowerCase();

  return months[normalizedMonth] ?? "01";
}
