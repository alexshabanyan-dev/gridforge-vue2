import { ref, computed, watch, type Ref } from 'vue';
import type { TableColumn, TableRow } from '../types';
import { getColumnKey } from '../utils/columnHelpers';

export interface UseTableProps {
  data: TableRow[];
  columns: TableColumn[];
}

export interface UseTableReturn {
  processedColumns: Ref<TableColumn[]>;
  processedRows: Ref<TableRow[]>;
  columnSizing: Ref<Record<string, number>>;
  columnVisibility: Ref<Record<string, boolean>>;
  columnOrder: Ref<string[]>;
}

/**
 * Нативный composable для управления таблицей без TanStack Table
 */
export function useTable(props: UseTableProps): UseTableReturn {
  const data = ref(props.data || []);
  const columns = ref(props.columns || []);

  // Состояние колонок
  const columnSizing = ref<Record<string, number>>({});
  const columnVisibility = ref<Record<string, boolean>>({});
  const columnOrder = ref<string[]>([]);

  // Инициализируем columnOrder при первом появлении колонок
  watch(
    () => columns.value,
    () => {
      if (columnOrder.value.length === 0 && columns.value.length > 0) {
        columnOrder.value = columns.value.map((col) => getColumnKey(col));
      }

      // Инициализируем видимость колонок (по умолчанию все видимы)
      columns.value.forEach((col) => {
        const key = getColumnKey(col);
        if (columnVisibility.value[key] === undefined) {
          columnVisibility.value[key] = true;
        }
      });
    },
    { immediate: true },
  );

  // Обрабатываем колонки с учетом порядка и видимости
  const processedColumns = computed(() => {
    // Фильтруем undefined/null колонки
    let cols = [...columns.value].filter((col) => col != null);

    // Применяем порядок колонок
    if (columnOrder.value.length > 0) {
      const orderMap = new Map(columnOrder.value.map((key, index) => [key, index]));
      cols.sort((a, b) => {
        const aKey = getColumnKey(a);
        const bKey = getColumnKey(b);
        const aOrder = orderMap.get(aKey) ?? Infinity;
        const bOrder = orderMap.get(bKey) ?? Infinity;
        return aOrder - bOrder;
      });
    }

    // Фильтруем видимые колонки
    cols = cols.filter((col) => {
      const key = getColumnKey(col);
      return columnVisibility.value[key] !== false;
    });

    return cols;
  });

  // Обрабатываем строки
  const processedRows = computed(() => {
    return data.value || [];
  });

  // Обновляем data и columns при изменении props
  watch(
    () => props.data,
    (newData) => {
      data.value = newData;
    },
    { deep: true },
  );

  watch(
    () => props.columns,
    (newColumns) => {
      columns.value = newColumns;
    },
    { deep: true },
  );

  return {
    processedColumns,
    processedRows,
    columnSizing,
    columnVisibility,
    columnOrder,
  };
}
