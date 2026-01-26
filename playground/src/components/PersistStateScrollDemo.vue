<template>
  <section class="section">
    <h2>Сохранение состояния (scroll)</h2>

    <GridforgeTable
      table-key="playground-persist-scroll"
      :data="paginatedRows"
      :columns="columns"
      layout="scroll"
      :page-size="pageSize"
      :pagination="pagination"
      :sort-by="sortBy"
      :action-column-params="actionColumnParams"
      @columns-change="onColumnsChange"
      @page-size-change="onPageSizeChange"
      @page-change="onPageChange"
      @sort-change="onSortChange"
      @row-edit="onRowEdit"
      @row-delete="onRowDelete"
    />
    <div class="persist-demo-divider" />
    <p class="section__description">
      Режим <code>layout="scroll"</code> с persist: колонки, пагинация,
      сортировка. Инициализация из <code>getTableState</code> при маунте.
    </p>

    <div class="persist-demo-panel">
      <div class="persist-demo-panel__block">
        <strong>getTableState</strong> при маунте:
        <pre class="persist-demo-panel__code">{{ getTableStateCode }}</pre>
      </div>
      <div class="persist-demo-panel__block">
        <strong>Текущие значения</strong> (таблица + «запросы»): pageSize
        {{ pageSize }}, currentPage {{ currentPage }}, sortBy
        <pre class="persist-demo-panel__pre">{{
          JSON.stringify(sortBy, null, 2)
        }}</pre>
      </div>
      <div class="persist-demo-panel__block">
        <strong>Снимок из storage</strong> (getTableState сейчас):
        <button
          type="button"
          class="persist-demo-panel__btn"
          @click="refreshStorageSnapshot"
        >
          Обновить
        </button>
        <pre class="persist-demo-panel__pre">{{
          JSON.stringify(storageSnapshot, null, 2)
        }}</pre>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import Vue from 'vue';
import { GridforgeTable, getTableState } from '@/index';
import type {
  TableColumn,
  TableRow,
  ActionColumnItem,
  SortState,
} from '@/types';

const TABLE_KEY = 'playground-persist-scroll';

const getTableStateCode = `const state = getTableState('${TABLE_KEY}');
const pageSize = state?.pagination?.pageSize ?? 10;
const currentPage = state?.pagination?.currentPage ?? 0;
const sortBy = state?.sort ?? [];`;

function buildAllRows(): TableRow[] {
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
  const rows: TableRow[] = [];
  for (let i = 1; i <= 150; i++) {
    const ni = (i - 1) % names.length;
    const si = Math.floor((i - 1) / names.length) % surnames.length;
    rows.push({
      id: i,
      name: `${names[ni]} ${surnames[si]}`,
      email: `user${i}@example.com`,
      age: 20 + (i % 40),
      city: cities[i % cities.length],
      jobTitle: jobs[i % jobs.length],
      company: `Company ${(i % 10) + 1}`,
      phone: `+7 (900) ${String(i).padStart(3, '0')}-00-00`,
      status:
        i % 3 === 0 ? 'Активен' : i % 3 === 1 ? 'Неактивен' : 'В ожидании',
      createdAt: `2024-${String((i % 12) + 1).padStart(2, '0')}-01`,
      updatedAt: `2024-${String((i % 12) + 1).padStart(2, '0')}-15`,
      deletable: i % 5 === 0 ? 'true' : undefined,
    });
  }
  return rows;
}

function sortRows(rows: TableRow[], sortBy: SortState[]): TableRow[] {
  if (!sortBy.length) return [...rows];
  return [...rows].sort((a, b) => {
    for (const s of sortBy) {
      const ka = a[s.id];
      const kb = b[s.id];
      const va = ka == null ? '' : String(ka);
      const vb = kb == null ? '' : String(kb);
      const cmp = va.localeCompare(vb, undefined, { numeric: true });
      if (cmp !== 0) return s.desc ? -cmp : cmp;
    }
    return 0;
  });
}

export default Vue.extend({
  name: 'PersistStateScrollDemo',
  components: {
    GridforgeTable,
  },
  data() {
    const allRows = buildAllRows();
    const state = getTableState(TABLE_KEY);
    const pageSize = state?.pagination?.pageSize ?? 10;
    const currentPage = state?.pagination?.currentPage ?? 0;
    const sortBy = (state?.sort?.length ? state.sort : []) as SortState[];

    return {
      getTableStateCode,
      allRows,
      pageSize,
      currentPage,
      sortBy,
      storageSnapshot: null as Record<string, unknown> | null,
      actionColumnParams: [
        { title: 'Редактировать', code: 'edit', emitEvent: 'row-edit' },
        {
          title: 'Удалить',
          code: 'delete',
          emitEvent: 'row-delete',
          visible: (row: TableRow) => !!row.deletable,
        },
      ] as ActionColumnItem[],
      columns: [
        { header: 'ID', field: 'id', columnKey: 'id', width: 60, minWidth: 50 },
        {
          header: 'Имя',
          field: 'name',
          columnKey: 'name',
          width: 200,
          sortable: true,
        },
        { header: 'Email', field: 'email', columnKey: 'email', width: 260 },
        {
          header: 'Возраст',
          field: 'age',
          columnKey: 'age',
          width: 100,
          sortable: true,
        },
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
          width: 220,
        },
        { header: 'Телефон', field: 'phone', columnKey: 'phone', width: 180 },
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
          width: 180,
        },
        {
          header: 'Обновлен',
          field: 'updatedAt',
          columnKey: 'updatedAt',
          width: 180,
        },
      ] as TableColumn[],
    };
  },
  computed: {
    sortedRows(): TableRow[] {
      return sortRows(this.allRows, this.sortBy);
    },
    paginatedRows(): TableRow[] {
      const start = this.currentPage * this.pageSize;
      const end = start + this.pageSize;
      return this.sortedRows.slice(start, end);
    },
    pagination(): {
      totalElements: number;
      currentPage: number;
      pageSize: number;
    } {
      return {
        totalElements: this.sortedRows.length,
        currentPage: this.currentPage,
        pageSize: this.pageSize,
      };
    },
  },
  mounted() {
    this.refreshStorageSnapshot();
  },
  methods: {
    refreshStorageSnapshot() {
      const state = getTableState(TABLE_KEY);
      this.storageSnapshot = state
        ? (JSON.parse(JSON.stringify(state)) as Record<string, unknown>)
        : null;
    },
    onColumnsChange(updatedColumns: TableColumn[]) {
      this.columns = updatedColumns.map((col) => {
        const newCol: TableColumn = { ...col };
        if (col.alignFrozen) newCol.alignFrozen = col.alignFrozen;
        return newCol;
      });
    },
    onPageSizeChange(newSize: number) {
      const firstIdx = this.currentPage * this.pageSize;
      const newPage = Math.min(
        Math.floor(firstIdx / newSize),
        Math.ceil(this.sortedRows.length / newSize) - 1,
      );
      this.pageSize = newSize;
      this.currentPage = Math.max(0, newPage);
      this.refreshStorageSnapshot();
    },
    onPageChange(page: number | 'previous' | 'next') {
      const total = this.sortedRows.length;
      const maxPage = Math.ceil(total / this.pageSize) - 1;
      if (typeof page === 'number') {
        this.currentPage = Math.max(0, Math.min(page, maxPage));
      } else if (page === 'previous') {
        this.currentPage = Math.max(0, this.currentPage - 1);
      } else {
        this.currentPage = Math.min(maxPage, this.currentPage + 1);
      }
      this.refreshStorageSnapshot();
    },
    onSortChange(nextSort: SortState[]) {
      this.sortBy = nextSort.map((s) => ({ ...s }));
      this.currentPage = 0;
      this.refreshStorageSnapshot();
    },
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

<style scoped>
.persist-demo-divider {
  margin: 24px 0;
  border: none;
  border-top: 1px solid #e2e8f0;
}

.persist-demo-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
}

.persist-demo-panel__block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.persist-demo-panel__code,
.persist-demo-panel__pre {
  margin: 0;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.persist-demo-panel__btn {
  align-self: flex-start;
  padding: 6px 12px;
  font-size: 12px;
  color: #334155;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
}

.persist-demo-panel__btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}
</style>
