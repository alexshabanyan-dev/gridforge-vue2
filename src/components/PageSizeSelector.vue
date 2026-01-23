<template>
  <div class="gf-table__page-size-selector">
    <label class="gf-table__page-size-label">
      Показать:
      <select
        :value="value"
        class="gf-table__page-size-select"
        @change="onChange"
      >
        <option
          v-for="option in options"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </label>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';

export default Vue.extend({
  name: 'PageSizeSelector',
  props: {
    value: {
      type: Number,
      required: true,
    },
    options: {
      type: Array as PropType<number[]>,
      required: true,
    },
  },
  methods: {
    onChange(event: Event) {
      const target = event.target as HTMLSelectElement;
      const newValue = parseInt(target.value, 10);
      this.$emit('change', newValue);
    },
  },
});
</script>
