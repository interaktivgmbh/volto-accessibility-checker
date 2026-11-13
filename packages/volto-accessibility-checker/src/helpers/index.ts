import config from '@plone/volto/registry';
import type { AxeResults } from 'axe-core';
import type { IntlShape } from 'react-intl';
import type {
  BlockIdMap,
  CheckResult,
} from '@interaktivgmbh/volto-accessibility-checker/types';
import { loadAxeLocale } from '@interaktivgmbh/volto-accessibility-checker/helpers/locales';
import {
  resultOrder,
  severityOrder,
} from '@interaktivgmbh/volto-accessibility-checker/constants';

export const startAxeScan = async (locale: string) => {
  const container = document.getElementById('page-document');

  if (!container) {
    throw new Error(
      "Could not find content container with id 'page-document'.",
    );
  }

  const { default: axe } = await import('axe-core');
  const axeLocale = await loadAxeLocale(locale);

  if (axeLocale) {
    axe.configure({ locale: axeLocale });
  } else {
    axe.resetLocale();
  }

  return axe.run(container, {
    runOnly: {
      type: 'rule',
      values: config.settings.accessibilityChecker.axeRules,
    },
    elementRef: true,
  });
};

export const transformAxeResults = (
  results: AxeResults,
  blockIds: BlockIdMap,
): CheckResult[] => {
  const { violations, incomplete, passes, inapplicable } = results;

  const flaggedRules = [...violations, ...incomplete];
  const allRules = [...flaggedRules, ...passes, ...inapplicable];

  // A rule is in several lists when some of its elements pass and others fail
  const uniqueRules = allRules.filter(
    (rule, index) => allRules.findIndex(({ id }) => id === rule.id) === index,
  );

  return uniqueRules.map((rule) => {
    const isFailed = violations.some(({ id }) => id === rule.id);
    const needsReview = incomplete.some(({ id }) => id === rule.id);
    const result = isFailed ? 'fail' : needsReview ? 'incomplete' : 'pass';

    const affectedBlocks = new Set(
      flaggedRules
        .filter(({ id }) => id === rule.id)
        .flatMap(({ nodes }) => nodes)
        .map((node) => node.element && blockIds.get(node.element))
        .filter((blockId): blockId is string => !!blockId),
    );

    return {
      criterion: rule.id,
      title: rule.help,
      description: rule.description,
      result,
      severity: result === 'pass' ? undefined : rule.impact ?? undefined,
      affected_blocks: [...affectedBlocks],
    };
  });
};

export const sortCheckResults = (results: CheckResult[]): CheckResult[] => {
  return [...results].sort(
    (a, b) =>
      resultOrder.indexOf(a.result) - resultOrder.indexOf(b.result) ||
      severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity),
  );
};

export const findBlockType = (
  blockId: string,
  blocks: Record<string, any> = {},
): string | undefined => {
  if (blocks[blockId]) {
    return blocks[blockId]['@type'];
  }

  for (const block of Object.values(blocks)) {
    const type = findBlockType(blockId, block?.blocks);
    if (type) {
      return type;
    }
  }

  return undefined;
};

// Copied from Volto 19 (helpers/I18n/I18n) for Volto 18 compatibility
export function formatMessageWithFallback<T extends string | undefined | null>(
  intl: IntlShape,
  message: T,
): T extends string ? string : T {
  if (!message) return message as T extends string ? string : T;
  return intl.formatMessage({
    id: message,
    defaultMessage: message,
  }) as T extends string ? string : T;
}
