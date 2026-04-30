import { STORAGE_KEY } from "../config/storage.js";
import { stampDashboardDataVersion } from "../domain/dashboard-data-schema.js";

export function saveDashboardData(data) {
  const versionedData = stampDashboardDataVersion(data);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versionedData));
  } catch (error) {
    console.error("No se pudieron guardar los datos del dashboard.", error);
  }

  return versionedData;
}

export function getSavedDashboardData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return null;
  }

  return JSON.parse(savedData);
}

export function clearSavedDashboardData() {
  localStorage.removeItem(STORAGE_KEY);
}
