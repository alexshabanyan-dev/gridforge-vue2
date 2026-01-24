<template>
  <tr class="gf-table__body-row">
    <TableBodyCell
      v-for="cell in visibleCells"
      :key="cell.id"
      :cell="cell"
      :layout="layout"
      :table="table"
      :visible-column-count="visibleColumnCount"
      :action-column-params="actionColumnParams"
      @action="$emit('action', $event)"
    />
  </tr>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { Row } from '@tanstack/table-core';
import type { TableRow, ActionColumnItem } from '../types';
import type { GridforgeTableInstance } from '../tableCore';
import TableBodyCell from './TableBodyCell.vue';

export default Vue.extend({
  name: 'TableBodyRow',
  components: {
    TableBodyCell,
  },
  props: {
    row: {
      type: Object as PropType<Row<TableRow>>,
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
    actionColumnParams: {
      type: Array as PropType<ActionColumnItem[]>,
      default: undefined,
    },
  },
  computed: {
    visibleCells() {
      return this.row.getVisibleCells();
    },
  },
});
</script>
