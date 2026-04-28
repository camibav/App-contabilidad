import { CATEGORY_RULES } from "../config/categories.js";
import {
  cleanDescription,
  extractStatementYear,
  getMonthNumber,
  normalizeLine,
  normalizeText,
  parseColombianCurrency,
} from "../utils/text.js";
import { inferCategoryFromLearnedRules } from "./category-learning.js";

export function parseNuMovements(
  rawText,
  sourceFileName = "Unknown source",
  options = {}
) {
  const learnedCategoryRules = Array.isArray(options.learnedCategoryRules)
    ? options.learnedCategoryRules
    : [];

  const statementYear = extractStatementYear(rawText);

  const lines = rawText
    .split("\n")
    .map((line) => normalizeLine(line))
    .filter(Boolean);

  const movements = [];
  const movementRegex =
    /^[^\d]*(\d{2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\s+(.+?)\s+([+-])\$?([\d.,]+)$/i;

  for (const line of lines) {
    const match = line.match(movementRegex);

    if (!match) {
      continue;
    }

    const [, day, monthText, description, sign, rawAmount] = match;
    const month = getMonthNumber(monthText);
    const date = `${statementYear}-${month}-${day}`;
    const monthKey = `${statementYear}-${month}`;
    const cleanMovementDescription = cleanDescription(description);
    const amount = parseColombianCurrency(rawAmount);
    const signedAmount = sign === "-" ? amount * -1 : amount;
    const type = signedAmount >= 0 ? "income" : "expense";

    const categoryResult = inferCategoryFromDescription(description, type, {
      learnedCategoryRules,
      movementLike: {
        description: cleanMovementDescription,
        rawLine: line,
        type,
      },
    });

    movements.push({
      id: buildMovementId({
        date,
        description: cleanMovementDescription,
        amount: signedAmount,
        source: sourceFileName,
      }),
      date,
      month: monthKey,
      description: cleanMovementDescription,
      category: categoryResult.category,
      categorySource: categoryResult.source,
      amount: signedAmount,
      type,
      source: sourceFileName,
      rawLine: line,
    });
  }

  return movements;
}

export function mergeMovementsById(previousMovements, newMovements) {
  const movementsMap = new Map();

  for (const movement of previousMovements) {
    movementsMap.set(movement.id, movement);
  }

  for (const movement of newMovements) {
    const existingMovement = movementsMap.get(movement.id);

    if (!existingMovement) {
      movementsMap.set(movement.id, movement);
      continue;
    }

    movementsMap.set(
      movement.id,
      mergeMovementPreservingManualCategory(existingMovement, movement)
    );
  }

  return Array.from(movementsMap.values()).sort(sortMovementsByDate);
}

export function mergeProcessedFiles(previousFiles, newFileName, options = {}) {
  const files = Array.isArray(previousFiles) ? previousFiles : [];
  const filesMap = new Map();

  for (const file of files) {
    if (!file?.name) {
      continue;
    }

    filesMap.set(file.name, file);
  }

  if (options.legacyFileName && !filesMap.has(options.legacyFileName)) {
    filesMap.set(options.legacyFileName, {
      name: options.legacyFileName,
      processedAt: options.legacyProcessedAt ?? null,
    });
  }

  filesMap.set(newFileName, {
    name: newFileName,
    processedAt: options.currentProcessedAt ?? new Date().toISOString(),
  });

  return Array.from(filesMap.values());
}

export function normalizeProcessedFiles(parsedData) {
  const filesMap = new Map();

  if (Array.isArray(parsedData.files)) {
    for (const file of parsedData.files) {
      if (!file?.name) {
        continue;
      }

      filesMap.set(file.name, {
        name: file.name,
        processedAt: file.processedAt ?? null,
      });
    }
  }

  if (parsedData.fileName && !filesMap.has(parsedData.fileName)) {
    filesMap.set(parsedData.fileName, {
      name: parsedData.fileName,
      processedAt: parsedData.processedAt ?? null,
    });
  }

  return Array.from(filesMap.values());
}

export function normalizeStoredMovement(
  movement,
  fallbackSource = "Unknown source",
  options = {}
) {
  const learnedCategoryRules = Array.isArray(options.learnedCategoryRules)
    ? options.learnedCategoryRules
    : [];

  const source = movement.source ?? fallbackSource ?? "Unknown source";
  const date = movement.date ?? "";
  const month = movement.month ?? date.slice(0, 7) ?? "Unknown month";
  const amount = Number(movement.amount ?? 0);
  const type = movement.type ?? (amount >= 0 ? "income" : "expense");

  const description = movement.description ?? "Unknown movement";
  const existingCategory = movement.category;
  const existingCategorySource = movement.categorySource;

  const shouldInferCategory = shouldRecalculateCategory({
    existingCategory,
    existingCategorySource,
  });

  const categoryLookupText = movement.rawLine || description;
  const inferredCategory = inferCategoryFromDescription(categoryLookupText, type, {
    learnedCategoryRules,
    movementLike: {
      description,
      rawLine: movement.rawLine ?? "",
      type,
    },
  });

  const category = shouldInferCategory
    ? inferredCategory.category
    : existingCategory;

  const normalizedMovement = {
    id: movement.id,
    date,
    month,
    description,
    category,
    categorySource: getCategorySource({
      category,
      existingCategorySource,
      shouldInferCategory,
      inferredCategorySource: inferredCategory.source,
    }),
    amount,
    type,
    source,
    rawLine: movement.rawLine ?? "",
  };

  if (!normalizedMovement.id) {
    normalizedMovement.id = buildMovementId({
      date: normalizedMovement.date,
      description: normalizedMovement.description,
      amount: normalizedMovement.amount,
      source: normalizedMovement.source,
    });
  }

  return normalizedMovement;
}

function mergeMovementPreservingManualCategory(existingMovement, incomingMovement) {
  if (existingMovement.categorySource === "manual") {
    return {
      ...incomingMovement,
      category: existingMovement.category,
      categorySource: "manual",
    };
  }

  return {
    ...existingMovement,
    ...incomingMovement,
    category: incomingMovement.category ?? existingMovement.category,
    categorySource:
      incomingMovement.categorySource ?? existingMovement.categorySource,
  };
}

function shouldRecalculateCategory({
  existingCategory,
  existingCategorySource,
}) {
  if (existingCategorySource === "manual") {
    return false;
  }

  if (!existingCategory) {
    return true;
  }

  if (existingCategory === "uncategorized") {
    return true;
  }

  return ["auto", "default", "manual-learning"].includes(
    existingCategorySource
  );
}

function inferCategoryFromDescription(description, type, options = {}) {
  if (type === "income") {
    return {
      category: "income",
      source: "auto",
    };
  }

  const learnedRule = inferCategoryFromLearnedRules(
    options.movementLike ?? {
      description,
      type,
    },
    options.learnedCategoryRules
  );

  if (learnedRule) {
    return {
      category: learnedRule.category,
      source: "manual-learning",
    };
  }

  const normalizedDescription = normalizeText(description);

  for (const rule of CATEGORY_RULES) {
    const hasMatch = rule.keywords.some((keyword) =>
      normalizedDescription.includes(normalizeText(keyword))
    );

    if (hasMatch) {
      return {
        category: rule.category,
        source: "auto",
      };
    }
  }

  return {
    category: "uncategorized",
    source: "default",
  };
}

function getCategorySource({
  category,
  existingCategorySource,
  shouldInferCategory,
  inferredCategorySource,
}) {
  if (!shouldInferCategory && existingCategorySource) {
    return existingCategorySource;
  }

  if (inferredCategorySource) {
    return inferredCategorySource;
  }

  if (category === "uncategorized") {
    return "default";
  }

  return "auto";
}

function sortMovementsByDate(a, b) {
  const dateComparison = a.date.localeCompare(b.date);

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return a.description.localeCompare(b.description);
}

function buildMovementId({ date, description, amount, source }) {
  return `${date}-${description}-${amount}-${source}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
