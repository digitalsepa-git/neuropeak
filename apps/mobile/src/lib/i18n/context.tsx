import type { AppLanguage, Localized } from '@neuropeak/core';
import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';

import { deviceLanguage, saveLanguage } from './storage';
import { STRINGS } from './strings';
import { translate, type EntryParams } from './types';

type Catalogue = typeof STRINGS;

type I18nContextValue = {
  readonly language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  /** Arayüz metni. Değişkenli metinlerde parametreler zorunlu. */
  t: <K extends keyof Catalogue>(key: K, ...params: EntryParams<Catalogue[K]>) => string;
  /** İçerik paketindeki iki dilli metinden geçerli dili seçer. */
  localized: (value: Localized) => string;
};

const fallbackLanguage = deviceLanguage();

const I18nContext = createContext<I18nContextValue>({
  language: fallbackLanguage,
  setLanguage: () => undefined,
  t: (key, ...params) => translate(STRINGS, fallbackLanguage, key, params[0]),
  localized: (value) => value[fallbackLanguage],
});

/**
 * Dil, açılışta okunup kök düzene verilir; burada yalnızca tutulur ve
 * değiştirilir. Dil değişince ağaç baştan çizilir: metin tutan her
 * bileşen `t`'yi bu bağlamdan aldığı için ekranda anında karşılığı
 * görünür.
 */
export function I18nProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: AppLanguage;
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<AppLanguage>(initialLanguage);

  const setLanguage = useCallback((next: AppLanguage) => {
    setLanguageState(next);
    void saveLanguage(next);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, ...params) => translate(STRINGS, language, key, params[0]),
      localized: (item) => item[language],
    }),
    [language, setLanguage],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nContextValue {
  return use(I18nContext);
}

/** Yalnızca metin gereken yerlerde kısa yol. */
export function useT(): I18nContextValue['t'] {
  return use(I18nContext).t;
}
