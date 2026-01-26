/**
 * Базовый тип для строки таблицы
 */
export type TableRow = Record<string, unknown>;

/**
 * Параметры пункта колонки действий (кнопка в контекстном меню)
 */
export interface ActionColumnItem {
  /** Текст кнопки */
  title: string;
  /** Код действия (передаётся в payload при emit) */
  code: string;
  /** Имя события при нажатии (emit сверху) */
  emitEvent: string;
  /** Видимость кнопки. (row) => boolean. Если не задано — всегда видна. */
  visible?: (row: TableRow) => boolean;
}

/**
 * Метаданные колонки в TanStack Table
 */
export interface ColumnMeta {
  alignFrozen?: 'left' | 'right';
  sortable?: boolean;
  isActionColumn?: boolean;
  actionColumnParams?: ActionColumnItem[];
}

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
  /** Уникальный ключ таблицы (обязателен для сохранения состояния в localStorage) */
  tableKey: string;
  /** Включить сохранение состояния колонок в localStorage. По умолчанию true. */
  persistState?: boolean;
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
  /** Колонка действий слева (fit) / справа sticky (scroll). Иконка ⋮, меню по клику. */
  actionColumnParams?: ActionColumnItem[];
  /** Ширина колонки действий в px (по умолчанию ACTION_COLUMN_WIDTH). */
  actionColumnWidth?: number;
}
