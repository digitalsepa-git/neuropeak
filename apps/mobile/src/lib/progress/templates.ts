import type { DailyTaskTemplate } from '@neuropeak/core';

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

export const TASK_LABELS: Record<string, string> = {
  'play-2-games': '2 oyun oyna',
  'play-4-games': '4 oyun oyna',
  'earn-300-xp': '300 XP kazan',
  'earn-600-xp': '600 XP kazan',
  'finish-test': 'Bir testi tamamla',
  'memory-2': '2 hafıza oyunu oyna',
  'attention-2': '2 odaklanma oyunu oyna',
  'logic-2': '2 mantık oyunu oyna',
  'math-2': '2 matematik oyunu oyna',
};
