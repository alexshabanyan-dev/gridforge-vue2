import type { TableColumn } from '../types';
import type { Header, Cell } from '@tanstack/table-core';
import type { TableRow } from '../types';
import type { GridforgeTableInstance } from '../tableCore';

/**
 * Получает стили для колонки (ширина)
 */
export function getColumnStyle(column: TableColumn): Record<string, string> {
  const styles: Record<string, string> = {};

  const width = column.width;
  if (width !== undefined && width !== null) {
    const widthValue = typeof width === 'number' ? `${width}px` : width;
    styles.width = widthValue;
    styles.minWidth = widthValue;
    styles.maxWidth = widthValue;
  }

  const minWidth = column.minWidth;
  if (minWidth !== undefined && minWidth !== null) {
    styles.minWidth = `${minWidth}px`;
  }

  const maxWidth = column.maxWidth;
  if (maxWidth !== undefined && maxWidth !== null) {
    styles.maxWidth = `${maxWidth}px`;
  }

  return styles;
}

/**
 * Вычисляет стили для заголовка колонки
 */
export function getHeaderStyle(
  header: Header<TableRow, unknown>,
  table: GridforgeTableInstance | null,
  layout: 'fit' | 'scroll',
  visibleColumnCount: number,
): Record<string, string> {
  if (!table || !header.column || typeof header.getSize !== 'function') {
    return {};
  }

  const size = header.getSize();
  if (!size) return {};

  // В scroll-режиме используем пиксели
  if (layout === 'scroll') {
    return {
      width: `${size}px`,
      minWidth: `${size}px`,
    };
  }

  // В fit-режиме используем проценты
  const total = typeof table.getTotalSize === 'function' ? table.getTotalSize() : 0;
  const percent =
    total > 0 && size > 0
      ? (size / total) * 100
      : visibleColumnCount > 0
        ? 100 / visibleColumnCount
        : 0;

  return {
    width: `${percent}%`,
    minWidth: '0',
    maxWidth: `${percent}%`,
  };
}

/**
 * Вычисляет стили для ячейки колонки
 */
export function getCellStyle(
  cell: Cell<TableRow, unknown>,
  table: GridforgeTableInstance | null,
  layout: 'fit' | 'scroll',
  visibleColumnCount: number,
): Record<string, string> {
  if (!table || !cell.column || typeof cell.column.getSize !== 'function') {
    return {};
  }

  const size = cell.column.getSize();
  if (!size) return {};

  // В scroll-режиме используем пиксели
  if (layout === 'scroll') {
    return {
      width: `${size}px`,
      minWidth: `${size}px`,
    };
  }

  // В fit-режиме используем проценты
  const total = typeof table.getTotalSize === 'function' ? table.getTotalSize() : 0;
  const percent =
    total > 0 && size > 0
      ? (size / total) * 100
      : visibleColumnCount > 0
        ? 100 / visibleColumnCount
        : 0;

  return {
    width: `${percent}%`,
    minWidth: '0',
    maxWidth: `${percent}%`,
  };
}
