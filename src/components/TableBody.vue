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
    <TableEmptyState
      v-if="!rows.length"
      :visible-column-count="visibleColumnCount"
      :loading="loading"
    />
  </tbody>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { ActionColumnItem } from '../types';
import type { GridforgeTableInstance } from '../tableCore';
import TableBodyRow from './TableBodyRow.vue';
import TableEmptyState from './TableEmptyState.vue';

export default Vue.extend({
  name: 'TableBody',
  components: {
    TableBodyRow,
    TableEmptyState,
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
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    rows() {
      if (!this.table) return [];
      return this.table.getRowModel().rows;
    },
  },
});
</script>
