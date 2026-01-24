<template>
  <th
    v-if="header"
    class="gf-table__head-cell"
    :class="{
      'gf-table__head-cell--draggable': canReorder,
      'gf-table__head-cell--dragging': isDragging,
      'gf-table__head-cell--drop-target': isDropTarget,
      'gf-table__head-cell--frozen-left': isFrozenLeft,
      'gf-table__head-cell--frozen-right': isFrozenRight,
      'gf-table__head-cell--frozen-left-border': isLastFrozenLeft,
      'gf-table__head-cell--frozen-right-border': isFirstFrozenRight,
    }"
    :style="headerStyle"
    :draggable="canReorder"
    @dragstart="onDragStart"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    @dragend="onDragEnd"
    @contextmenu.prevent="onContextMenu"
  >
    <div class="gf-table__head-cell__content">
      <Icon
        v-if="canReorder"
        name="dragVertical"
        :size="14"
        class="gf-table__head-cell__drag-icon"
      />
      <span
        v-if="!header.isPlaceholder"
        class="gf-table__head-cell__title"
      >
        {{ header.column.columnDef.header }}
      </span>
      <button
        v-if="!header.isPlaceholder && isSortable"
        class="gf-table__head-cell__sort-button"
        :class="{
          'gf-table__head-cell__sort-button--active': currentSortState,
        }"
        @click.stop="onSortClick"
        type="button"
      >
        <Icon
          :name="sortIconName"
          :size="14"
          class="gf-table__head-cell__sort-icon"
          :class="sortIconClass"
        />
      </button>
    </div>
    <div
      v-if="header.column.getCanResize && header.column.getCanResize()"
      class="gf-table__head-cell__resizer"
      :class="{ 'gf-table__head-cell__resizer--resizing': isResizing }"
      @mousedown.prevent="onResizeStart"
      @touchstart.prevent="onResizeStart"
    />
  </th>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { Header } from '@tanstack/table-core';
import type { TableRow, SortState, ColumnMeta } from '../types';
import type { GridforgeTableInstance } from '../tableCore';
import { getHeaderStyle } from '../utils/columnStyles';
import { canReorder as checkCanReorder } from '../utils/columnReorder';
import Icon from './icons/Icon.vue';

export default Vue.extend({
  name: 'TableHeaderCell',
  components: {
    Icon,
  },
  props: {
    header: {
      type: Object as PropType<Header<TableRow, unknown>>,
      required: true,
    },
    layout: {
      type: String as PropType<'fit' | 'scroll'>,
      required: true,
    },
    table: {
      type: Object as PropType<GridforgeTableInstance | null>,
      default: null,
    },
    visibleColumnCount: {
      type: Number,
      required: true,
    },
    draggedColumnId: {
      type: String,
      default: null,
    },
    dragOverColumnId: {
      type: String,
      default: null,
    },
    sortBy: {
      type: Array as PropType<SortState[]>,
      default: () => [],
    },
  },
  computed: {
    headerStyle(): Record<string, string> {
      return getHeaderStyle(
        this.header,
        this.table,
        this.layout,
        this.visibleColumnCount,
      );
    },
    canReorder(): boolean {
      return checkCanReorder(this.header);
    },
    isDragging(): boolean {
      return Boolean(
        this.draggedColumnId &&
        this.header.column &&
        this.draggedColumnId === this.header.column.id,
      );
    },
    isDropTarget(): boolean {
      return Boolean(
        this.dragOverColumnId &&
        this.header.column &&
        this.dragOverColumnId === this.header.column.id &&
        this.draggedColumnId !== this.dragOverColumnId,
      );
    },
    isResizing(): boolean {
      if (!this.table) return false;
      const sizingInfo = this.table.getState().columnSizingInfo;
      return sizingInfo.isResizingColumn === this.header.column.id;
    },
    columnMeta(): ColumnMeta {
      if (!this.header.column) return {};
      return (this.header.column.columnDef.meta as ColumnMeta) || {};
    },
    isFrozenLeft(): boolean {
      return this.columnMeta.alignFrozen === 'left';
    },
    isFrozenRight(): boolean {
      return this.columnMeta.alignFrozen === 'right';
    },
    isLastFrozenLeft(): boolean {
      if (!this.table || !this.isFrozenLeft) return false;
      const allColumns = this.table.getAllLeafColumns();
      const leftFrozen = allColumns.filter((col) => {
        const meta = this.getColumnMetaFromDef(col.columnDef);
        return meta.alignFrozen === 'left';
      });
      if (leftFrozen.length === 0) return false;
      const lastFrozen = leftFrozen[leftFrozen.length - 1];
      return lastFrozen.id === this.header.column.id;
    },
    isFirstFrozenRight(): boolean {
      if (!this.table || !this.isFrozenRight) return false;
      const allColumns = this.table.getAllLeafColumns();
      const rightFrozen = allColumns.filter((col) => {
        const meta = this.getColumnMetaFromDef(col.columnDef);
        return meta.alignFrozen === 'right';
      });
      if (rightFrozen.length === 0) return false;
      const firstFrozen = rightFrozen[0];
      return firstFrozen.id === this.header.column.id;
    },
    getColumnMetaFromDef(columnDef: { meta?: unknown }): ColumnMeta {
      return (columnDef.meta as ColumnMeta) || {};
    },
    currentSortState(): SortState | undefined {
      if (!this.header.column) return undefined;
      const columnId = this.header.column.id as string;
      return this.sortBy.find((sort) => sort.id === columnId);
    },
    sortIconName(): string {
      const sortState = this.currentSortState;
      if (!sortState) return 'sort';
      return sortState.desc ? 'sortDesc' : 'sortAsc';
    },
    sortIconClass(): Record<string, boolean> {
      const sortState = this.currentSortState;
      return {
        'gf-table__head-cell__sort-icon--asc': Boolean(
          sortState && !sortState.desc,
        ),
        'gf-table__head-cell__sort-icon--desc': Boolean(
          sortState && sortState.desc,
        ),
      };
    },
    isSortable(): boolean {
      return this.columnMeta.sortable === true; // По умолчанию false, нужно явно указать true
    },
  },
  methods: {
    onResizeStart(event: MouseEvent | TouchEvent) {
      if (
        !this.header.column.getCanResize ||
        !this.header.column.getCanResize()
      )
        return;
      const handler = this.header.getResizeHandler?.();
      if (handler) {
        handler(event);
      }
      this.$emit('resize-start', this.header, event);
    },
    onDragStart(event: DragEvent) {
      if (!this.canReorder) return;
      this.$emit('drag-start', this.header, event);
    },
    onDragOver(event: DragEvent) {
      if (!this.canReorder) return;
      this.$emit('drag-over', this.header, event);
    },
    onDrop(event: DragEvent) {
      if (!this.canReorder) return;
      this.$emit('drop', this.header, event);
    },
    onDragEnd() {
      this.$emit('drag-end');
    },
    onDragLeave(event: DragEvent) {
      if (!this.canReorder) return;
      const currentTarget = event.currentTarget as HTMLElement | null;
      const relatedTarget = event.relatedTarget as HTMLElement | null;
      // Игнорируем dragleave, если курсор всё ещё внутри той же ячейки
      if (
        currentTarget &&
        relatedTarget &&
        currentTarget.contains(relatedTarget)
      ) {
        return;
      }
      this.$emit('drag-leave', this.header, event);
    },
    onContextMenu(event: MouseEvent) {
      event.preventDefault();
      event.stopPropagation();
      this.$emit('context-menu', this.header, event);
    },
    onSortClick() {
      if (!this.header.column) return;
      const columnId = this.header.column.id as string;
      this.$emit('sort-toggle', columnId);
    },
  },
});
</script>
