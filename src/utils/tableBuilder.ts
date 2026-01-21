import type { TableColumn, TableRow } from '../types';
import type { GridforgeTableInstance } from '../tableCore';
import { createTanstackTable } from '../tableCore';
import { createFitModeResizeHandler, getFullColumnSizing } from './columnResize';

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

  // Сохраняем оригинальный setColumnSizing
  const originalSetColumnSizing = table.setColumnSizing.bind(table);

  // Создаём обработчик ресайза с логикой "только две колонки" для fit-режима
  const fitModeHandler = createFitModeResizeHandler(
    table,
    layout,
    getPreviousColumnSizing,
    onSizingUpdate,
  );

  // Переопределяем setColumnSizing
  (table as any).setColumnSizing = (updater: any) => {
    fitModeHandler(updater, originalSetColumnSizing);
  };

  return table;
}

/**
 * Инициализирует previousColumnSizing для таблицы
 */
export function initializeColumnSizing(table: GridforgeTableInstance): Record<string, number> {
  return getFullColumnSizing(table);
}
