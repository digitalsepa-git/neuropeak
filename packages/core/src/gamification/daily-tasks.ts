import type { GameCategory } from '../domain/categories';
import { createRng, sample, seedFromString } from '../random';

/** Bir günde verilen görev sayısı. */
export const DAILY_TASK_COUNT = 3;

export type TaskMetric = 'play_games' | 'earn_xp' | 'finish_test' | 'play_category';

export type DailyTaskTemplate = {
  readonly id: string;
  readonly metric: TaskMetric;
  readonly target: number;
  readonly category?: GameCategory;
  readonly starReward: number;
};

export type DailyTask = DailyTaskTemplate & {
  readonly progress: number;
  readonly claimed: boolean;
};

/**
 * Günün görevlerini seçer. Seçim kullanıcı ve tarihe göre tohumlanır:
 * aynı gün uygulama kaç kez açılırsa açılsın görevler değişmez, ertesi
 * gün kendiliğinden yenilenir.
 */
export function pickDailyTasks(
  templates: readonly DailyTaskTemplate[],
  userId: string,
  dateKey: string,
): DailyTask[] {
  const rng = createRng(seedFromString(`${userId}:${dateKey}`));

  return sample(templates, DAILY_TASK_COUNT, rng).map((template) => ({
    ...template,
    progress: 0,
    claimed: false,
  }));
}

export type TaskEvent =
  | { type: 'game_played'; category: GameCategory }
  | { type: 'xp_earned'; amount: number }
  | { type: 'test_finished' };

/** Bir olayın görev ilerlemesine katkısı. */
function contribution(task: DailyTask, event: TaskEvent): number {
  switch (task.metric) {
    case 'play_games':
      return event.type === 'game_played' ? 1 : 0;
    case 'play_category':
      return event.type === 'game_played' && event.category === task.category ? 1 : 0;
    case 'earn_xp':
      return event.type === 'xp_earned' ? event.amount : 0;
    case 'finish_test':
      return event.type === 'test_finished' ? 1 : 0;
  }
}

export type TaskProgressResult = {
  readonly tasks: DailyTask[];
  /** Bu olayla tamamlanan görevler — ödül bunlar için verilir. */
  readonly justCompleted: DailyTask[];
};

/** Olayı tüm görevlere işler ve bu adımda tamamlananları bildirir. */
export function applyTaskEvent(tasks: readonly DailyTask[], event: TaskEvent): TaskProgressResult {
  const justCompleted: DailyTask[] = [];

  const updated = tasks.map((task) => {
    if (task.progress >= task.target) return task;

    const added = contribution(task, event);
    if (added === 0) return task;

    const progress = Math.min(task.target, task.progress + added);
    const next = { ...task, progress };

    if (progress >= task.target) {
      justCompleted.push(next);
    }

    return next;
  });

  return { tasks: updated, justCompleted };
}

export function completedTaskCount(tasks: readonly DailyTask[]): number {
  return tasks.filter((task) => task.progress >= task.target).length;
}

/** Panelde okunacak kategori adları. */
const TASK_CATEGORY_LABELS: Readonly<Record<GameCategory, string>> = {
  memory: 'hafıza',
  attention: 'dikkat',
  logic: 'mantık',
  math: 'matematik',
  spatial: 'görsel',
  speed: 'hız',
  verbal: 'sözel',
};

/**
 * Görevin hedefini Türkçe bir cümleye çevirir — yönetim panelinin
 * görev listesi için.
 *
 * `describeBadgeRequirement` ve `describeRule` ile aynı iş: kuralı
 * veri olarak tutmanın bedeli, onu bir kez de insan diline çevirmek.
 * Katalogdaki başlık oyuncuya gösterilen metin; buradaki cümle
 * görevin gerçekte neyi saydığı. İkisi ayrıştığında panelde yan yana
 * görünüyor.
 */
export function describeTaskTarget(template: DailyTaskTemplate): string {
  switch (template.metric) {
    case 'play_games':
      return `${template.target} oyun turu oyna`;
    case 'earn_xp':
      return `${template.target} XP kazan`;
    case 'finish_test':
      return template.target === 1 ? 'Bir test tamamla' : `${template.target} test tamamla`;
    case 'play_category':
      return template.category === undefined
        ? `${template.target} oyun turu oyna`
        : `${TASK_CATEGORY_LABELS[template.category]} kategorisinde ${template.target} tur oyna`;
  }
}
