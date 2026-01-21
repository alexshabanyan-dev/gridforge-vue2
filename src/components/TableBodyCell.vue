<template>
  <td class="gf-table__body-cell" :style="cellStyle">
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
  },
});
</script>
