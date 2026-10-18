/**
 * Profil testlerinin puanlaması.
 *
 * IQ testlerinden farkı doğru cevabın olmaması: her şık bir ya da
 * birkaç eksene puan yazıyor, test bitince eksenler karşılaştırılıyor.
 *
 * Bu testler bir kişilik envanteri değil. Yayımlanmış bir ölçeğe
 * dayanmıyorlar ve sonuç ekranı bunu söylüyor. Burada yalnızca
 * toplama ve normalleştirme var; ne anlama geldiği içerik paketinde
 * yazılı.
 */

export type TraitWeights = Readonly<Record<string, number>>;
export type TraitScores = Readonly<Record<string, number>>;

export type ProfileOption = {
  /** Bu şık hangi eksenlere kaç puan yazıyor. */
  readonly weights: TraitWeights;
};

export type ProfileQuestionShape = {
  readonly options: readonly ProfileOption[];
};

/**
 * Eksen puanları, 0 ile 1 arasında.
 *
 * Her eksen o eksende toplanabilecek en yüksek puana bölünüyor:
 * bir eksene üç soru, diğerine altı soru yazıyorsa ham toplamları
 * karşılaştırmak ikincisini her zaman öne çıkarırdı.
 *
 * Cevaplanmamış soru (indeks `null` ya da aralık dışı) hem paya hem
 * paydaya girmiyor: yarıda bırakılan test kalan eksenleri
 * cezalandırmıyor.
 */
export function scoreProfile(
  questions: readonly ProfileQuestionShape[],
  answers: readonly (number | null)[],
): TraitScores {
  const totals = new Map<string, number>();
  const maxima = new Map<string, number>();

  questions.forEach((question, index) => {
    const answer = answers[index];
    const chosen = answer === null || answer === undefined ? undefined : question.options[answer];
    if (chosen === undefined) return;

    // Bu sorunun her eksende verebileceği en yüksek puan, tavana
    // eklenir. Soruların en yükseğini almak değil toplamak gerekiyor:
    // bir eksene iki soru yazıyorsa tavanı iki sorunun toplamı.
    const best = new Map<string, number>();
    for (const option of question.options) {
      for (const [trait, weight] of Object.entries(option.weights)) {
        best.set(trait, Math.max(best.get(trait) ?? 0, weight));
      }
    }
    for (const [trait, weight] of best) {
      maxima.set(trait, (maxima.get(trait) ?? 0) + weight);
    }

    for (const [trait, weight] of Object.entries(chosen.weights)) {
      totals.set(trait, (totals.get(trait) ?? 0) + weight);
    }
  });

  const scores: Record<string, number> = {};
  for (const [trait, max] of maxima) {
    scores[trait] = max === 0 ? 0 : Math.max(0, Math.min(1, (totals.get(trait) ?? 0) / max));
  }
  return scores;
}

/** Eksenleri yüksekten düşüğe; eşitlikte ad sırası sabit tutuluyor. */
export function rankTraits(scores: TraitScores): readonly string[] {
  return Object.keys(scores).sort((a, b) => {
    const diff = (scores[b] ?? 0) - (scores[a] ?? 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
}

/** En yüksek ve en düşük eksen arasındaki fark. */
export function traitSpread(scores: TraitScores): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

/** Altında "şu eksenin öne çıkıyor" denmeyen fark. */
export const MEANINGFUL_TRAIT_SPREAD = 0.08;

export type ProfileOutcomeShape = {
  readonly id: string;
  /** Bu sonucu temsil eden eksenler; eşleşme bunların ortalaması. */
  readonly traits: readonly string[];
};

export type OutcomeMatch<T extends ProfileOutcomeShape> = {
  readonly outcome: T;
  /** 0 ile 1 arasında; sonucun eksenlerinin ortalaması. */
  readonly score: number;
};

/**
 * Sonuçları eşleşmeye göre sıralar.
 *
 * Eşleşme, sonucun temsil ettiği eksenlerin ortalaması. Eşitlikte
 * tanım sırası korunuyor: aynı cevaplar her açılışta aynı sonucu
 * versin.
 */
export function rankOutcomes<T extends ProfileOutcomeShape>(
  outcomes: readonly T[],
  scores: TraitScores,
): readonly OutcomeMatch<T>[] {
  return outcomes
    .map((outcome, index) => {
      const values = outcome.traits.map((trait) => scores[trait] ?? 0);
      const score =
        values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
      return { outcome, score, index };
    })
    .sort((a, b) => (b.score !== a.score ? b.score - a.score : a.index - b.index))
    .map(({ outcome, score }) => ({ outcome, score }));
}
