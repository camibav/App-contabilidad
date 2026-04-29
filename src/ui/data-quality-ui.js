import { escapeHtml } from "../utils/html.js";

export function renderDataQualityPanel(elements, context = {}) {
  const container = elements.dataQualityPanel;

  if (!container) {
    return;
  }

  const stats = context.stats ?? {};
  const dataQuality = normalizeDataQuality(stats.dataQuality);
  const filesCount = getSafeLength(context.files);
  const learnedRulesCount = getSafeLength(context.learnedCategoryRules);
  const recurringExclusionsCount = getSafeLength(context.recurringExpenseExclusions);

  if (!dataQuality.totalMovements) {
    renderDataQualityEmptyState(container);
    return;
  }

  const qualityLevel = getQualityLevel(dataQuality.classifiedPercentage);
  const qualityLabel = getQualityLabel(qualityLevel);
  const unclassifiedTone = dataQuality.uncategorizedMovements > 0 ? "warning" : "success";

  container.innerHTML = `
    <article class="data-quality-card data-quality-card--${escapeHtml(qualityLevel)}">
      <div class="data-quality-card-header">
        <span class="data-quality-label">Movimientos clasificados</span>
        <strong class="data-quality-value">${escapeHtml(formatPercentage(dataQuality.classifiedPercentage))}</strong>
      </div>

      <div class="data-quality-progress" aria-hidden="true">
        <span style="--data-quality-progress: ${escapeHtml(formatProgressValue(dataQuality.classifiedPercentage))}%"></span>
      </div>

      <p class="data-quality-description">
        ${escapeHtml(dataQuality.classifiedMovements)} de ${escapeHtml(dataQuality.totalMovements)} movimientos tienen categoría asignada.
      </p>

      <span class="data-quality-pill">${escapeHtml(qualityLabel)}</span>
    </article>

    ${renderMetricCard({
      label: "Sin clasificar",
      value: String(dataQuality.uncategorizedMovements),
      description: dataQuality.uncategorizedMovements > 0
        ? "Revisa estos movimientos para mejorar la confiabilidad de las gráficas."
        : "Todos los movimientos filtrados tienen categoría.",
      tone: unclassifiedTone,
    })}

    ${renderMetricCard({
      label: "Reglas aprendidas",
      value: String(learnedRulesCount),
      description: "Reglas manuales disponibles para futuras importaciones de PDF.",
      tone: learnedRulesCount > 0 ? "info" : "neutral",
    })}

    ${renderMetricCard({
      label: "Archivos activos",
      value: String(filesCount),
      description: `Extractos PDF incluidos en el dashboard acumulado. Exclusiones recurrentes: ${recurringExclusionsCount}.`,
      tone: filesCount > 0 ? "info" : "neutral",
    })}
  `;
}

export function clearDataQualityPanel(elements) {
  renderDataQualityPanel(elements, {
    stats: {
      dataQuality: {
        totalMovements: 0,
        classifiedMovements: 0,
        uncategorizedMovements: 0,
        classifiedPercentage: 0,
      },
    },
    files: [],
    learnedCategoryRules: [],
    recurringExpenseExclusions: [],
  });
}

function renderMetricCard({ label, value, description, tone }) {
  return `
    <article class="data-quality-card data-quality-card--${escapeHtml(tone)}">
      <div class="data-quality-card-header">
        <span class="data-quality-label">${escapeHtml(label)}</span>
        <strong class="data-quality-value">${escapeHtml(value)}</strong>
      </div>
      <p class="data-quality-description">${escapeHtml(description)}</p>
    </article>
  `;
}

function renderDataQualityEmptyState(container) {
  container.innerHTML = `
    <div class="data-quality-empty-state">
      <strong>No hay calidad de datos disponible.</strong>
      <p>Carga uno o varios extractos PDF para calcular clasificación, reglas y archivos activos.</p>
    </div>
  `;
}

function normalizeDataQuality(dataQuality = {}) {
  const totalMovements = normalizeNumber(dataQuality.totalMovements);
  const uncategorizedMovements = normalizeNumber(dataQuality.uncategorizedMovements);
  const classifiedMovements = normalizeNumber(
    dataQuality.classifiedMovements ?? totalMovements - uncategorizedMovements
  );
  const classifiedPercentage = totalMovements
    ? normalizeNumber(dataQuality.classifiedPercentage ?? (classifiedMovements / totalMovements) * 100)
    : 0;

  return {
    totalMovements,
    classifiedMovements: Math.max(classifiedMovements, 0),
    uncategorizedMovements: Math.max(uncategorizedMovements, 0),
    classifiedPercentage: Math.min(Math.max(classifiedPercentage, 0), 100),
  };
}

function getQualityLevel(classifiedPercentage) {
  if (classifiedPercentage >= 90) {
    return "success";
  }

  if (classifiedPercentage >= 70) {
    return "warning";
  }

  return "danger";
}

function getQualityLabel(level) {
  if (level === "success") {
    return "Calidad alta";
  }

  if (level === "warning") {
    return "Calidad media";
  }

  return "Requiere revisión";
}

function formatPercentage(value) {
  return `${normalizeNumber(value).toFixed(1)}%`;
}

function formatProgressValue(value) {
  return normalizeNumber(value).toFixed(2);
}

function normalizeNumber(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return 0;
  }

  return numberValue;
}

function getSafeLength(value) {
  return Array.isArray(value) ? value.length : 0;
}
