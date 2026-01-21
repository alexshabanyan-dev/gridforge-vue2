import { HEADER_PADDING, RESIZER_SPACE } from '../constants/tableConstants';

/**
 * Измеряет ширину текста с учётом стилей элемента
 */
export function measureTextWidth(
  text: string,
  referenceElement: HTMLElement,
): number {
  const measureEl = document.createElement('span');
  measureEl.style.position = 'absolute';
  measureEl.style.visibility = 'hidden';
  measureEl.style.whiteSpace = 'nowrap';
  measureEl.style.fontSize = window.getComputedStyle(referenceElement).fontSize;
  measureEl.style.fontWeight = window.getComputedStyle(referenceElement).fontWeight;
  measureEl.style.fontFamily = window.getComputedStyle(referenceElement).fontFamily;
  measureEl.textContent = text;
  document.body.appendChild(measureEl);
  const width = measureEl.offsetWidth;
  document.body.removeChild(measureEl);
  return width;
}

/**
 * Вычисляет автоматическую минимальную ширину колонки на основе заголовка
 */
export function calculateAutoMinWidth(
  headerText: string,
  hasResizer: boolean,
): number {
  // Создаём временный элемент для измерения
  const tempEl = document.createElement('span');
  tempEl.style.position = 'absolute';
  tempEl.style.visibility = 'hidden';
  tempEl.style.whiteSpace = 'nowrap';
  document.body.appendChild(tempEl);

  // Используем стандартные стили (можно улучшить, передавая referenceElement)
  const textWidth = measureTextWidth(headerText, tempEl);
  document.body.removeChild(tempEl);

  const resizerSpace = hasResizer ? RESIZER_SPACE : 0;
  return Math.ceil(textWidth + HEADER_PADDING + resizerSpace);
}

/**
 * Измеряет ширину заголовка колонки с учётом реальных стилей элемента
 */
export function measureHeaderWidth(
  headerText: string,
  contentElement: HTMLElement,
  hasResizer: boolean,
): number {
  const textWidth = measureTextWidth(headerText, contentElement);
  const resizerSpace = hasResizer ? RESIZER_SPACE : 0;
  return Math.ceil(textWidth + HEADER_PADDING + resizerSpace);
}
