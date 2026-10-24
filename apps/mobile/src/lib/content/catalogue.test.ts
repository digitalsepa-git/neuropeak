import { describe, expect, it } from 'vitest';

import type { ContentGame, ContentQuestion, ContentTest } from '@neuropeak/content';

import { STALE_AFTER_MS, isStale } from './cache';
import { EMBEDDED_CATALOGUE, compatibleCatalogue, withFallback } from './catalogue';

const GAME = EMBEDDED_CATALOGUE.games[0] as ContentGame;
const TEST = EMBEDDED_CATALOGUE.tests[0] as ContentTest;
const QUESTION = TEST.questions[0] as ContentQuestion;

/**
 * İçeriğin veritabanından okunmasının testlenebilir parçaları:
 * yedeğe düşme, sürüm uyumu ve bayatlık kararı. Sorgunun kendisi
 * çalışan bir Supabase istiyor.
 */

describe('withFallback', () => {
  it('uzak içerik boşken gömülü bankayı veriyor', () => {
    expect(withFallback({})).toEqual(EMBEDDED_CATALOGUE);
  });

  it('gelen bölümü kullanıyor, gelmeyeni gömülüden tamamlıyor', () => {
    // Bölüm bölüm düşmek önemli: rozetler gelmediyse oyunlar yine
    // veritabanından okunmalı.
    const games = [{ ...GAME, id: 'uzak-oyun' }];
    const result = withFallback({ games, badges: [] });

    expect(result.games.map((game) => game.id)).toEqual(['uzak-oyun']);
    expect(result.badges).toBe(EMBEDDED_CATALOGUE.badges);
  });

  it('boş dizi gelmemiş sayılıyor', () => {
    // Sorgu boş döndüyse "içerik yok" değil "çekilemedi" diye
    // okunuyor; oyuncuya boş liste göstermektense gömülü banka.
    expect(withFallback({ games: [] }).games).toBe(EMBEDDED_CATALOGUE.games);
  });
});

describe('compatibleCatalogue', () => {
  const support = {
    playableGameIds: new Set(['card-match']),
    knownQuestionKinds: new Set(['number_series']),
  };

  it('ekranı olmayan oyunu listeden çıkarıyor', () => {
    // Panelden eklenmiş ama bu sürümde çizilemeyen bir oyun,
    // listede görünüp açılınca patlamaktansa hiç görünmemeli.
    const catalogue = compatibleCatalogue(
      {
        ...EMBEDDED_CATALOGUE,
        games: [
          { ...GAME, id: 'card-match' },
          { ...GAME, id: 'gelecek-oyun' },
        ],
      },
      support,
    );

    expect(catalogue.games.map((game) => game.id)).toEqual(['card-match']);
  });

  it('tanınmayan türdeki soruyu eliyor', () => {
    const test: ContentTest = {
      ...TEST,
      questions: [
        { ...QUESTION, kind: 'number_series' },
        // Bu sürümün tanımadığı bir tür; tipte yok, veritabanında
        // olabilir.
        { ...QUESTION, kind: 'gelecek_tur' as ContentQuestion['kind'] },
      ],
    };

    const catalogue = compatibleCatalogue({ ...EMBEDDED_CATALOGUE, tests: [test] }, support);
    expect(catalogue.tests[0]?.questions).toHaveLength(1);
  });

  it('bütün soruları elenen testi listeden çıkarıyor', () => {
    const test: ContentTest = {
      ...TEST,
      questions: [{ ...QUESTION, kind: 'gelecek_tur' as ContentQuestion['kind'] }],
    };

    expect(compatibleCatalogue({ ...EMBEDDED_CATALOGUE, tests: [test] }, support).tests).toEqual(
      [],
    );
  });

  it('rozetlere ve görevlere dokunmuyor', () => {
    const catalogue = compatibleCatalogue(EMBEDDED_CATALOGUE, support);
    expect(catalogue.badges).toBe(EMBEDDED_CATALOGUE.badges);
    expect(catalogue.dailyTasks).toBe(EMBEDDED_CATALOGUE.dailyTasks);
  });
});

describe('isStale', () => {
  const now = 1_700_000_000_000;

  it('önbellek yoksa bayat', () => {
    expect(isStale(null, now)).toBe(true);
  });

  it('süre dolmadan taze', () => {
    expect(isStale({ fetchedAt: now - 1000, catalogue: {} }, now)).toBe(false);
  });

  it('süre dolunca bayat', () => {
    expect(isStale({ fetchedAt: now - STALE_AFTER_MS, catalogue: {} }, now)).toBe(true);
  });

  it('ileri tarihli damga bayat sayılıyor', () => {
    // Cihaz saati geri alınmışsa önbellek hiç tazelenmezdi.
    expect(isStale({ fetchedAt: now + 60_000, catalogue: {} }, now)).toBe(true);
  });
});
