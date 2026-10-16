import type { QuestionKind, ReportDimension, ScoringNorm } from '@neuropeak/core';

export type Localized = {
  readonly tr: string;
  readonly en: string;
};

export type ContentQuestion = {
  readonly id: string;
  readonly kind: QuestionKind;
  readonly prompt: Localized;
  readonly options: readonly Localized[];
  readonly correctIndex: number;
  /**
   * Skorlamadaki ağırlık. Kolay sorular 0.7 civarında, en zorlar 2'ye
   * yaklaşır; bir testin ortalaması 1'e yakın tutulur.
   */
  readonly difficultyWeight: number;
  readonly explanation?: Localized;
};

export type ContentTest = {
  readonly id: string;
  readonly kind: 'iq' | 'fun';
  readonly title: Localized;
  readonly description: Localized;
  /** Bir oturumda havuzdan kaç soru sorulur. */
  readonly questionCount: number;
  readonly estMinutes: readonly [number, number];
  readonly isPro: boolean;
  /**
   * Tek bir alanı ölçen testler için o alan. Genel testlerde boş
   * bırakılır; soru türü dağılımı denetlenirken ikisi farklı
   * değerlendirilir — Sözel IQ'nun sözel sorulardan oluşması kusur
   * değil, tanımı.
   */
  readonly focus?: ReportDimension;
  readonly norm: ScoringNorm;
  readonly questions: readonly ContentQuestion[];
};
