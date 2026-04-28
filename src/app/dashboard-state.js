export function createDashboardState() {
  return {
    data: null,
    tablePagination: {
      page: 1,
      pageSize: 10,
    },
    tableSort: {
      key: "date",
      direction: "desc",
    },
  };
}

export function resetDashboardData(state) {
  state.data = null;
}

export function resetTablePaginationState(state) {
  state.tablePagination.page = 1;
  state.tablePagination.pageSize = 10;
}

export function resetTableSortState(state) {
  state.tableSort.key = "date";
  state.tableSort.direction = "desc";
}
