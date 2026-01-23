<template>
  <div id="app">
    <div class="container">
      <div class="layout">
        <aside class="sidebar">
          <div class="sidebar__header">
            <h1 class="sidebar__title">GridForge Vue2</h1>
          </div>
          <nav class="sidebar-nav">
            <!-- Раздел: Базовая таблица -->
            <div class="sidebar-nav__section">
              <div class="sidebar-nav__section-title">Базовая таблица</div>
              <button
                class="sidebar-nav__item sidebar-nav__item--sub"
                :class="{ 'sidebar-nav__item--active': activeSection === 'basic' && activePage === 'basic' }"
                @click="setActivePage('basic', 'basic')"
              >
                Базовая таблица
              </button>
              <button
                class="sidebar-nav__item sidebar-nav__item--sub"
                :class="{ 'sidebar-nav__item--active': activeSection === 'basic' && activePage === 'scroll' }"
                @click="setActivePage('basic', 'scroll')"
              >
                Таблица со скроллом
              </button>
            </div>

            <!-- Раздел: Пагинация -->
            <div class="sidebar-nav__section">
              <div class="sidebar-nav__section-title">Пагинация</div>
              <button
                class="sidebar-nav__item sidebar-nav__item--sub"
                :class="{ 'sidebar-nav__item--active': activeSection === 'pagination' && activePage === 'pagination-with-count' }"
                @click="setActivePage('pagination', 'pagination-with-count')"
              >
                Пагинация с count
              </button>
              <button
                class="sidebar-nav__item sidebar-nav__item--sub"
                :class="{ 'sidebar-nav__item--active': activeSection === 'pagination' && activePage === 'pagination-without-count' }"
                @click="setActivePage('pagination', 'pagination-without-count')"
              >
                Пагинация без count
              </button>
            </div>
          </nav>
        </aside>

        <main class="main">
          <BasicTableDemo v-if="activePage === 'basic'" />
          <ScrollTableDemo v-else-if="activePage === 'scroll'" />
          <PaginationTableDemo v-else-if="activePage === 'pagination-with-count'" />
          <PaginationWithoutCountDemo v-else-if="activePage === 'pagination-without-count'" />
        </main>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import BasicTableDemo from './components/BasicTableDemo.vue';
import ScrollTableDemo from './components/ScrollTableDemo.vue';
import PaginationTableDemo from './components/PaginationTableDemo.vue';
import PaginationWithoutCountDemo from './components/PaginationWithoutCountDemo.vue';

export default Vue.extend({
  name: 'App',
  components: {
    BasicTableDemo,
    ScrollTableDemo,
    PaginationTableDemo,
    PaginationWithoutCountDemo,
  },
  data() {
    // Читаем из URL при инициализации
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section') || 'basic';
    const page = urlParams.get('page') || 'basic';
    
    // Определяем валидные комбинации
    const validCombinations: Record<string, string[]> = {
      basic: ['basic', 'scroll'],
      pagination: ['pagination-with-count', 'pagination-without-count'],
    };
    
    const validSection = validCombinations[section] ? section : 'basic';
    const validPage = validCombinations[validSection]?.includes(page) 
      ? page 
      : validCombinations[validSection][0];
    
    return {
      activeSection: validSection as 'basic' | 'pagination',
      activePage: validPage as 'basic' | 'scroll' | 'pagination-with-count' | 'pagination-without-count',
    };
  },
  watch: {
    activePage() {
      this.updateUrl();
    },
    activeSection() {
      this.updateUrl();
    },
  },
  methods: {
    setActivePage(section: 'basic' | 'pagination', page: string) {
      this.activeSection = section;
      this.activePage = page as any;
    },
    updateUrl() {
      const url = new URL(window.location.href);
      url.searchParams.set('section', this.activeSection);
      url.searchParams.set('page', this.activePage);
      window.history.replaceState({}, '', url.toString());
    },
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
  background-color: #ffffff;
  min-height: 100vh;
  height: 100vh;
  overflow: hidden;
}

.container {
  max-width: 100%;
  margin: 0;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}

.layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  min-width: 250px;
  background: linear-gradient(to bottom, #f8fafc 0%, #f1f5f9 100%);
  border-right: 1px solid rgba(226, 232, 240, 0.8);
  padding: 0;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  padding: 12px 0;
  flex: 1;
  overflow-y: auto;
  gap: 0;
}

.sidebar-nav__section {
  display: flex;
  flex-direction: column;
  margin-bottom: 24px;
}

.sidebar-nav__section:last-child {
  margin-bottom: 0;
}

.sidebar-nav__section-title {
  margin: 0 0 8px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 10px 20px;
  border: none;
  border-left: 3px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0;
}

.sidebar-nav__item:hover {
  background: rgba(59, 130, 246, 0.05);
  color: #0ea5e9;
}

.sidebar-nav__item--active {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  border-left-color: #2563eb;
  font-weight: 600;
}

.sidebar-nav__item--sub {
  padding-left: 20px;
  font-size: 14px;
}

.sidebar__header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.sidebar__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.header {
  display: none;
}

.main {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 24px;
  /* важно для grid: позволяем содержимому ужиматься и не растягивать всю страницу */
  min-width: 0;
  background: #ffffff;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
}

.section {
  background: white;
  padding: 30px;
  border-radius: 0;
  box-shadow: none;
  /* чтобы таблица внутри могла скроллиться, а не растягивать колонку grid */
  min-width: 0;
  flex: 1;
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

/* Стилизация скроллбара для sidebar */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
    height: auto;
    max-height: none;
  }
}
</style>
