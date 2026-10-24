'use client';

import type { ContentBadge } from '@neuropeak/content';
import { useActionState, useState } from 'react';

import { IDLE, updateBadge } from '@/app/content/actions';
import { canEditContent } from '@/lib/content-mode';

import { Field, Result } from './task-editor';

/**
 * Bir rozetin satırı ve düzenleme formu.
 *
 * Koşul salt okunur. Koşulu daraltmak, rozeti çoktan kazanmış
 * kullanıcıları artık hak etmedikleri bir rozetle bırakıyor — motor
 * kazanılmış rozeti geri almıyor. Geri alınamayan bir kararı
 * panelden tek tıkla verdirmek doğru değil; koşul değişikliği
 * migration ile geliyor.
 */
export function BadgeEditor({ badge, requirement }: { badge: ContentBadge; requirement: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateBadge, IDLE);

  return (
    <>
      <tr className="border-b border-border last:border-0">
        <td className="px-md py-sm">
          <div className="flex items-center gap-xs">
            <span className="font-medium">{badge.title.tr}</span>
            {badge.isSecret && (
              <span className="rounded-pill bg-surface-sunken px-1.5 text-overline font-semibold tracking-wide text-fg-muted uppercase">
                Gizli
              </span>
            )}
          </div>
          <p className="text-caption text-fg-subtle">{badge.id}</p>
        </td>
        <td className="px-md py-sm text-fg-muted">{badge.description.tr}</td>
        <td className="px-md py-sm">{requirement}</td>
        <td className="px-md py-sm text-right tabular-nums">{badge.starReward}</td>
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
          <td colSpan={5} className="bg-surface-sunken px-md py-md">
            <form action={action} className="grid gap-sm sm:grid-cols-2">
              <input type="hidden" name="id" value={badge.id} />

              <Field label="Türkçe ad" name="title_tr" defaultValue={badge.title.tr} />
              <Field label="İngilizce ad" name="title_en" defaultValue={badge.title.en} />
              <Field
                label="Türkçe açıklama"
                name="description_tr"
                defaultValue={badge.description.tr}
              />
              <Field
                label="İngilizce açıklama"
                name="description_en"
                defaultValue={badge.description.en}
              />
              <Field
                label="Yıldız ödülü"
                name="star_reward"
                type="number"
                defaultValue={`${badge.starReward}`}
                min={0}
              />

              <label className="flex items-center gap-xs self-end text-bodysmall">
                <input type="checkbox" name="is_secret" defaultChecked={badge.isSecret} />
                <span>Gizli rozet</span>
              </label>

              <div className="rounded-md border border-border bg-surface p-sm text-bodysmall sm:col-span-2">
                <p className="font-medium">Koşul: {requirement}</p>
                <p className="mt-1 text-caption text-fg-muted">
                  Koşul panelden değiştirilmiyor. Daraltmak, rozeti çoktan kazanmış kullanıcıları
                  artık hak etmedikleri bir rozetle bırakırdı; kazanılmış rozet geri alınmıyor.
                </p>
              </div>

              <Result state={state} pending={pending} />
            </form>
          </td>
        </tr>
      )}
    </>
  );
}
