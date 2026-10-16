'use client';

import {
  PUSH_BODY_MAX,
  PUSH_TITLE_MAX,
  describeSegment,
  previewText,
  validateCampaign,
  type PushCampaign,
  type Segment,
} from '@neuropeak/core';
import { useMemo, useState } from 'react';

/**
 * Push besteci.
 *
 * Doğrulama gönderme anında değil yazarken çalışıyor: bildirim geri
 * alınamadığı için hatayı son adımda göstermek geç oluyor. Kilit
 * ekranı önizlemesi de aynı sebeple — başlığın nerede kesildiğini
 * görmeden uzunluk sınırı soyut kalıyor.
 */
export function PushComposer({
  segments,
  canSend,
}: {
  segments: readonly Segment[];
  canSend: boolean;
}) {
  const [segmentId, setSegmentId] = useState(segments[0]?.id ?? '');
  const [trTitle, setTrTitle] = useState('Serini koru');
  const [trBody, setTrBody] = useState('Bugün bir tur oyna, serin devam etsin.');
  const [enTitle, setEnTitle] = useState('Keep your streak');
  const [enBody, setEnBody] = useState('Play one round today to keep it going.');
  const [hour, setHour] = useState('');

  const campaign: PushCampaign = useMemo(
    () => ({
      id: 'draft',
      segmentId,
      tr: { title: trTitle, body: trBody },
      en: { title: enTitle, body: enBody },
      localHour: hour === '' ? undefined : Number(hour),
    }),
    [enBody, enTitle, hour, segmentId, trBody, trTitle],
  );

  const issues = useMemo(() => validateCampaign(campaign), [campaign]);
  const segment = segments.find((item) => item.id === segmentId);

  return (
    <div className="grid gap-lg lg:grid-cols-[1fr_280px]">
      <div className="space-y-lg">
        <section className="rounded-lg border border-border bg-surface p-md shadow-card">
          <label htmlFor="segment" className="text-bodysmall font-medium">
            Kitle
          </label>
          <select
            id="segment"
            value={segmentId}
            onChange={(event) => setSegmentId(event.target.value)}
            className="mt-xs w-full rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall outline-none focus:border-brand"
          >
            {segments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
          {segment !== undefined && (
            <p className="mt-xs text-caption text-fg-muted">{describeSegment(segment)}</p>
          )}
        </section>

        <LocaleFields
          locale="Türkçe"
          title={trTitle}
          body={trBody}
          onTitle={setTrTitle}
          onBody={setTrBody}
        />

        <LocaleFields
          locale="İngilizce"
          title={enTitle}
          body={enBody}
          onTitle={setEnTitle}
          onBody={setEnBody}
        />

        <section className="rounded-lg border border-border bg-surface p-md shadow-card">
          <label htmlFor="hour" className="text-bodysmall font-medium">
            Gönderim saati
          </label>
          <input
            id="hour"
            type="number"
            min={0}
            max={23}
            value={hour}
            onChange={(event) => setHour(event.target.value)}
            placeholder="Boş bırakılırsa hemen gönderilir"
            className="mt-xs w-full rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall outline-none focus:border-brand"
          />
          <p className="mt-xs text-caption text-fg-muted">
            Kullanıcının kendi saatiyle. Gece yarısı bildirimi göndermemek için kullanılır.
          </p>
        </section>

        {issues.length > 0 && (
          <ul className="rounded-lg border border-danger bg-surface p-md text-bodysmall text-danger">
            {issues.map((issue) => (
              <li key={`${issue.locale}-${issue.field}-${issue.message}`}>
                {issue.locale === 'tr' ? 'Türkçe' : 'İngilizce'}: {issue.message}
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-sm">
          <button
            type="button"
            disabled={!canSend || issues.length > 0}
            className="rounded-md bg-brand px-md py-1.5 text-bodysmall font-medium text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            Gönder
          </button>
          {!canSend && (
            <span className="text-caption text-fg-muted">
              Gönderim Supabase bağlanınca açılır; metin ve kitle şimdiden hazırlanabilir.
            </span>
          )}
        </div>
      </div>

      <aside className="space-y-md">
        <Preview locale="Türkçe" title={trTitle} body={trBody} />
        <Preview locale="İngilizce" title={enTitle} body={enBody} />
      </aside>
    </div>
  );
}

function LocaleFields({
  locale,
  title,
  body,
  onTitle,
  onBody,
}: {
  locale: string;
  title: string;
  body: string;
  onTitle: (value: string) => void;
  onBody: (value: string) => void;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-md shadow-card">
      <h2 className="text-subheading font-semibold">{locale}</h2>

      <label htmlFor={`${locale}-title`} className="mt-sm block text-bodysmall font-medium">
        Başlık
        <Counter value={title.trim().length} max={PUSH_TITLE_MAX} />
      </label>
      <input
        id={`${locale}-title`}
        value={title}
        onChange={(event) => onTitle(event.target.value)}
        className="mt-xs w-full rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall outline-none focus:border-brand"
      />

      <label htmlFor={`${locale}-body`} className="mt-sm block text-bodysmall font-medium">
        Metin
        <Counter value={body.trim().length} max={PUSH_BODY_MAX} />
      </label>
      <textarea
        id={`${locale}-body`}
        value={body}
        rows={3}
        onChange={(event) => onBody(event.target.value)}
        className="mt-xs w-full resize-y rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall outline-none focus:border-brand"
      />
    </section>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  return (
    <span
      className={`ml-xs text-caption tabular-nums ${value > max ? 'text-danger' : 'text-fg-muted'}`}
    >
      {value}/{max}
    </span>
  );
}

/** Kilit ekranı önizlemesi; metin gerçekte nerede kesiliyorsa orada kesiliyor. */
function Preview({ locale, title, body }: { locale: string; title: string; body: string }) {
  return (
    <div>
      <p className="mb-xs text-overline font-semibold tracking-wide text-fg-subtle uppercase">
        {locale} önizleme
      </p>
      <div className="rounded-lg border border-border bg-surface-sunken p-sm shadow-card">
        <div className="flex items-center gap-xs">
          <span aria-hidden className="size-4 rounded-sm bg-brand" />
          <span className="text-caption text-fg-muted">NeuroPeak · şimdi</span>
        </div>
        <p className="mt-xs text-bodysmall font-semibold">
          {previewText(title, PUSH_TITLE_MAX) || 'Başlık'}
        </p>
        <p className="text-bodysmall text-fg-muted">
          {previewText(body, PUSH_BODY_MAX) || 'Bildirim metni'}
        </p>
      </div>
    </div>
  );
}
