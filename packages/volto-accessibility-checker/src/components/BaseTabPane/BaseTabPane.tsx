import { useId } from 'react';
import { Button, TabPane } from 'semantic-ui-react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import type { Content } from '@plone/types';
import { flattenToAppURL, isCmsUi } from '@plone/volto/helpers/Url/Url';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import {
  failAxeCheck,
  runAICheck,
  setAxeResults,
  startAxeCheck,
} from '@interaktivgmbh/volto-accessibility-checker/actions/checks/checks';
import {
  startAxeScan,
  transformAxeResults,
} from '@interaktivgmbh/volto-accessibility-checker/helpers';
import { findBlockIds } from '@interaktivgmbh/volto-accessibility-checker/helpers/marker';
import ResultsContainer from '@interaktivgmbh/volto-accessibility-checker/components/ResultsContainer/ResultsContainer';
import type { RootState } from '@interaktivgmbh/volto-accessibility-checker/types';

interface BaseTabPaneProps {
  variant: 'axe' | 'ai';
  pageData: Content;
  onClose: () => void;
}

const messages = defineMessages({
  ruleBasedDescription: {
    id: 'rule-based-description',
    defaultMessage: 'Automated check of selected WCAG criteria.',
  },
  aiBasedDescription: {
    id: 'ai-based-description',
    defaultMessage:
      'Semantic and context-aware check using AI. The results are AI-generated hints and can be wrong. You remain responsible for the content.',
  },
  results: {
    id: 'heading-results',
    defaultMessage: 'Results',
  },
  lastChecked: {
    id: 'last-checked',
    defaultMessage: 'Last checked: {datetime}',
  },
  startCheck: {
    id: 'start-check',
    defaultMessage: 'Start check',
  },
  never: {
    id: 'never',
    defaultMessage: 'Never',
  },
  checkStarted: {
    id: 'check-started',
    defaultMessage: 'Check started',
  },
  checkFinished: {
    id: 'check-finished',
    defaultMessage: 'Check finished',
  },
  checkFailed: {
    id: 'check-failed',
    defaultMessage: 'Check failed',
  },
  checkFailedContent: {
    id: 'check-failed-content',
    defaultMessage: 'The check could not be completed. Please try again later.',
  },
  unavailableWhileEditing: {
    id: 'unavailable-while-editing',
    defaultMessage: 'Unavailable while editing',
  },
});

const BaseTabPane = ({ variant, pageData, onClose }: BaseTabPaneProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const resultsHeadingId = useId();

  const checkData = useSelector(
    (state: RootState) => state['accessibility-check'][pageData.UID]?.[variant],
  );
  const locale = useSelector((state: RootState) => state.intl.locale);
  const pathname = useSelector(
    (state: RootState) => state.router.location.pathname,
  );

  const timestamp = checkData?.timestamp;
  const isRunning = checkData?.status === 'running';
  const isEditing = isCmsUi(pathname);
  const isDisabled = isRunning || isEditing;

  const showFailedToast = () =>
    toast.error(
      <Toast
        error
        title={intl.formatMessage(messages.checkFailed)}
        content={intl.formatMessage(messages.checkFailedContent)}
      />,
    );

  const handleStartCheck = async () => {
    if (isDisabled) {
      return;
    }
    if (variant === 'axe') {
      dispatch(startAxeCheck(pageData.UID));
      try {
        const results = await startAxeScan(locale);
        const blockIds = findBlockIds(results);
        dispatch(
          setAxeResults(pageData.UID, transformAxeResults(results, blockIds)),
        );
      } catch {
        dispatch(failAxeCheck(pageData.UID));
        showFailedToast();
      }
      return;
    }

    toast.info(
      <Toast info title={intl.formatMessage(messages.checkStarted)} />,
    );
    try {
      await dispatch(
        runAICheck(flattenToAppURL(pageData['@id']), pageData.UID, locale),
      );
      toast.success(
        <Toast success title={intl.formatMessage(messages.checkFinished)} />,
      );
    } catch {
      showFailedToast();
    }
  };

  return (
    <TabPane className="base-tab-pane">
      <p className="description">
        {intl.formatMessage(
          variant === 'axe'
            ? messages.ruleBasedDescription
            : messages.aiBasedDescription,
        )}
      </p>
      <div className="results-header">
        <div>
          <h3 id={resultsHeadingId}>{intl.formatMessage(messages.results)}</h3>
          <p>
            {intl.formatMessage(messages.lastChecked, {
              datetime: timestamp ? (
                <time dateTime={timestamp}>
                  {intl.formatDate(timestamp, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              ) : (
                intl.formatMessage(messages.never)
              ),
            })}
          </p>
        </div>
        <div className="results-header-action">
          <Button
            onClick={handleStartCheck}
            aria-disabled={isDisabled}
            className={isDisabled ? 'disabled' : undefined}
            title={
              isEditing
                ? intl.formatMessage(messages.unavailableWhileEditing)
                : undefined
            }
          >
            {intl.formatMessage(messages.startCheck)}
          </Button>
        </div>
      </div>
      <ResultsContainer
        checkData={checkData}
        labelId={resultsHeadingId}
        onClose={onClose}
      />
    </TabPane>
  );
};

export default BaseTabPane;
