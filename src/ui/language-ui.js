const APP_LOCALE = "es-CO";

export function translateDashboardToSpanish(root = document) {
  document.documentElement.lang = APP_LOCALE.split("-")[0];

  return root;
}
