import { defineMessages, useIntl } from 'react-intl';
import BlockLink from '@interaktivgmbh/volto-accessibility-checker/components/BlockLink/BlockLink';
import StatusIndicator from '@interaktivgmbh/volto-accessibility-checker/components/StatusIndicator/StatusIndicator';
import type { CheckResult } from '@interaktivgmbh/volto-accessibility-checker/types';

interface ResultsRowProps {
  result: CheckResult;
  onClose: () => void;
}

const messages = defineMessages({
  severity: {
    id: 'severity',
    defaultMessage: 'Severity:',
  },
  minor: {
    id: 'severity-minor',
    defaultMessage: 'Minor',
  },
  moderate: {
    id: 'severity-moderate',
    defaultMessage: 'Moderate',
  },
  serious: {
    id: 'severity-serious',
    defaultMessage: 'Serious',
  },
  critical: {
    id: 'severity-critical',
    defaultMessage: 'Critical',
  },
  hint: {
    id: 'hint',
    defaultMessage: 'Hint:',
  },
  unassigned: {
    id: 'not-assigned-to-block',
    defaultMessage: 'Not assigned to a block',
  },
});

const ResultsRow = ({ result, onClose }: ResultsRowProps) => {
  const {
    title,
    severity,
    description,
    hints,
    affected_blocks,
    unassigned_hints = [],
  } = result;

  const intl = useIntl();

  return (
    <div className="results-row">
      <div className="results-row-header">
        <div className="results-row-title">
          <h4>{title}</h4>
          {severity && (
            <span className={`severity-badge severity-${severity}`}>
              <span className="visually-hidden">
                {intl.formatMessage(messages.severity)}{' '}
              </span>
              {intl.formatMessage(messages[severity])}
            </span>
          )}
        </div>
        <div className="results-row-status">
          <StatusIndicator result={result.result} />
        </div>
      </div>
      <div className="results-row-body">
        {description && (
          <p className="results-row-description">{description}</p>
        )}
        {(affected_blocks.length > 0 || unassigned_hints.length > 0) && (
          <ul className="results-affected-blocks">
            {affected_blocks.map((blockId) => (
              <li key={blockId}>
                <BlockLink blockId={blockId} onClose={onClose} />
                {hints?.[blockId] && (
                  <p className="results-row-hint">
                    <strong>{intl.formatMessage(messages.hint)}</strong>{' '}
                    {hints[blockId]}
                  </p>
                )}
              </li>
            ))}
            {unassigned_hints.map((hint, index) => (
              <li key={`unassigned-${index}`}>
                <span>{intl.formatMessage(messages.unassigned)}</span>
                <p className="results-row-hint">
                  <strong>{intl.formatMessage(messages.hint)}</strong> {hint}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResultsRow;
