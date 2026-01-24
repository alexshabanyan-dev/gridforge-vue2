<template>
  <tbody
    v-if="table"
    class="gf-table__body"
  >
    <TableBodyRow
      v-for="row in rows"
      :key="row.id"
      :row="row"
      :layout="layout"
      :table="table"
      :visible-column-count="visibleColumnCount"
      :action-column-params="actionColumnParams"
      @action="$emit('action', $event)"
    />
    <tr v-if="!rows.length">
      <td
        :colspan="visibleColumnCount"
        class="gf-table__body-cell"
      >
        <div class="gf-table__empty">{{ EMPTY_DATA_TEXT }}</div>
      </td>
    </tr>
  </tbody>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { ActionColumnItem } from '../types';
import type { GridforgeTableInstance } from '../tableCore';
import { EMPTY_DATA_TEXT } from '../constants/tableConstants';
import TableBodyRow from './TableBodyRow.vue';

export default Vue.extend({
  name: 'TableBody',
  components: {
    TableBodyRow,
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
    actionColumnParams: {
      type: Array as PropType<ActionColumnItem[]>,
      default: undefined,
    },
  },
  data() {
    return {
      EMPTY_DATA_TEXT,
    };
  },
  computed: {
    rows() {
      if (!this.table) return [];
      return this.table.getRowModel().rows;
    },
  },
});
</script>
