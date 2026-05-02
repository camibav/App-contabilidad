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

const DEFAULT_DISCARDED_SAMPLE_LIMIT = 5;

export function buildMovementCandidates(lines = []) {
  return buildMovementCandidatesWithDiagnostics(lines).candidates;
}

export function buildMovementCandidatesWithDiagnostics(lines = []) {
  const safeLines = Array.isArray(lines) ? lines : [];
  const candidates = [];
  const discardedCandidates = [];
  let currentCandidate = null;
  let ignoredPageMarkerLinesCount = 0;
  let orphanLinesCount = 0;

  for (const line of safeLines) {
    if (isIgnoredParserLine(line)) {
      ignoredPageMarkerLinesCount += 1;
      continue;
    }

    if (startsMovementCandidate(line)) {
      if (currentCandidate) {
        if (hasMovementAmount(currentCandidate.lines)) {
          candidates.push(currentCandidate);
        } else {
          discardedCandidates.push(
            buildDiscardedCandidate(currentCandidate.lines, "missing_amount")
          );
        }
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
      orphanLinesCount += 1;
      continue;
    }

    currentCandidate.lines.push(line);

    if (hasMovementAmount(currentCandidate.lines)) {
      candidates.push(currentCandidate);
      currentCandidate = null;
    }
  }

  if (currentCandidate) {
    if (hasMovementAmount(currentCandidate.lines)) {
      candidates.push(currentCandidate);
    } else {
      discardedCandidates.push(
        buildDiscardedCandidate(currentCandidate.lines, "missing_amount")
      );
    }
  }

  return {
    candidates,
    diagnostics: {
      readableLinesCount: safeLines.length,
      candidateGroupsCount: candidates.length + discardedCandidates.length,
      candidatesWithAmountCount: candidates.length,
      discardedIncompleteCandidatesCount: discardedCandidates.length,
      ignoredPageMarkerLinesCount,
      orphanLinesCount,
      discardedCandidateSamples: discardedCandidates.slice(
        0,
        DEFAULT_DISCARDED_SAMPLE_LIMIT
      ),
    },
  };
}

export function parseMovementCandidate(candidate, statementYear) {
  return parseMovementCandidateWithDiagnostics(candidate, statementYear).movement;
}

export function parseMovementCandidateWithDiagnostics(candidate, statementYear) {
  const lines = Array.isArray(candidate?.lines) ? candidate.lines : [];

  if (!lines.length) {
    return buildParseResult(null, "empty_candidate", lines);
  }

  const dateMatch = lines[0].match(MOVEMENT_DATE_PATTERN);

  if (!dateMatch) {
    return buildParseResult(null, "invalid_date", lines);
  }

  const [, rawDay, monthText, firstDescriptionPart = ""] = dateMatch;
  const body = [firstDescriptionPart, ...lines.slice(1)]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  const amountMatch = body.match(MOVEMENT_AMOUNT_PATTERN);

  if (!amountMatch) {
    return buildParseResult(null, "missing_amount", lines);
  }

  const [, sign, rawAmount] = amountMatch;
  const description = body.replace(MOVEMENT_AMOUNT_PATTERN, "").trim();
  const cleanMovementDescription = cleanDescription(description);

  if (!cleanMovementDescription) {
    return buildParseResult(null, "empty_description", lines);
  }

  const amount = parseColombianCurrency(rawAmount);

  if (!Number.isFinite(amount)) {
    return buildParseResult(null, "invalid_amount", lines);
  }

  const day = rawDay.padStart(2, "0");
  const month = getMonthNumber(monthText);
  const date = `${statementYear}-${month}-${day}`;
  const monthKey = `${statementYear}-${month}`;
  const signedAmount = sign === "-" ? amount * -1 : amount;
  const type = signedAmount >= 0 ? "income" : "expense";
  const rawLine = lines.join(" ");

  return buildParseResult(
    {
      date,
      monthKey,
      description,
      cleanMovementDescription,
      signedAmount,
      type,
      rawLine,
    },
    null,
    lines
  );
}

function buildParseResult(movement, reason, lines) {
  return {
    movement,
    discardedCandidate: reason ? buildDiscardedCandidate(lines, reason) : null,
  };
}

function buildDiscardedCandidate(lines, reason) {
  return {
    reason,
    rawLines: Array.isArray(lines) ? [...lines] : [],
  };
}
