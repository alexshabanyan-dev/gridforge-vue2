<template>
  <div
    :class="[
      'gf-table',
      customClass,
      { 'gf-table--reset-flash': resetFlashActive },
    ]"
  >
    <TableBar
      :table="table"
      :columns="leafColumnsForMenu"
      :persist-state="persistState"
      @visibility-change="onColumnVisibilityChange"
      @reset-settings="onResetSettings"
    />
    <div class="gf-table__wrapper">
      <table :class="tableClass">
        <TableHeader
          :table="table"
          :layout="layout"
          :visible-column-count="visibleColumnCount"
          :dragged-column-id="draggedColumnId"
          :drag-over-column-id="dragOverColumnId"
          @resize-start="onResizeStart"
          @drag-start="onHeaderDragStart"
          @drag-over="onHeaderDragOver"
          @drop="onHeaderDrop"
          @drag-end="onHeaderDragEnd"
          @drag-leave="onHeaderDragLeave"
          @context-menu="onHeaderContextMenu"
          :sort-by="effectiveSortBy"
          @sort-toggle="onSortToggle"
        />
        <TableBody
          :table="table"
          :layout="layout"
          :visible-column-count="visibleColumnCount"
          :action-column-params="actionColumnParams"
          :loading="loading"
          @action="onAction"
        />
      </table>
      <div
        v-if="loading"
        class="gf-table__loading-overlay"
      >
        <Icon
          name="loader"
          :size="48"
          color="var(--gf-color-primary)"
          class="gf-table__loading-spinner"
        />
      </div>
    </div>
    <TableFooter
      v-if="showPagination"
      :page-size="currentPageSize"
      :page-size-options="pageSizeOptions"
      :pagination="pagination"
      :pagination-flags="paginationFlags"
      @page-size-change="onPageSizeChange"
      @page-change="onPageChange"
    />
    <ColumnContextMenu
      :visible="contextMenuVisible"
      :header="contextMenuHeader"
      :position="contextMenuPosition"
      @freeze="onColumnFreeze"
      @hide="onContextMenuHide"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { Column } from '@tanstack/table-core';
import type { Header } from '@tanstack/table-core';
import type { TableColumn, TableRow } from '../types';
import type { GridforgeTableInstance } from '../tableCore';
import { buildTable, initializeColumnSizing } from '../utils/tableBuilder';
import { updateAutoMinSizes } from '../utils/columnMeasure';
import {
  handleDragStart,
  handleDragOver,
  handleDrop,
} from '../utils/columnReorder';
import { getFullColumnSizing } from '../utils/columnResize';
import {
  mergeAndPersist,
  persistFromTable,
  persistPagination,
  persistSort,
  resetToDefaultsAndPersist,
} from '../services/tableStateStorage';
import { getDefaultWidth } from '../tableCore';
import TableBar from './TableBar.vue';
import TableHeader from './TableHeader.vue';
import TableBody from './TableBody.vue';
import TableFooter from './TableFooter.vue';
import ColumnContextMenu from './ColumnContextMenu.vue';
import Icon from './icons/Icon.vue';
import type {
  PaginationWithTotal,
  PaginationWithFlags,
  SortState,
  ActionColumnItem,
} from '../types';
import {
  ACTION_COLUMN_ID,
  ACTION_COLUMN_WIDTH,
} from '../constants/tableConstants';

export default Vue.extend({
  name: 'GridforgeTable',
  components: {
    TableBar,
    TableHeader,
    TableBody,
    TableFooter,
    ColumnContextMenu,
    Icon,
  },
  props: {
    data: {
      type: Array as PropType<TableRow[]>,
      required: true,
      default: () => [],
    },
    columns: {
      type: Array as PropType<TableColumn[]>,
      required: true,
      default: () => [],
    },
    tableKey: {
      type: String,
      required: true,
    },
    /** Включить сохранение состояния (видимость, ширина колонок) в localStorage. По умолчанию true. */
    persistState: {
      type: Boolean,
      default: true,
    },
    customClass: {
      type: String,
      default: undefined,
    },
    layout: {
      type: String as PropType<'fit' | 'scroll'>,
      default: 'fit',
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    pageSizeOptions: {
      type: Array as PropType<number[]>,
      default: () => [10, 20, 50, 100, 200],
    },
    pagination: {
      type: Object as PropType<PaginationWithTotal | undefined>,
      default: undefined,
    },
    paginationFlags: {
      type: Object as PropType<PaginationWithFlags | undefined>,
      default: undefined,
    },
    sortBy: {
      type: Array as PropType<SortState[]>,
      default: undefined,
    },
    actionColumnParams: {
      type: Array as PropType<ActionColumnItem[]>,
      default: undefined,
    },
    actionColumnWidth: {
      type: Number,
      default: undefined,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      table: null as GridforgeTableInstance | null,
      draggedColumnId: null as string | null,
      dragOverColumnId: null as string | null,
      previousColumnSizing: {} as Record<string, number>,
      contextMenuVisible: false,
      contextMenuHeader: null as Header<TableRow, unknown> | null,
      contextMenuPosition: null as { x: number; y: number } | null,
      storedColumnIds: [] as string[],
      persistDebounceTimer: null as ReturnType<typeof setTimeout> | null,
      resetFlashActive: false,
    };
  },
  computed: {
    tableClass(): string[] {
      const classes = ['gf-table__table'];
      if (this.layout === 'scroll') {
        classes.push('gf-table__table--scroll');
      }
      return classes;
    },
    visibleColumnCount(): number {
      if (!this.table) return 0;
      return this.table.getVisibleLeafColumns().length;
    },
    leafColumns(): Column<TableRow, unknown>[] {
      if (!this.table) return [];
      return this.table.getAllLeafColumns();
    },
    leafColumnsForMenu(): Column<TableRow, unknown>[] {
      return this.leafColumns.filter(
        (col) => (col.id as string) !== ACTION_COLUMN_ID,
      );
    },
    // Переупорядочиваем колонки: закрепленные слева -> обычные -> закрепленные справа
    showPagination(): boolean {
      return Boolean(this.pagination || this.paginationFlags);
    },
    currentPageSize(): number {
      return this.pageSize;
    },
    effectiveSortBy(): SortState[] {
      return this.sortBy ?? [];
    },
    orderedColumns(): TableColumn[] {
      const leftFrozen: TableColumn[] = [];
      const normal: TableColumn[] = [];
      const rightFrozen: TableColumn[] = [];

      // Сохраняем исходный порядок для правильной сортировки внутри групп
      const originalOrder = new Map<string, number>();
      this.columns.forEach((col, index) => {
        const colId = String(col.columnKey || col.field);
        originalOrder.set(colId, index);
      });

      this.columns.forEach((col) => {
        if (col.alignFrozen === 'left') {
          leftFrozen.push(col);
        } else if (col.alignFrozen === 'right') {
          rightFrozen.push(col);
        } else {
          normal.push(col);
        }
      });

      // Сохраняем порядок внутри каждой группы на основе исходного порядка
      const leftFrozenOrdered = leftFrozen.sort((a, b) => {
        const aId = String(a.columnKey || a.field);
        const bId = String(b.columnKey || b.field);
        const aIndex = originalOrder.get(aId) ?? 0;
        const bIndex = originalOrder.get(bId) ?? 0;
        return aIndex - bIndex;
      });

      const rightFrozenOrdered = rightFrozen.sort((a, b) => {
        const aId = String(a.columnKey || a.field);
        const bId = String(b.columnKey || b.field);
        const aIndex = originalOrder.get(aId) ?? 0;
        const bIndex = originalOrder.get(bId) ?? 0;
        return aIndex - bIndex;
      });

      return [...leftFrozenOrdered, ...normal, ...rightFrozenOrdered];
    },
  },
  watch: {
    data: {
      handler() {
        this.buildTable();
      },
      deep: true,
    },
    columns: {
      handler() {
        this.buildTable();
        this.$nextTick(() => {
          this.updateAutoMinSizes();
          this.$forceUpdate();
        });
      },
      deep: true,
    },
    actionColumnParams: {
      handler() {
        this.buildTable();
        this.$nextTick(() => {
          this.updateAutoMinSizes();
          this.$forceUpdate();
        });
      },
      deep: true,
    },
    layout() {
      this.buildTable();
      this.$nextTick(() => {
        this.updateAutoMinSizes();
        this.$forceUpdate();
      });
    },
    actionColumnWidth() {
      this.buildTable();
      this.$nextTick(() => {
        this.updateAutoMinSizes();
        this.$forceUpdate();
      });
    },
  },
  created() {
    this.buildTable();
  },
  mounted() {
    // Слушаем события окончания ресайза, чтобы обновить классы
    document.addEventListener('mouseup', this.handleResizeEnd);
    document.addEventListener('touchend', this.handleResizeEnd);
    // Измеряем заголовки для автоматического определения minWidth
    this.$nextTick(() => {
      this.updateAutoMinSizes();
    });
  },
  beforeDestroy() {
    document.removeEventListener('mouseup', this.handleResizeEnd);
    document.removeEventListener('touchend', this.handleResizeEnd);
    if (this.persistDebounceTimer) {
      clearTimeout(this.persistDebounceTimer);
      this.persistDebounceTimer = null;
    }
  },
  methods: {
    buildTable() {
      if (ACTION_COLUMN_ID in this.previousColumnSizing) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [ACTION_COLUMN_ID]: _, ...rest } = this.previousColumnSizing;
        this.previousColumnSizing = rest;
      }

      const ordered = this.orderedColumns || [];
      const currentColumns: { id: string; defaultWidth: number }[] =
        ordered.map((col) => ({
          id: String(col.columnKey || col.field),
          defaultWidth: getDefaultWidth(col),
        }));
      if (this.actionColumnParams && this.actionColumnParams.length > 0) {
        const actionW = this.actionColumnWidth ?? ACTION_COLUMN_WIDTH;
        currentColumns.push({
          id: ACTION_COLUMN_ID,
          defaultWidth: actionW,
        });
      }

      let initialState:
        | {
            columnVisibility: Record<string, boolean>;
            columnSizing: Record<string, number>;
            columnOrder?: string[];
          }
        | undefined;
      if (this.persistState) {
        const merged = mergeAndPersist(this.tableKey, currentColumns);
        this.storedColumnIds = merged.storedColumnIds;
        initialState = {
          columnVisibility: merged.columnVisibility,
          columnSizing: merged.columnSizing,
          columnOrder: merged.columnOrder,
        };
      } else {
        this.storedColumnIds = [];
      }

      this.table = buildTable(
        this.data || [],
        ordered,
        this.layout as 'fit' | 'scroll',
        () => this.previousColumnSizing,
        (sizing) => {
          this.previousColumnSizing = sizing;
          if (this.persistState) this.persistTableStateDebounced();
        },
        this.actionColumnParams,
        this.actionColumnWidth ?? ACTION_COLUMN_WIDTH,
        initialState,
      );

      if (this.table) {
        if (this.actionColumnParams && this.actionColumnParams.length > 0) {
          const actionWidth = this.actionColumnWidth ?? ACTION_COLUMN_WIDTH;
          const currentSizing = this.table.getState().columnSizing;
          this.table.setColumnSizing({
            ...currentSizing,
            [ACTION_COLUMN_ID]: actionWidth,
          });
        }
        this.previousColumnSizing = initializeColumnSizing(this.table);
      }
    },
    persistTableState() {
      if (!this.persistState || !this.table) return;
      if (this.persistDebounceTimer) {
        clearTimeout(this.persistDebounceTimer);
        this.persistDebounceTimer = null;
      }
      const ids = this.table.getAllLeafColumns().map((c) => c.id as string);
      const visibility = this.table.getState().columnVisibility ?? {};
      const sizing = getFullColumnSizing(this.table);
      const order = this.table.getState().columnOrder;
      const columnOrder =
        Array.isArray(order) && order.length > 0 ? order : undefined;
      persistFromTable(this.tableKey, visibility, sizing, ids, columnOrder);
    },
    persistTableStateDebounced() {
      if (!this.persistState || !this.table) return;
      if (this.persistDebounceTimer) {
        clearTimeout(this.persistDebounceTimer);
      }
      this.persistDebounceTimer = setTimeout(() => {
        this.persistDebounceTimer = null;
        this.persistTableState();
      }, 400);
    },
    updateAutoMinSizes() {
      if (!this.table) return;

      const headerCells = this.$el.querySelectorAll(
        '.gf-table__head-cell',
      ) as NodeListOf<HTMLElement>;

      const skipSet = new Set(this.storedColumnIds);
      const { hasChanges, columnSizing } = updateAutoMinSizes(
        this.table,
        this.orderedColumns,
        headerCells,
        skipSet,
      );

      // Применяем обновлённые размеры, если что-то изменилось
      if (hasChanges && Object.keys(columnSizing).length > 0) {
        this.table.setColumnSizing(columnSizing);
        // Обновляем previousColumnSizing для корректной работы логики "только две колонки"
        this.previousColumnSizing = { ...columnSizing };
      }
    },
    onColumnVisibilityChange() {
      if (!this.table) return;
      this.$nextTick(() => {
        if (this.persistState) this.persistTableState();
        this.$forceUpdate();
      });
    },
    onResetSettings() {
      if (!this.table) return;
      const ordered = this.orderedColumns || [];
      const currentColumns: { id: string; defaultWidth: number }[] =
        ordered.map((col) => ({
          id: String(col.columnKey || col.field),
          defaultWidth: getDefaultWidth(col),
        }));
      if (this.actionColumnParams && this.actionColumnParams.length > 0) {
        const actionW = this.actionColumnWidth ?? ACTION_COLUMN_WIDTH;
        currentColumns.push({
          id: ACTION_COLUMN_ID,
          defaultWidth: actionW,
        });
      }
      const defaultOrder = currentColumns.map((c) => c.id);
      if (!this.persistState) {
        const visibility: Record<string, boolean> = {};
        const sizing: Record<string, number> = {};
        currentColumns.forEach((c) => {
          visibility[c.id] = true;
          sizing[c.id] = c.defaultWidth;
        });
        this.table.setColumnVisibility(visibility);
        this.table.setColumnSizing(sizing);
        this.table.setColumnOrder(defaultOrder);
        this.previousColumnSizing = { ...sizing };
        this.storedColumnIds = [];
      } else {
        const defaultPageSize = this.currentPageSize ?? this.pageSize ?? 10;
        const merged = resetToDefaultsAndPersist(
          this.tableKey,
          currentColumns,
          defaultPageSize,
        );
        this.table.setColumnVisibility(merged.columnVisibility);
        this.table.setColumnSizing(merged.columnSizing);
        this.table.setColumnOrder(merged.columnOrder ?? defaultOrder);
        this.previousColumnSizing = { ...merged.columnSizing };
        this.storedColumnIds = [];
      }
      this.resetFlashActive = true;
      this.$nextTick(() => {
        this.$forceUpdate();
      });
      this.$emit('reset');
      setTimeout(() => {
        this.resetFlashActive = false;
      }, 300);
    },
    onResizeStart(
      header: Header<TableRow, unknown>,
      event: MouseEvent | TouchEvent,
    ) {
      if (!header.column.getCanResize || !header.column.getCanResize()) return;
      const handler = header.getResizeHandler?.();
      if (handler) {
        handler(event);
      }
    },
    onHeaderDragStart(header: Header<TableRow, unknown>, event: DragEvent) {
      const columnId = handleDragStart(header, event);
      if (columnId) {
        this.draggedColumnId = columnId;
        this.dragOverColumnId = null;
      }
    },
    onHeaderDragOver(header: Header<TableRow, unknown>, event: DragEvent) {
      const newDragOverId = handleDragOver(header, event, this.draggedColumnId);
      if (newDragOverId && this.dragOverColumnId !== newDragOverId) {
        this.dragOverColumnId = newDragOverId;
        // Форсируем обновление для визуальных индикаторов
        this.$forceUpdate();
      }
    },
    onHeaderDrop(header: Header<TableRow, unknown>) {
      if (!this.table || !this.draggedColumnId) return;

      const success = handleDrop(this.table, header, this.draggedColumnId);
      if (success) {
        if (this.persistState) this.persistTableState();
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      }

      this.draggedColumnId = null;
      this.dragOverColumnId = null;
    },
    onHeaderDragEnd() {
      // На случай, если drag завершился вне заголовков
      this.dragOverColumnId = null;
      this.draggedColumnId = null;
    },
    onHeaderDragLeave() {
      // Если мы уводим курсор из области заголовков в пустое пространство,
      // убираем визуальный индикатор drop-target
      if (!this.draggedColumnId) return;
      if (this.dragOverColumnId) {
        this.dragOverColumnId = null;
        this.$forceUpdate();
      }
    },
    handleResizeEnd() {
      if (this.table) {
        this.previousColumnSizing = { ...this.table.getState().columnSizing };
        if (this.persistState) this.persistTableState();
      }
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    onHeaderContextMenu(header: Header<TableRow, unknown>, event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.contextMenuHeader = header;
      this.contextMenuPosition = { x: event.clientX, y: event.clientY };
      this.contextMenuVisible = true;
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    onContextMenuHide() {
      this.contextMenuVisible = false;
      this.contextMenuHeader = null;
      this.contextMenuPosition = null;
    },
    onAction(payload: { emitEvent: string; row: TableRow; code: string }) {
      this.$emit(payload.emitEvent, {
        row: payload.row,
        code: payload.code,
      });
    },
    onColumnFreeze(alignFrozen: 'left' | 'right' | null) {
      if (!this.contextMenuHeader?.column) return;

      const columnId = this.contextMenuHeader.column.id as string;

      // Сначала обновляем свойство alignFrozen у нужной колонки
      const updatedColumns = this.columns.map((col) => {
        const colId = String(col.columnKey || col.field);
        if (colId === columnId) {
          // Обновляем только выбранную колонку
          const updated: TableColumn = {
            ...col,
          };
          if (alignFrozen) {
            updated.alignFrozen = alignFrozen;
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { alignFrozen: _, ...rest } = updated;
            return rest;
          }
          return updated;
        }
        // Возвращаем колонку как есть, без изменений
        return col;
      });

      // Переупорядочиваем колонки: закрепленные слева -> обычные -> закрепленные справа
      // Сохраняем исходный порядок для правильной сортировки внутри групп
      const originalOrder = new Map<string, number>();
      updatedColumns.forEach((col, index) => {
        const colId = String(col.columnKey || col.field);
        originalOrder.set(colId, index);
      });

      const leftFrozen: TableColumn[] = [];
      const normal: TableColumn[] = [];
      const rightFrozen: TableColumn[] = [];

      updatedColumns.forEach((col) => {
        if (col.alignFrozen === 'left') {
          leftFrozen.push(col);
        } else if (col.alignFrozen === 'right') {
          rightFrozen.push(col);
        } else {
          normal.push(col);
        }
      });

      // Сохраняем порядок внутри каждой группы на основе исходного порядка
      const leftFrozenOrdered = leftFrozen.sort((a, b) => {
        const aId = String(a.columnKey || a.field);
        const bId = String(b.columnKey || b.field);
        const aIndex = originalOrder.get(aId) ?? 0;
        const bIndex = originalOrder.get(bId) ?? 0;
        return aIndex - bIndex;
      });

      const rightFrozenOrdered = rightFrozen.sort((a, b) => {
        const aId = String(a.columnKey || a.field);
        const bId = String(b.columnKey || b.field);
        const aIndex = originalOrder.get(aId) ?? 0;
        const bIndex = originalOrder.get(bId) ?? 0;
        return aIndex - bIndex;
      });

      const reorderedColumns = [
        ...leftFrozenOrdered,
        ...normal,
        ...rightFrozenOrdered,
      ];

      // Закрываем меню
      this.onContextMenuHide();

      // Эмитим событие для обновления columns в родительском компоненте
      this.$emit('columns-change', reorderedColumns);
    },
    onPageSizeChange(newSize: number) {
      if (this.persistState) {
        persistPagination(this.tableKey, {
          pageSize: newSize,
          currentPage: 0,
        });
      }
      this.$emit('page-size-change', newSize);
    },
    onPageChange(page: number | 'previous' | 'next') {
      if (this.persistState && this.pagination) {
        const cur = this.pagination.currentPage ?? 0;
        const next =
          typeof page === 'number'
            ? page
            : page === 'previous'
              ? cur - 1
              : cur + 1;
        persistPagination(this.tableKey, {
          pageSize: this.pagination.pageSize,
          currentPage: Math.max(0, next),
        });
      }
      this.$emit('page-change', page);
    },
    onSortToggle(columnId: string) {
      const currentSort = this.effectiveSortBy;
      const existingIndex = currentSort.findIndex(
        (sort) => sort.id === columnId,
      );

      let nextSort: SortState[];

      if (existingIndex === -1) {
        // Колонка не в сортировке - добавляем ASC
        nextSort = [...currentSort, { id: columnId, desc: false }];
      } else {
        const existing = currentSort[existingIndex];
        if (existing.desc) {
          // DESC -> None (удаляем из массива)
          nextSort = currentSort.filter((_, index) => index !== existingIndex);
        } else {
          // ASC -> DESC
          nextSort = currentSort.map((sort, index) =>
            index === existingIndex ? { id: columnId, desc: true } : sort,
          );
        }
      }

      if (this.persistState) persistSort(this.tableKey, nextSort);
      this.$emit('sort-change', nextSort);
    },
  },
});
</script>
