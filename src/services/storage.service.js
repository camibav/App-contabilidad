import { STORAGE_KEY } from "../config/storage.js";

export function saveDashboardData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
