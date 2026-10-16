import { basicIqTest } from './tests/basic-iq';
import type { ContentTest } from './types';

export type { ContentQuestion, ContentTest, Localized } from './types';

/**
 * Gömülü içerik. Uygulama açılışta Supabase'den güncel içeriği çeker;
 * buradaki havuz ilk açılışta ve çevrimdışıyken kullanılan temel pakettir.
 */
export const CONTENT_TESTS: readonly ContentTest[] = [basicIqTest];

export function findTest(id: string): ContentTest | undefined {
  return CONTENT_TESTS.find((test) => test.id === id);
}

export { basicIqTest };

export { TR_ANAGRAMS, TR_ANALOGIES, TR_WORD_PAIRS } from './words/tr';

export { TR_DISPLAY_NAMES } from './names/tr';

export { BADGES, type ContentBadge } from './badges/catalogue';
