'use client';

import type { ContentGame } from '@neuropeak/content';
import { useActionState, useState } from 'react';

import { IDLE, updateGame } from '@/app/content/actions';

import { Field, Result } from './task-editor';

/**
 * Bir oyunun üst bilgisi.
 *
 * Kategori ve kip düzenlenmiyor ve form bunu söylüyor: kip oyunun
 * kendi ekranına bağlı, kategori beyin haritasında hangi ekseni
 * beslediğini belirliyor. İkisi de metin değil, yapı — değişirlerse
 * oyunun kodu da değişmeli.
 */
export function GameEditor({ game, onClose }: { game: ContentGame; onClose: () => void }) {
  const [state, action, pending] = useActionState(updateGame, IDLE);
  const [skills, setSkills] = useState(() =>
    game.skills.map((skill) => ({ tr: skill.tr, en: skill.en })),
  );

  return (
    <form action={action} className="mt-md grid gap-sm border-t border-border pt-md">
      <input type="hidden" name="id" value={game.id} />
      <input type="hidden" name="mode" value={game.mode} />

      <p className="rounded-md border border-border bg-surface-sunken p-sm text-caption text-fg-muted">
        Kategori ({game.category}) ve kip ({game.mode === 'levels' ? 'seviyeli' : 'süreli'})
        panelden değiştirilmiyor: oyunun ekranına ve beyin haritasındaki eksenine bağlılar.
      </p>

      <div className="grid gap-sm sm:grid-cols-2">
        <Field label="Türkçe ad" name="title_tr" defaultValue={game.title.tr} />
        <Field label="İngilizce ad" name="title_en" defaultValue={game.title.en} />
        <Field label="Türkçe yönerge" name="instruction_tr" defaultValue={game.instruction.tr} />
        <Field label="İngilizce yönerge" name="instruction_en" defaultValue={game.instruction.en} />
        <Field label="Türkçe açıklama" name="description_tr" defaultValue={game.description.tr} />
        <Field
          label="İngilizce açıklama"
          name="description_en"
          defaultValue={game.description.en}
        />
      </div>

      <fieldset className="grid gap-xs">
        <legend className="mb-1 text-bodysmall font-medium">Yetenekler</legend>
        <input type="hidden" name="skills_count" value={skills.length} />

        {skills.map((skill, index) => (
          <div key={index} className="flex items-center gap-xs">
            <input
              name={`skill_tr_${index}`}
              value={skill.tr}
              onChange={(event) =>
                setSkills(
                  skills.map((s, i) => (i === index ? { ...s, tr: event.target.value } : s)),
                )
              }
              aria-label={`${index + 1}. yetenek, Türkçe`}
              className="min-w-0 flex-1 rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall"
            />
            <input
              name={`skill_en_${index}`}
              value={skill.en}
              onChange={(event) =>
                setSkills(
                  skills.map((s, i) => (i === index ? { ...s, en: event.target.value } : s)),
                )
              }
              aria-label={`${index + 1}. yetenek, İngilizce`}
              className="min-w-0 flex-1 rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall"
            />
            <button
              type="button"
              onClick={() => setSkills(skills.filter((_, i) => i !== index))}
              aria-label={`${index + 1}. yeteneği çıkar`}
              className="rounded-md border border-border px-sm py-1 text-bodysmall"
            >
              −
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setSkills([...skills, { tr: '', en: '' }])}
          className="justify-self-start rounded-md border border-border px-sm py-1 text-bodysmall"
        >
          Yetenek ekle
        </button>
      </fieldset>

      <div className="grid gap-sm sm:grid-cols-2">
        <Field
          label="Tur başına XP"
          name="xp_per_round"
          type="number"
          defaultValue={`${game.baseXp}`}
          min={1}
        />
        <Field
          label={game.mode === 'levels' ? 'Seviye sayısı' : 'Seviye sayısı (süreli: 0)'}
          name="total_levels"
          type="number"
          defaultValue={`${game.totalLevels}`}
          min={0}
        />
        <label className="flex items-center gap-xs text-bodysmall">
          <input type="checkbox" name="is_active" defaultChecked />
          <span>Yayında</span>
        </label>
      </div>

      <Result state={state} pending={pending} />

      <button
        type="button"
        onClick={onClose}
        className="justify-self-start text-caption text-fg-muted hover:underline"
      >
        Düzenlemeyi kapat
      </button>
    </form>
  );
}
