import type { GridforgeTableInstance } from '../tableCore';
import { DEFAULT_MIN_SIZE, DELTA_THRESHOLD } from '../constants/tableConstants';

/**
 * Находит изменённую колонку при ресайзе
 */
export function findChangedColumn(
  table: GridforgeTableInstance,
  newSizing: Record<string, number>,
  previousSizing: Record<string, number>,
  resizingColumnId: string | null,
): { columnId: string | null; delta: number } {
  if (resizingColumnId) {
    // Если знаем колонку из TanStack, используем её
    const oldSize =
      previousSizing[resizingColumnId] ??
      table.getColumn(resizingColumnId)?.getSize() ??
      0;
    const newSize = newSizing[resizingColumnId] ?? oldSize;
    return {
      columnId: resizingColumnId,
      delta: newSize - oldSize,
    };
  }

  // Иначе ищем колонку с максимальным изменением
  const currentSizing = table.getState().columnSizing;
  const currentSizingForCompare = { ...currentSizing };
  for (const col of table.getAllLeafColumns()) {
    const colId = col.id as string;
    if (!(colId in currentSizingForCompare)) {
      currentSizingForCompare[colId] = col.getSize();
    }
  }

  let maxDelta = 0;
  let changedColumnId: string | null = null;

  for (const columnId in newSizing) {
    const oldSize = previousSizing[columnId] ?? currentSizingForCompare[columnId] ?? 0;
    const newSize = newSizing[columnId];
    const currentDelta = newSize - oldSize;
    if (Math.abs(currentDelta) > Math.abs(maxDelta)) {
      maxDelta = currentDelta;
      changedColumnId = columnId;
    }
  }

  return {
    columnId: changedColumnId,
    delta: maxDelta,
  };
}

/**
 * Применяет ограничение minSize к размеру колонки
 */
export function applyMinSizeConstraint(
  table: GridforgeTableInstance,
  columnId: string,
  newSize: number,
): number {
  const column = table.getColumn(columnId);
  if (!column) return newSize;
  const minSize = (column.columnDef as any).minSize ?? DEFAULT_MIN_SIZE;
  return Math.max(minSize, newSize);
}

/**
 * Получает полный объект размеров всех колонок для сравнения
 */
export function getFullColumnSizing(table: GridforgeTableInstance): Record<string, number> {
  const currentSizing = { ...table.getState().columnSizing };
  for (const col of table.getAllLeafColumns()) {
    const colId = col.id as string;
    if (!(colId in currentSizing)) {
      currentSizing[colId] = col.getSize();
    }
  }
  return currentSizing;
}

/**
 * Создаёт функцию для обработки ресайза в fit-режиме (только две соседние колонки)
 */
export function createFitModeResizeHandler(
  table: GridforgeTableInstance,
  layout: 'fit' | 'scroll',
  getPreviousColumnSizing: () => Record<string, number>,
  onSizingUpdate: (sizing: Record<string, number>) => void,
) {
  return (updater: any, originalSetColumnSizing: (updater: any) => void) => {
    if (layout !== 'fit') {
      // В scroll-режиме используем стандартное поведение
      originalSetColumnSizing(updater);
      onSizingUpdate({ ...table.getState().columnSizing });
      return;
    }

    // В fit-режиме применяем логику "только две соседние колонки"
    const currentSizing = table.getState().columnSizing;
    const sizingInfo = table.getState().columnSizingInfo;
    const previousSizing = { ...getPreviousColumnSizing() };

    // Вычисляем новое состояние
    const newSizing = typeof updater === 'function' ? updater(currentSizing) : updater;

    // Находим изменённую колонку
    const { columnId: changedColumnId, delta: initialDelta } = findChangedColumn(
      table,
      newSizing,
      previousSizing,
      sizingInfo.isResizingColumn || null,
    );

    let delta = initialDelta;

    // Проверяем и применяем minSize для изменённой колонки
    if (changedColumnId) {
      const changedColumn = table.getColumn(changedColumnId);
      if (changedColumn) {
        const minSize = (changedColumn.columnDef as any).minSize ?? DEFAULT_MIN_SIZE;
        if (newSizing[changedColumnId] < minSize) {
          newSizing[changedColumnId] = minSize;
          delta = minSize - (previousSizing[changedColumnId] ?? changedColumn.getSize());
        }
      }
    }

    // Если нашли изменённую колонку, корректируем только соседнюю справа
    if (changedColumnId && Math.abs(delta) > DELTA_THRESHOLD) {
      const allColumns = table.getAllLeafColumns();
      const changedIndex = allColumns.findIndex((col) => col.id === changedColumnId);

      if (changedIndex >= 0 && changedIndex < allColumns.length - 1) {
        const nextColumn = allColumns[changedIndex + 1];
        const nextColumnId = nextColumn.id as string;
        const currentSizingForCompare = getFullColumnSizing(table);

        const nextColumnCurrentSize =
          newSizing[nextColumnId] ??
          currentSizingForCompare[nextColumnId] ??
          nextColumn.getSize();

        // Корректируем размер соседней колонки на противоположную величину
        const nextMinSize = (nextColumn.columnDef as any).minSize ?? DEFAULT_MIN_SIZE;
        const adjustedNextSize = Math.max(nextMinSize, nextColumnCurrentSize - delta);

        newSizing[nextColumnId] = adjustedNextSize;

        // Убеждаемся, что мы не трогаем другие колонки
        const finalSizing: Record<string, number> = {};
        for (const col of allColumns) {
          const colId = col.id as string;
          if (colId === changedColumnId || colId === nextColumnId) {
            finalSizing[colId] = newSizing[colId];
          } else {
            // Остальные колонки сохраняют текущий размер
            finalSizing[colId] = currentSizing[colId] ?? col.getSize();
          }
        }

        // Применяем только изменения для двух колонок
        originalSetColumnSizing(finalSizing);
        onSizingUpdate({ ...finalSizing });
        return;
      }
    }

    // Если не нашли изменённую колонку или это не наш случай, применяем стандартно
    originalSetColumnSizing(newSizing);
    onSizingUpdate({ ...newSizing });
  };
}
