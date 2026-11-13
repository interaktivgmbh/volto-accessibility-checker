import { defineMessages, useIntl } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import passSVG from '@interaktivgmbh/volto-accessibility-checker/icons/status-pass.svg';
import incompleteSVG from '@interaktivgmbh/volto-accessibility-checker/icons/status-incomplete.svg';
import failSVG from '@interaktivgmbh/volto-accessibility-checker/icons/status-fail.svg';
import type { CheckResult } from '@interaktivgmbh/volto-accessibility-checker/types';

interface StatusIndicatorProps {
  result: CheckResult['result'];
}

const messages = defineMessages({
  pass: {
    id: 'status-pass',
    defaultMessage: 'Passed',
  },
  incomplete: {
    id: 'status-incomplete',
    defaultMessage: 'Needs review',
  },
  fail: {
    id: 'status-fail',
    defaultMessage: 'Failed',
  },
});

const icons = {
  pass: passSVG,
  incomplete: incompleteSVG,
  fail: failSVG,
};

const StatusIndicator = ({ result }: StatusIndicatorProps) => {
  const intl = useIntl();
  const label = intl.formatMessage(messages[result]);

  return (
    <span className={`status-indicator status-${result}`}>
      <Icon name={icons[result]} size="24px" title={label} ariaHidden />
      <span className="visually-hidden">{label}</span>
    </span>
  );
};

export default StatusIndicator;
