'use client';

import type { ContentQuestion } from '@neuropeak/content';
import { useActionState, useState } from 'react';

import { IDLE, updateQuestion } from '@/app/content/actions';

import { Field, Result } from './task-editor';

/**
 * Bir sorunun düzenleme formu.
 *
 * İki şey özel:
 *
 * Doğru şık radyo düğmesiyle seçiliyor, elle indeks yazılmıyor. Bir
 * şık silindiğinde indeks kayar ve sessizce başka bir şıkkı doğru
 * gösterirdi; radyo düğmesi seçimi şıkka bağlıyor.
 *
 * Görsel soruların şekil şeması düzenlenmiyor. Elle yazılacak bir
 * veri değil ve bu sorularda ekranda görünen şekiller; aşağıdaki
 * metinler ekran okuyucu etiketi. Form bunu söylüyor, yoksa metni
 * değiştiren kişi şeklin de değiştiğini sanabilir.
 */
export function QuestionEditor({
  question,
  usedIn,
  onClose,
}: {
  question: ContentQuestion;
  usedIn: readonly string[];
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState(updateQuestion, IDLE);
  const [options, setOptions] = useState(() =>
    question.options.map((option) => ({ tr: option.tr, en: option.en })),
  );
  const [correct, setCorrect] = useState(question.correctIndex);

  const addOption = () => setOptions([...options, { tr: '', en: '' }]);

  const removeOption = (index: number) => {
    if (options.length <= 2) return;

    setOptions(options.filter((_, i) => i !== index));
    // Doğru şık silindiyse ilk şıkka düşüyor; sonrasındaki bir şıksa
    // bir sola kayıyor. Seçim hep var olan bir şıkkı gösteriyor.
    if (correct === index) setCorrect(0);
    else if (correct > index) setCorrect(correct - 1);
  };

  return (
    <form action={action} className="mt-md grid gap-sm border-t border-border pt-md">
      <input type="hidden" name="slug" value={question.id} />
      <input type="hidden" name="options_count" value={options.length} />
      <input type="hidden" name="correct_index" value={correct} />

      {usedIn.length > 1 && (
        <p className="rounded-md border border-border bg-surface-sunken p-sm text-caption text-fg-muted">
          Bu soru {usedIn.length} testte geçiyor: {usedIn.join(', ')}. Değişiklik hepsini etkiliyor.
        </p>
      )}

      {question.visual !== undefined && (
        <p className="rounded-md border border-border bg-surface-sunken p-sm text-caption text-fg-muted">
          Görsel soru. Ekranda şekiller görünüyor; aşağıdaki metinler ekran okuyucu etiketi. Şekil
          şeması panelden düzenlenmiyor.
        </p>
      )}

      <div className="grid gap-sm sm:grid-cols-2">
        <Field label="Türkçe soru metni" name="prompt_tr" defaultValue={question.prompt.tr} />
        <Field label="İngilizce soru metni" name="prompt_en" defaultValue={question.prompt.en} />
      </div>

      <fieldset className="grid gap-xs">
        <legend className="mb-1 text-bodysmall font-medium">Şıklar ve doğru cevap</legend>

        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-xs">
            <input
              type="radio"
              name="correct_choice"
              checked={correct === index}
              onChange={() => setCorrect(index)}
              aria-label={`${index + 1}. şık doğru`}
            />
            <input
              name={`option_tr_${index}`}
              value={option.tr}
              onChange={(event) =>
                setOptions(
                  options.map((o, i) => (i === index ? { ...o, tr: event.target.value } : o)),
                )
              }
              aria-label={`${index + 1}. şık, Türkçe`}
              className="min-w-0 flex-1 rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall"
            />
            <input
              name={`option_en_${index}`}
              value={option.en}
              onChange={(event) =>
                setOptions(
                  options.map((o, i) => (i === index ? { ...o, en: event.target.value } : o)),
                )
              }
              aria-label={`${index + 1}. şık, İngilizce`}
              className="min-w-0 flex-1 rounded-md border border-border bg-surface px-sm py-1.5 text-bodysmall"
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
              aria-label={`${index + 1}. şıkkı çıkar`}
              className="rounded-md border border-border px-sm py-1 text-bodysmall disabled:cursor-not-allowed disabled:opacity-50"
            >
              −
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addOption}
          className="justify-self-start rounded-md border border-border px-sm py-1 text-bodysmall"
        >
          Şık ekle
        </button>
      </fieldset>

      <div className="grid gap-sm sm:grid-cols-2">
        <Field
          label="Zorluk ağırlığı"
          name="difficulty_weight"
          defaultValue={`${question.difficultyWeight}`}
        />
        <label className="flex items-center gap-xs self-end text-bodysmall">
          <input type="checkbox" name="is_active" defaultChecked />
          <span>Yayında</span>
        </label>

        <Field
          label="Türkçe açıklama"
          name="explanation_tr"
          defaultValue={question.explanation?.tr ?? ''}
        />
        <Field
          label="İngilizce açıklama"
          name="explanation_en"
          defaultValue={question.explanation?.en ?? ''}
        />
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
