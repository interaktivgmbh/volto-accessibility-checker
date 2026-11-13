import type {
  CheckResultType,
  CheckSeverityType,
} from '@interaktivgmbh/volto-accessibility-checker/types';

export const resultOrder: readonly CheckResultType[] = [
  'fail',
  'incomplete',
  'pass',
];

export const severityOrder: readonly CheckSeverityType[] = [
  'critical',
  'serious',
  'moderate',
  'minor',
  undefined,
];
