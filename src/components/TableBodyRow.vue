<template>
  <tr v-if="hasValidRow" class="gf-table__body-row">
    <TableBodyCell
      v-for="column in validColumns"
      :key="getColumnKey(column)"
      :row="row"
      :column="column"
      :column-sizing="columnSizing"
    />
  </tr>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type Ref } from 'vue';
import type { PropType } from 'vue';
import type { TableColumn, TableRow } from '../types';
import TableBodyCell from './TableBodyCell.vue';
import { getColumnKey } from '../utils/columnHelpers';

const defaultColumnSizing = ref<Record<string, number>>({});

export default defineComponent({
  name: 'TableBodyRow',
  components: {
    TableBodyCell,
  },
  props: {
    row: {
      type: Object as PropType<TableRow>,
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
    const validColumns = computed(() => {
      if (!props.columns || !Array.isArray(props.columns)) {
        return [];
      }
      return props.columns.filter((col) => col != null && typeof col === 'object');
    });

    const hasValidRow = computed(() => {
      return props.row != null && typeof props.row === 'object';
    });

    return {
      row: props.row,
      hasValidRow,
      getColumnKey,
      validColumns,
    };
  },
});
</script>
