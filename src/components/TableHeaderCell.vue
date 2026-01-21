<template>
  <th
    ref="cellRef"
    class="gf-table__head-cell"
    :class="{
      'gf-table__head-cell--resizing': isResizing,
    }"
    :style="columnStyle"
  >
    <div class="gf-table__head-cell__content">
      {{ columnHeader }}
    </div>
    <div
      v-if="canResize"
      class="gf-table__head-cell__resizer"
      :class="{ 'gf-table__head-cell__resizer--resizing': isResizing }"
      @mousedown.prevent="startResize"
      @touchstart.prevent="startResize"
    />
  </th>
</template>

<script lang="ts">
import { defineComponent, ref, computed, type Ref } from 'vue';
import type { PropType } from 'vue';
import type { TableColumn } from '../types';
import { useColumnResize } from '../composables/useColumnResize';

const defaultColumnSizing = ref<Record<string, number>>({});

export default defineComponent({
  name: 'TableHeaderCell',
  props: {
    column: {
      type: Object as PropType<TableColumn>,
      required: true,
    },
    columnSizing: {
      type: Object as PropType<Ref<Record<string, number>>>,
      required: false,
      default: () => defaultColumnSizing,
    },
  },
  setup(props) {
    const cellRef = ref<HTMLElement>();

    const columnHeader = computed(() => {
      return props.column && props.column.header ? props.column.header : '';
    });

    const resizeData = useColumnResize({
      column: props.column,
      columnSizing: props.columnSizing,
    });

    return {
      cellRef,
      columnHeader,
      isResizing: resizeData.isResizing,
      canResize: resizeData.canResize,
      columnStyle: resizeData.columnStyle,
      startResize: resizeData.startResize,
    };
  },
});
</script>
