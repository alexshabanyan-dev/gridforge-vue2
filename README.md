# GridForge Vue2

Гибкая библиотека компонентов таблиц для Vue 2 с поддержкой перестановки колонок, изменения размера и управления видимостью.

## Установка

```bash
npm install gridforge-vue2
```

## Быстрый старт

### Импорт стилей

**Важно:** Не забудьте импортировать стили!

```typescript
import 'gridforge-vue2/style.css';
```

### Использование компонента

```vue
<template>
  <GridforgeTable :data="data" :columns="columns" />
</template>

<script>
import { GridforgeTable } from 'gridforge-vue2';
import 'gridforge-vue2/style.css';

export default {
  components: { GridforgeTable },
  data() {
    return {
      data: [
        { id: 1, name: 'Иван', email: 'ivan@example.com' },
        { id: 2, name: 'Петр', email: 'petr@example.com' },
      ],
      columns: [
        { header: 'ID', field: 'id', width: 80 },
        { header: 'Имя', field: 'name', width: 200 },
        { header: 'Email', field: 'email', width: 250 },
      ],
    };
  },
};
</script>
```

## API

### Props

#### `data` (required)

Массив объектов данных для отображения в таблице.

#### `columns` (required)

Массив определений колонок. Каждая колонка может иметь следующие свойства:

- `header` (string, required) - Заголовок колонки
- `field` (string, required) - Поле данных для отображения
- `columnKey` (string, optional) - Уникальный ключ колонки
- `width` (number | string, optional) - Ширина колонки в пикселях
- `minWidth` (number, optional) - Минимальная ширина колонки
- `maxWidth` (number, optional) - Максимальная ширина колонки
- `resizable` (boolean, optional) - Можно ли изменять размер колонки
- `reorderableColumn` (boolean, optional) - Можно ли переставлять колонку
- `canNotManipulate` (boolean, optional) - Можно ли скрывать колонку
- `frozen` (boolean, optional) - Закреплена ли колонка
- `alignFrozen` ('left' | 'right', optional) - Выравнивание закрепленной колонки

#### `tableKey` (optional)

Уникальный ключ таблицы для сохранения состояния (будет использоваться в будущих версиях).

#### `class` (optional)

Дополнительный CSS класс для корневого элемента.

## Разработка

### Установка зависимостей

```bash
npm install
cd playground && npm install
```

### Запуск playground

Playground - это отдельное приложение, которое импортирует компоненты напрямую из `src/`:

```bash
cd playground
npm install  # если еще не установлены зависимости
npm run dev
```

Playground откроется на `http://localhost:3000`

**Важно:** Playground импортирует компоненты напрямую из `../src/`, поэтому изменения в библиотеке сразу видны без пересборки.

### Сборка библиотеки

```bash
npm run build
```

Собранные файлы будут в папке `dist/`:

- `gridforge-vue2.es.js` - ES модуль
- `gridforge-vue2.umd.js` - UMD модуль
- `style.css` - стили
- `index.d.ts` - TypeScript типы

## Лицензия

MIT
