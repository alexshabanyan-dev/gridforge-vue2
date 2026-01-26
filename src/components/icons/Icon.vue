<template>
  <IconifyIcon
    :icon="iconId"
    :width="size"
    :height="size"
    :style="iconStyle"
    class="gf-icon"
  />
</template>

<script lang="ts">
import Vue from 'vue';
import { Icon as IconifyIcon } from '@iconify/vue2';

const NAME_TO_ICON: Record<string, string> = {
  columns: 'lucide:columns-2',
  dragVertical: 'lucide:grip-vertical',
  sort: 'lucide:arrow-up-down',
  sortAsc: 'lucide:arrow-up',
  sortDesc: 'lucide:arrow-down',
  ellipsisVertical: 'lucide:ellipsis-vertical',
  settings: 'lucide:settings',
  inbox: 'lucide:inbox',
  loader: 'lucide:loader-2',
};

export default Vue.extend({
  name: 'Icon',
  components: { IconifyIcon },
  props: {
    name: {
      type: String,
      required: true,
      validator: (value: string) => {
        return Object.keys(NAME_TO_ICON).includes(value);
      },
    },
    size: {
      type: Number,
      default: 16,
    },
    color: {
      type: String,
      default: 'currentColor',
    },
  },
  computed: {
    iconId(): string {
      return NAME_TO_ICON[this.name] ?? '';
    },
    iconStyle(): Record<string, string> {
      return {
        color: this.color,
        verticalAlign: 'middle',
      };
    },
  },
});
</script>

<style scoped>
.gf-icon {
  display: inline-block;
}
</style>
