'use client';

import type { ContentDailyTask } from '@neuropeak/content';
import { GAME_CATEGORIES } from '@neuropeak/core';
import { useActionState, useState } from 'react';

import { IDLE, updateDailyTask } from '@/app/content/actions';
import { canEditContent } from '@/lib/content-mode';

/**
 * Bir günlük görevin satırı ve düzenleme formu.
 *
 * Satır kapalıyken tablo okunur kalıyor; "Düzenle" açınca form
 * geliyor. Satır içi girdi kutularıyla dolu bir tablo, dokuz görevi
 * gözden geçirmeyi zorlaştırırdı.
 */

const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  memory: 'Hafıza',
  attention: 'Dikkat',
  logic: 'Mantık',
  math: 'Matematik',
  spatial: 'Görsel',
  speed: 'Hız',
  verbal: 'Sözel',
};

export function TaskEditor({
  task,
  target,
  metric,
}: {
  task: ContentDailyTask;
  target: string;
  metric: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateDailyTask, IDLE);

  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="px-md py-sm">
          <p className="text-caption text-fg-subtle">{task.id}</p>
        </td>
        <td className="px-md py-sm font-medium">{task.title.tr}</td>
        <td className="px-md py-sm text-fg-muted">{target}</td>
        <td className="px-md py-sm text-fg-muted">{metric}</td>
        <td className="px-md py-sm text-right tabular-nums">{task.starReward}</td>
        <td className="px-md py-sm text-right">
          <button
            type="button"
            disabled={!canEditContent}
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="rounded-md border border-border px-sm py-1 text-bodysmall disabled:cursor-not-allowed disabled:opacity-50"
          >
            {open ? 'Kapat' : 'Düzenle'}
          </button>
        </td>
      </tr>

      {open && (
        <tr className="border-b border-border last:border-0">
          <td colSpan={6} className="bg-surface-sunken px-md py-md">
            <form action={action} className="grid gap-sm sm:grid-cols-2">
              <input type="hidden" name="id" value={task.id} />

              <Field label="Türkçe başlık" name="title_tr" defaultValue={task.title.tr} />
              <Field label="İngilizce başlık" name="title_en" defaultValue={task.title.en} />
              <Field
                label="Hedef"
                name="target"
                type="number"
                defaultValue={`${task.target}`}
                min={1}
              />
              <Field
                label="Yıldız ödülü"
                name="star_reward"
                type="number"
                defaultValue={`${task.starReward}`}
                min={0}
              />

              <label className="block text-bodysmall sm:col-span-2">
                <span className="mb-1 block font-medium">Kategori</span>
                <select
                  name="category"
                  defaultValue={task.category ?? ''}
                  className="w-full rounded-md border border-border bg-surface px-sm py-1.5"
                >
                  <option value="">Kategorisiz</option>
                  {GAME_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {CATEGORY_LABELS[category] ?? category}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-caption text-fg-muted">
                  Yalnızca kategori görevlerinde dolu olmalı.
                </span>
              </label>

              <Result state={state} pending={pending} />
            </form>
          </td>
        </tr>
      )}
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  min,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  min?: number;
}) {
  return (
    <label className="block text-bodysmall">
      <span className="mb-1 block font-medium">{label}</span>
      <input
        name={name}
        type={type}
        min={min}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-border bg-surface px-sm py-1.5"
      />
    </label>
  );
}

function Result({
  state,
  pending,
}: {
  state: { status: 'idle' | 'saved' | 'error'; message?: string };
  pending: boolean;
}) {
  return (
    <div className="flex items-center gap-sm sm:col-span-2">
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-md py-1.5 text-bodysmall font-medium text-on-brand disabled:opacity-50"
      >
        {pending ? 'Kaydediliyor…' : 'Kaydet'}
      </button>

      {state.status === 'saved' && (
        <p role="status" className="text-bodysmall text-success">
          Kaydedildi.
        </p>
      )}
      {state.status === 'error' && (
        <p role="alert" className="text-bodysmall text-danger">
          {state.message}
        </p>
      )}
    </div>
  );
}

export { Field, Result };
