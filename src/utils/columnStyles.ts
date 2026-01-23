import type { TableColumn } from '../types';
import type { Header, Cell } from '@tanstack/table-core';
import type { TableRow } from '../types';
import type { GridforgeTableInstance } from '../tableCore';

/**
 * Вычисляет позицию left для закрепленной колонки слева
 * Использует индекс колонки среди закрепленных слева для правильного вычисления позиции
 */
function calculateFrozenLeftPosition(
  columnId: string,
  table: GridforgeTableInstance | null,
  layout: 'fit' | 'scroll',
): number {
  if (!table || layout !== 'scroll') return 0;

  const allColumns = table.getAllLeafColumns();
  
  // Получаем все закрепленные слева колонки в порядке их следования в таблице
  const leftFrozenColumns: Array<{ id: string; size: number }> = [];
  allColumns.forEach((col) => {
    const meta = (col.columnDef.meta as any) || {};
    if (meta.alignFrozen === 'left') {
      leftFrozenColumns.push({
        id: col.id as string,
        size: col.getSize() || 0,
      });
    }
  });

  // Находим индекс текущей колонки среди закрепленных слева
  const currentIndex = leftFrozenColumns.findIndex((col) => col.id === columnId);
  if (currentIndex === -1) return 0;

  // Суммируем ширины всех закрепленных слева колонок, которые идут перед текущей
  let left = 0;
  for (let i = 0; i < currentIndex; i++) {
    left += leftFrozenColumns[i].size;
  }

  return left;
}

/**
 * Вычисляет позицию right для закрепленной колонки справа
 * Использует индекс колонки среди закрепленных справа для правильного вычисления позиции
 */
function calculateFrozenRightPosition(
  columnId: string,
  table: GridforgeTableInstance | null,
  layout: 'fit' | 'scroll',
): number {
  if (!table || layout !== 'scroll') return 0;

  const allColumns = table.getAllLeafColumns();
  
  // Получаем все закрепленные справа колонки в порядке их следования в таблице
  const rightFrozenColumns: Array<{ id: string; size: number }> = [];
  allColumns.forEach((col) => {
    const meta = (col.columnDef.meta as any) || {};
    if (meta.alignFrozen === 'right') {
      rightFrozenColumns.push({
        id: col.id as string,
        size: col.getSize() || 0,
      });
    }
  });

  // Находим индекс текущей колонки среди закрепленных справа
  const currentIndex = rightFrozenColumns.findIndex((col) => col.id === columnId);
  if (currentIndex === -1) return 0;

  // Суммируем ширины всех закрепленных справа колонок, которые идут после текущей
  let right = 0;
  for (let i = currentIndex + 1; i < rightFrozenColumns.length; i++) {
    right += rightFrozenColumns[i].size;
  }

  return right;
}

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

  const meta = (header.column.columnDef.meta as any) || {};
  const alignFrozen = meta.alignFrozen;

  const baseStyles: Record<string, string> = {};

  // В scroll-режиме используем пиксели
  if (layout === 'scroll') {
    baseStyles.width = `${size}px`;
    baseStyles.minWidth = `${size}px`;

    // Добавляем sticky позиционирование для закрепленных колонок
    if (alignFrozen === 'left' || alignFrozen === 'right') {
      baseStyles.position = 'sticky';
      baseStyles.zIndex = '11';
      baseStyles.backgroundColor = 'var(--gf-bg-header)';
      if (alignFrozen === 'left') {
        const leftPos = calculateFrozenLeftPosition(header.column.id, table, layout);
        baseStyles.left = `${leftPos}px`;
      } else {
        const rightPos = calculateFrozenRightPosition(header.column.id, table, layout);
        baseStyles.right = `${rightPos}px`;
      }
    }
  } else {
    // В fit-режиме используем проценты
    const total = typeof table.getTotalSize === 'function' ? table.getTotalSize() : 0;
    const percent =
      total > 0 && size > 0
        ? (size / total) * 100
        : visibleColumnCount > 0
          ? 100 / visibleColumnCount
          : 0;

    baseStyles.width = `${percent}%`;
    baseStyles.minWidth = '0';
    baseStyles.maxWidth = `${percent}%`;
  }

  return baseStyles;
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

  const meta = (cell.column.columnDef.meta as any) || {};
  const alignFrozen = meta.alignFrozen;

  const baseStyles: Record<string, string> = {};

  // В scroll-режиме используем пиксели
  if (layout === 'scroll') {
    baseStyles.width = `${size}px`;
    baseStyles.minWidth = `${size}px`;

    // Добавляем sticky позиционирование для закрепленных колонок
    if (alignFrozen === 'left' || alignFrozen === 'right') {
      baseStyles.position = 'sticky';
      baseStyles.zIndex = '1';
      baseStyles.backgroundColor = 'var(--gf-bg-base)';
      if (alignFrozen === 'left') {
        const leftPos = calculateFrozenLeftPosition(cell.column.id, table, layout);
        baseStyles.left = `${leftPos}px`;
      } else {
        const rightPos = calculateFrozenRightPosition(cell.column.id, table, layout);
        baseStyles.right = `${rightPos}px`;
      }
    }
  } else {
    // В fit-режиме используем проценты
    const total = typeof table.getTotalSize === 'function' ? table.getTotalSize() : 0;
    const percent =
      total > 0 && size > 0
        ? (size / total) * 100
        : visibleColumnCount > 0
          ? 100 / visibleColumnCount
          : 0;

    baseStyles.width = `${percent}%`;
    baseStyles.minWidth = '0';
    baseStyles.maxWidth = `${percent}%`;
  }

  return baseStyles;
}
