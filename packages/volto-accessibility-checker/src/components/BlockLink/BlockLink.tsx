import { flushSync } from 'react-dom';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import config from '@plone/volto/registry';
import type { BlocksConfigData } from '@plone/types';
import {
  findBlockType,
  formatMessageWithFallback,
} from '@interaktivgmbh/volto-accessibility-checker/helpers';
import { findBlockElement } from '@interaktivgmbh/volto-accessibility-checker/helpers/marker';
import type { RootState } from '@interaktivgmbh/volto-accessibility-checker/types';

interface BlockLinkProps {
  blockId: string;
  onClose: () => void;
}

const messages = defineMessages({
  blockType: {
    id: 'block-type',
    defaultMessage: '{type} block',
  },
  blockId: {
    id: 'block-id',
    defaultMessage: 'Block-ID:',
  },
  goToBlock: {
    id: 'go-to-block',
    defaultMessage: 'Go to block',
  },
});

const BlockLink = ({ blockId, onClose }: BlockLinkProps) => {
  const intl = useIntl();
  const blocks = useSelector((state: RootState) => state.content.data?.blocks);

  const blockType = findBlockType(blockId, blocks);
  const blockTypeTitle =
    blockType &&
    formatMessageWithFallback(
      intl,
      // Volto 18's BlocksConfigData has no index signature
      config.blocks.blocksConfig[blockType as keyof BlocksConfigData]?.title ??
        blockType,
    );

  const goToBlock = () => {
    const block = findBlockElement(blockId);

    if (!(block instanceof HTMLElement)) {
      return;
    }

    // Close synchronously so the modal restores its focus first
    // before the block is focused, to avoid an unexpected focus change
    flushSync(() => onClose());

    requestAnimationFrame(() => {
      const hasOwnTabIndex = block.hasAttribute('tabindex');

      if (!hasOwnTabIndex) {
        block.setAttribute('tabindex', '-1');
      }

      block.setAttribute('data-accessibility-checker-target', '');

      const handleFocusOut = (event: FocusEvent) => {
        if (block.contains(event.relatedTarget as Node | null)) {
          return;
        }

        if (!hasOwnTabIndex) {
          block.removeAttribute('tabindex');
        }

        block.removeAttribute('data-accessibility-checker-target');
        block.removeEventListener('focusout', handleFocusOut);
      };

      block.addEventListener('focusout', handleFocusOut);

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      block.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'center',
      });
      block.focus({ preventScroll: true });
    });
  };

  return (
    <button type="button" className="results-block-link" onClick={goToBlock}>
      {blockTypeTitle && (
        <>
          {intl.formatMessage(messages.blockType, { type: blockTypeTitle })}
          <span aria-hidden="true"> ⋅ </span>
        </>
      )}
      {intl.formatMessage(messages.blockId)} <code>{blockId}</code>
      <span className="visually-hidden">
        {' '}
        {intl.formatMessage(messages.goToBlock)}
      </span>
    </button>
  );
};

export default BlockLink;
