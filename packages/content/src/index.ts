import { advancedIqTest } from './tests/advanced-iq';
import { basicIqTest } from './tests/basic-iq';
import { logicReasoningTest } from './tests/logic-reasoning';
import { numericIqTest } from './tests/numeric-iq';
import { quickIqTest } from './tests/quick-iq';
import { verbalIqTest } from './tests/verbal-iq';
import type { ContentTest } from './types';

export type { ContentQuestion, ContentTest, Localized } from './types';

/**
 * Gömülü içerik. Uygulama açılışta Supabase'den güncel içeriği çeker;
 * buradaki havuz ilk açılışta ve çevrimdışıyken kullanılan temel pakettir.
 */
export const CONTENT_TESTS: readonly ContentTest[] = [
  basicIqTest,
  advancedIqTest,
  numericIqTest,
  verbalIqTest,
  logicReasoningTest,
  quickIqTest,
];

export function findTest(id: string): ContentTest | undefined {
  return CONTENT_TESTS.find((test) => test.id === id);
}

export {
  advancedIqTest,
  basicIqTest,
  logicReasoningTest,
  numericIqTest,
  quickIqTest,
  verbalIqTest,
};

export { TR_ANAGRAMS, TR_ANALOGIES, TR_WORD_PAIRS } from './words/tr';

export { TR_DISPLAY_NAMES } from './names/tr';

export { BADGES, type ContentBadge } from './badges/catalogue';
