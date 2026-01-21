# Иконки

Универсальный компонент `Icon` для отображения SVG иконок в библиотеке.

## Использование

```vue
<template>
  <Icon name="columns" :size="16" color="currentColor" />
</template>

<script>
import Icon from '@/components/icons/Icon.vue';

export default {
  components: {
    Icon,
  },
};
</script>
```

## Props

- `name` (required, string) - Имя иконки из доступного списка
- `size` (optional, number, default: 16) - Размер иконки в пикселях
- `color` (optional, string, default: 'currentColor') - Цвет иконки

## Добавление новых иконок

1. Добавьте SVG файл в `src/assets/icons/`
2. Импортируйте его в `src/components/icons/Icon.vue`:
   ```typescript
   import newIconSvg from '../../assets/icons/NewIcon.svg?raw';
   ```
3. Добавьте запись в `iconMap`:
   ```typescript
   const iconMap: Record<string, string> = {
     columns: columnsIconSvg as string,
     newIcon: newIconSvg as string, // новая иконка
   };
   ```
4. Используйте в компонентах:
   ```vue
   <Icon name="newIcon" :size="20" />
   ```

## Доступные иконки

- `columns` - Иконка колонок (ColumnsSolid.svg)
