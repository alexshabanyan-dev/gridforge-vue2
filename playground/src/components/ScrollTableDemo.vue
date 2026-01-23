<template>
  <section class="section">
    <h2>Таблица с горизонтальным скроллом</h2>
    <p class="section__description">
      Таблица визуально занимает 100% ширины родителя, но при этом появляется горизонтальный скролл,
      а ширина колонок берётся из <code>column.width</code>.
    </p>
    <GridforgeTable
      :data="rows"
      :columns="columns"
      layout="scroll"
      @columns-change="onColumnsChange"
    />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { GridforgeTable } from '@/index';
import type { TableColumn, TableRow } from '@/types';

export default Vue.extend({
  name: 'ScrollTableDemo',
  components: {
    GridforgeTable,
  },
  data() {
    return {
      columns: [
        {
          header: 'ID',
          field: 'id',
          columnKey: 'id',
          width: 60,
          minWidth: 50,
        },
        { header: 'Имя', field: 'name', columnKey: 'name', width: 200 },
        { header: 'Email', field: 'email', columnKey: 'email', width: 260 },
        { header: 'Возраст', field: 'age', columnKey: 'age', width: 100 },
        { header: 'Город', field: 'city', columnKey: 'city', width: 160 },
        { header: 'Профессия', field: 'jobTitle', columnKey: 'jobTitle', width: 220 },
        { header: 'Компания', field: 'company', columnKey: 'company', width: 220 },
        { header: 'Телефон', field: 'phone', columnKey: 'phone', width: 180 },
        { header: 'Страна', field: 'country', columnKey: 'country', width: 160 },
        { header: 'Адрес', field: 'address', columnKey: 'address', width: 300 },
        { header: 'Почтовый индекс', field: 'zip', columnKey: 'zip', width: 140 },
        { header: 'Статус', field: 'status', columnKey: 'status', width: 140 },
        { header: 'Создан', field: 'createdAt', columnKey: 'createdAt', width: 180 },
        {
          header: 'Обновлен',
          field: 'updatedAt',
          columnKey: 'updatedAt',
          width: 180,
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
          phone: '+7 (900) 000-00-01',
          country: 'Россия',
          address: 'ул. Ленина, 1',
          zip: '101000',
          status: 'Активен',
          createdAt: '2024-01-01',
          updatedAt: '2024-02-01',
        },
        {
          id: 2,
          name: 'Петр Петров',
          email: 'petr@example.com',
          age: 30,
          city: 'Санкт-Петербург',
          jobTitle: 'Backend Developer',
          company: 'Backend Inc',
          phone: '+7 (900) 000-00-02',
          country: 'Россия',
          address: 'Невский проспект, 10',
          zip: '191025',
          status: 'Активен',
          createdAt: '2024-01-05',
          updatedAt: '2024-02-03',
        },
        {
          id: 3,
          name: 'Мария Сидорова',
          email: 'maria@example.com',
          age: 28,
          city: 'Казань',
          jobTitle: 'Product Manager',
          company: 'Products LLC',
          phone: '+7 (900) 000-00-03',
          country: 'Россия',
          address: 'ул. Баумана, 15',
          zip: '420111',
          status: 'Неактивен',
          createdAt: '2024-01-10',
          updatedAt: '2024-02-05',
        },
        {
          id: 4,
          name: 'Алексей Смирнов',
          email: 'alex@example.com',
          age: 35,
          city: 'Новосибирск',
          jobTitle: 'DevOps Engineer',
          company: 'CloudOps',
          phone: '+7 (900) 000-00-04',
          country: 'Россия',
          address: 'ул. Советская, 20',
          zip: '630099',
          status: 'Активен',
          createdAt: '2024-01-15',
          updatedAt: '2024-02-10',
        },
        {
          id: 5,
          name: 'Елена Козлова',
          email: 'elena@example.com',
          age: 27,
          city: 'Екатеринбург',
          jobTitle: 'Designer',
          company: 'Design Studio',
          phone: '+7 (900) 000-00-05',
          country: 'Россия',
          address: 'ул. Малышева, 5',
          zip: '620014',
          status: 'В ожидании',
          createdAt: '2024-01-20',
          updatedAt: '2024-02-12',
        },
      ] as TableRow[],
    };
  },
  methods: {
    onColumnsChange(updatedColumns: TableColumn[]) {
      // Создаем полностью новый массив с новыми объектами
      this.columns = updatedColumns.map((col) => {
        const newCol: TableColumn = { ...col };
        if (col.alignFrozen) {
          newCol.alignFrozen = col.alignFrozen;
        }
        return newCol;
      });
    },
  },
});
</script>
