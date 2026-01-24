import type { Updater } from '@tanstack/table-core';
import type { TableColumn, TableRow } from '../types';
import type { GridforgeTableInstance } from '../tableCore';
import { createTanstackTable } from '../tableCore';
import {
  createFitModeResizeHandler,
  getFullColumnSizing,
} from './columnResize';

type ColumnSizingState = Record<string, number>;

/**
 * Создаёт и настраивает экземпляр таблицы TanStack
 */
export function buildTable(
  data: TableRow[],
  columns: TableColumn[],
  layout: 'fit' | 'scroll',
  getPreviousColumnSizing: () => Record<string, number>,
  onSizingUpdate: (sizing: Record<string, number>) => void,
): GridforgeTableInstance | null {
  const table = createTanstackTable(data || [], columns || []);
  if (!table) return null;

  const originalSetColumnSizing = table.setColumnSizing.bind(table);
  const fitModeHandler = createFitModeResizeHandler(
    table,
    layout,
    getPreviousColumnSizing,
    onSizingUpdate,
  );

  const override = (updater: Updater<ColumnSizingState>) => {
    fitModeHandler(updater, originalSetColumnSizing);
  };
  (
    table as GridforgeTableInstance & { setColumnSizing: typeof override }
  ).setColumnSizing = override;

  return table;
}

/**
 * Инициализирует previousColumnSizing для таблицы
 */
export function initializeColumnSizing(
  table: GridforgeTableInstance,
): Record<string, number> {
  return getFullColumnSizing(table);
}
