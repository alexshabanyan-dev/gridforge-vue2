<template>
  <tbody class="gf-table__body">
    <TableBodyRow
      v-for="(row, rowIndex) in validRows"
      :key="rowIndex"
      :row="row"
      :columns="validColumns"
      :column-sizing="columnSizing"
    />
  </tbody>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type Ref } from 'vue';
import type { PropType } from 'vue';
import type { TableColumn, TableRow } from '../types';
import TableBodyRow from './TableBodyRow.vue';

const defaultColumnSizing = ref<Record<string, number>>({});

export default defineComponent({
  name: 'TableBody',
  components: {
    TableBodyRow,
  },
  props: {
    rows: {
      type: Array as PropType<TableRow[]>,
      required: true,
    },
    columns: {
      type: Array as PropType<TableColumn[]>,
      required: true,
    },
    columnSizing: {
      type: Object as PropType<Ref<Record<string, number>>>,
      required: false,
      default: () => defaultColumnSizing,
    },
  },
  setup(props) {
    // В Vue 2 computed автоматически разворачивается при передаче как prop
    // Но нужно убедиться, что данные правильно обработаны
    const validRows = computed(() => {
      const rows = props.rows;
      if (!Array.isArray(rows)) {
        return [];
      }
      return rows.filter((row) => row != null && typeof row === 'object');
    });

    const validColumns = computed(() => {
      const cols = props.columns;
      if (!Array.isArray(cols)) {
        return [];
      }
      return cols.filter((col) => col != null && typeof col === 'object');
    });

    return {
      validRows,
      validColumns,
    };
  },
});
</script>
