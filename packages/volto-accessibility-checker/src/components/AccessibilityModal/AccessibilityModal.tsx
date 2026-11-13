import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { FocusScope } from 'react-aria';
import { Button, Modal, Tab } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import type { Content } from '@plone/types';
import BaseTabPane from '@interaktivgmbh/volto-accessibility-checker/components/BaseTabPane/BaseTabPane';
import type { RootState } from '@interaktivgmbh/volto-accessibility-checker/types';

const messages = defineMessages({
  accessibilityChecker: {
    id: 'accessibility-checker-title',
    defaultMessage: 'Accessibility checker',
  },
  accessibilityCheckerDescription: {
    id: 'accessibility-checker-description',
    defaultMessage:
      "Check this page's content for potential accessibility issues.",
  },
  ruleBased: {
    id: 'rule-based',
    defaultMessage: 'Rule-based',
  },
  aiBased: {
    id: 'ai-based',
    defaultMessage: 'AI-based',
  },
  close: {
    id: 'Close',
    defaultMessage: 'Close',
  },
  noPermission: {
    id: 'no-permission',
    defaultMessage: 'No permission',
  },
});

interface AccessibilityModalProps {
  onClose: () => void;
  pageData: Content;
}

const AccessibilityModal = ({ onClose, pageData }: AccessibilityModalProps) => {
  const intl = useIntl();
  const titleId = useId();
  const descriptionId = useId();
  const tabsId = useId();
  const [activeIndex, setActiveIndex] = useState(0);

  const canRunAICheck = useSelector((state: RootState) =>
    state.actions.actions.object_accessibility_checker?.some(
      (action) => action.id === 'ai_check',
    ),
  );

  const tabs = [
    { variant: 'axe', label: intl.formatMessage(messages.ruleBased) },
    { variant: 'ai', label: intl.formatMessage(messages.aiBased) },
  ] as const;
  const tabId = (variant: string) => `${tabsId}-tab-${variant}`;
  const panelId = (variant: string) => `${tabsId}-panel-${variant}`;

  const isTabDisabled = (index: number) =>
    tabs[index].variant === 'ai' && !canRunAICheck;

  const selectTab = (index: number) => {
    document.getElementById(tabId(tabs[index].variant))?.focus();
    if (!isTabDisabled(index)) {
      setActiveIndex(index);
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent, index: number) => {
    const lastIndex = tabs.length - 1;
    const nextIndex = {
      ArrowRight: index === lastIndex ? 0 : index + 1,
      ArrowLeft: index === 0 ? lastIndex : index - 1,
      Home: 0,
      End: lastIndex,
    }[event.key];

    if (nextIndex !== undefined) {
      event.preventDefault();
      selectTab(nextIndex);
    }
  };

  const panes = tabs.map((tab, index) => {
    const isActive = index === activeIndex;
    const isDisabled = isTabDisabled(index);

    return {
      menuItem: {
        key: tab.variant,
        as: 'button',
        type: 'button',
        content: tab.label,
        role: 'tab',
        id: tabId(tab.variant),
        'aria-controls': panelId(tab.variant),
        'aria-selected': isActive,
        'aria-disabled': isDisabled || undefined,
        disabled: isDisabled,
        title: isTabDisabled(index)
          ? intl.formatMessage(messages.noPermission)
          : undefined,
        tabIndex: isActive ? 0 : -1,
        onKeyDown: (event: KeyboardEvent) => handleTabKeyDown(event, index),
      },
      render: () => (
        <div
          key={tab.variant}
          role="tabpanel"
          id={panelId(tab.variant)}
          aria-labelledby={tabId(tab.variant)}
        >
          <BaseTabPane
            variant={tab.variant}
            pageData={pageData}
            onClose={onClose}
          />
        </div>
      ),
    };
  });

  return (
    <Modal
      open
      onClose={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      id="accessibility-checker-modal"
    >
      {/* eslint-disable-next-line jsx-a11y/no-autofocus -- dialogs must move focus inside */}
      <FocusScope contain restoreFocus autoFocus>
        <Modal.Header as="h2" id={titleId}>
          {intl.formatMessage(messages.accessibilityChecker)}
        </Modal.Header>
        <Modal.Content id={descriptionId}>
          <p>{intl.formatMessage(messages.accessibilityCheckerDescription)}</p>
          <Tab
            menu={{
              secondary: true,
              pointing: true,
              role: 'tablist',
              'aria-labelledby': titleId,
            }}
            panes={panes}
            activeIndex={activeIndex}
            onTabChange={(_, data) => selectTab(Number(data.activeIndex))}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            type="button"
            basic
            circular
            secondary
            icon="remove"
            aria-label={intl.formatMessage(messages.close)}
            title={intl.formatMessage(messages.close)}
            floated="right"
            size="big"
            onClick={onClose}
          />
        </Modal.Actions>
      </FocusScope>
    </Modal>
  );
};

export default AccessibilityModal;
