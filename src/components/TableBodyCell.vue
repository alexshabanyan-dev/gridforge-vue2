<template>
  <td
    class="gf-table__body-cell"
    :class="{
      'gf-table__body-cell--action': isActionColumn,
      'gf-table__body-cell--frozen-left': isFrozenLeft,
      'gf-table__body-cell--frozen-right': isFrozenRight,
      'gf-table__body-cell--frozen-left-border': isLastFrozenLeft,
      'gf-table__body-cell--frozen-right-border': isFirstFrozenRight,
    }"
    :style="cellStyle"
  >
    <div
      v-if="isActionColumn"
      class="gf-table__action-cell"
    >
      <VDropdown
        v-if="visibleActionItems.length"
        :triggers="['click']"
        :distance="6"
        placement="bottom-end"
        :auto-hide="true"
        :boundaries-selector="'.gf-table'"
      >
        <button
          type="button"
          class="gf-table__action-cell__trigger"
          aria-label="Действия"
        >
          <Icon
            name="ellipsisVertical"
            :size="14"
          />
        </button>
        <template #popper>
          <div class="gf-table__action-menu-dropdown">
            <button
              v-for="item in visibleActionItems"
              :key="item.code"
              type="button"
              class="gf-table__action-menu-item"
              @click="onActionItemClick(item)"
            >
              <span>{{ item.title }}</span>
            </button>
          </div>
        </template>
      </VDropdown>
    </div>
    <template v-else>
      {{ cell.getValue() }}
    </template>
  </td>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { Cell } from '@tanstack/table-core';
import type { TableRow, ColumnMeta, ActionColumnItem } from '../types';
import type { GridforgeTableInstance } from '../tableCore';
import { getCellStyle } from '../utils/columnStyles';
import { Dropdown, hideAllPoppers } from 'floating-vue';
import 'floating-vue/dist/style.css';
import Icon from './icons/Icon.vue';

export default Vue.extend({
  name: 'TableBodyCell',
  components: {
    Icon,
    VDropdown: Dropdown,
  },
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
    actionColumnParams: {
      type: Array as PropType<ActionColumnItem[]>,
      default: undefined,
    },
  },
  computed: {
    isActionColumn(): boolean {
      return Boolean(this.columnMeta.isActionColumn);
    },
    cellStyle(): Record<string, string> {
      return getCellStyle(
        this.cell,
        this.table,
        this.layout,
        this.visibleColumnCount,
      );
    },
    columnMeta(): ColumnMeta {
      if (!this.cell.column) return {};
      return (this.cell.column.columnDef.meta as ColumnMeta) || {};
    },
    visibleActionItems(): ActionColumnItem[] {
      const params = this.actionColumnParams;
      if (!params || !params.length) return [];
      const row = this.cell.row.original as TableRow;
      return params.filter((item) =>
        item.visible ? item.visible(row) : true,
      );
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
      return lastFrozen.id === this.cell.column.id;
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
      return firstFrozen.id === this.cell.column.id;
    },
  },
  methods: {
    getColumnMetaFromDef(columnDef: { meta?: unknown }): ColumnMeta {
      return (columnDef.meta as ColumnMeta) || {};
    },
    onActionItemClick(item: ActionColumnItem) {
      const row = this.cell.row.original as TableRow;
      this.$emit('action', {
        emitEvent: item.emitEvent,
        row,
        code: item.code,
      });
      hideAllPoppers();
    },
  },
});
</script>
