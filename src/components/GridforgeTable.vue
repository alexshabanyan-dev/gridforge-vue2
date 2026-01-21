<template>
  <div :class="['gf-table', customClass]">
    <ColumnMenu
      :table="table"
      :columns="leafColumns"
      @visibility-change="onColumnVisibilityChange"
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
        />
        <TableBody :table="table" :layout="layout" :visible-column-count="visibleColumnCount" />
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { TableColumn, TableRow } from '../types';
import type { Header } from '@tanstack/table-core';
import { createTanstackTable, GridforgeTableInstance } from '../tableCore';
import { measureHeaderWidth } from '../utils/columnMeasure';
import { createFitModeResizeHandler, getFullColumnSizing } from '../utils/columnResize';
import ColumnMenu from './ColumnMenu.vue';
import TableHeader from './TableHeader.vue';
import TableBody from './TableBody.vue';

export default Vue.extend({
  name: 'GridforgeTable',
  components: {
    ColumnMenu,
    TableHeader,
    TableBody,
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
    /**
     * Режим layout:
     * - "fit"   — таблица растягивается до 100% ширины родителя
     * - "scroll" — таблица может быть шире контейнера, появляется горизонтальный скролл
     */
    layout: {
      type: String as PropType<'fit' | 'scroll'>,
      default: 'fit',
    },
  },
  data() {
    return {
      table: null as GridforgeTableInstance | null,
      draggedColumnId: null as string | null,
      dragOverColumnId: null as string | null,
      previousColumnSizing: {} as Record<string, number>,
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
    leafColumns(): any[] {
      if (!this.table) return [];
      return this.table.getAllLeafColumns();
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
      this.table = createTanstackTable(this.data || [], this.columns || []);
      if (!this.table) return;

      // Сохраняем оригинальный setColumnSizing
      const originalSetColumnSizing = this.table.setColumnSizing.bind(this.table);

      // Создаём обработчик ресайза с логикой "только две колонки" для fit-режима
      const fitModeHandler = createFitModeResizeHandler(
        this.table,
        this.layout as 'fit' | 'scroll',
        () => this.previousColumnSizing,
        (sizing) => {
          this.previousColumnSizing = sizing;
        },
      );

      // Переопределяем setColumnSizing
      (this.table as any).setColumnSizing = (updater: any) => {
        fitModeHandler(updater, originalSetColumnSizing);
      };

      // Инициализируем previousColumnSizing текущими размерами колонок
      this.previousColumnSizing = getFullColumnSizing(this.table);
    },
    updateAutoMinSizes() {
      if (!this.table) return;

      const headerCells = this.$el.querySelectorAll(
        '.gf-table__head-cell',
      ) as NodeListOf<HTMLElement>;

      if (headerCells.length === 0) return;

      const allColumns = this.table.getAllLeafColumns();
      let hasChanges = false;
      const columnSizing = { ...this.table.getState().columnSizing };

      headerCells.forEach((cell, index) => {
        if (index >= allColumns.length) return;

        const column = allColumns[index];
        const columnId = column.id as string;

        // Пропускаем колонки, у которых уже задан minWidth в props
        const originalColumn = this.columns.find(
          (col) => String(col.columnKey || col.field) === columnId,
        );
        if (originalColumn && typeof originalColumn.minWidth === 'number') {
          return;
        }

        // Измеряем ширину содержимого заголовка
        const content = cell.querySelector('.gf-table__head-cell__content') as HTMLElement;
        if (!content) return;

        const headerText = (column.columnDef.header as string) || columnId;
        const autoMinWidth = measureHeaderWidth(
          headerText,
          content,
          column.getCanResize() || false,
        );

        // Обновляем minSize в columnDef напрямую (это влияет на getSize() и ограничения ресайза)
        const currentMinSize = (column.columnDef as any).minSize || 0;
        if (autoMinWidth > currentMinSize) {
          (column.columnDef as any).minSize = autoMinWidth;
          hasChanges = true;
        }

        // Если текущий размер колонки меньше автоматического минимума, увеличиваем его
        const currentSize = columnSizing[columnId] ?? column.getSize();
        if (currentSize < autoMinWidth) {
          columnSizing[columnId] = autoMinWidth;
          hasChanges = true;
        }
      });

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
    canReorder(header: Header<TableRow, unknown>): boolean {
      // Не пытаемся перетаскивать плейсхолдеры и групповые заголовки без колонки
      return Boolean(header.column && !header.isPlaceholder);
    },
    onResizeStart(header: Header<TableRow, unknown>, event: MouseEvent | TouchEvent) {
      if (!header.column.getCanResize || !header.column.getCanResize()) return;
      const handler = header.getResizeHandler?.();
      if (handler) {
        handler(event);
      }
    },
    onHeaderDragStart(header: Header<TableRow, unknown>, event: DragEvent) {
      if (!this.canReorder(header)) return;
      this.draggedColumnId = header.column.id as string;
      this.dragOverColumnId = null;
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', String(this.draggedColumnId));
      }
    },
    onHeaderDragOver(header: Header<TableRow, unknown>, event: DragEvent) {
      // Просто разрешаем drop — логика перестановки в onHeaderDrop
      if (!this.canReorder(header)) return;
      const newDragOverId = header.column.id as string;
      if (this.dragOverColumnId !== newDragOverId) {
        this.dragOverColumnId = newDragOverId;
        // Форсируем обновление для визуальных индикаторов
        this.$forceUpdate();
      }
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    },
    onHeaderDrop(header: Header<TableRow, unknown>, event: DragEvent) {
      if (!this.table || !this.draggedColumnId || !this.canReorder(header)) return;
      const targetId = header.column.id as string;
      const sourceId = this.draggedColumnId;
      if (sourceId === targetId) {
        this.draggedColumnId = null;
        this.dragOverColumnId = null;
        return;
      }

      const currentOrder =
        this.table.getState().columnOrder && this.table.getState().columnOrder.length
          ? [...this.table.getState().columnOrder]
          : this.table.getAllLeafColumns().map((col) => col.id as string);

      const fromIndex = currentOrder.indexOf(sourceId);
      const toIndex = currentOrder.indexOf(targetId);
      if (fromIndex === -1 || toIndex === -1) {
        this.draggedColumnId = null;
        return;
      }

      currentOrder.splice(fromIndex, 1);
      currentOrder.splice(toIndex, 0, sourceId);

      this.table.setColumnOrder(currentOrder);
      this.draggedColumnId = null;
      // Форсируем перерисовку, чтобы заголовки/ячейки перешли в новый порядок
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    onHeaderDragEnd() {
      // На случай, если drag завершился вне заголовков
      this.dragOverColumnId = null;
      this.draggedColumnId = null;
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
  },
});
</script>
