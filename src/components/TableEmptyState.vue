<template>
  <tr>
    <td
      :colspan="visibleColumnCount"
      class="gf-table__body-cell gf-table__body-cell--empty"
    >
      <div class="gf-table__empty">
        <Icon
          :name="loading ? 'loader' : 'inbox'"
          :size="48"
          color="var(--gf-text-tertiary)"
          :class="[
            'gf-table__empty-icon',
            { 'gf-table__empty-icon--spinning': loading },
          ]"
        />
        <div
          v-if="!loading"
          class="gf-table__empty-text"
        >{{ EMPTY_DATA_TEXT }}</div>
      </div>
    </td>
  </tr>
</template>

<script lang="ts">
import Vue from 'vue';
import { EMPTY_DATA_TEXT } from '../constants/tableConstants';
import Icon from './icons/Icon.vue';

export default Vue.extend({
  name: 'TableEmptyState',
  components: {
    Icon,
  },
  props: {
    visibleColumnCount: {
      type: Number,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      EMPTY_DATA_TEXT,
    };
  },
});
</script>
