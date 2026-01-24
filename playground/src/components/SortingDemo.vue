<template>
  <section class="section">
    <h2>Сортировка (server-side)</h2>
    <p class="section__description">
      Пример использования server-side сортировки с мультисортировкой. Клик по
      иконке сортировки переключает состояние: None → ASC → DESC → None. Можно
      сортировать по нескольким колонкам одновременно.
    </p>
    <GridforgeTable
      :data="rows"
      :columns="columns"
      :sort-by="sortBy"
      layout="scroll"
      @sort-change="onSortChange"
    />
    <div
      style="
        margin-top: 16px;
        padding: 12px;
        background: #f3f4f6;
        border-radius: 6px;
        font-size: 13px;
      "
    >
      <strong>Текущая сортировка:</strong>
      <pre style="margin: 8px 0 0 0; font-size: 12px">{{
        JSON.stringify(sortBy, null, 2)
      }}</pre>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { GridforgeTable } from '@/index';
import type { TableColumn, TableRow, SortState } from '@/types';

export default Vue.extend({
  name: 'SortingDemo',
  components: {
    GridforgeTable,
  },
  data() {
    return {
      // Начальное значение сортировки
      sortBy: [{ id: 'name', desc: false }] as SortState[],
      columns: [
        { header: 'ID', field: 'id', columnKey: 'id', width: 60 },
        {
          header: 'Имя',
          field: 'name',
          columnKey: 'name',
          width: 200,
          sortable: true,
        },
        { header: 'Email', field: 'email', columnKey: 'email', width: 260 },
        { header: 'Возраст', field: 'age', columnKey: 'age', width: 100 },
        {
          header: 'Город',
          field: 'city',
          columnKey: 'city',
          width: 160,
          sortable: true,
        },
        {
          header: 'Профессия',
          field: 'jobTitle',
          columnKey: 'jobTitle',
          width: 220,
          sortable: true,
        },
        {
          header: 'Компания',
          field: 'company',
          columnKey: 'company',
          width: 180,
          sortable: true,
        },
        {
          header: 'Статус',
          field: 'status',
          columnKey: 'status',
          width: 140,
          sortable: true,
        },
        {
          header: 'Создан',
          field: 'createdAt',
          columnKey: 'createdAt',
          width: 140,
          sortable: true,
        },
      ] as TableColumn[],
      rows: [
        {
          id: 1,
          name: 'Иван Иванов',
          email: 'ivan@example.com',
          age: 25,
          city: 'Москва',
          jobTitle: 'Frontend Developer',
          company: 'TechCorp',
          status: 'Активен',
          createdAt: '2024-01-01',
        },
        {
          id: 2,
          name: 'Петр Петров',
          email: 'petr@example.com',
          age: 30,
          city: 'Санкт-Петербург',
          jobTitle: 'Backend Developer',
          company: 'Backend Inc',
          status: 'Активен',
          createdAt: '2024-01-05',
        },
        {
          id: 3,
          name: 'Мария Сидорова',
          email: 'maria@example.com',
          age: 28,
          city: 'Казань',
          jobTitle: 'Product Manager',
          company: 'Products LLC',
          status: 'Неактивен',
          createdAt: '2024-01-10',
        },
        {
          id: 4,
          name: 'Алексей Смирнов',
          email: 'alex@example.com',
          age: 35,
          city: 'Новосибирск',
          jobTitle: 'DevOps Engineer',
          company: 'CloudOps',
          status: 'Активен',
          createdAt: '2024-01-15',
        },
        {
          id: 5,
          name: 'Елена Козлова',
          email: 'elena@example.com',
          age: 27,
          city: 'Екатеринбург',
          jobTitle: 'Designer',
          company: 'Design Studio',
          status: 'В ожидании',
          createdAt: '2024-01-20',
        },
        {
          id: 6,
          name: 'Дмитрий Новиков',
          email: 'dmitry@example.com',
          age: 32,
          city: 'Нижний Новгород',
          jobTitle: 'QA Engineer',
          company: 'TestCorp',
          status: 'Активен',
          createdAt: '2024-01-25',
        },
        {
          id: 7,
          name: 'Анна Морозова',
          email: 'anna@example.com',
          age: 29,
          city: 'Челябинск',
          jobTitle: 'Data Scientist',
          company: 'DataLab',
          status: 'Активен',
          createdAt: '2024-02-01',
        },
        {
          id: 8,
          name: 'Сергей Волков',
          email: 'sergey@example.com',
          age: 33,
          city: 'Самара',
          jobTitle: 'Team Lead',
          company: 'LeadCorp',
          status: 'Активен',
          createdAt: '2024-02-05',
        },
      ] as TableRow[],
    };
  },
  methods: {
    onSortChange(nextSort: SortState[]) {
      // Обновляем sortBy - в реальном приложении здесь был бы запрос на сервер
      this.sortBy = nextSort.map((sort) => ({ ...sort }));
      console.log('Sort changed:', nextSort);
    },
  },
});
</script>
