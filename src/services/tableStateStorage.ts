/**
 * Сервис сохранения состояния таблицы в localStorage.
 * Унифицированная работа с видимостью, шириной, порядком колонок,
 * пагинацией и сортировкой + миграция.
 */

import type { SortState } from '../types';

const STORAGE_PREFIX = 'gf-table:';

/** Данные одной колонки для хранения (только сериализуемое) */
export interface StoredColumnState {
  visible: boolean;
  width: number;
}

/** Пагинация в storage (pageSize и опционально currentPage) */
export interface StoredPagination {
  pageSize: number;
  currentPage?: number;
}

/** Состояние таблицы в localStorage. Вложенная структура для будущего расширения. */
export interface StoredTableState {
  columns: Record<string, StoredColumnState>;
  /** Порядок колонок (id[]). Опционально для обратной совместимости. */
  columnOrder?: string[];
  /** Пагинация: pageSize, при необходимости currentPage. */
  pagination?: StoredPagination;
  /** Сортировка. */
  sort?: SortState[];
}

/** Текущая колонка при слиянии: id + дефолтная ширина */
export interface CurrentColumnInput {
  id: string;
  defaultWidth: number;
}

/** Результат merge: готовые слайсы для TanStack */
export interface MergedTableState {
  columnVisibility: Record<string, boolean>;
  columnSizing: Record<string, number>;
  columnOrder?: string[];
  /** Id колонок, для которых использовали сохранённые данные (не перезаписывать auto-min). */
  storedColumnIds: string[];
}

function storageKey(tableKey: string): string {
  return `${STORAGE_PREFIX}${tableKey}`;
}

function parsePagination(v: unknown): StoredPagination | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const o = v as Record<string, unknown>;
  const pageSize = typeof o.pageSize === 'number' ? o.pageSize : undefined;
  if (pageSize == null) return undefined;
  const currentPage =
    typeof o.currentPage === 'number' ? o.currentPage : undefined;
  return { pageSize, currentPage };
}

function parseSort(v: unknown): SortState[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out: SortState[] = [];
  for (const item of v) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    const id = typeof o.id === 'string' ? o.id : '';
    const desc = typeof o.desc === 'boolean' ? o.desc : false;
    if (id) out.push({ id, desc });
  }
  return out.length ? out : undefined;
}

/**
 * Загружает состояние из localStorage. Возвращает null, если записи нет или JSON невалиден.
 */
export function loadTableState(tableKey: string): StoredTableState | null {
  if (!tableKey) return null;
  try {
    const raw = localStorage.getItem(storageKey(tableKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object') return null;
    const obj = parsed as Record<string, unknown>;
    if (!obj.columns || typeof obj.columns !== 'object') return null;
    const columns = obj.columns as Record<string, StoredColumnState>;
    const columnOrder = Array.isArray(obj.columnOrder)
      ? (obj.columnOrder as string[])
      : undefined;
    const pagination = parsePagination(obj.pagination);
    const sort = parseSort(obj.sort);
    return { columns, columnOrder, pagination, sort };
  } catch {
    return null;
  }
}

/**
 * Возвращает состояние таблицы из localStorage.
 * Публичный API: импортируйте снаружи для инициализации pageSize, sort и т.д.
 *
 * @example
 * import { getTableState } from 'gridforge-vue2';
 * const state = getTableState('my-table-key');
 * const pageSize = state?.pagination?.pageSize ?? 10;
 * const sortBy = state?.sort ?? [];
 * // Использовать в запросах к API и как пропсы для GridforgeTable.
 */
export function getTableState(tableKey: string): StoredTableState | null {
  return loadTableState(tableKey);
}

/**
 * Сохраняет состояние в localStorage.
 */
export function saveTableState(
  tableKey: string,
  state: StoredTableState,
): void {
  if (!tableKey) return;
  try {
    localStorage.setItem(storageKey(tableKey), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/**
 * Сливает текущий набор колонок с сохранённым состоянием (миграция):
 * - новая колонка → добавляем, visible: true, width: defaultWidth;
 * - удалённая колонка → убираем из stored;
 * - существующая → берём visible/width из stored.
 * Всегда сохраняет обновлённое состояние (в т.ч. при первом рендере).
 * Возвращает { columnVisibility, columnSizing } для применения в таблице.
 */
export function mergeAndPersist(
  tableKey: string,
  currentColumns: CurrentColumnInput[],
): MergedTableState {
  const stored = loadTableState(tableKey);
  const storedColumns = stored?.columns ?? {};
  const storedOrder = stored?.columnOrder ?? null;
  const currentIds = currentColumns.map((c) => c.id);
  const currentIdSet = new Set(currentIds);
  const nextColumns: Record<string, StoredColumnState> = {};
  const columnVisibility: Record<string, boolean> = {};
  const columnSizing: Record<string, number> = {};
  const storedColumnIds: string[] = [];

  for (const col of currentColumns) {
    const existing = storedColumns[col.id];
    const visible = existing?.visible ?? true;
    const width = existing?.width ?? col.defaultWidth;
    nextColumns[col.id] = { visible, width };
    columnVisibility[col.id] = visible;
    columnSizing[col.id] = width;
    if (existing) storedColumnIds.push(col.id);
  }

  let columnOrder: string[] | undefined;
  if (storedOrder && storedOrder.length > 0) {
    const kept = storedOrder.filter((id) => currentIdSet.has(id));
    const newIds = currentIds.filter((id) => !kept.includes(id));
    columnOrder = [...kept, ...newIds];
  }

  const next: StoredTableState = {
    columns: nextColumns,
    columnOrder,
    pagination: stored?.pagination,
    sort: stored?.sort,
  };
  saveTableState(tableKey, next);
  return {
    columnVisibility,
    columnSizing,
    columnOrder,
    storedColumnIds,
  };
}

/**
 * Строит состояние по умолчанию из columns (все видимы, ширины из defaultWidth),
 * сбрасывает pagination и sort, сохраняет в localStorage и возвращает слайсы для таблицы.
 * Для сброса пользовательских настроек.
 */
export function resetToDefaultsAndPersist(
  tableKey: string,
  currentColumns: CurrentColumnInput[],
  defaultPageSize: number,
): MergedTableState {
  const columnVisibility: Record<string, boolean> = {};
  const columnSizing: Record<string, number> = {};
  const nextColumns: Record<string, StoredColumnState> = {};
  const columnOrder = currentColumns.map((c) => c.id);

  for (const col of currentColumns) {
    nextColumns[col.id] = { visible: true, width: col.defaultWidth };
    columnVisibility[col.id] = true;
    columnSizing[col.id] = col.defaultWidth;
  }

  const next: StoredTableState = {
    columns: nextColumns,
    columnOrder,
    pagination: { pageSize: defaultPageSize, currentPage: 0 },
    sort: [],
  };
  saveTableState(tableKey, next);
  return {
    columnVisibility,
    columnSizing,
    columnOrder,
    storedColumnIds: [],
  };
}

/**
 * Сохраняет текущее состояние таблицы (видимость, ширина, порядок колонок).
 * Пагинация и сортировка не перезаписываются (read‑modify‑write).
 */
export function persistFromTable(
  tableKey: string,
  columnVisibility: Record<string, boolean>,
  columnSizing: Record<string, number>,
  allColumnIds: string[],
  columnOrder?: string[],
): void {
  if (!tableKey || allColumnIds.length === 0) return;
  const stored = loadTableState(tableKey);
  const columns: Record<string, StoredColumnState> = {};
  for (const id of allColumnIds) {
    columns[id] = {
      visible: columnVisibility[id] ?? true,
      width: columnSizing[id] ?? 0,
    };
  }
  const next: StoredTableState = {
    columns,
    columnOrder,
    pagination: stored?.pagination,
    sort: stored?.sort,
  };
  saveTableState(tableKey, next);
}

/**
 * Обновляет и сохраняет пагинацию в storage (read‑modify‑write).
 */
export function persistPagination(
  tableKey: string,
  pagination: StoredPagination,
): void {
  if (!tableKey) return;
  const stored = loadTableState(tableKey);
  const next: StoredTableState = {
    columns: stored?.columns ?? {},
    columnOrder: stored?.columnOrder,
    pagination,
    sort: stored?.sort,
  };
  saveTableState(tableKey, next);
}

/**
 * Обновляет и сохраняет сортировку в storage (read‑modify‑write).
 */
export function persistSort(tableKey: string, sort: SortState[]): void {
  if (!tableKey) return;
  const stored = loadTableState(tableKey);
  const next: StoredTableState = {
    columns: stored?.columns ?? {},
    columnOrder: stored?.columnOrder,
    pagination: stored?.pagination,
    sort: sort.length ? sort : undefined,
  };
  saveTableState(tableKey, next);
}
