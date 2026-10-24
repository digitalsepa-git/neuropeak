import { describe, expect, it } from 'vitest';

import {
  DAILY_TASK_COUNT,
  applyTaskEvent,
  completedTaskCount,
  describeTaskTarget,
  pickDailyTasks,
  type DailyTask,
  type DailyTaskTemplate,
} from './daily-tasks';

const TEMPLATES: DailyTaskTemplate[] = [
  { id: 'play-2', metric: 'play_games', target: 2, starReward: 15 },
  { id: 'play-5', metric: 'play_games', target: 5, starReward: 25 },
  { id: 'xp-500', metric: 'earn_xp', target: 500, starReward: 20 },
  { id: 'xp-1000', metric: 'earn_xp', target: 1000, starReward: 35 },
  { id: 'test-1', metric: 'finish_test', target: 1, starReward: 30 },
  { id: 'memory-2', metric: 'play_category', target: 2, category: 'memory', starReward: 20 },
  { id: 'logic-2', metric: 'play_category', target: 2, category: 'logic', starReward: 20 },
];

function task(overrides: Partial<DailyTask> & { id: string }): DailyTask {
  return {
    metric: 'play_games',
    target: 2,
    starReward: 15,
    progress: 0,
    claimed: false,
    ...overrides,
  };
}

describe('pickDailyTasks', () => {
  it('her gün için sabit sayıda görev verir', () => {
    expect(pickDailyTasks(TEMPLATES, 'user-1', '2026-10-15')).toHaveLength(DAILY_TASK_COUNT);
  });

  it('aynı kullanıcı ve gün için hep aynı görevleri verir', () => {
    const first = pickDailyTasks(TEMPLATES, 'user-1', '2026-10-15');
    const second = pickDailyTasks(TEMPLATES, 'user-1', '2026-10-15');

    expect(second.map((item) => item.id)).toEqual(first.map((item) => item.id));
  });

  it('ertesi gün görevler değişir', () => {
    const today = pickDailyTasks(TEMPLATES, 'user-1', '2026-10-15');
    const tomorrow = pickDailyTasks(TEMPLATES, 'user-1', '2026-10-16');

    expect(tomorrow.map((item) => item.id)).not.toEqual(today.map((item) => item.id));
  });

  it('farklı kullanıcılar farklı görev alabilir', () => {
    const a = pickDailyTasks(TEMPLATES, 'user-1', '2026-10-15');
    const b = pickDailyTasks(TEMPLATES, 'user-2', '2026-10-15');

    expect(a.map((item) => item.id)).not.toEqual(b.map((item) => item.id));
  });

  it('aynı görevi iki kez vermez', () => {
    const tasks = pickDailyTasks(TEMPLATES, 'user-1', '2026-10-15');

    expect(new Set(tasks.map((item) => item.id)).size).toBe(tasks.length);
  });

  it('görevler sıfır ilerlemeyle başlar', () => {
    for (const item of pickDailyTasks(TEMPLATES, 'user-1', '2026-10-15')) {
      expect(item.progress).toBe(0);
      expect(item.claimed).toBe(false);
    }
  });
});

describe('applyTaskEvent', () => {
  it('oyun oynama görevini ilerletir', () => {
    const result = applyTaskEvent([task({ id: 'play-2' })], {
      type: 'game_played',
      category: 'memory',
    });

    expect(result.tasks[0]?.progress).toBe(1);
    expect(result.justCompleted).toHaveLength(0);
  });

  it('hedefe ulaşınca tamamlananları bildirir', () => {
    const result = applyTaskEvent([task({ id: 'play-2', progress: 1 })], {
      type: 'game_played',
      category: 'memory',
    });

    expect(result.tasks[0]?.progress).toBe(2);
    expect(result.justCompleted.map((item) => item.id)).toEqual(['play-2']);
  });

  it('tamamlanmış görevi tekrar bildirmez', () => {
    const result = applyTaskEvent([task({ id: 'play-2', progress: 2 })], {
      type: 'game_played',
      category: 'memory',
    });

    expect(result.justCompleted).toHaveLength(0);
    expect(result.tasks[0]?.progress).toBe(2);
  });

  it('ilerleme hedefi aşmaz', () => {
    const result = applyTaskEvent([task({ id: 'xp', metric: 'earn_xp', target: 500 })], {
      type: 'xp_earned',
      amount: 9999,
    });

    expect(result.tasks[0]?.progress).toBe(500);
  });

  it('kategori görevi yalnızca o kategoriden sayar', () => {
    const memoryTask = task({ id: 'memory-2', metric: 'play_category', category: 'memory' });

    const wrong = applyTaskEvent([memoryTask], { type: 'game_played', category: 'logic' });
    expect(wrong.tasks[0]?.progress).toBe(0);

    const right = applyTaskEvent([memoryTask], { type: 'game_played', category: 'memory' });
    expect(right.tasks[0]?.progress).toBe(1);
  });

  it('ilgisiz olay görevi etkilemez', () => {
    const result = applyTaskEvent([task({ id: 'test-1', metric: 'finish_test', target: 1 })], {
      type: 'game_played',
      category: 'memory',
    });

    expect(result.tasks[0]?.progress).toBe(0);
  });

  it('bir olay birden çok görevi birden ilerletebilir', () => {
    const result = applyTaskEvent(
      [
        task({ id: 'play-2', metric: 'play_games', target: 2 }),
        task({ id: 'memory-2', metric: 'play_category', target: 2, category: 'memory' }),
      ],
      { type: 'game_played', category: 'memory' },
    );

    expect(result.tasks.map((item) => item.progress)).toEqual([1, 1]);
  });
});

describe('completedTaskCount', () => {
  it('hedefe ulaşan görevleri sayar', () => {
    const tasks = [
      task({ id: 'a', progress: 2, target: 2 }),
      task({ id: 'b', progress: 1, target: 2 }),
      task({ id: 'c', progress: 5, target: 2 }),
    ];

    expect(completedTaskCount(tasks)).toBe(2);
  });
});

describe('describeTaskTarget', () => {
  const TEMPLATES: readonly DailyTaskTemplate[] = [
    { id: 'a', metric: 'play_games', target: 2, starReward: 15 },
    { id: 'b', metric: 'earn_xp', target: 300, starReward: 15 },
    { id: 'c', metric: 'finish_test', target: 1, starReward: 30 },
    { id: 'd', metric: 'finish_test', target: 3, starReward: 30 },
    { id: 'e', metric: 'play_category', target: 2, category: 'memory', starReward: 20 },
  ];

  it('her metrik türü için bir cümle üretir', () => {
    for (const template of TEMPLATES) {
      const text = describeTaskTarget(template);
      expect(text.length, template.id).toBeGreaterThan(0);
      // Etiket tablosundan düşen bir anahtar "undefined" yazardı.
      expect(text, template.id).not.toContain('undefined');
    }
  });

  it('tek testi sayıyla değil kelimeyle söylüyor', () => {
    expect(describeTaskTarget(TEMPLATES[2] as DailyTaskTemplate)).toBe('Bir test tamamla');
    expect(describeTaskTarget(TEMPLATES[3] as DailyTaskTemplate)).toBe('3 test tamamla');
  });

  it('kategori görevinde kategoriyi adlandırıyor', () => {
    expect(describeTaskTarget(TEMPLATES[4] as DailyTaskTemplate)).toBe(
      'hafıza kategorisinde 2 tur oyna',
    );
  });

  it('kategorisiz bir kategori görevi sessizce bozulmuyor', () => {
    // Katalogda olmaması gereken bir durum ama tip buna izin veriyor;
    // "undefined kategorisinde" yazmaktansa genel cümleye düşüyor.
    expect(describeTaskTarget({ id: 'x', metric: 'play_category', target: 2, starReward: 5 })).toBe(
      '2 oyun turu oyna',
    );
  });
});
