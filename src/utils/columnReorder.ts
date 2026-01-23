import type { Header } from '@tanstack/table-core';
import type { TableRow } from '../types';
import type { GridforgeTableInstance } from '../tableCore';

/**
 * Проверяет, можно ли перетаскивать заголовок колонки
 */
export function canReorder(header: Header<TableRow, unknown>): boolean {
  if (!header.column || header.isPlaceholder) return false;
  
  // Закрепленные колонки нельзя перетаскивать
  const meta = (header.column.columnDef.meta as any) || {};
  if (meta.alignFrozen === 'left' || meta.alignFrozen === 'right') {
    return false;
  }
  
  return true;
}

/**
 * Обработчик начала перетаскивания колонки
 */
export function handleDragStart(
  header: Header<TableRow, unknown>,
  event: DragEvent,
): string | null {
  if (!canReorder(header)) return null;

  const columnId = header.column.id as string;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', columnId);
  }
  return columnId;
}

/**
 * Обработчик перетаскивания над колонкой
 */
export function handleDragOver(
  header: Header<TableRow, unknown>,
  event: DragEvent,
  draggedColumnId: string | null,
): string | null {
  if (!canReorder(header) || !draggedColumnId) return null;

  const newDragOverId = header.column.id as string;
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  return newDragOverId !== draggedColumnId ? newDragOverId : null;
}

/**
 * Обработчик drop колонки - переставляет колонки в таблице
 */
export function handleDrop(
  table: GridforgeTableInstance,
  header: Header<TableRow, unknown>,
  draggedColumnId: string | null,
): boolean {
  if (!table || !draggedColumnId || !canReorder(header)) return false;

  const targetId = header.column.id as string;
  const sourceId = draggedColumnId;

  if (sourceId === targetId) {
    return false;
  }

  const currentOrder =
    table.getState().columnOrder && table.getState().columnOrder.length
      ? [...table.getState().columnOrder]
      : table.getAllLeafColumns().map((col) => col.id as string);

  const fromIndex = currentOrder.indexOf(sourceId);
  const toIndex = currentOrder.indexOf(targetId);

  if (fromIndex === -1 || toIndex === -1) {
    return false;
  }

  // Переставляем колонки
  currentOrder.splice(fromIndex, 1);
  currentOrder.splice(toIndex, 0, sourceId);

  table.setColumnOrder(currentOrder);
  return true;
}
