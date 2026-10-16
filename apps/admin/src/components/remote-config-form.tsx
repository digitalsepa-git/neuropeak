'use client';

import {
  isValidRemoteValue,
  type RemoteConfig,
  type RemoteKeyDefinition,
  type RemoteValue,
} from '@neuropeak/core';
import { useMemo, useState } from 'react';

/**
 * Uzaktan yapılandırma düzenleyicisi.
 *
 * Her alan kendi sözleşmesine göre doğrulanıyor ve geçersiz değerde
 * kaydetme kapanıyor. Bu ekrandan yazılan bir değer bütün kullanıcılara
 * anında gidiyor; hatayı burada yakalamak, uygulamanın varsayılana
 * düşmesini beklemekten iyi.
 *
 * Değişen alanlar işaretleniyor: on anahtarlık bir formda neyi
 * değiştirdiğini hatırlamak zor.
 */
export function RemoteConfigForm({
  definitions,
  values,
  canSave,
}: {
  definitions: readonly RemoteKeyDefinition[];
  values: RemoteConfig;
  canSave: boolean;
}) {
  const [draft, setDraft] = useState<Record<string, RemoteValue>>({ ...values });

  const invalid = useMemo(
    () =>
      definitions.filter(
        (definition) => !isValidRemoteValue(definition, draft[definition.key] ?? ''),
      ),
    [definitions, draft],
  );

  const changed = useMemo(
    () => definitions.filter((definition) => draft[definition.key] !== values[definition.key]),
    [definitions, draft, values],
  );

  return (
    <div>
      <ul className="space-y-sm">
        {definitions.map((definition) => {
          const value = draft[definition.key];
          const isChanged = value !== values[definition.key];
          const isInvalid = !isValidRemoteValue(definition, value ?? '');

          return (
            <li
              key={definition.key}
              className={`rounded-lg border bg-surface p-md shadow-card ${
                isInvalid ? 'border-danger' : isChanged ? 'border-brand' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between gap-sm">
                <div className="min-w-0">
                  <label htmlFor={definition.key} className="text-bodysmall font-semibold">
                    {definition.label}
                  </label>
                  <p className="mt-0.5 text-caption text-fg-muted">{definition.description}</p>
                  <p className="mt-0.5 font-mono text-caption text-fg-subtle">{definition.key}</p>
                </div>

                {isChanged && (
                  <span className="shrink-0 rounded-pill bg-brand px-xs py-0.5 text-overline font-semibold tracking-wide text-on-brand uppercase">
                    Değişti
                  </span>
                )}
              </div>

              <div className="mt-sm">
                <Field
                  definition={definition}
                  value={value}
                  onChange={(next) =>
                    setDraft((current) => ({ ...current, [definition.key]: next }))
                  }
                />
              </div>

              {isInvalid && (
                <p className="mt-xs text-caption text-danger">
                  {definition.type === 'number'
                    ? `Değer ${definition.min ?? 0} ile ${definition.max ?? '∞'} arasında olmalı`
                    : 'Geçersiz değer'}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-lg flex flex-wrap items-center gap-sm">
        <button
          type="button"
          disabled={!canSave || invalid.length > 0 || changed.length === 0}
          className="rounded-md bg-brand px-md py-1.5 text-bodysmall font-medium text-on-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          Kaydet{changed.length > 0 ? ` (${changed.length})` : ''}
        </button>

        <button
          type="button"
          disabled={changed.length === 0}
          onClick={() => setDraft({ ...values })}
          className="rounded-md border border-border px-md py-1.5 text-bodysmall disabled:cursor-not-allowed disabled:opacity-50"
        >
          Geri al
        </button>

        {!canSave && (
          <span className="text-caption text-fg-muted">
            Kaydetme Supabase bağlanınca açılır; değerler şimdilik varsayılanları gösteriyor.
          </span>
        )}
      </div>
    </div>
  );
}

function Field({
  definition,
  value,
  onChange,
}: {
  definition: RemoteKeyDefinition;
  value: RemoteValue | undefined;
  onChange: (next: RemoteValue) => void;
}) {
  const className =
    'w-full rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall outline-none focus:border-brand';

  if (definition.type === 'boolean') {
    return (
      <label className="flex items-center gap-xs text-bodysmall">
        <input
          id={definition.key}
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4"
        />
        {value === true ? 'Açık' : 'Kapalı'}
      </label>
    );
  }

  if (definition.type === 'number') {
    return (
      <input
        id={definition.key}
        type="number"
        min={definition.min}
        max={definition.max}
        value={typeof value === 'number' ? value : ''}
        onChange={(event) => onChange(Number(event.target.value))}
        className={className}
      />
    );
  }

  if (definition.options !== undefined) {
    return (
      <select
        id={definition.key}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        className={className}
      >
        {definition.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      id={definition.key}
      type="text"
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      className={className}
    />
  );
}
