import Vue from 'vue';
import './styles/style.css';
import GridforgeTable from './components/GridforgeTable.vue';

// Export component
export { GridforgeTable };

// Export types
export type {
  TableColumn,
  TableRow,
  GridforgeTableProps,
  PaginationWithTotal,
  PaginationWithFlags,
  SortState,
  SortDirection,
  ColumnMeta,
  ActionColumnItem,
} from './types';

// Storage service (localStorage state for columns, pagination, sort)
export {
  getTableState,
  loadTableState,
  saveTableState,
  mergeAndPersist,
  persistFromTable,
  persistPagination,
  persistSort,
  resetToDefaultsAndPersist,
} from './services/tableStateStorage';
export type {
  StoredTableState,
  StoredColumnState,
  StoredPagination,
  CurrentColumnInput,
  MergedTableState,
} from './services/tableStateStorage';

// Plugin installation for Vue 2
export default {
  install(vue: typeof Vue) {
    vue.component('GridforgeTable', GridforgeTable);
  },
};
