import type { DailyTaskTemplate } from '@neuropeak/core';

import type { StringKey } from '@/lib/i18n';

/**
 * Günlük görev havuzu. Her gün buradan üç tanesi seçilir; seçim
 * kullanıcı ve tarihe göre tohumlandığı için gün içinde değişmez.
 * Panelden yönetilebilir hale gelecek (PR#21), o zamana kadar gömülü.
 */
export const DAILY_TASK_TEMPLATES: DailyTaskTemplate[] = [
  { id: 'play-2-games', metric: 'play_games', target: 2, starReward: 15 },
  { id: 'play-4-games', metric: 'play_games', target: 4, starReward: 25 },
  { id: 'earn-300-xp', metric: 'earn_xp', target: 300, starReward: 15 },
  { id: 'earn-600-xp', metric: 'earn_xp', target: 600, starReward: 25 },
  { id: 'finish-test', metric: 'finish_test', target: 1, starReward: 30 },
  { id: 'memory-2', metric: 'play_category', target: 2, category: 'memory', starReward: 20 },
  { id: 'attention-2', metric: 'play_category', target: 2, category: 'attention', starReward: 20 },
  { id: 'logic-2', metric: 'play_category', target: 2, category: 'logic', starReward: 20 },
  { id: 'math-2', metric: 'play_category', target: 2, category: 'math', starReward: 20 },
];

/** Görev kimliğinden metin anahtarına; metinler i18n kataloğunda. */
export const TASK_LABEL_KEYS: Record<string, StringKey> = {
  'play-2-games': 'task.play-2-games',
  'play-4-games': 'task.play-4-games',
  'earn-300-xp': 'task.earn-300-xp',
  'earn-600-xp': 'task.earn-600-xp',
  'finish-test': 'task.finish-test',
  'memory-2': 'task.memory-2',
  'attention-2': 'task.attention-2',
  'logic-2': 'task.logic-2',
  'math-2': 'task.math-2',
};
