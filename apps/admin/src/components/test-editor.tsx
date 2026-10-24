'use client';

import type { ContentTest } from '@neuropeak/content';
import { useActionState, useState } from 'react';

import { IDLE, updateTest } from '@/app/content/actions';
import { canEditContent } from '@/lib/content-mode';

import { Field, Result } from './task-editor';

/**
 * Testin üst bilgisi: adlar, açıklamalar, oturumda sorulan soru
 * sayısı, süre aralığı ve erişim.
 *
 * Norm (ortalama ve sapma) burada yok. Ham puanı IQ'ya çeviren
 * ölçek metin değil; değiştirmek geçmiş sonuçları da yeniden
 * anlamlandırırdı ve geçmişi taşıyacak bir yol yok.
 *
 * Havuz boyutu forma gizli alan olarak giriyor: "oturumda havuzdan
 * fazla soru sorulamaz" kontrolü buna bakıyor. Bu kontrolün
 * veritabanında karşılığı yok, çünkü havuz başka bir tabloda.
 */
export function TestEditor({ test, poolSize }: { test: ContentTest; poolSize: number }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateTest, IDLE);

  if (!open) {
    return (
      <button
        type="button"
        disabled={!canEditContent}
        onClick={() => setOpen(true)}
        className="mt-lg rounded-md border border-border px-sm py-1 text-bodysmall disabled:cursor-not-allowed disabled:opacity-50"
      >
        Üst bilgiyi düzenle
      </button>
    );
  }

  return (
    <form
      action={action}
      className="mt-lg grid gap-sm rounded-lg border border-border bg-surface p-md"
    >
      <input type="hidden" name="id" value={test.id} />
      <input type="hidden" name="pool_size" value={poolSize} />

      <div className="grid gap-sm sm:grid-cols-2">
        <Field label="Türkçe ad" name="title_tr" defaultValue={test.title.tr} />
        <Field label="İngilizce ad" name="title_en" defaultValue={test.title.en} />
        <Field label="Türkçe açıklama" name="description_tr" defaultValue={test.description.tr} />
        <Field
          label="İngilizce açıklama"
          name="description_en"
          defaultValue={test.description.en}
        />
        <Field
          label={`Oturumda sorulan (havuz: ${poolSize})`}
          name="question_count"
          type="number"
          defaultValue={`${test.questionCount}`}
          min={1}
        />
        <div className="grid grid-cols-2 gap-sm">
          <Field
            label="En az dk"
            name="est_minutes_min"
            type="number"
            defaultValue={`${test.estMinutes[0]}`}
            min={1}
          />
          <Field
            label="En çok dk"
            name="est_minutes_max"
            type="number"
            defaultValue={`${test.estMinutes[1]}`}
            min={1}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-md">
        <label className="flex items-center gap-xs text-bodysmall">
          <input type="checkbox" name="is_pro" defaultChecked={test.isPro} />
          <span>PRO</span>
        </label>
        <label className="flex items-center gap-xs text-bodysmall">
          <input type="checkbox" name="is_active" defaultChecked />
          <span>Yayında</span>
        </label>
      </div>

      <p className="text-caption text-fg-muted">
        Norm ortalaması ({test.norm.mean}) ve sapması ({test.norm.sd}) panelden değiştirilmiyor: ham
        puanı IQ&apos;ya çeviren ölçek, geçmiş sonuçları da yeniden anlamlandırırdı.
      </p>

      <Result state={state} pending={pending} />

      <button
        type="button"
        onClick={() => setOpen(false)}
        className="justify-self-start text-caption text-fg-muted hover:underline"
      >
        Düzenlemeyi kapat
      </button>
    </form>
  );
}
