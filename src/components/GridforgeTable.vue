<template>
  <div :class="['gf-table', customClass]">
    <TableBar :table="table" :columns="leafColumns" @visibility-change="onColumnVisibilityChange" />
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
        />
        <TableBody :table="table" :layout="layout" :visible-column-count="visibleColumnCount" />
      </table>
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
import type { TableColumn, TableRow } from '../types';
import type { Header } from '@tanstack/table-core';
import type { GridforgeTableInstance } from '../tableCore';
import { buildTable, initializeColumnSizing } from '../utils/tableBuilder';
import { updateAutoMinSizes } from '../utils/columnMeasure';
import { handleDragStart, handleDragOver, handleDrop } from '../utils/columnReorder';
import TableBar from './TableBar.vue';
import TableHeader from './TableHeader.vue';
import TableBody from './TableBody.vue';
import TableFooter from './TableFooter.vue';
import ColumnContextMenu from './ColumnContextMenu.vue';
import type { PaginationWithTotal, PaginationWithFlags } from '../types';

export default Vue.extend({
  name: 'GridforgeTable',
  components: {
    TableBar,
    TableHeader,
    TableBody,
    TableFooter,
    ColumnContextMenu,
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
      default: undefined,
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
    leafColumns() {
      if (!this.table) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.table.getAllLeafColumns() as any[];
    },
    // Переупорядочиваем колонки: закрепленные слева -> обычные -> закрепленные справа
    showPagination(): boolean {
      return Boolean(this.pagination || this.paginationFlags);
    },
    currentPageSize(): number {
      return this.pageSize;
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
        // Пересчитываем автоматические minSize после изменения колонок
        this.$nextTick(() => {
          this.updateAutoMinSizes();
          this.$forceUpdate();
        });
      },
      deep: true,
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
  },
  methods: {
    buildTable() {
      // Используем переупорядоченные колонки для построения таблицы
      this.table = buildTable(
        this.data || [],
        this.orderedColumns || [],
        this.layout as 'fit' | 'scroll',
        () => this.previousColumnSizing,
        (sizing) => {
          this.previousColumnSizing = sizing;
        },
      );

      if (this.table) {
        // Инициализируем previousColumnSizing текущими размерами колонок
        this.previousColumnSizing = initializeColumnSizing(this.table);
      }
    },
    updateAutoMinSizes() {
      if (!this.table) return;

      const headerCells = this.$el.querySelectorAll(
        '.gf-table__head-cell',
      ) as NodeListOf<HTMLElement>;

      const { hasChanges, columnSizing } = updateAutoMinSizes(
        this.table,
        this.orderedColumns,
        headerCells,
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
      // TanStack сам обновляет state.columnVisibility через features,
      // но мы форсируем перерисовку Vue для надёжности
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    onResizeStart(header: Header<TableRow, unknown>, event: MouseEvent | TouchEvent) {
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
        // Форсируем перерисовку, чтобы заголовки/ячейки перешли в новый порядок
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
      // Синхронизируем previousColumnSizing с текущим состоянием после окончания ресайза
      if (this.table) {
        this.previousColumnSizing = { ...this.table.getState().columnSizing };
      }
      // Форсируем обновление компонента после окончания ресайза,
      // чтобы убрать класс --resizing
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
            // Удаляем alignFrozen, создавая новый объект без этого свойства
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

      const reorderedColumns = [...leftFrozenOrdered, ...normal, ...rightFrozenOrdered];

      // Закрываем меню
      this.onContextMenuHide();

      // Эмитим событие для обновления columns в родительском компоненте
      this.$emit('columns-change', reorderedColumns);
    },
    onPageSizeChange(newSize: number) {
      // Эмитим событие, но не меняем локально - ждем обновления пропса
      this.$emit('page-size-change', newSize);
    },
    onPageChange(page: number | 'previous' | 'next') {
      // Эмитим событие для изменения страницы
      this.$emit('page-change', page);
    },
  },
});
</script>
