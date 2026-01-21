<template>
  <div
    v-html="svgContent"
    class="gf-icon"
    :style="iconStyle"
  />
</template>

<script lang="ts">
import Vue from 'vue';
// @ts-ignore - Vite поддерживает импорт SVG как строки через ?raw
import columnsIconSvg from '../../assets/icons/ColumnsSolid.svg?raw';

// Маппинг имен иконок на их SVG содержимое
const iconMap: Record<string, string> = {
  columns: columnsIconSvg as string,
  // Здесь можно добавить другие иконки по мере необходимости
  // Например:
  // import anotherIconSvg from '../../assets/icons/AnotherIcon.svg?raw';
  // another: anotherIconSvg as string,
};

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
        console.warn(`Icon "${this.name}" not found`);
        return '';
      }

      // Заменяем фиксированные размеры на динамические
      let content = svgString
        .replace(/width="\d+"/g, `width="${this.size}"`)
        .replace(/height="\d+"/g, `height="${this.size}"`);

      // Если нужно, заменяем fill на currentColor для поддержки color prop
      if (this.color !== 'currentColor') {
        content = content.replace(/fill="[^"]*"/g, `fill="${this.color}"`);
      } else {
        // Убеждаемся, что fill="currentColor" установлен
        if (!content.includes('fill=')) {
          // Если нет fill, добавляем к path
          content = content.replace(/<path/g, '<path fill="currentColor"');
        } else {
          // Заменяем существующий fill на currentColor
          content = content.replace(/fill="[^"]*"/g, 'fill="currentColor"');
        }
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
