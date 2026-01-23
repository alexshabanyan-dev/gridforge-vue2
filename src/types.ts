/**
 * Базовый тип для строки таблицы
 */
export type TableRow = Record<string, unknown>;

/**
 * Определение колонки таблицы
 */
export interface TableColumn<T = TableRow> {
  /** Заголовок колонки */
  header: string;
  /** Поле данных для отображения */
  field: keyof T | string;
  /** Уникальный ключ колонки (используется для идентификации) */
  columnKey?: string;
  /** Ширина колонки в пикселях */
  width?: number | string;
  /** Минимальная ширина колонки */
  minWidth?: number;
  /** Максимальная ширина колонки */
  maxWidth?: number;
  /** Можно ли изменять размер колонки */
  resizable?: boolean;
  /** Можно ли переставлять колонку */
  reorderableColumn?: boolean;
  /** Можно ли скрывать колонку */
  canNotManipulate?: boolean;
  /** Выравнивание закрепленной колонки (left/right) */
  alignFrozen?: 'left' | 'right';
}

/**
 * Props для компонента GridforgeTable
 */
export interface GridforgeTableProps<T = TableRow> {
  /** Данные для отображения в таблице */
  data: T[];
  /** Определения колонок */
  columns: TableColumn<T>[];
  /** Уникальный ключ таблицы (для сохранения состояния) */
  tableKey?: string;
  /** Класс для корневого элемента */
  customClass?: string;
}
