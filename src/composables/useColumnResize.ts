import { ref, computed, nextTick, type Ref } from 'vue';
import type { TableColumn } from '../types';

export interface UseColumnResizeProps {
  column: TableColumn;
  columnSizing: Ref<Record<string, number>>;
  onResize?: (columnKey: string, newWidth: number) => void;
}

/**
 * Нативный composable для работы с resize колонок
 */
export function useColumnResize(props: UseColumnResizeProps) {
  const isResizing = ref(false);
  const startX = ref(0);
  const startWidth = ref(0);
  const currentWidth = ref<number | null>(null);

  // Получаем ключ колонки
  const columnKey = computed(() => {
    if (!props.column) {
      return '';
    }
    return props.column.columnKey || String(props.column.field || '');
  });

  // Получаем текущую ширину колонки
  const width = computed(() => {
    if (!props.column) {
      return typeof props.column?.width === 'number' ? props.column.width : 150;
    }
    
    // Если есть текущая ширина (во время resize), используем её
    if (currentWidth.value !== null) {
      return currentWidth.value;
    }
    
    const key = columnKey.value;
    // Если есть сохраненная ширина в columnSizing
    // Явно обращаемся к .value для правильного отслеживания в Vue 2
    if (props.columnSizing) {
      const sizing = props.columnSizing.value || {};
      if (sizing[key] !== undefined) {
        return sizing[key];
      }
    }
    
    // Иначе используем width из column или дефолт
    if (typeof props.column.width === 'number') {
      return props.column.width;
    }
    return 150; // Дефолтная ширина
  });

  // Можно ли изменять размер
  const canResize = computed(() => {
    if (!props.column) {
      return false;
    }
    return props.column.resizable !== false;
  });

  // Минимальная ширина
  const minWidth = computed(() => {
    if (!props.column) {
      return 50;
    }
    return props.column.minWidth || 50;
  });

  // Максимальная ширина
  const maxWidth = computed(() => {
    if (!props.column) {
      return Number.MAX_SAFE_INTEGER;
    }
    return props.column.maxWidth || Number.MAX_SAFE_INTEGER;
  });

  /**
   * Начало resize
   */
  function startResize(event: MouseEvent | TouchEvent) {
    if (!canResize.value) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    isResizing.value = true;

    // Получаем начальную позицию
    const clientX =
      event instanceof TouchEvent && event.touches.length > 0
        ? event.touches[0].clientX
        : (event as MouseEvent).clientX;

    startX.value = clientX;
    startWidth.value = width.value;

    // Обработчики для перемещения и окончания
    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isResizing.value) {
        return;
      }

      const currentX =
        moveEvent instanceof TouchEvent && moveEvent.touches.length > 0
          ? moveEvent.touches[0].clientX
          : (moveEvent as MouseEvent).clientX;

      const delta = currentX - startX.value;
      let newWidth = startWidth.value + delta;

      // Ограничиваем минимальной и максимальной шириной
      newWidth = Math.max(minWidth.value, Math.min(maxWidth.value, newWidth));

      // Обновляем текущую ширину для немедленного отображения
      currentWidth.value = newWidth;

      // Обновляем размер в columnSizing
      // Для Vue 2 реактивности создаем новый объект каждый раз
      const key = columnKey.value;
      if (props.columnSizing) {
        // Всегда создаем новый объект для правильной реактивности в Vue 2
        const currentSizing = props.columnSizing.value || {};
        const newSizing = { ...currentSizing };
        newSizing[key] = newWidth;
        // Присваиваем новый объект для триггера реактивности
        props.columnSizing.value = newSizing;
      }

      // Вызываем callback если есть
      if (props.onResize) {
        props.onResize(key, newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing.value) {
        // Сохраняем финальное значение перед сбросом
        const finalWidth = currentWidth.value;
        const key = columnKey.value;
        
        // Убеждаемся, что финальное значение сохранено в columnSizing
        // Значение уже должно быть сохранено в handleMouseMove, но сохраняем еще раз для надежности
        if (props.columnSizing && finalWidth !== null) {
          const currentSizing = props.columnSizing.value || {};
          // Создаем новый объект только если значение изменилось
          if (currentSizing[key] !== finalWidth) {
            const newSizing = { ...currentSizing };
            newSizing[key] = finalWidth;
            // Присваиваем новый объект для триггера реактивности в Vue 2
            props.columnSizing.value = newSizing;
          }
        }

        isResizing.value = false;
        // Сбрасываем текущую ширину после сохранения
        // Используем nextTick чтобы убедиться, что computed пересчитался
        nextTick(() => {
          currentWidth.value = null;
        });

        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // Удаляем обработчики
        document.removeEventListener('mousemove', handleMouseMove as EventListener);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove as EventListener);
        document.removeEventListener('touchend', handleMouseUp);
      }
    };

    // Добавляем обработчики на document
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove as EventListener);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove as EventListener);
    document.addEventListener('touchend', handleMouseUp);
  }

  // Стили для колонки
  const columnStyle = computed(() => {
    const styles: Record<string, string> = {
      width: `${width.value}px`,
      minWidth: `${minWidth.value}px`,
      maxWidth: `${maxWidth.value}px`,
    };
    return styles;
  });

  return {
    isResizing,
    canResize,
    width,
    columnStyle,
    startResize,
  };
}
