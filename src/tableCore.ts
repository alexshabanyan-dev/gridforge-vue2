import {
  ColumnDef,
  Table,
  createTable,
  getCoreRowModel,
  type TableState,
  type Updater,
  type TableOptionsResolved,
} from '@tanstack/table-core';
import type { TableRow, TableColumn } from './types';

export type GridforgeTableInstance = Table<TableRow>;

type MutableTable<TData> = Table<TData> & {
  options: TableOptionsResolved<TData>;
};

export function toColumnDefs(columns: TableColumn[]): ColumnDef<TableRow, unknown>[] {
  return (columns || []).map((col) => {
    const id = String(col.columnKey || col.field);

    // width задаёт базовый размер (в px), но НЕ делает колонку жёстко фиксированной.
    const baseSize = typeof col.width === 'number' ? col.width : undefined;
    const minSize = typeof col.minWidth === 'number' ? col.minWidth : undefined;
    const maxSize = typeof col.maxWidth === 'number' ? col.maxWidth : undefined;

    const def: ColumnDef<TableRow, unknown> = {
      id,
      accessorKey: String(col.field),
      header: col.header,
      // базовый размер TanStack (используется до первого ресайза)
      size: baseSize,
      minSize,
      maxSize,
      enableResizing: col.resizable !== false,
    };

    return def;
  });
}

export function createTanstackTable(
  data: TableRow[],
  columns: TableColumn[],
): GridforgeTableInstance {
  const table = createTable<TableRow>({
    data: data || [],
    columns: toColumnDefs(columns || []),
    getCoreRowModel: getCoreRowModel(),
    // Ресайз колонок: обновляем ширину в процессе движения
    columnResizeMode: 'onChange',
    // Внутренне управляемое состояние: TanStack будет звать onStateChange,
    // а мы просто обновляем table.options.state
    state: {} as TableState,
    onStateChange: (updater: Updater<TableState>) => {
      const previous = table.getState();
      const next =
        typeof updater === 'function'
          ? (updater as (old: TableState) => TableState)(previous)
          : updater;

      (table as MutableTable<TableRow>).options.state = next;
    },
    // Фоллбек для значений ячеек
    renderFallbackValue: null,
  });

  // Инициализируем state рассчитанным initialState (со всеми слайсами
  // columnSizing, columnSizingInfo, columnOrder и т.д.)
  (table as MutableTable<TableRow>).options.state = table.initialState;

  return table;
}
