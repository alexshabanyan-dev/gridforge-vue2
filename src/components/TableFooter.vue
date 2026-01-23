<template>
  <div
    class="gf-table__footer"
    :class="{
      'gf-table__footer--with-total': pagination,
    }"
  >
    <!-- Режим с totalElements: слева текст, по центру пагинация, справа pageSizeChanger -->
    <template v-if="pagination">
      <div class="gf-table__footer-total">Найдено записей — {{ pagination.totalElements }}</div>
      <Pagination :pagination="pagination" @page-change="onPageChange" />
      <PageSizeSelector :value="pageSize" :options="pageSizeOptions" @change="onPageSizeChange" />
    </template>

    <!-- Режим без totalElements: слева pageSizeChanger, справа пагинация -->
    <template v-else>
      <PageSizeSelector :value="pageSize" :options="pageSizeOptions" @change="onPageSizeChange" />
      <Pagination :pagination-flags="paginationFlags" @page-change="onPageChange" />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { PaginationWithTotal, PaginationWithFlags } from '../types';
import PageSizeSelector from './PageSizeSelector.vue';
import Pagination from './Pagination.vue';

export default Vue.extend({
  name: 'TableFooter',
  components: {
    PageSizeSelector,
    Pagination,
  },
  props: {
    pageSize: {
      type: Number,
      default: 10,
    },
    pageSizeOptions: {
      type: Array as PropType<number[]>,
      default: () => [10, 20, 50, 100, 200],
    },
    pagination: {
      type: Object as PropType<PaginationWithTotal | undefined>,
      default: undefined,
    },
    paginationFlags: {
      type: Object as PropType<PaginationWithFlags | undefined>,
      default: undefined,
    },
  },
  methods: {
    onPageSizeChange(newSize: number) {
      this.$emit('page-size-change', newSize);
    },
    onPageChange(page: number | 'previous' | 'next') {
      this.$emit('page-change', page);
    },
  },
});
</script>
