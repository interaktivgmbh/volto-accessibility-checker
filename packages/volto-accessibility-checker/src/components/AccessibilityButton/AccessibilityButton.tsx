import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import config from '@plone/volto/registry';
import { Plug } from '@plone/volto/components/manage/Pluggable';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import AccessibilityModal from '@interaktivgmbh/volto-accessibility-checker/components/AccessibilityModal/AccessibilityModal';
import accessibilitySVG from '@interaktivgmbh/volto-accessibility-checker/icons/accessibility.svg';
import type { RootState } from '@interaktivgmbh/volto-accessibility-checker/types';

const messages = defineMessages({
  accessibilityChecker: {
    id: 'toolbar-accessibility-checker',
    defaultMessage: 'Accessibility checker',
  },
});

const AccessibilityButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const intl = useIntl();
  const forContentTypes = config.settings.accessibilityChecker.contentTypes;
  const pageData = useSelector((state: RootState) => state.content.data);
  const canEdit = useSelector((state: RootState) =>
    state.actions.actions.object?.some((action) => action.id === 'edit'),
  );

  if (!pageData || !canEdit || !forContentTypes.includes(pageData['@type'])) {
    return null;
  }

  return (
    <>
      <Plug pluggable="main.toolbar.bottom" id="accessibility-button">
        <button
          className="accessibility-button"
          aria-label={intl.formatMessage(messages.accessibilityChecker)}
          title={intl.formatMessage(messages.accessibilityChecker)}
          onClick={() => setIsModalOpen(true)}
          tabIndex={0}
          id="toolbar-accessibility-checker"
          aria-haspopup="dialog"
        >
          <Icon name={accessibilitySVG} size="30px" />
        </button>
      </Plug>
      {isModalOpen && (
        <AccessibilityModal
          onClose={() => setIsModalOpen(false)}
          pageData={pageData}
        />
      )}
    </>
  );
};

export default AccessibilityButton;
