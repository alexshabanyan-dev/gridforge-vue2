<template>
  <div id="app">
    <div class="container">
      <header class="header">
        <h1>GridForge Vue2 - Playground</h1>
        <p>Тестовая страница для проверки работы таблицы</p>
      </header>

      <div class="layout">
        <aside class="sidebar">
          <nav class="sidebar-nav">
            <button
              class="sidebar-nav__item"
              :class="{ 'sidebar-nav__item--active': activePage === 'basic' }"
              @click="activePage = 'basic'"
            >
              Базовая таблица
            </button>
            <button
              class="sidebar-nav__item"
              :class="{ 'sidebar-nav__item--active': activePage === 'scroll' }"
              @click="activePage = 'scroll'"
            >
              Таблица с горизонтальным скроллом
            </button>
          </nav>
        </aside>

        <main class="main">
          <BasicTableDemo v-if="activePage === 'basic'" />
          <ScrollTableDemo v-else-if="activePage === 'scroll'" />
        </main>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BasicTableDemo from './components/BasicTableDemo.vue';
import ScrollTableDemo from './components/ScrollTableDemo.vue';

export default Vue.extend({
  name: 'App',
  components: {
    BasicTableDemo,
    ScrollTableDemo,
  },
  data() {
    return {
      activePage: 'basic' as 'basic' | 'scroll',
    };
  },
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
  align-items: flex-start;
}

.sidebar {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 20px;
  align-self: flex-start;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar-nav__item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.sidebar-nav__item:hover {
  background-color: #f1f3f5;
}

.sidebar-nav__item--active {
  background-color: #0d6efd;
  color: #ffffff;
}

.header {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header h1 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #2c3e50;
}

.header p {
  font-size: 16px;
  color: #6c757d;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 30px;
  /* важно для grid: позволяем содержимому ужиматься и не растягивать всю страницу */
  min-width: 0;
}

.section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* чтобы таблица внутри могла скроллиться, а не растягивать колонку grid */
  min-width: 0;
}

.section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.section__description {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 16px;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }
}
</style>
