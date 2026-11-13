import type { Content } from '@plone/types';

export type CheckerType = 'ai' | 'axe';
export type CheckResultType = 'pass' | 'fail' | 'incomplete';
export type CheckStatusType = 'idle' | 'running' | 'unavailable';
export type CheckSeverityType =
  | 'minor'
  | 'moderate'
  | 'serious'
  | 'critical'
  | undefined;

export type BlockIdMap = Map<Element, string | null>;

export type CheckResult = {
  criterion: string;
  title: string;
  description?: string;
  result: CheckResultType;
  severity?: CheckSeverityType;
  affected_blocks: string[];
  hints?: Record<string, string>;
  unassigned_hints?: string[];
};

export type CheckStateType = {
  timestamp: string | null;
  status: CheckStatusType;
  results: CheckResult[] | null;
};

export type ContentCheckStateType = Record<CheckerType, CheckStateType>;

export type AccessibilityCheckStateType = Record<string, ContentCheckStateType>;

export type RootState = {
  actions: { actions: Record<string, { id: string }[] | undefined> };
  content: { data?: Content };
  intl: { locale: string };
  router: { location: { pathname: string } };
  'accessibility-check': AccessibilityCheckStateType;
};
