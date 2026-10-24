import { DAILY_TASKS, type ContentDailyTask } from '@neuropeak/content';
import { DAILY_TASK_COUNT, describeTaskTarget, type TaskMetric } from '@neuropeak/core';

import { Shell } from '@/components/shell';

/**
 * Günlük görev havuzu.
 *
 * Rozet sayfasıyla aynı düzen: oyuncunun gördüğü başlık ve görevin
 * gerçekte neyi saydığı yan yana. İkisi ayrıştığında — hedef değişip
 * başlık güncellenmediğinde — burada görünüyor.
 */

const METRIC_LABELS: Readonly<Record<TaskMetric, string>> = {
  play_games: 'Oyun turu',
  earn_xp: 'XP',
  finish_test: 'Test',
  play_category: 'Kategori turu',
};

export default function TasksPage() {
  const totalStars = DAILY_TASKS.reduce((sum, task) => sum + task.starReward, 0);

  return (
    <Shell
      title="Günlük görevler"
      description={`Havuzda ${DAILY_TASKS.length} görev var; her gün bunlardan ${DAILY_TASK_COUNT} tanesi seçiliyor.`}
    >
      <section className="mb-xl grid gap-md sm:grid-cols-3">
        <Stat label="Havuzdaki görev" value={`${DAILY_TASKS.length}`} />
        <Stat label="Günde verilen" value={`${DAILY_TASK_COUNT}`} />
        <Stat label="Havuzun toplam yıldızı" value={`${totalStars}`} />
      </section>

      <p className="mb-md text-bodysmall text-fg-muted">
        Seçim kullanıcıya ve güne göre tohumlanıyor: aynı gün uygulama kaç kez açılırsa açılsın
        görevler değişmiyor, ertesi gün kendiliğinden yenileniyor.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
        <table className="w-full text-bodysmall">
          <thead>
            <tr className="border-b border-border text-left text-overline tracking-wide text-fg-subtle uppercase">
              <th className="px-md py-sm font-semibold">Görev</th>
              <th className="px-md py-sm font-semibold">Oyuncuya görünen</th>
              <th className="px-md py-sm font-semibold">Hedef</th>
              <th className="px-md py-sm font-semibold">Metrik</th>
              <th className="px-md py-sm text-right font-semibold">Yıldız</th>
            </tr>
          </thead>
          <tbody>
            {DAILY_TASKS.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}

function TaskRow({ task }: { task: ContentDailyTask }) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-md py-sm">
        <p className="text-caption text-fg-subtle">{task.id}</p>
      </td>
      <td className="px-md py-sm font-medium">{task.title.tr}</td>
      <td className="px-md py-sm text-fg-muted">{describeTaskTarget(task)}</td>
      <td className="px-md py-sm text-fg-muted">{METRIC_LABELS[task.metric]}</td>
      <td className="px-md py-sm text-right tabular-nums">{task.starReward}</td>
    </tr>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-md shadow-card">
      <p className="text-overline font-semibold tracking-wide text-fg-subtle uppercase">{label}</p>
      <p className="mt-1 text-title font-bold tracking-tight">{value}</p>
    </article>
  );
}
