import type { ColumnDef } from '@tanstack/table-core';
import type { TableColumn, TableRow } from '../types';
import { ACTION_COLUMN_ID } from '../constants/tableConstants';
import type { GridforgeTableInstance } from '../tableCore';
import { HEADER_PADDING, RESIZER_SPACE } from '../constants/tableConstants';

/**
 * Измеряет ширину текста с учётом стилей элемента
 */
export function measureTextWidth(
  text: string,
  referenceElement: HTMLElement,
): number {
  const measureEl = document.createElement('span');
  measureEl.style.position = 'absolute';
  measureEl.style.visibility = 'hidden';
  measureEl.style.whiteSpace = 'nowrap';
  measureEl.style.fontSize = window.getComputedStyle(referenceElement).fontSize;
  measureEl.style.fontWeight =
    window.getComputedStyle(referenceElement).fontWeight;
  measureEl.style.fontFamily =
    window.getComputedStyle(referenceElement).fontFamily;
  measureEl.textContent = text;
  document.body.appendChild(measureEl);
  const width = measureEl.offsetWidth;
  document.body.removeChild(measureEl);
  return width;
}

/**
 * Вычисляет автоматическую минимальную ширину колонки на основе заголовка
 */
export function calculateAutoMinWidth(
  headerText: string,
  hasResizer: boolean,
): number {
  // Создаём временный элемент для измерения
  const tempEl = document.createElement('span');
  tempEl.style.position = 'absolute';
  tempEl.style.visibility = 'hidden';
  tempEl.style.whiteSpace = 'nowrap';
  document.body.appendChild(tempEl);

  // Используем стандартные стили (можно улучшить, передавая referenceElement)
  const textWidth = measureTextWidth(headerText, tempEl);
  document.body.removeChild(tempEl);

  const resizerSpace = hasResizer ? RESIZER_SPACE : 0;
  return Math.ceil(textWidth + HEADER_PADDING + resizerSpace);
}

/**
 * Измеряет ширину заголовка колонки с учётом реальных стилей элемента
 */
export function measureHeaderWidth(
  headerText: string,
  contentElement: HTMLElement,
  hasResizer: boolean,
): number {
  const textWidth = measureTextWidth(headerText, contentElement);
  const resizerSpace = hasResizer ? RESIZER_SPACE : 0;
  return Math.ceil(textWidth + HEADER_PADDING + resizerSpace);
}

/**
 * Обновляет автоматические минимальные размеры колонок на основе их заголовков.
 * Для колонок из skipWidthUpdateForColumnIds не перезаписываем ширину (сохранённые).
 */
export function updateAutoMinSizes(
  table: GridforgeTableInstance,
  columns: TableColumn[],
  headerCells: NodeListOf<HTMLElement>,
  skipWidthUpdateForColumnIds?: Set<string>,
): { hasChanges: boolean; columnSizing: Record<string, number> } {
  if (!table || headerCells.length === 0) {
    return { hasChanges: false, columnSizing: {} };
  }

  const allColumns = table.getAllLeafColumns();
  const skipSet = skipWidthUpdateForColumnIds ?? new Set<string>();
  let hasChanges = false;
  const columnSizing = { ...table.getState().columnSizing };

  headerCells.forEach((cell, index) => {
    if (index >= allColumns.length) return;

    const column = allColumns[index];
    const columnId = column.id as string;
    if (columnId === ACTION_COLUMN_ID) return;

    const originalColumn = columns.find(
      (col) => String(col.columnKey || col.field) === columnId,
    );
    if (originalColumn && typeof originalColumn.minWidth === 'number') {
      return;
    }

    const content = cell.querySelector(
      '.gf-table__head-cell__content',
    ) as HTMLElement;
    if (!content) return;

    const headerText = (column.columnDef.header as string) || columnId;
    const autoMinWidth = measureHeaderWidth(
      headerText,
      content,
      column.getCanResize() || false,
    );

    const def = column.columnDef as ColumnDef<TableRow, unknown>;
    const currentMinSize = def.minSize || 0;
    if (autoMinWidth > currentMinSize) {
      def.minSize = autoMinWidth;
      hasChanges = true;
    }

    if (skipSet.has(columnId)) return;

    const currentSize = columnSizing[columnId] ?? column.getSize();
    if (currentSize < autoMinWidth) {
      columnSizing[columnId] = autoMinWidth;
      hasChanges = true;
    }
  });

  return { hasChanges, columnSizing };
}
