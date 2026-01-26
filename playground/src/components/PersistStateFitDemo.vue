<template>
  <section class="section">
    <h2>Сохранение состояния (fit)</h2>
    <p class="section__description">
      Режим <code>layout="fit"</code> с включённым сохранением в localStorage.
      Скрывайте колонки, меняйте ширину — состояние восстановится после
      перезагрузки.
    </p>
    <GridforgeTable
      table-key="playground-persist-fit"
      :data="rows"
      :columns="columns"
      :action-column-params="actionColumnParams"
      @row-edit="onRowEdit"
      @row-delete="onRowDelete"
    />
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { GridforgeTable } from '@/index';
import type { TableColumn, TableRow, ActionColumnItem } from '@/types';

export default Vue.extend({
  name: 'PersistStateFitDemo',
  components: {
    GridforgeTable,
  },
  data() {
    return {
      actionColumnParams: [
        { title: 'Редактировать', code: 'edit', emitEvent: 'row-edit' },
        { title: 'Удалить', code: 'delete', emitEvent: 'row-delete' },
      ] as ActionColumnItem[],
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
  methods: {
    onRowEdit(payload: { row: TableRow; code: string }) {
      // eslint-disable-next-line no-console
      console.log('row-edit', payload);
    },
    onRowDelete(payload: { row: TableRow; code: string }) {
      // eslint-disable-next-line no-console
      console.log('row-delete', payload);
    },
  },
});
</script>
