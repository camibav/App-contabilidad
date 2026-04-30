import { buildDashboardStats } from "../domain/dashboard-stats.js";
import { saveDashboardData } from "../services/storage.service.js";
import {
  resetDashboardData,
  resetTablePaginationState,
} from "./dashboard-state.js";

export function getDashboardMovementsFromState(state) {
  return Array.isArray(state?.data?.movements) ? state.data.movements : [];
}

export function getDashboardFilesFromState(state) {
  return Array.isArray(state?.data?.files) ? state.data.files : [];
}

export function buildDashboardDataWithMovements(data, movements = [], patch = {}) {
  const safeMovements = Array.isArray(movements) ? movements : [];
  const dashboardStats = buildDashboardStats(safeMovements);

  return {
    ...data,
    ...patch,
    movements: safeMovements,
    summary: dashboardStats.summary,
  };
}

export function setDashboardData(state, data, options = {}) {
  if (!state || typeof state !== "object") {
    throw new Error("No se recibió un estado válido del dashboard.");
  }

  const shouldPersist = options.persist !== false;

  state.data = shouldPersist ? saveDashboardData(data) : data;

  return state.data;
}

export function updateDashboardMovements(state, movements, options = {}) {
  const processedAt = options.processedAt ?? new Date().toISOString();
  const patch = {
    processedAt,
    ...(options.patch ?? {}),
  };
  const nextData = buildDashboardDataWithMovements(
    state?.data ?? {},
    movements,
    patch
  );

  return setDashboardData(state, nextData, {
    persist: options.persist,
  });
}

export function resetDashboardDataState(state, options = {}) {
  resetDashboardData(state);

  if (options.resetPagination !== false) {
    resetTablePaginationState(state);
  }

  return state;
}

export function resetDashboardPagination(state) {
  resetTablePaginationState(state);

  return state.tablePagination;
}
