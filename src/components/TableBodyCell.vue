<template>
  <td class="gf-table__body-cell" :style="cellStyle">
    {{ cellValue }}
  </td>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type Ref } from 'vue';
import type { PropType } from 'vue';
import type { TableColumn, TableRow } from '../types';
import { getColumnKey, getCellValue } from '../utils/columnHelpers';

const defaultColumnSizing = ref<Record<string, number>>({});

export default defineComponent({
  name: 'TableBodyCell',
  props: {
    row: {
      type: Object as PropType<TableRow>,
      required: true,
    },
    column: {
      type: Object as PropType<TableColumn>,
      required: true,
    },
    columnSizing: {
      type: Object as PropType<Ref<Record<string, number>>>,
      required: false,
      default: () => defaultColumnSizing,
    },
  },
  setup(props) {
    // Проверяем, что row и column существуют
    const isValid = computed(() => {
      return props.row != null && props.column != null;
    });

    const cellValue = computed(() => {
      if (!isValid.value) {
        return '';
      }
      return getCellValue(props.row, props.column);
    });

    const cellStyle = computed(() => {
      if (!props.column || !props.row) {
        return {};
      }

      const columnKey = getColumnKey(props.column);
      // Явно обращаемся к .value для правильного отслеживания изменений в Vue 2
      const sizing = props.columnSizing && props.columnSizing.value ? props.columnSizing.value : {};
      const width =
        sizing[columnKey] !== undefined
          ? sizing[columnKey]
          : typeof props.column.width === 'number'
            ? props.column.width
            : 150;

      const styles: Record<string, string> = {
        width: `${width}px`,
        minWidth: `${props.column.minWidth || 50}px`,
      };

      if (props.column.maxWidth !== undefined) {
        styles.maxWidth = `${props.column.maxWidth}px`;
      }

      return styles;
    });

    return {
      cellValue,
      cellStyle,
    };
  },
});
</script>
