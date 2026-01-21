<template>
  <div :class="['gf-table', customClass]">
    <div class="gf-table__wrapper">
      <table :class="tableClass">
        <thead v-if="table" class="gf-table__head">
          <tr
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="gf-table__head-row"
          >
            <th
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="gf-table__head-cell"
              :style="getHeaderStyle(header)"
            >
              <div class="gf-table__head-cell__content">
                <span v-if="!header.isPlaceholder">
                  {{ header.column.columnDef.header }}
                </span>
              </div>
              <div
                v-if="header.column.getCanResize && header.column.getCanResize()"
                class="gf-table__head-cell__resizer"
                :class="{ 'gf-table__head-cell__resizer--resizing': isResizing(header) }"
                @mousedown.prevent="onResizeStart(header, $event)"
                @touchstart.prevent="onResizeStart(header, $event)"
              />
            </th>
          </tr>
        </thead>
        <tbody v-if="table" class="gf-table__body">
          <tr v-for="row in table.getRowModel().rows" :key="row.id" class="gf-table__body-row">
            <td
              v-for="cell in row.getVisibleCells()"
              :key="cell.id"
              class="gf-table__body-cell"
              :style="getCellStyle(cell)"
            >
              {{ cell.getValue() }}
            </td>
          </tr>
          <tr v-if="!table.getRowModel().rows.length">
            <td :colspan="visibleColumnCount" class="gf-table__body-cell">
              <div class="gf-table__empty">Нет данных</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { TableColumn, TableRow } from '../types';
import type { Header, Cell } from '@tanstack/table-core';
import { createTanstackTable, GridforgeTableInstance } from '../tableCore';

export default Vue.extend({
  name: 'GridforgeTable',
  props: {
    data: {
      type: Array as PropType<TableRow[]>,
      required: true,
      default: () => [],
    },
    columns: {
      type: Array as PropType<TableColumn[]>,
      required: true,
      default: () => [],
    },
    tableKey: {
      type: String,
      default: undefined,
    },
    customClass: {
      type: String,
      default: undefined,
    },
    /**
     * Режим layout:
     * - "fit"   — таблица растягивается до 100% ширины родителя
     * - "scroll" — таблица может быть шире контейнера, появляется горизонтальный скролл
     */
    layout: {
      type: String as PropType<'fit' | 'scroll'>,
      default: 'fit',
    },
  },
  data() {
    return {
      table: null as GridforgeTableInstance | null,
    };
  },
  computed: {
    tableClass(): string[] {
      const classes = ['gf-table__table'];
      if (this.layout === 'scroll') {
        classes.push('gf-table__table--scroll');
      }
      return classes;
    },
    visibleColumnCount(): number {
      if (!this.table) return 0;
      return this.table.getVisibleLeafColumns().length;
    },
  },
  watch: {
    data: {
      handler() {
        this.buildTable();
      },
      deep: true,
    },
    columns: {
      handler() {
        this.buildTable();
      },
      deep: true,
    },
  },
  created() {
    this.buildTable();
  },
  mounted() {
    // Слушаем события окончания ресайза, чтобы обновить классы
    document.addEventListener('mouseup', this.handleResizeEnd);
    document.addEventListener('touchend', this.handleResizeEnd);
  },
  beforeDestroy() {
    document.removeEventListener('mouseup', this.handleResizeEnd);
    document.removeEventListener('touchend', this.handleResizeEnd);
  },
  methods: {
    buildTable() {
      this.table = createTanstackTable(this.data || [], this.columns || []);
    },
    getHeaderStyle(header: Header<TableRow, unknown>) {
      if (!this.table || !header.column || typeof header.getSize !== 'function') {
        return {};
      }
      const size = header.getSize();
      if (!size) return {};
      // В scroll-режиме используем пиксели и даём таблице быть шире контейнера
      if (this.layout === 'scroll') {
        return {
          width: `${size}px`,
          minWidth: `${size}px`,
        };
      }
      // В fit-режиме жёстко укладываемся в 100% ширины родителя:
      // считаем долю колонки от общей ширины и задаём проценты
      const total = typeof this.table.getTotalSize === 'function' ? this.table.getTotalSize() : 0;
      const percent =
        total > 0 && size > 0
          ? (size / total) * 100
          : this.visibleColumnCount > 0
            ? 100 / this.visibleColumnCount
            : 0;
      return {
        width: `${percent}%`,
        minWidth: '0',
        maxWidth: `${percent}%`,
      };
    },
    getCellStyle(cell: Cell<TableRow, unknown>) {
      if (!this.table || !cell.column || typeof cell.column.getSize !== 'function') {
        return {};
      }
      const size = cell.column.getSize();
      if (!size) return {};
      if (this.layout === 'scroll') {
        return {
          width: `${size}px`,
          minWidth: `${size}px`,
        };
      }
      const total = typeof this.table.getTotalSize === 'function' ? this.table.getTotalSize() : 0;
      const percent =
        total > 0 && size > 0
          ? (size / total) * 100
          : this.visibleColumnCount > 0
            ? 100 / this.visibleColumnCount
            : 0;
      return {
        width: `${percent}%`,
        minWidth: '0',
        maxWidth: `${percent}%`,
      };
    },
    onResizeStart(header: Header<TableRow, unknown>, event: MouseEvent | TouchEvent) {
      if (!header.column.getCanResize || !header.column.getCanResize()) return;
      const handler = header.getResizeHandler?.();
      if (handler) {
        handler(event);
      }
    },
    isResizing(header: Header<TableRow, unknown>) {
      if (!this.table) return false;
      // Используем состояние ресайза напрямую из TanStack
      const sizingInfo = this.table.getState().columnSizingInfo;
      return sizingInfo.isResizingColumn === header.column.id;
    },
    handleResizeEnd() {
      // Форсируем обновление компонента после окончания ресайза,
      // чтобы убрать класс --resizing
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
  },
});
</script>
