import type { AnagramEntry, AnalogyEntry, AppLanguage, WordPairEntry } from '@neuropeak/core';

import { EN_DISPLAY_NAMES } from '../names/en';
import { TR_DISPLAY_NAMES } from '../names/tr';
import { EN_ANAGRAMS, EN_ANALOGIES, EN_WORD_PAIRS } from './en';
import { TR_ANAGRAMS, TR_ANALOGIES, TR_WORD_PAIRS } from './tr';

export type WordBank = {
  readonly anagrams: readonly AnagramEntry[];
  readonly analogies: readonly AnalogyEntry[];
  readonly wordPairs: readonly WordPairEntry[];
};

const BANKS: Record<AppLanguage, WordBank> = {
  tr: { anagrams: TR_ANAGRAMS, analogies: TR_ANALOGIES, wordPairs: TR_WORD_PAIRS },
  en: { anagrams: EN_ANAGRAMS, analogies: EN_ANALOGIES, wordPairs: EN_WORD_PAIRS },
};

const NAMES: Record<AppLanguage, readonly string[]> = {
  tr: TR_DISPLAY_NAMES,
  en: EN_DISPLAY_NAMES,
};

/**
 * Sözel oyunların kelime bankası.
 *
 * Sözel içerik çevrilemez — bir kelimenin anagramı başka dilde
 * anagram olmuyor, eş anlamlı çiftleri örtüşmüyor. Her dilin kendi
 * bankası var, seçim burada yapılıyor.
 */
export function wordBankFor(language: AppLanguage): WordBank {
  return BANKS[language];
}

export function displayNamesFor(language: AppLanguage): readonly string[] {
  return NAMES[language];
}
