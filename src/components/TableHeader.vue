<template>
  <thead class="gf-table__head">
    <tr class="gf-table__head-row">
      <TableHeaderCell
        v-for="column in validColumns"
        :key="getColumnKey(column)"
        :column="column"
        :column-sizing="columnSizing"
      />
    </tr>
  </thead>
</template>

<script lang="ts">
import { defineComponent, computed, ref, type Ref } from 'vue';
import type { PropType } from 'vue';
import type { TableColumn } from '../types';
import TableHeaderCell from './TableHeaderCell.vue';
import { getColumnKey } from '../utils/columnHelpers';

const defaultColumnSizing = ref<Record<string, number>>({});

export default defineComponent({
  name: 'TableHeader',
  components: {
    TableHeaderCell,
  },
  props: {
    columns: {
      type: Array as PropType<TableColumn[]>,
      required: true,
    },
    columnSizing: {
      type: Object as PropType<Ref<Record<string, number>>>,
      required: false,
      default: () => defaultColumnSizing,
    },
  },
  setup(props) {
    const validColumns = computed(() => {
      return props.columns.filter((col) => col != null);
    });

    return {
      getColumnKey,
      validColumns,
    };
  },
});
</script>
