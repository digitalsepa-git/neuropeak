import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';

import { QUESTION_KINDS } from '@neuropeak/core';

import { PLAYABLE_GAME_IDS } from '@/games/registry';

import { isStale, readCache, writeCache } from './cache';
import { EMBEDDED_CATALOGUE, compatibleCatalogue, withFallback, type Catalogue } from './catalogue';
import { fetchCatalogue } from './remote';

const KNOWN_QUESTION_KINDS: ReadonlySet<string> = new Set(QUESTION_KINDS);

/**
 * Uygulamanın içerik kaynağı.
 *
 * Açılışta gömülü bankayla başlıyor — ekran hiçbir zaman boş
 * beklemiyor — sonra önbellek, sonra gerekiyorsa veritabanı.
 * Sırayla:
 *
 *   1. Gömülü banka (anında)
 *   2. Önbellek varsa onunla değiştir
 *   3. Önbellek bayatsa ya da yoksa veritabanından çek ve sakla
 *
 * Her adım bir öncekinin üstüne yazıyor ve her adımda eksik kalan
 * bölüm gömülü bankadan tamamlanıyor. Böylece ağ yokken, sorgu
 * boş dönerken ya da Supabase hiç yapılandırılmamışken uygulama
 * bugünkü gibi çalışıyor.
 */

const ContentContext = createContext<Catalogue>(EMBEDDED_CATALOGUE);

function resolve(remote: Partial<Catalogue>): Catalogue {
  return compatibleCatalogue(withFallback(remote), {
    playableGameIds: PLAYABLE_GAME_IDS,
    knownQuestionKinds: KNOWN_QUESTION_KINDS,
  });
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [catalogue, setCatalogue] = useState<Catalogue>(() => resolve({}));
  // Bir kez çalışsın: içerik oturum boyunca değişmiyor ve tazeleme
  // açılışta yapılıyor.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function load() {
      const cached = await readCache();
      if (cached !== null) setCatalogue(resolve(cached.catalogue));

      const now = Date.now();
      if (!isStale(cached, now)) return;

      const remote = await fetchCatalogue();
      // Hiçbir bölüm gelmediyse yazmaya değmez: bir sonraki açılış
      // yine denesin, bayat damgayla tazelemeyi geciktirmesin.
      if (Object.values(remote).every((section) => section.length === 0)) return;

      await writeCache(remote, now);
      setCatalogue(resolve(remote));
    }

    void load();
  }, []);

  return <ContentContext value={catalogue}>{children}</ContentContext>;
}

export function useContent(): Catalogue {
  return use(ContentContext);
}
