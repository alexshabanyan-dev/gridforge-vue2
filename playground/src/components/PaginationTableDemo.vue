<template>
  <section class="section">
    <h2>Пагинация с count</h2>
    <p class="section__description">
      Пример использования пагинации с известным общим количеством элементов
      (totalElements). Можно выбрать размер страницы и переключаться между
      страницами с отображением номеров страниц.
    </p>
    <GridforgeTable
      :data="paginatedRows"
      :columns="columns"
      :page-size="pageSize"
      :pagination="pagination"
      @page-size-change="onPageSizeChange"
      @page-change="onPageChange"
      layout="scroll"
    />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { GridforgeTable } from '@/index';
import type { TableColumn, TableRow } from '@/types';

export default Vue.extend({
  name: 'PaginationTableDemo',
  components: {
    GridforgeTable,
  },
  data() {
    // Генерируем больше данных для демонстрации пагинации
    const allRows: TableRow[] = [];
    const names = [
      'Иван',
      'Петр',
      'Мария',
      'Алексей',
      'Елена',
      'Дмитрий',
      'Анна',
      'Сергей',
    ];
    const surnames = [
      'Иванов',
      'Петров',
      'Сидорова',
      'Смирнов',
      'Козлова',
      'Новиков',
      'Морозова',
      'Волков',
    ];
    const cities = [
      'Москва',
      'Санкт-Петербург',
      'Казань',
      'Новосибирск',
      'Екатеринбург',
      'Нижний Новгород',
      'Челябинск',
      'Самара',
    ];
    const jobs = [
      'Frontend Developer',
      'Backend Developer',
      'Product Manager',
      'DevOps Engineer',
      'Designer',
      'QA Engineer',
      'Data Scientist',
      'Team Lead',
    ];

    for (let i = 1; i <= 150; i++) {
      const nameIndex = (i - 1) % names.length;
      const surnameIndex = Math.floor((i - 1) / names.length) % surnames.length;
      allRows.push({
        id: i,
        name: `${names[nameIndex]} ${surnames[surnameIndex]}`,
        email: `user${i}@example.com`,
        age: 20 + (i % 40),
        city: cities[i % cities.length],
        jobTitle: jobs[i % jobs.length],
        company: `Company ${(i % 10) + 1}`,
        phone: `+7 (900) ${String(i).padStart(3, '0')}-${String(i * 2).padStart(2, '0')}-${String(i * 3).padStart(2, '0')}`,
        status:
          i % 3 === 0 ? 'Активен' : i % 3 === 1 ? 'Неактивен' : 'В ожидании',
        createdAt: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        updatedAt: `2024-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      });
    }

    return {
      allRows,
      pageSize: 10,
      currentPage: 0,
      columns: [
        { header: 'ID', field: 'id', columnKey: 'id', width: 60 },
        { header: 'Имя', field: 'name', columnKey: 'name', width: 200 },
        { header: 'Email', field: 'email', columnKey: 'email', width: 260 },
        { header: 'Возраст', field: 'age', columnKey: 'age', width: 100 },
        { header: 'Город', field: 'city', columnKey: 'city', width: 160 },
        {
          header: 'Профессия',
          field: 'jobTitle',
          columnKey: 'jobTitle',
          width: 220,
        },
        {
          header: 'Компания',
          field: 'company',
          columnKey: 'company',
          width: 180,
        },
        { header: 'Телефон', field: 'phone', columnKey: 'phone', width: 180 },
        { header: 'Статус', field: 'status', columnKey: 'status', width: 140 },
        {
          header: 'Создан',
          field: 'createdAt',
          columnKey: 'createdAt',
          width: 140,
        },
        {
          header: 'Обновлен',
          field: 'updatedAt',
          columnKey: 'updatedAt',
          width: 140,
        },
      ] as TableColumn[],
    };
  },
  computed: {
    paginatedRows(): TableRow[] {
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;
      return this.allRows.slice(start, end);
    },
    pagination() {
      return {
        totalElements: this.allRows.length,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      };
    },
  },
  methods: {
    onPageSizeChange(newSize: number) {
      console.log('🚀 ~ newSize:', newSize);
      // Вычисляем новую страницу, чтобы сохранить видимость текущих элементов
      const firstItemIndex = this.currentPage * this.pageSize;
      const newPage = Math.floor(firstItemIndex / newSize);

      this.pageSize = newSize;
      this.currentPage = newPage;
    },
    onPageChange(page: number | 'previous' | 'next') {
      console.log('🚀 ~ page:', page);
      if (typeof page === 'number') {
        this.currentPage = page;
      } else if (page === 'previous') {
        this.currentPage = Math.max(0, this.currentPage - 1);
      } else if (page === 'next') {
        const maxPage = Math.ceil(this.allRows.length / this.pageSize) - 1;
        this.currentPage = Math.min(maxPage, this.currentPage + 1);
      }
    },
  },
});
</script>
