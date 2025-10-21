import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TranslationManager } from './translationManager';

import hostEn from '../../locales/en.json';
import hostHe from '../../locales/he.json';
import hostRu from '../../locales/ru.json';

export const translationManager = new TranslationManager();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { host: hostEn },
      ru: { host: hostRu },
      he: { host: hostHe },
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'host',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });

translationManager.setI18nInstance(i18n);

export default i18n;