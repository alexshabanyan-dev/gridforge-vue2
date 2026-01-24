# Анализ стека технологий для GridForge Vue2

## Анализ существующих проектов

### 1. GridForge Vue3 (исходная библиотека)

**Стек:**

- Vue 3.4.0 с Composition API
- @tanstack/vue-table 8.21.3 (управление состоянием таблицы)
- @tanstack/vue-virtual 3.13.12 (виртуализация)
- Нативный HTML5 Drag and Drop API
- TypeScript 5.6.2
- Vite для сборки
- @vueuse/core для утилит

**Ключевые особенности:**

- Использует TanStack Table для управления состоянием колонок, сортировки, фильтрации
- Собственная реализация drag-and-drop на нативном HTML5 API
- Composition API с provide/inject для состояния drag-and-drop
- Виртуализация для больших таблиц

### 2. USMT UI (целевой проект)

**Стек:**

- Vue 2.7.8 (последняя версия Vue 2, поддерживает Composition API)
- PrimeVue 2.10.0 (используется DataTable)
- TypeScript ~5.1.0
- Vue CLI (Webpack)
- Vuex 3.6.2
- Vue Router 3.5.4

**Текущая реализация таблиц:**

- Используется PrimeVue DataTable
- Есть базовый функционал перестановки колонок (`reorderable-columns`)
- Есть базовый функционал изменения видимости колонок (через OverlayPanel с Checkbox)
- Структура колонок: `{ header, field, columnKey, width, sortable, frozen, reorderableColumn, canNotManipulate }`

## Предложение по стеку для GridForge Vue2

### Вариант 1: С TanStack Table Core (РЕКОМЕНДУЕТСЯ)

**Стек:**

- **Vue 2.7.8** - последняя версия Vue 2 с поддержкой Composition API
- **@tanstack/table-core** - framework-agnostic библиотека для управления состоянием таблицы
- **Нативный HTML5 Drag and Drop API** - для перестановки колонок
- **TypeScript 5.1.0** - совместим с проектом
- **Vue CLI / Vite** - для сборки библиотеки

**Почему этот вариант:**

1. ✅ **Готовая логика из коробки:**
   - `header.getResizeHandler()` - готовый обработчик для изменения ширины
   - `column.getSize()`, `column.getCanResize()` - управление размерами
   - `column.getIsVisible()`, `column.toggleVisibility()` - управление видимостью
   - `table.getState().columnOrder` - управление порядком колонок
   - Валидация minSize/maxSize встроена

2. ✅ **Переиспользование кода:**
   - Можно адаптировать большую часть логики из Vue3 версии
   - Та же архитектура и API
   - Меньше кода для поддержки

3. ✅ **Production-ready:**
   - Проверенная библиотека (используется тысячами проектов)
   - Меньше багов в собственной реализации
   - Легче добавлять новые фичи (сортировка, фильтрация в будущем)

4. ✅ **Framework-agnostic:**
   - `@tanstack/table-core` не привязан к Vue 3
   - Работает с любым фреймворком
   - Нужно только обернуть в Vue 2 реактивность

5. ✅ **Размер библиотеки:**
   - `@tanstack/table-core` ~20-25KB (gzipped)
   - Это оправдано для production библиотеки
   - Итого: ~25-30KB gzipped (вместо 12-18KB без core)

**Реализация для Vue 2:**

```typescript
import { createTable } from '@tanstack/table-core';
import { ref, computed, watch } from 'vue'; // Vue 2.7.8 уже имеет Composition API

// Создаем таблицу напрямую через core
const table = createTable({
  data: data.value,
  columns: columnDefs.value,
  getCoreRowModel: getCoreRowModel(),
  state: {
    columnSizing: columnSizing.value,
    columnOrder: columnsOrder.value,
    columnVisibility: columnVisibility.value,
  },
  onColumnSizingChange: (updater) => {
    // Синхронизация с Vue 2 реактивностью
  },
  // ... остальные опции
});
```

### Вариант 2: Минималистичный подход (альтернатива)

**Стек:**

- Vue 2.7.8
- Нативный HTML5 Drag and Drop API
- Нативные события мыши для resizing
- TypeScript

**Плюсы:**

- Минимальный bundle size (~12-18KB gzipped)
- Нет внешних зависимостей

**Минусы:**

- Нужно писать всю логику самостоятельно
- Больше кода для поддержки
- Больше потенциальных багов
- Сложнее переиспользовать код из Vue3 версии

### Вариант 3: С SortableJS (если нативный DnD недостаточен)

**Стек:**

- Vue 2.7.8
- **SortableJS** - проверенная библиотека для drag-and-drop
- TypeScript

**Плюсы:**

- Более надежная работа DnD на разных браузерах
- Больше возможностей кастомизации

**Минусы:**

- Дополнительная зависимость (~15KB)
- Меньше контроля над процессом

## Рекомендация: Вариант 1 (С TanStack Table Core)

### Обоснование:

1. **Переиспользование кода:**
   - В Vue3 версии используется `@tanstack/vue-table`, построенный на `table-core`
   - Можно адаптировать ~70-80% логики из Vue3 версии
   - Та же архитектура и подходы
   - Меньше времени на разработку

2. **Готовая логика:**
   - **Column Resizing:** `header.getResizeHandler()`, `column.getSize()`, встроенная валидация minSize/maxSize
   - **Column Visibility:** `column.getIsVisible()`, `column.toggleVisibility()`, встроенный state
   - **Column Ordering:** `table.getState().columnOrder`, `table.setColumnOrder()`
   - Все это уже протестировано и работает надежно

3. **Production-ready:**
   - TanStack Table используется в тысячах production проектов
   - Меньше багов, чем в собственной реализации
   - Легче поддерживать и расширять

4. **Размер vs Функциональность:**
   - +10-12KB к bundle size (с 12-18KB до 25-30KB)
   - Но получаем готовую, проверенную логику
   - Для production библиотеки это оправдано

5. **Совместимость с Vue 2:**
   - `@tanstack/table-core` - framework-agnostic
   - Vue 2.7.8 уже имеет Composition API
   - Нужно только обернуть в Vue 2 реактивность (ref, computed, watch)

### Архитектура библиотеки:

```
gridforge-vue2/
├── src/
│   ├── components/
│   │   ├── GridforgeTable.vue        # Основной компонент таблицы
│   │   ├── TableHeader.vue           # Заголовок с drag-and-drop
│   │   ├── TableHeaderCell.vue       # Ячейка заголовка (draggable + resizable)
│   │   ├── TableBody.vue             # Тело таблицы
│   │   ├── TableBodyCell.vue         # Ячейка тела
│   │   └── ColumnVisibilityMenu.vue  # Меню управления видимостью
│   ├── composables/
│   │   ├── useTable.ts               # Основной composable с TanStack Table
│   │   ├── useTableColumns.ts        # Трансформация колонок в ColumnDef
│   │   ├── useColumnReorder.ts       # Логика перестановки колонок (через table.setColumnOrder)
│   │   ├── useColumnVisibility.ts    # Логика видимости (через table state)
│   │   ├── useColumnResize.ts        # Логика изменения ширины (через header.getResizeHandler)
│   │   └── useDragNDrop.ts           # Состояние drag-and-drop для UI
│   ├── utils/
│   │   ├── storage.ts                 # Сохранение состояния в localStorage
│   │   └── array.ts                   # Утилиты для работы с массивами
│   ├── types.ts                       # TypeScript типы
│   └── index.ts                       # Точка входа
├── package.json
└── vite.config.ts (или vue.config.js)
```

### Ключевые особенности реализации:

1. **Создание таблицы через TanStack Table Core:**

   ```typescript
   import { createTable, getCoreRowModel } from '@tanstack/table-core';

   const table = createTable({
     data: data.value,
     columns: columnDefs.value,
     getCoreRowModel: getCoreRowModel(),
     state: {
       columnSizing: columnSizing.value,
       columnOrder: columnsOrder.value,
       columnVisibility: columnVisibility.value,
     },
     onColumnSizingChange: (updater) => {
       // Синхронизация с Vue 2 реактивностью
       columnSizing.value =
         typeof updater === 'function' ? updater(columnSizing.value) : updater;
     },
     enableColumnResizing: true,
     enableColumnVisibility: true,
   });
   ```

2. **Drag-and-Drop колонок:**
   - Используем нативный HTML5 Drag and Drop API для UI
   - После drop вызываем `table.setColumnOrder(newOrder)`
   - Адаптируем логику из `useSortable.ts` и `useDragNDropState.ts` из Vue3 версии
   - Поддержка визуального feedback (ghost element)
   - Поддержка свойства `reorderableColumn: false` для запрета перестановки

3. **Изменение ширины колонок (Column Resizing):**
   - Используем `header.getResizeHandler()` из TanStack Table
   - Resizer handle в правой части заголовка колонки
   - Визуальный feedback при наведении и активном ресайзе
   - TanStack Table автоматически управляет `columnSizing` state
   - Сохранение ширины колонок в localStorage
   - Встроенная поддержка `minSize` и `maxSize` из columnDef
   - Поддержка свойства `resizable: false` через `column.getCanResize()`
   - Адаптация стилей из Vue3 версии

4. **Управление видимостью колонок:**
   - Используем `column.getIsVisible()` и `column.toggleVisibility()` из TanStack Table
   - TanStack Table автоматически управляет `columnVisibility` state
   - Сохранение в localStorage (опционально)
   - Меню/панель для переключения видимости
   - Поддержка свойства `canNotManipulate: true` для запрета скрытия

5. **Совместимость с существующим проектом:**
   - Поддержка формата колонок из `table-columns.ts`
   - Трансформация в `ColumnDef` через `transformColumns` (адаптированная из Vue3 версии)
   - Поддержка свойств: `reorderableColumn`, `canNotManipulate`, `frozen`, `width`, `minSize`, `maxSize`
   - Минимальные изменения в существующем коде

### Зависимости (package.json):

```json
{
  "name": "gridforge-vue2",
  "version": "0.1.0",
  "peerDependencies": {
    "vue": "^2.7.8"
  },
  "dependencies": {
    "@tanstack/table-core": "^8.21.3"
  },
  "devDependencies": {
    "vue": "^2.7.8",
    "typescript": "~5.1.0",
    "@vue/cli-service": "^5.0.4",
    "vue-template-compiler": "^2.7.8"
  }
}
```

### Пример использования:

```vue
<template>
  <GridforgeTable
    :columns="columns"
    :data="data"
    :table-key="'my-table'"
    @column-reorder="handleColumnReorder"
    @column-resize="handleColumnResize"
    @column-visibility-change="handleVisibilityChange"
  />
</template>

<script lang="ts">
import { GridforgeTable } from 'gridforge-vue2';
import { tableColumns } from '@/constants/table/table-columns';

export default {
  components: { GridforgeTable },
  data() {
    return {
      columns: tableColumns.personList,
      data: [],
    };
  },
  methods: {
    handleColumnReorder(newOrder) {
      // Сохранение нового порядка колонок
    },
    handleColumnResize(columnSizes) {
      // Сохранение новых размеров колонок
      // columnSizes: { [columnKey]: width }
    },
    handleVisibilityChange(visibleColumns) {
      // Сохранение видимых колонок
    },
  },
};
</script>
```

## Итоговая рекомендация

**Использовать Вариант 1 (С TanStack Table Core):**

- Vue 2.7.8 с Composition API
- @tanstack/table-core для управления состоянием
- Нативный HTML5 Drag and Drop API для UI
- TypeScript
- Переиспользование логики из Vue3 версии

Это даст нам:

- ✅ Профессиональную библиотеку (~25-30KB gzipped)
- ✅ Быструю разработку (можно переиспользовать ~70-80% кода)
- ✅ Готовую, проверенную логику для resizing и visibility
- ✅ Production-ready решение
- ✅ Легкую интеграцию с существующим проектом
- ✅ Полный функционал: reorder, resize, visibility
- ✅ Легкое расширение в будущем (сортировка, фильтрация)

## Реализация с TanStack Table Core

### Технические детали:

**Подход:**

- Использование `@tanstack/table-core` для управления состоянием
- Нативные события мыши для UI взаимодействия
- Синхронизация состояния TanStack Table с Vue 2 реактивностью

**Реализация:**

1. **Создание таблицы:**

   ```typescript
   import { createTable, getCoreRowModel } from '@tanstack/table-core';
   import { ref, computed, watch } from 'vue';

   const columnSizing = ref({});
   const columnsOrder = ref([]);
   const columnVisibility = ref({});

   const table = createTable({
     data: data.value,
     columns: columnDefs.value,
     getCoreRowModel: getCoreRowModel(),
     state: {
       get columnSizing() {
         return columnSizing.value;
       },
       get columnOrder() {
         return columnsOrder.value;
       },
       get columnVisibility() {
         return columnVisibility.value;
       },
     },
     onColumnSizingChange: (updater) => {
       columnSizing.value =
         typeof updater === 'function' ? updater(columnSizing.value) : updater;
     },
     enableColumnResizing: true,
     enableColumnVisibility: true,
   });
   ```

2. **Column Resizing:**
   - Используем `header.getResizeHandler()` из TanStack Table
   - Resizer handle в правой части заголовка
   - TanStack Table автоматически обновляет `columnSizing` state
   - Встроенная валидация `minSize` и `maxSize`

   ```typescript
   // В TableHeaderCell.vue
   const resizerProps = computed(() => ({
     onMousedown: (e) => {
       e.preventDefault();
       header.getResizeHandler()(e);
     },
   }));
   ```

3. **Column Visibility:**
   - Используем `column.getIsVisible()` и `column.toggleVisibility()`
   - TanStack Table автоматически обновляет `columnVisibility` state

   ```typescript
   const isVisible = computed(() => column.getIsVisible());
   const toggleVisibility = () => column.toggleVisibility();
   ```

4. **Column Reordering:**
   - После drag-and-drop вызываем `table.setColumnOrder(newOrder)`
   - TanStack Table автоматически обновляет порядок колонок

   ```typescript
   function handleColumnDrop(sourceId, targetId) {
     const newOrder = reorderArray(columnsOrder.value, sourceId, targetId);
     table.setColumnOrder(newOrder);
   }
   ```

5. **Сохранение состояния:**
   - Сохраняем `columnSizing`, `columnOrder`, `columnVisibility` в localStorage
   - Восстанавливаем при инициализации таблицы
   - Используем `tableKey` для изоляции состояния разных таблиц
