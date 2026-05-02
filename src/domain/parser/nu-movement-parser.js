import {
  cleanDescription,
  getMonthNumber,
  parseColombianCurrency,
} from "../../utils/text.js";
import {
  MOVEMENT_AMOUNT_PATTERN,
  MOVEMENT_DATE_PATTERN,
  hasMovementAmount,
  isIgnoredParserLine,
  startsMovementCandidate,
} from "./nu-parser-patterns.js";

export function buildMovementCandidates(lines = []) {
  const candidates = [];
  let currentCandidate = null;

  for (const line of lines) {
    if (isIgnoredParserLine(line)) {
      continue;
    }

    if (startsMovementCandidate(line)) {
      if (currentCandidate && hasMovementAmount(currentCandidate.lines)) {
        candidates.push(currentCandidate);
      }

      currentCandidate = {
        lines: [line],
      };

      if (hasMovementAmount(currentCandidate.lines)) {
        candidates.push(currentCandidate);
        currentCandidate = null;
      }

      continue;
    }

    if (!currentCandidate) {
      continue;
    }

    currentCandidate.lines.push(line);

    if (hasMovementAmount(currentCandidate.lines)) {
      candidates.push(currentCandidate);
      currentCandidate = null;
    }
  }

  if (currentCandidate && hasMovementAmount(currentCandidate.lines)) {
    candidates.push(currentCandidate);
  }

  return candidates;
}

export function parseMovementCandidate(candidate, statementYear) {
  const lines = Array.isArray(candidate?.lines) ? candidate.lines : [];

  if (!lines.length) {
    return null;
  }

  const dateMatch = lines[0].match(MOVEMENT_DATE_PATTERN);

  if (!dateMatch) {
    return null;
  }

  const [, rawDay, monthText, firstDescriptionPart = ""] = dateMatch;
  const body = [firstDescriptionPart, ...lines.slice(1)]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const amountMatch = body.match(MOVEMENT_AMOUNT_PATTERN);

  if (!amountMatch) {
    return null;
  }

  const [, sign, rawAmount] = amountMatch;
  const description = body.replace(MOVEMENT_AMOUNT_PATTERN, "").trim();
  const cleanMovementDescription = cleanDescription(description);

  if (!cleanMovementDescription) {
    return null;
  }

  const day = rawDay.padStart(2, "0");
  const month = getMonthNumber(monthText);
  const date = `${statementYear}-${month}-${day}`;
  const monthKey = `${statementYear}-${month}`;
  const amount = parseColombianCurrency(rawAmount);
  const signedAmount = sign === "-" ? amount * -1 : amount;
  const type = signedAmount >= 0 ? "income" : "expense";
  const rawLine = lines.join(" ");

  return {
    date,
    monthKey,
    description,
    cleanMovementDescription,
    signedAmount,
    type,
    rawLine,
  };
}
