<template>
  <th
    v-if="header"
    class="gf-table__head-cell"
    :class="{
      'gf-table__head-cell--draggable': canReorder,
      'gf-table__head-cell--dragging': isDragging,
      'gf-table__head-cell--drop-target': isDropTarget,
    }"
    :style="headerStyle"
    :draggable="canReorder"
    @dragstart="onDragStart"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    @dragend="onDragEnd"
  >
    <div class="gf-table__head-cell__content">
      <Icon
        v-if="canReorder"
        name="dragVertical"
        :size="14"
        class="gf-table__head-cell__drag-icon"
      />
      <span v-if="!header.isPlaceholder">
        {{ header.column.columnDef.header }}
      </span>
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
import type { TableRow } from '../types';
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
  },
  methods: {
    onResizeStart(event: MouseEvent | TouchEvent) {
      if (!this.header.column.getCanResize || !this.header.column.getCanResize()) return;
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
      if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
        return;
      }
      this.$emit('drag-leave', this.header, event);
    },
  },
});
</script>
