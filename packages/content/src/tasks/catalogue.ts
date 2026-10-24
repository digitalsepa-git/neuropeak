import type { DailyTaskTemplate } from '@neuropeak/core';

import type { Localized } from '../types';

/**
 * Günlük görev havuzu.
 *
 * Her gün buradan üç tanesi seçilir; seçim kullanıcı ve tarihe göre
 * tohumlandığı için gün içinde değişmez. Seçimi yapan `pickDailyTasks`
 * çekirdekte, havuzun kendisi burada: rozetlerde olduğu gibi kuralın
 * motoru çekirdekte, verisi içerikte.
 *
 * Başlık katalogda duruyor, arayüzün metin kataloğunda değil. Önceden
 * mobil tarafta kimlikten i18n anahtarına bir eşleme vardı; görev
 * eklemek iki dosyayı birden düzenlemeyi gerektiriyordu ve panel
 * görevleri hiç göremiyordu.
 */

export type ContentDailyTask = DailyTaskTemplate & {
  readonly title: Localized;
};

export const DAILY_TASKS: readonly ContentDailyTask[] = [
  {
    id: 'play-2-games',
    metric: 'play_games',
    target: 2,
    starReward: 15,
    title: { tr: '2 oyun oyna', en: 'Play 2 games' },
  },
  {
    id: 'play-4-games',
    metric: 'play_games',
    target: 4,
    starReward: 25,
    title: { tr: '4 oyun oyna', en: 'Play 4 games' },
  },
  {
    id: 'earn-300-xp',
    metric: 'earn_xp',
    target: 300,
    starReward: 15,
    title: { tr: '300 XP kazan', en: 'Earn 300 XP' },
  },
  {
    id: 'earn-600-xp',
    metric: 'earn_xp',
    target: 600,
    starReward: 25,
    title: { tr: '600 XP kazan', en: 'Earn 600 XP' },
  },
  {
    id: 'finish-test',
    metric: 'finish_test',
    target: 1,
    starReward: 30,
    title: { tr: 'Bir testi tamamla', en: 'Finish a test' },
  },
  {
    id: 'memory-2',
    metric: 'play_category',
    target: 2,
    category: 'memory',
    starReward: 20,
    title: { tr: '2 hafıza oyunu oyna', en: 'Play 2 memory games' },
  },
  {
    id: 'attention-2',
    metric: 'play_category',
    target: 2,
    category: 'attention',
    starReward: 20,
    title: { tr: '2 odaklanma oyunu oyna', en: 'Play 2 attention games' },
  },
  {
    id: 'logic-2',
    metric: 'play_category',
    target: 2,
    category: 'logic',
    starReward: 20,
    title: { tr: '2 mantık oyunu oyna', en: 'Play 2 logic games' },
  },
  {
    id: 'math-2',
    metric: 'play_category',
    target: 2,
    category: 'math',
    starReward: 20,
    title: { tr: '2 matematik oyunu oyna', en: 'Play 2 math games' },
  },
];

export function findDailyTask(id: string): ContentDailyTask | undefined {
  return DAILY_TASKS.find((task) => task.id === id);
}
