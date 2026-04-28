export const APP_LOCALE = "es-CO";

export const CATEGORY_LABELS = {
  uncategorized: "Sin clasificar",
  income: "Ingresos",
  services: "Servicios",
  food: "Alimentación",
  transport: "Transporte",
  transfers: "Transferencias",
  taxes: "Impuestos",
  financial: "Financiero",
  shopping: "Compras",
  health: "Salud",
  education: "Educación",
  housing: "Vivienda",
  entertainment: "Entretenimiento",
  subscriptions: "Suscripciones",
  "personal-care": "Cuidado personal",
  cash: "Efectivo",
  other: "Otros",
};

export const MOVEMENT_TYPE_LABELS = {
  income: "Ingreso",
  expense: "Gasto",
};

export const CATEGORY_SOURCE_LABELS = {
  manual: "Manual",
  "manual-learning": "Regla aprendida",
  auto: "Regla automática",
  default: "Sin clasificar",
};

export const CATEGORY_SOURCE_TITLES = {
  manual: "Esta categoría fue asignada manualmente.",
  "manual-learning": "Esta categoría fue asignada a partir de una regla aprendida.",
  auto: "Esta categoría fue asignada por reglas automáticas.",
  default: "Aún no se aplicó una regla confiable de categoría.",
};

const STATIC_TRANSLATIONS = {
  "Contabilidad Dashboard": "Dashboard de contabilidad",
  "Upload one or more Nu Bank PDF statements to extract, parse and review your movements.":
    "Carga uno o varios extractos PDF de Nu Bank para extraer, procesar y revisar tus movimientos.",
  "Select one or more Nu Bank PDF statements":
    "Selecciona uno o varios extractos PDF de Nu Bank",
  "No PDF selected.": "No se ha seleccionado ningún PDF.",
  "Income": "Ingresos",
  "Expense": "Gasto",
  "Expenses": "Gastos",
  "Net balance": "Balance neto",
  "Balance": "Balance",
  "Movements": "Movimientos",
  "Processed files": "Archivos procesados",
  "Files already loaded into the accumulated dashboard.":
    "Archivos ya cargados en el dashboard acumulado.",
  "Filters": "Filtros",
  "Filter movements by month, file, type, category or description.":
    "Filtra movimientos por mes, archivo, tipo, categoría o descripción.",
  "Clear filters": "Limpiar filtros",
  "Month": "Mes",
  "All months": "Todos los meses",
  "File": "Archivo",
  "All files": "Todos los archivos",
  "Type": "Tipo",
  "All types": "Todos los tipos",
  "Category": "Categoría",
  "All categories": "Todas las categorías",
  "Description": "Descripción",
  "Insights": "Indicadores",
  "Key observations based on the current filtered dashboard data.":
    "Observaciones clave basadas en los datos filtrados actuales.",
  "Charts": "Gráficas",
  "Visual summary of expenses by month and category based on the current filters.":
    "Resumen visual de gastos por mes y categoría según los filtros actuales.",
  "Expenses by month": "Gastos por mes",
  "Monthly spending distribution.": "Distribución mensual de gastos.",
  "Expenses by category": "Gastos por categoría",
  "Spending grouped by assigned category.": "Gastos agrupados por categoría asignada.",
  "Income vs expenses by month": "Ingresos vs gastos por mes",
  "Monthly comparison between income and expenses.":
    "Comparación mensual entre ingresos y gastos.",
  "Expense share by category": "Participación de gastos por categoría",
  "Percentage distribution of expenses by category.":
    "Distribución porcentual de gastos por categoría.",
  "Category breakdown": "Desglose por categoría",
  "Detailed category distribution based on the current filtered dashboard data.":
    "Distribución detallada por categoría según los datos filtrados actuales.",
  "Top expenses": "Mayores gastos",
  "Highest expenses detected from the current filtered dashboard data.":
    "Mayores gastos detectados en los datos filtrados actuales.",
  "Recurring expenses": "Gastos recurrentes",
  "Expenses detected across multiple months based on similar descriptions.":
    "Gastos detectados en varios meses con base en descripciones similares.",
  "Excluded recurring expenses": "Gastos recurrentes excluidos",
  "Patterns manually excluded from recurring expense calculations.":
    "Patrones excluidos manualmente de los cálculos de gastos recurrentes.",
  "Fixed vs variable expenses": "Gastos fijos vs variables",
  "Estimated split between recurring fixed expenses and variable spending.":
    "Distribución estimada entre gastos fijos recurrentes y gastos variables.",
  "Uncategorized movements": "Movimientos sin clasificar",
  "Movements that still need a category assignment in the current filtered view.":
    "Movimientos que aún necesitan una categoría en la vista filtrada actual.",
  "Learned category rules": "Reglas de categoría aprendidas",
  "Manual categorization rules saved for future PDF imports.":
    "Reglas de categorización manual guardadas para futuras importaciones de PDF.",
  "Parsed movements": "Movimientos procesados",
  "Review the detected transactions before adding more dashboard features.":
    "Revisa las transacciones detectadas antes de seguir ampliando el dashboard.",
  "Export filtered CSV": "Exportar CSV filtrado",
  "Export backup JSON": "Exportar backup JSON",
  "Restore backup JSON": "Restaurar backup JSON",
  "Delete saved dashboard data": "Eliminar datos guardados",
  "Rows per page": "Filas por página",
  "Previous": "Anterior",
  "Next": "Siguiente",
  "Date": "Fecha",
  "Source": "Origen",
  "Amount": "Monto",
  "Debug: extracted raw text": "Debug: texto bruto extraído",
  "No files processed yet.": "Aún no hay archivos procesados.",
  "Unknown date": "Fecha desconocida",
  "Unknown source": "Fuente desconocida",
  "Unknown movement": "Movimiento desconocido",
  "No insights available": "No hay indicadores disponibles",
  "Load PDF statements or adjust the filters to analyze movements.":
    "Carga extractos PDF o ajusta los filtros para analizar movimientos.",
  "Needs categorization": "Requiere categorización",
  "Review the uncategorized movements panel before improving automatic category rules.":
    "Revisa el panel de movimientos sin clasificar antes de mejorar las reglas automáticas.",
  "Highest expense": "Mayor gasto",
  "Main expense category": "Categoría principal de gasto",
  "Highest spending month": "Mes con mayor gasto",
  "Highest spending file": "Archivo con mayor gasto",
  "Filtered balance": "Balance filtrado",
  "Income is equal to or higher than expenses in the current view.":
    "Los ingresos son iguales o superiores a los gastos en la vista actual.",
  "Expenses are higher than income in the current view.":
    "Los gastos son superiores a los ingresos en la vista actual.",
  "No monthly expenses available.": "No hay gastos mensuales disponibles.",
  "Load movements or adjust filters to display expenses by month.":
    "Carga movimientos o ajusta los filtros para mostrar gastos por mes.",
  "No category expenses available.": "No hay gastos por categoría disponibles.",
  "Assign categories or adjust filters to display expenses by category.":
    "Asigna categorías o ajusta los filtros para mostrar gastos por categoría.",
  "No category breakdown available.": "No hay desglose por categoría disponible.",
  "Load movements or adjust filters to display category totals.":
    "Carga movimientos o ajusta los filtros para mostrar totales por categoría.",
  "No top expenses available.": "No hay mayores gastos disponibles.",
  "Load expense movements or adjust the filters to display the highest expenses.":
    "Carga movimientos de gasto o ajusta los filtros para mostrar los mayores gastos.",
  "No recurring expenses detected.": "No se detectaron gastos recurrentes.",
  "Load at least two months of movements or adjust exclusions to detect recurring expenses.":
    "Carga movimientos de al menos dos meses o ajusta las exclusiones para detectar gastos recurrentes.",
  "No detected months.": "No hay meses detectados.",
  "No excluded recurring expenses.": "No hay gastos recurrentes excluidos.",
  "Use Exclude in the Recurring expenses panel to ignore false positives.":
    "Usa Excluir en el panel de gastos recurrentes para ignorar falsos positivos.",
  "No fixed vs variable summary available.":
    "No hay resumen de gastos fijos vs variables disponible.",
  "Load expense movements or adjust filters to estimate fixed and variable spending.":
    "Carga movimientos de gasto o ajusta los filtros para estimar gastos fijos y variables.",
  "No uncategorized movements found.": "No se encontraron movimientos sin clasificar.",
  "All movements in the current filtered view already have a category.":
    "Todos los movimientos de la vista filtrada actual ya tienen una categoría.",
  "No learned category rules yet.": "Aún no hay reglas de categoría aprendidas.",
  "Change a movement category manually and choose to remember it for future PDFs.":
    "Cambia manualmente la categoría de un movimiento y elige recordarla para futuros PDF.",
  "No movements loaded yet.": "Aún no hay movimientos cargados.",
  "No movements match the current filters.":
    "Ningún movimiento coincide con los filtros actuales.",
  "Adjust or clear the filters to display stored movements again.":
    "Ajusta o limpia los filtros para volver a mostrar los movimientos guardados.",
  "Upload one or more Nu Bank PDF statements to start building the dashboard.":
    "Carga uno o varios extractos PDF de Nu Bank para empezar a construir el dashboard.",
  "No expense share available.": "No hay participación de gastos disponible.",
  "Load expense movements or adjust filters to display category percentages.":
    "Carga movimientos de gasto o ajusta los filtros para mostrar porcentajes por categoría.",
  "No monthly comparison available.": "No hay comparación mensual disponible.",
  "Load income and expense movements or adjust filters to compare monthly income and expenses.":
    "Carga movimientos de ingresos y gastos o ajusta los filtros para comparar ingresos y gastos por mes.",
  "Total expenses": "Total de gastos",
  "Detected months": "Meses detectados",
  "Average monthly expense": "Gasto mensual promedio",
  "Total detected": "Total detectado",
  "Fixed expenses": "Gastos fijos",
  "Variable expenses": "Gastos variables",
  "Estimated monthly fixed": "Fijo mensual estimado",
  "Recurring patterns": "Patrones recurrentes",
  "Pattern": "Patrón",
  "Updated": "Actualizado",
  "Delete": "Eliminar",
  "Restore": "Restaurar",
  "Exclude": "Excluir",
  "Assign category": "Asignar categoría",
  "Manual": "Manual",
  "Learned rule": "Regla aprendida",
  "Auto rule": "Regla automática",
  "Uncategorized": "Sin clasificar",
  "This category was assigned manually.": "Esta categoría fue asignada manualmente.",
  "This category was assigned from a learned manual rule.":
    "Esta categoría fue asignada a partir de una regla aprendida.",
  "This category was assigned by the automatic category rules.":
    "Esta categoría fue asignada por reglas automáticas.",
  "No reliable category rule has been applied yet.":
    "Aún no se aplicó una regla confiable de categoría.",
};

const ATTRIBUTE_TRANSLATIONS = {
  "Search by description...": "Buscar por descripción...",
  "Table pagination controls": "Controles de paginación de la tabla",
};

export function formatCategoryLabel(category) {
  const normalizedCategory = String(category || "uncategorized").trim();

  if (CATEGORY_LABELS[normalizedCategory]) {
    return CATEGORY_LABELS[normalizedCategory];
  }

  return normalizedCategory
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatMovementTypeLabel(type) {
  return MOVEMENT_TYPE_LABELS[type] ?? MOVEMENT_TYPE_LABELS.expense;
}

export function formatCategorySourceLabel(categorySource) {
  return CATEGORY_SOURCE_LABELS[categorySource] ?? CATEGORY_SOURCE_LABELS.default;
}

export function formatCategorySourceTitle(categorySource) {
  return CATEGORY_SOURCE_TITLES[categorySource] ?? CATEGORY_SOURCE_TITLES.default;
}

export function translateTextToSpanish(value) {
  const text = String(value ?? "");
  const trimmed = text.trim();

  if (!trimmed) {
    return text;
  }

  const translated = translateKnownText(trimmed);

  if (translated === trimmed) {
    return text;
  }

  return text.replace(trimmed, translated);
}

export function translateAttributeToSpanish(value) {
  const text = String(value ?? "").trim();

  return ATTRIBUTE_TRANSLATIONS[text] ?? translateKnownText(text);
}

function translateKnownText(text) {
  if (STATIC_TRANSLATIONS[text]) {
    return STATIC_TRANSLATIONS[text];
  }

  const patterns = [
    [/^Page (\d+) of (\d+)$/, (_, page, totalPages) => `Página ${page} de ${totalPages}`],
    [/^Showing (\d+) of (\d+) movements\.$/, (_, visible, total) => `Mostrando ${visible} de ${total} movimientos.`],
    [/^Showing (\d+)-(\d+) of (\d+)\. Page (\d+) of (\d+)\.$/, (_, start, end, total, page, totalPages) => `Mostrando ${start}-${end} de ${total}. Página ${page} de ${totalPages}.`],
    [/^(\d+) filtered movements from (\d+) stored movements\.$/, (_, filtered, total) => `${filtered} movimientos filtrados de ${total} movimientos guardados.`],
    [/^Showing (\d+) of (\d+) uncategorized movements\.$/, (_, visible, total) => `Mostrando ${visible} de ${total} movimientos sin clasificar.`],
    [/^Showing (\d+) recurring expenses detected in the current filtered view\.$/, (_, total) => `Mostrando ${total} gastos recurrentes detectados en la vista filtrada actual.`],
    [/^(\d+) active recurring expense exclusions\.$/, (_, total) => `${total} exclusiones activas de gastos recurrentes.`],
    [/^(\d+) rules$/, (_, total) => `${total} reglas`],
    [/^(\d+) rule$/, (_, total) => `${total} regla`],
    [/^(.+) across (\d+) movement\(s\)\.$/, (_, amount, total) => `${amount} en ${total} movimiento(s).`],
    [/^(.+) in expenses for this filtered view\.$/, (_, amount) => `${amount} en gastos para esta vista filtrada.`],
    [/^(.+) detected from this source\.$/, (_, amount) => `${amount} detectados desde esta fuente.`],
  ];

  for (const [pattern, replacer] of patterns) {
    const match = text.match(pattern);

    if (match) {
      return replacer(...match);
    }
  }

  return text;
}
