<template>
  <section class="section">
    <h2>Базовая таблица</h2>
    <p class="section__description">
      Таблица растягивается на всю ширину родителя, ширина колонок
      распределяется автоматически.
    </p>
    <GridforgeTable
      :data="rows"
      :columns="columns"
    />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { GridforgeTable } from '@/index';
import type { TableColumn, TableRow } from '@/types';

export default Vue.extend({
  name: 'BasicTableDemo',
  components: {
    GridforgeTable,
  },
  data() {
    return {
      columns: [
        { header: 'ID', field: 'id', columnKey: 'id' },
        { header: 'Имя', field: 'name', columnKey: 'name' },
        { header: 'Email', field: 'email', columnKey: 'email' },
        { header: 'Возраст', field: 'age', columnKey: 'age' },
        { header: 'Город', field: 'city', columnKey: 'city' },
      ] as TableColumn[],
      rows: [
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
    };
  },
});
</script>
