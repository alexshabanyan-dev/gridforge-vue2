<template>
  <thead
    v-if="table"
    class="gf-table__head"
  >
    <tr
      v-for="headerGroup in headerGroups"
      :key="headerGroup.id"
      class="gf-table__head-row"
    >
      <TableHeaderCell
        v-for="header in headerGroup.headers"
        :key="header.id"
        :header="header"
        :layout="layout"
        :table="table"
        :visible-column-count="visibleColumnCount"
        :dragged-column-id="draggedColumnId"
        :drag-over-column-id="dragOverColumnId"
        :sort-by="sortBy"
        @resize-start="onResizeStart"
        @drag-start="onDragStart"
        @drag-over="onDragOver"
        @drop="onDrop"
        @drag-end="onDragEnd"
        @drag-leave="onDragLeave"
        @context-menu="onContextMenu"
        @sort-toggle="onSortToggle"
      />
    </tr>
  </thead>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { Header } from '@tanstack/table-core';
import type { GridforgeTableInstance } from '../tableCore';
import type { SortState, TableRow } from '../types';
import TableHeaderCell from './TableHeaderCell.vue';

type HeaderType = Header<TableRow, unknown>;

export default Vue.extend({
  name: 'TableHeader',
  components: {
    TableHeaderCell,
  },
  props: {
    table: {
      type: Object as PropType<GridforgeTableInstance | null>,
      default: null,
    },
    layout: {
      type: String as PropType<'fit' | 'scroll'>,
      required: true,
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
    headerGroups() {
      if (!this.table) return [];

      const groups = this.table.getHeaderGroups();
      if (groups.length === 0) return [];

      const lastGroup = groups[groups.length - 1];

      const visibleHeaders = lastGroup.headers.filter(
        (header: HeaderType) => !header.isPlaceholder && header.column,
      );

      return [
        {
          id: lastGroup.id,
          headers: visibleHeaders,
        },
      ];
    },
  },
  methods: {
    onResizeStart(header: HeaderType, event: MouseEvent | TouchEvent) {
      this.$emit('resize-start', header, event);
    },
    onDragStart(header: HeaderType, event: DragEvent) {
      this.$emit('drag-start', header, event);
    },
    onDragOver(header: HeaderType, event: DragEvent) {
      this.$emit('drag-over', header, event);
    },
    onDrop(header: HeaderType, event: DragEvent) {
      this.$emit('drop', header, event);
    },
    onDragEnd() {
      this.$emit('drag-end');
    },
    onDragLeave(header: HeaderType, event: DragEvent) {
      this.$emit('drag-leave', header, event);
    },
    onContextMenu(header: HeaderType, event: MouseEvent) {
      this.$emit('context-menu', header, event);
    },
    onSortToggle(columnId: string) {
      this.$emit('sort-toggle', columnId);
    },
  },
});
</script>
