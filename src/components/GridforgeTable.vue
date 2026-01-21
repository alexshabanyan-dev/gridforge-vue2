<template>
  <div :class="['gf-table', $props.customClass]">
    <div v-if="processedColumns.length > 0" class="gf-table__wrapper">
      <table class="gf-table__table">
        <TableHeader :columns="processedColumns" :column-sizing="columnSizing" />
        <TableBody
          :rows="processedRows"
          :columns="processedColumns"
          :column-sizing="columnSizing"
        />
      </table>
    </div>
    <div v-else class="gf-table__empty">Загрузка таблицы...</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { PropType } from 'vue';
import type { TableColumn, TableRow } from '../types';
import TableHeader from './TableHeader.vue';
import TableBody from './TableBody.vue';
import { useTable } from '../composables/useTable';

export default defineComponent({
  name: 'GridforgeTable',
  components: {
    TableHeader,
    TableBody,
  },
  props: {
    data: {
      type: Array as PropType<TableRow[]>,
      required: true,
      default: () => [],
    },
    columns: {
      type: Array as PropType<TableColumn[]>,
      required: true,
      default: () => [],
    },
    tableKey: {
      type: String,
      default: undefined,
    },
    customClass: {
      type: String,
      default: undefined,
    },
  },
  setup(props) {
    // Используем нативный useTable без TanStack
    const { processedColumns, processedRows, columnSizing } = useTable({
      data: props.data || [],
      columns: props.columns || [],
    });

    // Явно разворачиваем и фильтруем колонки для безопасности
    const safeColumns = computed(() => {
      const cols = processedColumns.value || [];
      return cols.filter((col) => col != null);
    });

    // Явно разворачиваем rows
    const safeRows = computed(() => {
      const rows = processedRows.value || [];
      // Фильтруем только явно невалидные значения
      return rows.filter((row) => row != null);
    });

    return {
      processedColumns: safeColumns,
      processedRows: safeRows,
      columnSizing: columnSizing, // Оставляем как Ref для передачи в дочерние компоненты
    };
  },
});
</script>
