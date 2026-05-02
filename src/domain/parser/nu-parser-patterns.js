export const MOVEMENT_DATE_PATTERN =
  /^[^\d]*(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\b(.*)$/i;

export const MOVEMENT_AMOUNT_PATTERN = /([+-])\s*\$?\s*([\d.,]+)\s*$/;

export function startsMovementCandidate(line) {
  return MOVEMENT_DATE_PATTERN.test(String(line ?? ""));
}

export function hasMovementAmount(lines) {
  const text = Array.isArray(lines) ? lines.join(" ").trim() : String(lines ?? "").trim();

  return MOVEMENT_AMOUNT_PATTERN.test(text);
}

export function isIgnoredParserLine(line) {
  return /^---\s*P[ÁA]GINA\s+\d+\s*(OCR)?\s*---$/i.test(String(line ?? ""));
}
