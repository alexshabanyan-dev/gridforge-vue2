import type { TableColumn, TableRow } from '../types';

/**
 * Получает уникальный ключ колонки
 */
export function getColumnKey(column: TableColumn): string {
  if (!column) {
    return '';
  }
  return column.columnKey || String(column.field || '');
}

/**
 * Получает значение ячейки из строки данных
 */
export function getCellValue(row: TableRow, column: TableColumn): string {
  if (
    !row ||
    !column ||
    typeof row !== 'object' ||
    typeof column !== 'object'
  ) {
    return '';
  }
  const field = column.field as string;
  if (!field || typeof field !== 'string') {
    return '';
  }
  if (!(field in row)) {
    return '';
  }
  const value = row[field];
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}
