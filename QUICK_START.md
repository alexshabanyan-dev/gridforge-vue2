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

Playground откроется на `http://localhost:8080`.

**Важно:** Playground импортирует компоненты напрямую из `../src/`, поэтому изменения в библиотеке сразу видны без пересборки.

### Local test playground (Machinery)

Рядом с `playground` есть папка **`local-test-playground/`** (в .gitignore, не коммитится). В ней — только MachinerySearch Count / TotalElements и запросы к API. Запуск: `cd local-test-playground && npm install && npm run dev` (порт **8081**). Заполни `BEARER_TOKEN` и при необходимости `MACHINERY_API_BASE_URL` в `local-test-playground/src/test/auth.ts`.

## Структура проекта

```
gridforge-vue2/
├── src/                    # Исходный код библиотеки
│   ├── components/         # Vue компоненты
│   ├── styles/            # Стили
│   ├── types.ts           # TypeScript типы
│   └── index.ts           # Точка входа
├── playground/            # Тестовая среда (демо таблицы), порт 8080
│   ├── src/
│   │   ├── App.vue
│   │   └── main.ts
│   └── index.html
├── local-test-playground/ # Machinery API тесты (gitignore), порт 8081
├── dist/                  # Собранная библиотека (после build)
├── package.json
├── vite.config.ts         # Конфигурация сборки библиотеки
└── tsconfig.json
```

## Сборка библиотеки

```bash
npm run build
```

Собирается **только** библиотека (в `dist/`). `playground` и `local-test-playground` в сборку не входят; у каждого свой `npm run build` при необходимости.

Результат в `dist/`:

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
