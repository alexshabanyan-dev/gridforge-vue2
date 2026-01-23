<template>
  <div class="gf-table__toolbar">
    <div class="gf-table__toolbar-spacer" />
    <VDropdown
      v-if="table"
      :triggers="['click']"
      :distance="8"
      placement="bottom-end"
      :auto-hide="true"
      :handle-resize="true"
      :boundaries-selector="'.gf-table'"
      @show="onMenuShow"
      @hide="onMenuHide"
    >
      <button type="button" class="gf-table__column-menu-trigger">
        <Icon name="columns" :size="12" class="gf-table__column-menu-trigger-icon" />
      </button>

      <template #popper>
        <div class="gf-table__column-menu-dropdown">
          <div class="gf-table__column-menu-header">
            <span class="gf-table__column-menu-header-title">{{ COLUMN_MENU_TITLE }}</span>
          </div>
          <div class="gf-table__column-menu-content">
            <label v-for="column in columns" :key="column.id" class="gf-table__column-menu-item">
              <input
                type="checkbox"
                class="gf-table__column-menu-checkbox"
                :checked="column.getIsVisible()"
                @change="onToggle(column, $event)"
              />
              <span class="gf-table__column-menu-item-label">
                {{ column.columnDef.header || column.id }}
              </span>
            </label>
          </div>
        </div>
      </template>
    </VDropdown>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import { Dropdown } from 'floating-vue';
import 'floating-vue/dist/style.css';
import { COLUMN_MENU_TITLE } from '../constants/tableConstants';
import Icon from './icons/Icon.vue';

export default Vue.extend({
  name: 'TableBar',
  components: {
    Icon,
    VDropdown: Dropdown,
  },
  props: {
    table: {
      type: Object,
      default: null,
    },
    columns: {
      type: Array as PropType<any[]>,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      COLUMN_MENU_TITLE,
    };
  },
  methods: {
    onMenuShow() {
      this.$emit('toggle', true);
    },
    onMenuHide() {
      this.$emit('toggle', false);
    },
    onToggle(column: any, event: Event) {
      const target = event.target as HTMLInputElement | null;
      const isChecked = target ? target.checked : column.getIsVisible();
      column.toggleVisibility(isChecked);
      this.$emit('visibility-change', column, isChecked);
    },
  },
});
</script>

