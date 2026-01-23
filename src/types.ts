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
  /** Можно ли сортировать колонку (по умолчанию false, нужно явно указать true) */
  sortable?: boolean;
}

/**
 * Направление сортировки
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Состояние сортировки для одной колонки
 */
export interface SortState {
  /** ID колонки (columnKey или field) */
  id: string;
  /** Направление сортировки: false = ASC, true = DESC */
  desc: boolean;
}

/**
 * Параметры пагинации с известным общим количеством элементов
 */
export interface PaginationWithTotal {
  /** Общее количество элементов */
  totalElements: number;
  /** Текущая страница (начиная с 0) */
  currentPage: number;
  /** Размер страницы */
  pageSize: number;
}

/**
 * Параметры пагинации без известного общего количества
 */
export interface PaginationWithFlags {
  /** Первая ли это страница */
  isFirst: boolean;
  /** Последняя ли это страница */
  isLast: boolean;
  /** Размер страницы */
  pageSize: number;
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
  /** Размер страницы (по умолчанию 10) */
  pageSize?: number;
  /** Доступные размеры страницы (по умолчанию [10, 20, 50, 100, 200]) */
  pageSizeOptions?: number[];
  /** Пагинация с известным общим количеством элементов */
  pagination?: PaginationWithTotal;
  /** Пагинация без известного общего количества (используется isFirst/isLast) */
  paginationFlags?: PaginationWithFlags;
  /** Текущее состояние сортировки (controlled) */
  sortBy?: SortState[];
}
