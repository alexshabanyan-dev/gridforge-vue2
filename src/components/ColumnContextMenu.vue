<template>
  <div
    v-if="visible"
    class="gf-table__column-context-menu"
    :style="menuStyle"
    @click.stop
  >
    <button
      v-if="!isFrozen"
      type="button"
      class="gf-table__column-context-menu-item"
      @click="onFreezeLeft"
    >
      <span>Закрепить слева</span>
    </button>
    <button
      v-if="!isFrozen"
      type="button"
      class="gf-table__column-context-menu-item"
      @click="onFreezeRight"
    >
      <span>Закрепить справа</span>
    </button>
    <button
      v-if="isFrozen"
      type="button"
      class="gf-table__column-context-menu-item"
      @click="onUnfreeze"
    >
      <span>Открепить</span>
    </button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { Header } from '@tanstack/table-core';
import type { TableRow, ColumnMeta } from '../types';

export default Vue.extend({
  name: 'ColumnContextMenu',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    header: {
      type: Object as PropType<Header<TableRow, unknown> | null>,
      default: null,
    },
    position: {
      type: Object as PropType<{ x: number; y: number } | null>,
      default: null,
    },
  },
  computed: {
    isFrozen(): boolean {
      if (!this.header?.column) return false;
      const meta = (this.header.column.columnDef.meta as ColumnMeta) || {};
      return meta.alignFrozen === 'left' || meta.alignFrozen === 'right';
    },
    menuStyle(): Record<string, string> {
      if (!this.position) return {};
      return {
        position: 'fixed',
        left: `${this.position.x}px`,
        top: `${this.position.y}px`,
        zIndex: '10000',
      };
    },
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('contextmenu', this.handleClickOutside);
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        // Добавляем небольшую задержку, чтобы не закрыть меню сразу после открытия
        this.$nextTick(() => {
          setTimeout(() => {
            document.addEventListener('click', this.handleClickOutside, true);
            document.addEventListener(
              'contextmenu',
              this.handleClickOutside,
              true,
            );
          }, 50);
        });
      } else {
        document.removeEventListener('click', this.handleClickOutside, true);
        document.removeEventListener(
          'contextmenu',
          this.handleClickOutside,
          true,
        );
      }
    },
  },
  methods: {
    handleClickOutside(event: Event) {
      const target = event.target as HTMLElement;
      const menu = this.$el as HTMLElement;
      if (menu && !menu.contains(target)) {
        this.$emit('hide');
      }
    },
    onFreezeLeft() {
      this.$emit('freeze', 'left');
      this.$emit('hide');
    },
    onFreezeRight() {
      this.$emit('freeze', 'right');
      this.$emit('hide');
    },
    onUnfreeze() {
      this.$emit('freeze', null);
      this.$emit('hide');
    },
  },
});
</script>
