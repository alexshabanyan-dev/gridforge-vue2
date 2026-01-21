# Быстрый старт

## Установка зависимостей

```bash
# Установка зависимостей для библиотеки
npm install

# Установка зависимостей для playground
cd playground
npm install
cd ..
```

## Запуск playground

Playground - это отдельное приложение, которое импортирует компоненты из библиотеки:

```bash
cd playground
npm install  # если еще не установлены зависимости
npm run dev
```

Playground откроется автоматически на `http://localhost:3000`

**Важно:** Playground импортирует компоненты напрямую из `../src/`, поэтому изменения в библиотеке сразу видны в playground без пересборки.

## Структура проекта

```
gridforge-vue2/
├── src/                    # Исходный код библиотеки
│   ├── components/         # Vue компоненты
│   ├── styles/            # Стили
│   ├── types.ts           # TypeScript типы
│   └── index.ts           # Точка входа
├── playground/            # Тестовая среда
│   ├── src/
│   │   ├── App.vue        # Главный компонент playground
│   │   └── main.ts        # Точка входа playground
│   └── index.html
├── dist/                  # Собранная библиотека (после build)
├── package.json
├── vite.config.ts         # Конфигурация сборки библиотеки
└── tsconfig.json
```

## Сборка библиотеки

```bash
npm run build
```

Результат будет в папке `dist/`:
- `gridforge-vue2.es.js` - ES модуль
- `gridforge-vue2.umd.js` - UMD модуль  
- `style.css` - стили
- `index.d.ts` - TypeScript типы

## Текущий функционал

✅ Базовая таблица с выводом данных
✅ Поддержка ширины колонок (width)
✅ Поддержка minWidth и maxWidth
✅ Базовые стили

## Следующие шаги

- [ ] Интеграция TanStack Table Core
- [ ] Drag-and-drop для перестановки колонок
- [ ] Изменение ширины колонок (resizing)
- [ ] Управление видимостью колонок
- [ ] Сохранение состояния в localStorage
