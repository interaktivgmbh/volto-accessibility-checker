import {
  FAIL_AXE_CHECK,
  RUN_AI_CHECK,
  SET_AXE_RESULTS,
  START_AXE_CHECK,
} from '@interaktivgmbh/volto-accessibility-checker/constants/ActionTypes';
import type {
  AccessibilityCheckStateType,
  CheckerType,
  CheckStateType,
  ContentCheckStateType,
} from '@interaktivgmbh/volto-accessibility-checker/types';

const initialCheckState: CheckStateType = {
  timestamp: null,
  status: 'unavailable',
  results: null,
};

const initialContentState: ContentCheckStateType = {
  ai: initialCheckState,
  axe: initialCheckState,
};

const initialState: AccessibilityCheckStateType = {};

function updateCheck(
  state: AccessibilityCheckStateType,
  uid: string,
  checker: CheckerType,
  changes: Partial<CheckStateType>,
): AccessibilityCheckStateType {
  const content = state[uid] ?? initialContentState;
  return {
    ...state,
    [uid]: {
      ...content,
      [checker]: {
        ...content[checker],
        ...changes,
      },
    },
  };
}

const startCheck = (
  state: AccessibilityCheckStateType,
  uid: string,
  checker: CheckerType,
) => updateCheck(state, uid, checker, { status: 'running' });

const finishCheck = (
  state: AccessibilityCheckStateType,
  uid: string,
  checker: CheckerType,
  results: CheckStateType['results'],
) =>
  updateCheck(state, uid, checker, {
    status: 'idle',
    timestamp: new Date().toISOString(),
    results,
  });

const failCheck = (
  state: AccessibilityCheckStateType,
  uid: string,
  checker: CheckerType,
) =>
  updateCheck(state, uid, checker, {
    status: state[uid]?.[checker].timestamp ? 'idle' : 'unavailable',
  });

export default function accessibilityCheck(
  state: AccessibilityCheckStateType = initialState,
  action: any = {},
): AccessibilityCheckStateType {
  switch (action.type) {
    case `${RUN_AI_CHECK}_PENDING`:
      return startCheck(state, action.uid, 'ai');
    case `${RUN_AI_CHECK}_SUCCESS`:
      return finishCheck(state, action.uid, 'ai', action.result);
    case `${RUN_AI_CHECK}_FAIL`:
      return failCheck(state, action.uid, 'ai');
    case START_AXE_CHECK:
      return startCheck(state, action.uid, 'axe');
    case SET_AXE_RESULTS:
      return finishCheck(state, action.uid, 'axe', action.results);
    case FAIL_AXE_CHECK:
      return failCheck(state, action.uid, 'axe');
    default:
      return state;
  }
}
