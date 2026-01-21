<template>
  <div id="app">
    <div class="container">
      <header class="header">
        <h1>GridForge Vue2 - Playground</h1>
        <p>Тестовая страница для проверки работы таблицы</p>
      </header>

      <main class="main">
        <section class="section">
          <h2>Базовая таблица</h2>
          <GridforgeTable :data="sampleData" :columns="columns" />
        </section>

        <section class="section">
          <h2>Таблица с фиксированными ширинами</h2>
          <GridforgeTable :data="sampleData" :columns="columnsWithWidths" />
        </section>

        <section class="section">
          <h2>Таблица с разными типами данных</h2>
          <GridforgeTable :data="mixedData" :columns="mixedColumns" />
        </section>
      </main>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { GridforgeTable } from '@/index';
import type { TableColumn, TableRow } from '@/types';

export default Vue.extend({
  name: 'App',
  components: {
    GridforgeTable,
  },
  data() {
    return {
      // Базовые колонки без указания ширины
      columns: [
        { header: 'ID', field: 'id', columnKey: 'id' },
        { header: 'Имя', field: 'name', columnKey: 'name' },
        { header: 'Email', field: 'email', columnKey: 'email' },
        { header: 'Возраст', field: 'age', columnKey: 'age' },
        { header: 'Город', field: 'city', columnKey: 'city' },
      ] as TableColumn[],

      // Колонки с фиксированными ширинами
      columnsWithWidths: [
        { header: 'ID', field: 'id', columnKey: 'id', width: 80 },
        { header: 'Имя', field: 'name', columnKey: 'name', width: 200 },
        { header: 'Email', field: 'email', columnKey: 'email', width: 250 },
        { header: 'Возраст', field: 'age', columnKey: 'age', width: 100 },
        { header: 'Город', field: 'city', columnKey: 'city', width: 150 },
      ] as TableColumn[],

      // Колонки для смешанных данных
      mixedColumns: [
        { header: 'ID', field: 'id', columnKey: 'id', width: 80 },
        { header: 'Название', field: 'title', columnKey: 'title', width: 300 },
        { header: 'Цена', field: 'price', columnKey: 'price', width: 120 },
        { header: 'В наличии', field: 'inStock', columnKey: 'inStock', width: 120 },
        { header: 'Дата', field: 'date', columnKey: 'date', width: 150 },
      ] as TableColumn[],

      // Пример данных
      sampleData: [
        {
          id: 1,
          name: 'Иван Иванов',
          email: 'ivan@example.com',
          age: 25,
          city: 'Москва',
        },
        {
          id: 2,
          name: 'Петр Петров',
          email: 'petr@example.com',
          age: 30,
          city: 'Санкт-Петербург',
        },
        {
          id: 3,
          name: 'Мария Сидорова',
          email: 'maria@example.com',
          age: 28,
          city: 'Казань',
        },
        {
          id: 4,
          name: 'Алексей Смирнов',
          email: 'alex@example.com',
          age: 35,
          city: 'Новосибирск',
        },
        {
          id: 5,
          name: 'Елена Козлова',
          email: 'elena@example.com',
          age: 27,
          city: 'Екатеринбург',
        },
      ] as TableRow[],

      // Смешанные данные
      mixedData: [
        {
          id: 1,
          title: 'Ноутбук',
          price: 50000,
          inStock: true,
          date: '2024-01-15',
        },
        {
          id: 2,
          title: 'Мышь',
          price: 1500,
          inStock: false,
          date: '2024-01-20',
        },
        {
          id: 3,
          title: 'Клавиатура',
          price: 3000,
          inStock: true,
          date: '2024-02-01',
        },
        {
          id: 4,
          title: 'Монитор',
          price: 25000,
          inStock: true,
          date: '2024-02-10',
        },
      ] as TableRow[],
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
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
}

.section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #2c3e50;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}
</style>
