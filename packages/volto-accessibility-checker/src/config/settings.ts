import type { ConfigType } from '@plone/registry';
import type { BlocksConfigData } from '@plone/types';
import AccessibilityButton from '@interaktivgmbh/volto-accessibility-checker/components/AccessibilityButton/AccessibilityButton';
import accessibilityCheck from '@interaktivgmbh/volto-accessibility-checker/reducers/checks/checks';
import withBlockMarker from '@interaktivgmbh/volto-accessibility-checker/hocs/withBlockMarker/withBlockMarker';

declare module '@plone/types' {
  export interface SettingsConfig {
    accessibilityChecker: {
      contentTypes: string[];
      axeRules: string[];
    };
  }
}

const addBlockMarkers = (
  blocksConfig: Partial<BlocksConfigData>,
  visited = new WeakSet<object>(),
) => {
  Object.values(blocksConfig).forEach((blockConfig) => {
    if (!blockConfig || visited.has(blockConfig)) {
      return;
    }
    visited.add(blockConfig);

    if (blockConfig.view) {
      blockConfig.view = withBlockMarker(blockConfig.view);
    }
    if (blockConfig.blocksConfig) {
      addBlockMarkers(blockConfig.blocksConfig, visited);
    }
  });
};

export default function install(config: ConfigType) {
  config.settings.accessibilityChecker = {
    contentTypes: ['Document', 'Plone Site', 'LRF'],
    axeRules: [
      'image-alt',
      'link-name',
      'heading-order',
      'empty-heading',
      'image-redundant-alt',
      'empty-table-header',
      'td-headers-attr',
      'scope-attr-valid',
      'th-has-data-cells',
    ],
  };

  addBlockMarkers(config.blocks.blocksConfig);

  config.settings.appExtras = [
    ...config.settings.appExtras,
    {
      match: '',
      component: AccessibilityButton,
      props: {},
    },
  ];

  config.addonReducers = {
    ...config.addonReducers,
    'accessibility-check': accessibilityCheck,
  };

  return config;
}
