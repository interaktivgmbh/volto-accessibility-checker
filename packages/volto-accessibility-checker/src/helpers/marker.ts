import { flushSync } from 'react-dom';
import type { AxeResults } from 'axe-core';
import type { BlockIdMap } from '@interaktivgmbh/volto-accessibility-checker/types';
import { setShowMarkers } from '@interaktivgmbh/volto-accessibility-checker/hooks/useShowMarkers/useShowMarkers';

const findBlockId = (element: Element): string | null => {
  let current: Element | null = element;

  while (current) {
    let sibling = current.previousElementSibling;
    while (sibling) {
      if (sibling instanceof HTMLTemplateElement && sibling.dataset.blockUuid) {
        return sibling.dataset.blockUuid;
      }
      sibling = sibling.previousElementSibling;
    }
    current = current.parentElement;
  }

  return null;
};

export const findBlockIds = (results: AxeResults): BlockIdMap => {
  const elements = [...results.violations, ...results.incomplete]
    .flatMap((rule) => rule.nodes)
    .map((node) => node.element)
    .filter((element): element is HTMLElement => !!element);

  const blockIds: BlockIdMap = new Map();

  if (elements.length === 0) {
    return blockIds;
  }

  try {
    flushSync(() => setShowMarkers(true));

    elements.forEach((element) => {
      blockIds.set(element, findBlockId(element));
    });
  } finally {
    flushSync(() => setShowMarkers(false));
  }

  return blockIds;
};

export const findBlockElement = (blockId: string): Element | null => {
  const editBlock = document.querySelector(
    `[data-rbd-draggable-id="${CSS.escape(blockId)}"] .block[role="presentation"]`,
  );

  if (editBlock) {
    return editBlock;
  }

  try {
    flushSync(() => setShowMarkers(true));
    const marker = document.querySelector(
      `template[data-block-uuid="${CSS.escape(blockId)}"]`,
    );
    return marker?.nextElementSibling ?? null;
  } finally {
    flushSync(() => setShowMarkers(false));
  }
};
