const ALLOWED_PAGE_SIZES = [5, 10, 50, 100];
const ALLOWED_SORT_KEYS = ["date", "type", "amount"];

export function getPaginationState(totalItems, paginationState) {
  const pageSize = normalizePageSize(paginationState.pageSize);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(paginationState.page, 1), totalPages);

  paginationState.page = page;
  paginationState.pageSize = pageSize;

  return {
    page,
    pageSize,
    totalPages,
  };
}

export function paginateMovements(movements = [], pagination) {
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;

  return movements.slice(startIndex, endIndex);
}

export function sortMovements(movements = [], sortState = {}) {
  const safeMovements = Array.isArray(movements) ? movements : [];
  const sortKey = sortState.key ?? "date";
  const direction = sortState.direction === "asc" ? "asc" : "desc";

  return [...safeMovements].sort((firstMovement, secondMovement) => {
    const comparison = compareMovements(firstMovement, secondMovement, sortKey);

    if (direction === "asc") {
      return comparison;
    }

    return comparison * -1;
  });
}

export function normalizePageSize(value) {
  const pageSize = Number(value);

  if (!ALLOWED_PAGE_SIZES.includes(pageSize)) {
    return 10;
  }

  return pageSize;
}

export function updateTableSortState(sortState, sortKey) {
  if (!ALLOWED_SORT_KEYS.includes(sortKey)) {
    return false;
  }

  if (sortState.key === sortKey) {
    sortState.direction = sortState.direction === "asc" ? "desc" : "asc";
    return true;
  }

  sortState.key = sortKey;
  sortState.direction = sortKey === "date" ? "desc" : "asc";

  return true;
}

function compareMovements(firstMovement, secondMovement, sortKey) {
  const firstValue = getMovementSortValue(firstMovement, sortKey);
  const secondValue = getMovementSortValue(secondMovement, sortKey);

  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return firstValue - secondValue;
  }

  return String(firstValue).localeCompare(String(secondValue), "en", {
    numeric: true,
    sensitivity: "base",
  });
}

function getMovementSortValue(movement, sortKey) {
  if (sortKey === "amount") {
    return Number(movement.amount ?? 0);
  }

  if (sortKey === "type") {
    return movement.type ?? "";
  }

  return movement.date ?? "";
}
