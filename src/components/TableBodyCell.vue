<template>
  <td
    class="gf-table__body-cell"
    :class="{
      'gf-table__body-cell--frozen-left': isFrozenLeft,
      'gf-table__body-cell--frozen-right': isFrozenRight,
      'gf-table__body-cell--frozen-left-border': isLastFrozenLeft,
      'gf-table__body-cell--frozen-right-border': isFirstFrozenRight,
    }"
    :style="cellStyle"
  >
    {{ cell.getValue() }}
  </td>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { Cell } from '@tanstack/table-core';
import type { TableRow } from '../types';
import type { GridforgeTableInstance } from '../tableCore';
import { getCellStyle } from '../utils/columnStyles';

export default Vue.extend({
  name: 'TableBodyCell',
  props: {
    cell: {
      type: Object as PropType<Cell<TableRow, unknown>>,
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
  },
  computed: {
    cellStyle(): Record<string, string> {
      return getCellStyle(this.cell, this.table, this.layout, this.visibleColumnCount);
    },
    isFrozenLeft(): boolean {
      if (!this.cell.column) return false;
      const meta = (this.cell.column.columnDef.meta as any) || {};
      return meta.alignFrozen === 'left';
    },
    isFrozenRight(): boolean {
      if (!this.cell.column) return false;
      const meta = (this.cell.column.columnDef.meta as any) || {};
      return meta.alignFrozen === 'right';
    },
    isLastFrozenLeft(): boolean {
      if (!this.table || !this.isFrozenLeft) return false;
      const allColumns = this.table.getAllLeafColumns();
      const leftFrozen = allColumns.filter((col) => {
        const meta = (col.columnDef.meta as any) || {};
        return meta.alignFrozen === 'left';
      });
      if (leftFrozen.length === 0) return false;
      const lastFrozen = leftFrozen[leftFrozen.length - 1];
      return lastFrozen.id === this.cell.column.id;
    },
    isFirstFrozenRight(): boolean {
      if (!this.table || !this.isFrozenRight) return false;
      const allColumns = this.table.getAllLeafColumns();
      const rightFrozen = allColumns.filter((col) => {
        const meta = (col.columnDef.meta as any) || {};
        return meta.alignFrozen === 'right';
      });
      if (rightFrozen.length === 0) return false;
      const firstFrozen = rightFrozen[0];
      return firstFrozen.id === this.cell.column.id;
    },
  },
});
</script>
