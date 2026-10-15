import { clamp, standardNormalCdf } from '../utils/math';

/**
 * Norm tabanlı skorlama.
 *
 * Ham puan, doğru cevapların zorluk ağırlıklarının toplamı artı hız
 * bonusudur. Bu puan ulaşılabilecek en yüksek puana bölünerek orana
 * çevrilir; oran, testin norm ortalaması ve standart sapmasıyla z-skoruna,
 * z-skoru da ortalaması 100 ve standart sapması 15 olan ölçeğe taşınır.
 *
 * Normlar oran cinsindendir (0–1 arası), ham puan cinsinden değil: soru
 * sayısı veya zorluk dağılımı değişse de aynı normlar geçerli kalır.
 */

export type QuestionKind =
  | 'matrix'
  | 'number_series'
  | 'shape_analogy'
  | 'verbal_analogy'
  | 'logic'
  | 'spatial'
  | 'coding'
  | 'odd_one_out'
  | 'arithmetic';

/** Sonuç raporundaki alt boyutlar. */
export const REPORT_DIMENSIONS = ['verbal', 'numeric', 'visual', 'logical'] as const;
export type ReportDimension = (typeof REPORT_DIMENSIONS)[number];

const KIND_TO_DIMENSION: Readonly<Record<QuestionKind, ReportDimension>> = {
  verbal_analogy: 'verbal',
  number_series: 'numeric',
  arithmetic: 'numeric',
  matrix: 'visual',
  shape_analogy: 'visual',
  spatial: 'visual',
  logic: 'logical',
  odd_one_out: 'logical',
  coding: 'logical',
};

export type AnsweredQuestion = {
  readonly questionId: string;
  readonly kind: QuestionKind;
  readonly difficultyWeight: number;
  readonly isCorrect: boolean;
  readonly elapsedMs: number;
};

export type ScoringNorm = {
  /** Nüfusun ortalama başarı oranı (0–1). */
  readonly mean: number;
  /** Başarı oranının standart sapması. */
  readonly sd: number;
};

export type ScoringConfig = {
  /** Hız bonusunun ham puana en çok katkısı; 0.1 = %10. */
  readonly timeBonusWeight: number;
  /** Bu süreden hızlı cevaplar bonus kazanır. */
  readonly targetMsPerQuestion: number;
};

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  timeBonusWeight: 0.1,
  targetMsPerQuestion: 45_000,
};

export const DEFAULT_NORM: ScoringNorm = { mean: 0.55, sd: 0.18 };

export const IQ_MIN = 55;
export const IQ_MAX = 145;

export type ScoreBand = 'developing' | 'average' | 'aboveAverage' | 'superior' | 'exceptional';

export function bandForIq(iq: number): ScoreBand {
  if (iq < 85) return 'developing';
  if (iq < 100) return 'average';
  if (iq < 115) return 'aboveAverage';
  if (iq < 130) return 'superior';
  return 'exceptional';
}

export type ScoreResult = {
  readonly iq: number;
  readonly percentile: number;
  readonly band: ScoreBand;
  readonly rawScore: number;
  readonly maxRawScore: number;
  readonly correctCount: number;
  readonly answeredCount: number;
  readonly durationMs: number;
  /** Yeterli soru bulunan alt boyutlar için IQ ölçeğinde puanlar. */
  readonly subscores: Partial<Record<ReportDimension, number>>;
};

/** Bir soru için hız bonusu çarpanı: zamanında bitirene 1, geç kalana 0. */
function speedFactor(elapsedMs: number, targetMs: number): number {
  if (targetMs <= 0) return 0;
  return clamp((targetMs - elapsedMs) / targetMs, 0, 1);
}

function rawScoreOf(answers: readonly AnsweredQuestion[], config: ScoringConfig): number {
  return answers.reduce((total, answer) => {
    if (!answer.isCorrect) return total;

    const bonus =
      config.timeBonusWeight * speedFactor(answer.elapsedMs, config.targetMsPerQuestion);

    return total + answer.difficultyWeight * (1 + bonus);
  }, 0);
}

function maxRawScoreOf(answers: readonly AnsweredQuestion[], config: ScoringConfig): number {
  return answers.reduce(
    (total, answer) => total + answer.difficultyWeight * (1 + config.timeBonusWeight),
    0,
  );
}

function iqFromRatio(ratio: number, norm: ScoringNorm): number {
  const z = (ratio - norm.mean) / norm.sd;
  return clamp(Math.round(100 + 15 * z), IQ_MIN, IQ_MAX);
}

/**
 * Bir test oturumunu puanlar. Hiç soru cevaplanmamışsa en düşük skor
 * döner — bu durum arayüzde zaten engellenir, burada yalnızca tanımlıdır.
 */
export function scoreTest(
  answers: readonly AnsweredQuestion[],
  norm: ScoringNorm = DEFAULT_NORM,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): ScoreResult {
  const durationMs = answers.reduce((total, answer) => total + answer.elapsedMs, 0);
  const correctCount = answers.filter((answer) => answer.isCorrect).length;
  const maxRawScore = maxRawScoreOf(answers, config);
  const rawScore = rawScoreOf(answers, config);
  const ratio = maxRawScore === 0 ? 0 : rawScore / maxRawScore;

  const iq = iqFromRatio(ratio, norm);
  const z = (iq - 100) / 15;

  return {
    iq,
    percentile: Math.round(standardNormalCdf(z) * 1000) / 10,
    band: bandForIq(iq),
    rawScore: Math.round(rawScore * 1000) / 1000,
    maxRawScore: Math.round(maxRawScore * 1000) / 1000,
    correctCount,
    answeredCount: answers.length,
    durationMs,
    subscores: subscoresOf(answers, norm, config),
  };
}

/** Bir alt boyut için en az bu kadar soru gerekir; azı anlamlı değil. */
const MIN_QUESTIONS_PER_DIMENSION = 2;

function subscoresOf(
  answers: readonly AnsweredQuestion[],
  norm: ScoringNorm,
  config: ScoringConfig,
): Partial<Record<ReportDimension, number>> {
  const grouped = new Map<ReportDimension, AnsweredQuestion[]>();

  for (const answer of answers) {
    const dimension = KIND_TO_DIMENSION[answer.kind];
    const bucket = grouped.get(dimension) ?? [];
    bucket.push(answer);
    grouped.set(dimension, bucket);
  }

  const result: Partial<Record<ReportDimension, number>> = {};

  for (const [dimension, bucket] of grouped) {
    if (bucket.length < MIN_QUESTIONS_PER_DIMENSION) continue;

    const max = maxRawScoreOf(bucket, config);
    const raw = rawScoreOf(bucket, config);
    result[dimension] = iqFromRatio(max === 0 ? 0 : raw / max, norm);
  }

  return result;
}

export function dimensionOf(kind: QuestionKind): ReportDimension {
  return KIND_TO_DIMENSION[kind];
}
