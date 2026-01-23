<template>
  <thead v-if="table" class="gf-table__head">
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
        @resize-start="onResizeStart"
        @drag-start="onDragStart"
        @drag-over="onDragOver"
        @drop="onDrop"
        @drag-end="onDragEnd"
        @drag-leave="onDragLeave"
        @context-menu="onContextMenu"
      />
    </tr>
  </thead>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { GridforgeTableInstance } from '../tableCore';
import TableHeaderCell from './TableHeaderCell.vue';
import { canReorder } from '../utils/columnReorder';

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
  },
  computed: {
    headerGroups() {
      if (!this.table) return [];
      return this.table.getHeaderGroups();
    },
  },
  methods: {
    onResizeStart(header: any, event: MouseEvent | TouchEvent) {
      this.$emit('resize-start', header, event);
    },
    onDragStart(header: any, event: DragEvent) {
      this.$emit('drag-start', header, event);
    },
    onDragOver(header: any, event: DragEvent) {
      this.$emit('drag-over', header, event);
    },
    onDrop(header: any, event: DragEvent) {
      this.$emit('drop', header, event);
    },
    onDragEnd() {
      this.$emit('drag-end');
    },
    onDragLeave(header: any, event: DragEvent) {
      this.$emit('drag-leave', header, event);
    },
    onContextMenu(header: any, event: MouseEvent) {
      this.$emit('context-menu', header, event);
    },
  },
});
</script>
