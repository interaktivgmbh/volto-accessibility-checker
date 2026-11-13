import { defineMessages, useIntl } from 'react-intl';
import { Dimmer, Loader } from 'semantic-ui-react';
import { sortCheckResults } from '@interaktivgmbh/volto-accessibility-checker/helpers';
import ResultsRow from '@interaktivgmbh/volto-accessibility-checker/components/ResultsRow/ResultsRow';
import type { CheckStateType } from '@interaktivgmbh/volto-accessibility-checker/types';

interface ResultsContainerProps {
  checkData?: CheckStateType;
  labelId: string;
  onClose: () => void;
}

const messages = defineMessages({
  noCheckStarted: {
    id: 'no-check-started',
    defaultMessage: 'No check has been started yet.',
  },
  checkRunning: {
    id: 'check-running',
    defaultMessage: 'Check in progress…',
  },
});

const ResultsContainer = ({
  checkData,
  labelId,
  onClose,
}: ResultsContainerProps) => {
  const intl = useIntl();

  const results = sortCheckResults(checkData?.results ?? []);
  const isInitial = checkData?.results == null;
  const isRunning = checkData?.status === 'running';

  return (
    <div className="results-container">
      <div
        className="results-scroll"
        role="region"
        aria-labelledby={labelId}
        aria-busy={isRunning}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable regions must be keyboard reachable
        tabIndex={0}
      >
        {isInitial ? (
          intl.formatMessage(messages.noCheckStarted)
        ) : (
          <ul className="results-list">
            {results.map((result) => (
              <li key={result.criterion}>
                <ResultsRow result={result} onClose={onClose} />
              </li>
            ))}
          </ul>
        )}
      </div>
      {isRunning && (
        <Dimmer active inverted aria-hidden="true">
          <Loader>{intl.formatMessage(messages.checkRunning)}</Loader>
        </Dimmer>
      )}
      <div role="status" className="visually-hidden">
        {isRunning && intl.formatMessage(messages.checkRunning)}
      </div>
    </div>
  );
};

export default ResultsContainer;
