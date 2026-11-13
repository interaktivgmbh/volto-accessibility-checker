import {
  FAIL_AXE_CHECK,
  RUN_AI_CHECK,
  SET_AXE_RESULTS,
  START_AXE_CHECK,
} from '@interaktivgmbh/volto-accessibility-checker/constants/ActionTypes';
import type { CheckResult } from '@interaktivgmbh/volto-accessibility-checker/types';

export function runAICheck(path: string, uid: string, locale: string) {
  return {
    type: RUN_AI_CHECK,
    uid,
    request: {
      op: 'post',
      path: `${path}/@accessibility-check`,
      data: { language: locale },
    },
  };
}

export function startAxeCheck(uid: string) {
  return {
    type: START_AXE_CHECK,
    uid,
  };
}

export function setAxeResults(uid: string, results: CheckResult[]) {
  return {
    type: SET_AXE_RESULTS,
    uid,
    results,
  };
}

export function failAxeCheck(uid: string) {
  return {
    type: FAIL_AXE_CHECK,
    uid,
  };
}
