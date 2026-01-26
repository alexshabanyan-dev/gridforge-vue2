import {
  ColumnDef,
  Table,
  createTable,
  getCoreRowModel,
  type TableState,
  type Updater,
  type TableOptionsResolved,
} from '@tanstack/table-core';
import type { TableRow, TableColumn, ActionColumnItem } from './types';
import {
  ACTION_COLUMN_ID,
  ACTION_COLUMN_WIDTH,
  DEFAULT_COLUMN_WIDTH,
} from './constants/tableConstants';

export type GridforgeTableInstance = Table<TableRow>;

type MutableTable<TData> = Table<TData> & {
  options: TableOptionsResolved<TData>;
};

export function toColumnDefs(
  columns: TableColumn[],
): ColumnDef<TableRow, unknown>[] {
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
      // Сохраняем alignFrozen и sortable в meta для доступа из компонентов
      meta: {
        alignFrozen: col.alignFrozen,
        sortable: col.sortable === true, // По умолчанию false, нужно явно указать true
      },
    };

    return def;
  });
}

function buildActionColumnDef(
  layout: 'fit' | 'scroll',
  actionColumnParams: ActionColumnItem[],
  width: number,
): ColumnDef<TableRow, unknown> {
  return {
    id: ACTION_COLUMN_ID,
    accessorKey: ACTION_COLUMN_ID,
    header: '',
    size: width,
    minSize: width,
    maxSize: width,
    enableResizing: false,
    meta: {
      isActionColumn: true,
      actionColumnParams,
      alignFrozen: layout === 'scroll' ? 'right' : undefined,
    },
  };
}

export interface TableInitialState {
  columnVisibility?: Record<string, boolean>;
  columnSizing?: Record<string, number>;
  columnOrder?: string[];
}

export function createTanstackTable(
  data: TableRow[],
  columns: TableColumn[],
  layout: 'fit' | 'scroll',
  actionColumnParams?: ActionColumnItem[],
  actionColumnWidth?: number,
  initialState?: TableInitialState,
): GridforgeTableInstance {
  const userDefs = toColumnDefs(columns || []);
  const hasAction = Boolean(
    actionColumnParams && actionColumnParams.length > 0,
  );
  const actionDef = hasAction
    ? buildActionColumnDef(
        layout,
        actionColumnParams!,
        actionColumnWidth ?? ACTION_COLUMN_WIDTH,
      )
    : null;

  const cols: ColumnDef<TableRow, unknown>[] = actionDef
    ? [...userDefs, actionDef]
    : userDefs;

  const table = createTable<TableRow>({
    data: data || [],
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
    initialState: initialState ?? {},
    state: {} as TableState,
    onStateChange: (updater: Updater<TableState>) => {
      const previous = table.getState();
      const next =
        typeof updater === 'function'
          ? (updater as (old: TableState) => TableState)(previous)
          : updater;

      (table as MutableTable<TableRow>).options.state = next;
    },
    renderFallbackValue: null,
  });

  (table as MutableTable<TableRow>).options.state = table.initialState;

  return table;
}

export function getDefaultWidth(col: TableColumn): number {
  const w = col.width;
  return typeof w === 'number' ? w : DEFAULT_COLUMN_WIDTH;
}
