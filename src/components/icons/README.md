# Иконки

Компонент `Icon` — обёртка над [@iconify/vue2](https://iconify.design/docs/icon-components/vue2/). Иконки из набора **Lucide** подгружаются по требованию через Iconify API.

## Использование

```vue
<template>
  <Icon
    name="columns"
    :size="16"
    color="currentColor"
  />
</template>

<script>
import Icon from '@/components/icons/Icon.vue';

export default {
  components: { Icon },
};
</script>
```

## Props

- `name` (required, string) — имя из списка ниже
- `size` (optional, number, default: 16) — размер в px
- `color` (optional, string, default: `'currentColor'`) — цвет

## Доступные иконки

| name             | Iconify (Lucide)    |
|------------------|---------------------|
| `columns`        | lucide:columns-2    |
| `dragVertical`   | lucide:grip-vertical|
| `sort`           | lucide:arrow-up-down|
| `sortAsc`        | lucide:arrow-up     |
| `sortDesc`       | lucide:arrow-down   |
| `ellipsisVertical` | lucide:ellipsis-vertical |

## Добавление новых иконок

1. Выберите иконку на [Iconify](https://icon-sets.iconify.design/) (например, Lucide).
2. В `Icon.vue` добавьте запись в `NAME_TO_ICON`:

   ```ts
   const NAME_TO_ICON: Record<string, string> = {
     // ...
     myIcon: 'lucide:my-icon-name',
   };
   ```

3. Добавьте `myIcon` в `validator` (через `Object.keys(NAME_TO_ICON)` он уже учитывается).
4. Используйте: `<Icon name="myIcon" :size="20" />`.
