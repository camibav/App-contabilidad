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
  const statementMonth = inferStatementMonthFromFileName(
    sourceFileName,
    statementYear
  );

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

    const dedupeKey = buildMovementDedupeKey({
      date,
      description: cleanMovementDescription,
      amount: signedAmount,
    });

    movements.push({
      id: buildMovementId({
        date,
        description: cleanMovementDescription,
        amount: signedAmount,
        source: sourceFileName,
      }),
      dedupeKey,
      date,
      month: monthKey,
      statementMonth,
      description: cleanMovementDescription,
      category: categoryResult.category,
      categorySource: categoryResult.source,
      amount: signedAmount,
      type,
      source: sourceFileName,
      sources: normalizeMovementSources(sourceFileName),
      rawLine: line,
    });
  }

  return movements;
}

export function mergeMovementsById(previousMovements = [], newMovements = []) {
  const movementsMap = new Map();

  for (const movement of previousMovements) {
    const mergeKey = getMovementMergeKey(movement);

    if (!mergeKey) {
      continue;
    }

    movementsMap.set(mergeKey, normalizeMovementForMerge(movement));
  }

  for (const movement of newMovements) {
    const normalizedMovement = normalizeMovementForMerge(movement);
    const mergeKey = getMovementMergeKey(normalizedMovement);

    if (!mergeKey) {
      continue;
    }

    const existingMovement = movementsMap.get(mergeKey);

    if (!existingMovement) {
      movementsMap.set(mergeKey, normalizedMovement);
      continue;
    }

    movementsMap.set(
      mergeKey,
      mergeMovementPreservingManualCategory(existingMovement, normalizedMovement)
    );
  }

  return Array.from(movementsMap.values()).sort(sortMovementsByDate);
}

export function mergeProcessedFiles(previousFiles, newFileName, options = {}) {
  const files = Array.isArray(previousFiles) ? previousFiles : [];
  const filesMap = new Map();

  for (const file of files) {
    if (!isValidProcessedFileName(file?.name)) {
      continue;
    }

    filesMap.set(file.name, file);
  }

  if (
    isValidProcessedFileName(options.legacyFileName) &&
    !filesMap.has(options.legacyFileName)
  ) {
    filesMap.set(options.legacyFileName, {
      name: options.legacyFileName,
      processedAt: options.legacyProcessedAt ?? null,
    });
  }

  if (isValidProcessedFileName(newFileName)) {
    filesMap.set(newFileName, {
      name: newFileName,
      processedAt: options.currentProcessedAt ?? new Date().toISOString(),
    });
  }

  return Array.from(filesMap.values());
}

export function normalizeProcessedFiles(parsedData) {
  const filesMap = new Map();

  if (Array.isArray(parsedData.files)) {
    for (const file of parsedData.files) {
      if (!isValidProcessedFileName(file?.name)) {
        continue;
      }

      filesMap.set(file.name, {
        name: file.name,
        processedAt: file.processedAt ?? null,
      });
    }
  }

  if (
    isValidProcessedFileName(parsedData.fileName) &&
    !filesMap.has(parsedData.fileName)
  ) {
    filesMap.set(parsedData.fileName, {
      name: parsedData.fileName,
      processedAt: parsedData.processedAt ?? null,
    });
  }

  return Array.from(filesMap.values());
}

export function removeProcessedFileFromDashboardData(data, fileNameToRemove) {
  const targetFileName = String(fileNameToRemove ?? "").trim();

  if (!targetFileName || !data || typeof data !== "object") {
    return data;
  }

  const files = normalizeProcessedFiles(data).filter(
    (file) => file.name !== targetFileName
  );

  const movements = Array.isArray(data.movements)
    ? data.movements
        .map((movement) =>
          removeSourceFromMovement(movement, targetFileName, files)
        )
        .filter(Boolean)
    : [];

  const fallbackFileName = files.at(-1)?.name ?? null;

  return {
    ...data,
    fileName: fallbackFileName,
    files,
    movements,
    processedAt: new Date().toISOString(),
  };
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

  const dedupeKey =
    movement.dedupeKey ??
    buildMovementDedupeKey({
      date,
      description,
      amount,
    });

  const sources = normalizeMovementSources(movement.sources, source);
  const statementMonth =
    movement.statementMonth ?? inferStatementMonthFromFileName(source, date.slice(0, 4));

  const normalizedMovement = {
    id: movement.id,
    dedupeKey,
    date,
    month,
    statementMonth,
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
    sources,
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

function normalizeMovementForMerge(movement) {
  const source = movement.source ?? "Unknown source";
  const dedupeKey =
    movement.dedupeKey ??
    buildMovementDedupeKey({
      date: movement.date,
      description: movement.description,
      amount: movement.amount,
    });

  return {
    ...movement,
    dedupeKey,
    sources: normalizeMovementSources(movement.sources, source),
  };
}

function removeSourceFromMovement(movement, fileNameToRemove, remainingFiles = []) {
  if (!movement || typeof movement !== "object") {
    return null;
  }

  const currentSources = normalizeMovementSources(
    movement.sources,
    movement.source
  );

  const updatedSources = currentSources.filter(
    (source) => source !== fileNameToRemove
  );

  if (!updatedSources.length) {
    return null;
  }

  const knownRemainingFileNames = remainingFiles.map((file) => file.name);
  const sources = updatedSources.filter((sourceName) =>
    knownRemainingFileNames.length
      ? knownRemainingFileNames.includes(sourceName)
      : true
  );

  if (!sources.length) {
    return null;
  }

  const source = sources[0];
  const fallbackYear = String(movement.date ?? "").slice(0, 4);
  const statementMonth =
    inferStatementMonthFromFileName(source, fallbackYear) ??
    movement.statementMonth ??
    null;

  return {
    ...movement,
    source,
    sources,
    statementMonth,
  };
}

function mergeMovementPreservingManualCategory(existingMovement, incomingMovement) {
  const mergedSources = normalizeMovementSources(
    existingMovement.sources,
    existingMovement.source,
    incomingMovement.sources,
    incomingMovement.source
  );

  if (existingMovement.categorySource === "manual") {
    return {
      ...incomingMovement,
      id: existingMovement.id ?? incomingMovement.id,
      dedupeKey: existingMovement.dedupeKey ?? incomingMovement.dedupeKey,
      source: existingMovement.source ?? incomingMovement.source,
      sources: mergedSources,
      statementMonth:
        existingMovement.statementMonth ?? incomingMovement.statementMonth ?? null,
      category: existingMovement.category,
      categorySource: "manual",
    };
  }

  return {
    ...existingMovement,
    ...incomingMovement,
    id: existingMovement.id ?? incomingMovement.id,
    dedupeKey: existingMovement.dedupeKey ?? incomingMovement.dedupeKey,
    source: existingMovement.source ?? incomingMovement.source,
    sources: mergedSources,
    statementMonth:
      existingMovement.statementMonth ?? incomingMovement.statementMonth ?? null,
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

function getMovementMergeKey(movement) {
  if (movement?.dedupeKey) {
    return movement.dedupeKey;
  }

  return buildMovementDedupeKey({
    date: movement?.date,
    description: movement?.description,
    amount: movement?.amount,
  });
}

function sortMovementsByDate(a, b) {
  const dateComparison = String(a.date ?? "").localeCompare(String(b.date ?? ""));

  if (dateComparison !== 0) {
    return dateComparison;
  }

  return String(a.description ?? "").localeCompare(String(b.description ?? ""));
}

function buildMovementId({ date, description, amount, source }) {
  return `${date}-${description}-${amount}-${source}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildMovementDedupeKey({ date, description, amount }) {
  return `${date}-${description}-${amount}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeMovementSources(...sourceValues) {
  const sources = [];

  for (const value of sourceValues.flat()) {
    const source = String(value ?? "").trim();

    if (!source || source === "Unknown source" || sources.includes(source)) {
      continue;
    }

    sources.push(source);
  }

  return sources;
}

function isValidProcessedFileName(fileName) {
  const normalizedFileName = String(fileName ?? "").trim();

  if (!normalizedFileName) {
    return false;
  }

  if (normalizedFileName === "Unknown source") {
    return false;
  }

  return normalizedFileName.toLowerCase().endsWith(".pdf");
}

function inferStatementMonthFromFileName(fileName, fallbackYear) {
  const normalizedFileName = normalizeText(fileName);
  const yearMatch = normalizedFileName.match(/\b(20\d{2})\b/);
  const year = yearMatch?.[1] ?? fallbackYear;

  if (!year) {
    return null;
  }

  const monthEntries = [
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

  const matchedMonth = monthEntries.find(([monthName]) =>
    normalizedFileName.includes(monthName)
  );

  if (!matchedMonth) {
    return null;
  }

  return `${year}-${matchedMonth[1]}`;
}
