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
} from './types';

// Plugin installation for Vue 2
export default {
  install(vue: typeof Vue) {
    vue.component('GridforgeTable', GridforgeTable);
  },
};
