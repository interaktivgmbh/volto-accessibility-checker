import type { Locale } from 'axe-core';
import { toGettextLang } from '@plone/volto/helpers';

export const importAxeLocale = (name: string): Promise<Locale | undefined> =>
  import(`axe-core/locales/${name}.json`)
    .then((module) => module.default)
    .catch(() => undefined);

export const loadAxeLocale = async (
  locale: string,
): Promise<Locale | undefined> => {
  const name = toGettextLang(locale);
  const language = name.split('_')[0];

  if (language === 'en') {
    return undefined;
  }

  return (await importAxeLocale(name)) ?? (await importAxeLocale(language));
};
