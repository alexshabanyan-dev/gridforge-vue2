<template>
  <div
    v-html="svgContent"
    class="gf-icon"
    :style="iconStyle"
  />
</template>

<script lang="ts">
import Vue from 'vue';
// @ts-expect-error Vite импортирует SVG как строку через ?raw
import columnsIconSvg from '../../assets/icons/ColumnsSolid.svg?raw';
// @ts-expect-error Vite ?raw
import dragVerticalIconSvg from '../../assets/icons/DragVerticalSolid.svg?raw';
// @ts-expect-error Vite ?raw
import sortIconSvg from '../../assets/icons/Sort.svg?raw';
// @ts-expect-error Vite ?raw
import sortAscendingIconSvg from '../../assets/icons/SortAscending.svg?raw';
// @ts-expect-error Vite ?raw
import sortDescendingIconSvg from '../../assets/icons/SortDescending.svg?raw';
// @ts-expect-error Vite ?raw
import ellipsisVerticalIconSvg from '../../assets/icons/EllipsisVerticalSolid.svg?raw';

// Маппинг имен иконок на их SVG содержимое
const iconMap: Record<string, string> = {
  columns: columnsIconSvg as string,
  dragVertical: dragVerticalIconSvg as string,
  sort: sortIconSvg as string,
  sortAsc: sortAscendingIconSvg as string,
  sortDesc: sortDescendingIconSvg as string,
  ellipsisVertical: ellipsisVerticalIconSvg as string,
};

// Константы для иконок сортировки (вынесены для оптимизации)
const STROKE_SORT_ICONS = ['sortAsc', 'sortDesc'] as const;
const ALL_SORT_ICONS = ['sort', 'sortAsc', 'sortDesc'] as const;
type SortIconName = (typeof ALL_SORT_ICONS)[number];
type StrokeSortIconName = (typeof STROKE_SORT_ICONS)[number];

export default Vue.extend({
  name: 'Icon',
  props: {
    name: {
      type: String,
      required: true,
      validator: (value: string) => {
        return Object.keys(iconMap).includes(value);
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
    iconStyle(): Record<string, string> {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`,
        display: 'inline-block',
        color: this.color,
      };
    },
    svgContent(): string {
      const svgString = iconMap[this.name];
      if (!svgString) {
        // В development режиме предупреждаем, в production - просто возвращаем пустую строку
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Icon "${this.name}" not found`);
        }
        return '';
      }

      // Заменяем фиксированные размеры на динамические
      let content = svgString
        .replace(/width="\d+"/g, `width="${this.size}"`)
        .replace(/height="\d+"/g, `height="${this.size}"`);

      // Для иконок сортировки с stroke уменьшаем stroke-width пропорционально размеру
      if (STROKE_SORT_ICONS.includes(this.name as StrokeSortIconName)) {
        // stroke-width="2" для размера 24px, для меньших размеров уменьшаем пропорционально
        const baseSize = 24;
        const baseStrokeWidth = 2;
        const strokeWidth = Math.max(
          1,
          (this.size / baseSize) * baseStrokeWidth,
        );
        if (content.includes('stroke-width=')) {
          content = content.replace(
            /stroke-width="[^"]*"/g,
            `stroke-width="${strokeWidth}"`,
          );
        } else {
          // Добавляем stroke-width к path элементам
          content = content.replace(
            /<path/g,
            `<path stroke-width="${strokeWidth}"`,
          );
        }
      }

      // Для всех иконок сортировки добавляем preserveAspectRatio
      if (
        ALL_SORT_ICONS.includes(this.name as SortIconName) &&
        !content.includes('preserveAspectRatio=')
      ) {
        if (content.includes('viewBox=')) {
          content = content.replace(
            /(<svg[^>]*viewBox="[^"]*")/,
            `$1 preserveAspectRatio="xMidYMid meet"`,
          );
        } else {
          // Если нет viewBox, добавляем его вместе с preserveAspectRatio
          const viewBox = this.name === 'sort' ? '0 0 1024 1408' : '0 0 24 24';
          content = content.replace(
            /(<svg[^>]*xmlns="[^"]*")/,
            `$1 viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet"`,
          );
        }
      }

      // Если нужно, заменяем fill на currentColor для поддержки color prop
      if (this.color !== 'currentColor') {
        content = content.replace(/fill="[^"]*"/g, `fill="${this.color}"`);
      } else {
        // Для иконок с fill (не stroke) убеждаемся, что fill="currentColor"
        if (this.name === 'sort') {
          // Иконка Sort использует fill, заменяем на currentColor
          content = content.replace(/fill="[^"]*"/g, 'fill="currentColor"');
        }
        // Для иконок с stroke (sortAsc, sortDesc) не трогаем fill, так как они используют stroke
      }

      return content;
    },
  },
});
</script>

<style scoped>
.gf-icon {
  vertical-align: middle;
}

.gf-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
