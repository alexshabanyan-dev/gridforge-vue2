<template>
  <div class="gf-table__pagination">
    <!-- Режим с известным totalElements -->
    <template v-if="pagination">
      <button
        class="gf-table__pagination-button"
        :class="{ 'gf-table__pagination-button--disabled': currentPage === 0 }"
        :disabled="currentPage === 0"
        @click="goToPage(0)"
      >
        Первая
      </button>
      <button
        class="gf-table__pagination-button"
        :class="{ 'gf-table__pagination-button--disabled': currentPage === 0 }"
        :disabled="currentPage === 0"
        @click="goToPage(currentPage - 1)"
      >
        ‹
      </button>

      <template v-for="(page, index) in visiblePages">
        <button
          v-if="page !== '...'"
          :key="`page-${index}-${page}`"
          class="gf-table__pagination-button"
          :class="{
            'gf-table__pagination-button--active': page === currentPage,
          }"
          @click="goToPage(Number(page))"
        >
          {{ Number(page) + 1 }}
        </button>
        <span
          v-else
          :key="`ellipsis-${index}`"
          class="gf-table__pagination-ellipsis"
        >
          ...
        </span>
      </template>

      <button
        class="gf-table__pagination-button"
        :class="{
          'gf-table__pagination-button--disabled':
            currentPage === totalPages - 1,
        }"
        :disabled="currentPage === totalPages - 1"
        @click="goToPage(currentPage + 1)"
      >
        ›
      </button>
      <button
        class="gf-table__pagination-button"
        :class="{
          'gf-table__pagination-button--disabled':
            currentPage === totalPages - 1,
        }"
        :disabled="currentPage === totalPages - 1"
        @click="goToPage(totalPages - 1)"
      >
        Последняя
      </button>
    </template>

    <!-- Режим с isFirst/isLast -->
    <template v-else-if="paginationFlags">
      <button
        class="gf-table__pagination-button"
        :class="{
          'gf-table__pagination-button--disabled': paginationFlags.isFirst,
        }"
        :disabled="paginationFlags.isFirst"
        @click="goToPrevious"
      >
        ‹ Назад
      </button>
      <button
        class="gf-table__pagination-button"
        :class="{
          'gf-table__pagination-button--disabled': paginationFlags.isLast,
        }"
        :disabled="paginationFlags.isLast"
        @click="goToNext"
      >
        Вперёд ›
      </button>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import type { PropType } from 'vue';
import type { PaginationWithTotal, PaginationWithFlags } from '../types';

export default Vue.extend({
  name: 'Pagination',
  props: {
    pagination: {
      type: Object as PropType<PaginationWithTotal | undefined>,
      default: undefined,
    },
    paginationFlags: {
      type: Object as PropType<PaginationWithFlags | undefined>,
      default: undefined,
    },
  },
  computed: {
    currentPage(): number {
      if (this.pagination) {
        // Предполагаем, что currentPage начинается с 0 (внутренняя логика)
        // Если пользователь передал currentPage начиная с 1, нужно будет конвертировать
        return this.pagination.currentPage >= 0
          ? this.pagination.currentPage
          : 0;
      }
      return 0;
    },
    totalPages(): number {
      if (!this.pagination) return 0;
      return Math.ceil(
        this.pagination.totalElements / this.pagination.pageSize,
      );
    },
    visiblePages(): Array<number | string> {
      if (!this.pagination) return [];

      const current = this.currentPage;
      const total = this.totalPages;
      const pages: Array<number | string> = [];

      if (total <= 7) {
        // Если страниц мало, показываем все
        for (let i = 0; i < total; i++) {
          pages.push(i);
        }
      } else {
        // Всегда показываем первую страницу
        pages.push(0);

        if (current <= 3) {
          // Близко к началу
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total - 1);
        } else if (current >= total - 4) {
          // Близко к концу
          pages.push('...');
          for (let i = total - 5; i < total; i++) {
            pages.push(i);
          }
        } else {
          // В середине
          pages.push('...');
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(total - 1);
        }
      }

      return pages;
    },
  },
  methods: {
    goToPage(page: number) {
      if (this.pagination) {
        this.$emit('page-change', page);
      }
    },
    goToPrevious() {
      this.$emit('page-change', 'previous');
    },
    goToNext() {
      this.$emit('page-change', 'next');
    },
  },
});
</script>
