import type { TableColumn } from '../types';

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
