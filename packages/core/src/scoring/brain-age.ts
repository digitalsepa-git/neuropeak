/**
 * Beyin Yaşı ölçümü.
 *
 * Dört kısa ölçümden bir sayı üretir. Bu sayı **biyolojik bir ölçüm
 * değil**: yayımlanmış bir norm tablosuna dayanmıyor, bizim
 * seçtiğimiz bir ölçek. Bu yüzden sonuç ekranı ham ölçümleri de
 * gösteriyor — tepki süresi milisaniye, menzil hane, hız doğru/dakika,
 * doğruluk yüzde. Sayı eğlencelik, ölçümler gerçek.
 *
 * Eşikler aşağıda açıkça yazılı; birini değiştirmek sonucu
 * değiştirir ve testler eşiklerin uçlarını sabitliyor.
 */

export const BRAIN_AGE_MEASURES = ['reaction', 'memory', 'speed', 'focus'] as const;
export type BrainAgeMeasure = (typeof BRAIN_AGE_MEASURES)[number];

/** Ölçeğin uçları. Altına da üstüne de çıkılmıyor. */
export const BRAIN_AGE_MIN = 18;
export const BRAIN_AGE_MAX = 70;

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * İki uç arasında doğrusal eşleme: `best` 1 puan, `worst` 0 puan.
 * Tepki süresinde olduğu gibi küçük değerin iyi olduğu ölçümlerde
 * `best` büyükten küçüktür.
 */
function between(value: number, best: number, worst: number): number {
  if (best === worst) return 0;
  return clamp01((value - worst) / (best - worst));
}

/**
 * Tepki süresi puanı. 220 ms ve altı tam puan, 600 ms ve üstü sıfır.
 *
 * Ortalama değil ortanca bekleniyor: tek bir dalgınlık ortalamayı
 * uçuruyor ve insanın gerçek tepkisini temsil etmiyor.
 */
export function reactionScore(medianMs: number): number {
  return between(medianMs, 220, 600);
}

/** Hane menzili puanı. 4 hane sıfır, 9 hane tam puan. */
export function memoryScore(span: number): number {
  return between(span, 9, 4);
}

/** İşlem hızı puanı: dakikada doğru sayısı. 10 sıfır, 40 tam puan. */
export function speedScore(correctPerMinute: number): number {
  return between(correctPerMinute, 40, 10);
}

/** Dürtü kontrolü puanı: doğru tepki oranı. 0.6 sıfır, 1 tam puan. */
export function focusScore(accuracy: number): number {
  return between(accuracy, 1, 0.6);
}

export type BrainAgeScores = Readonly<Record<BrainAgeMeasure, number>>;

/**
 * Ölçümlerin ağırlıkları.
 *
 * Tepki ve hız daha ağır: ikisi de yaşla en belirgin değişen
 * ölçümler ve en az öğrenme etkisi taşıyanlar. Menzil ve dürtü
 * kontrolü pratikle daha çabuk yükseliyor.
 */
const WEIGHTS: BrainAgeScores = {
  reaction: 0.3,
  memory: 0.25,
  speed: 0.3,
  focus: 0.15,
};

export function overallScore(scores: BrainAgeScores): number {
  const total = BRAIN_AGE_MEASURES.reduce(
    (sum, measure) => sum + clamp01(scores[measure]) * WEIGHTS[measure],
    0,
  );
  const weight = BRAIN_AGE_MEASURES.reduce((sum, measure) => sum + WEIGHTS[measure], 0);
  return clamp01(total / weight);
}

/**
 * Toplam puandan yaşa. Tam puan ölçeğin alt ucu, sıfır üst ucu.
 *
 * Doğrusal: eğri uydurmak, elimizde olmayan bir kesinlik iddia
 * ederdi.
 */
export function brainAge(scores: BrainAgeScores): number {
  const overall = overallScore(scores);
  return Math.round(BRAIN_AGE_MAX - overall * (BRAIN_AGE_MAX - BRAIN_AGE_MIN));
}

/**
 * En güçlü ve en zayıf ölçüm. Eşitlikte sabit sıra kullanılıyor ki
 * aynı sonuç her açılışta aynı yorumu versin.
 */
export function rankMeasures(scores: BrainAgeScores): readonly BrainAgeMeasure[] {
  return [...BRAIN_AGE_MEASURES].sort((a, b) => {
    const diff = clamp01(scores[b]) - clamp01(scores[a]);
    return diff !== 0 ? diff : BRAIN_AGE_MEASURES.indexOf(a) - BRAIN_AGE_MEASURES.indexOf(b);
  });
}

/**
 * En yüksek ve en düşük ölçüm arasındaki fark.
 *
 * Fark yoksa "en güçlü ölçümün şu" demek yanıltıcı: dördü de aynı
 * çıkmışken sıralamanın başındaki, listedeki sırası yüzünden
 * başta duruyor.
 */
export function measureSpread(scores: BrainAgeScores): number {
  const values = BRAIN_AGE_MEASURES.map((measure) => clamp01(scores[measure]));
  return Math.max(...values) - Math.min(...values);
}

/** Altında güçlü/zayıf yorumunun yapılmadığı fark. */
export const MEANINGFUL_SPREAD = 0.05;

/** Bir dizinin ortancası; tepki süresinde ortalama yerine bu kullanılıyor. */
export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? (sorted[middle] as number)
    : ((sorted[middle - 1] as number) + (sorted[middle] as number)) / 2;
}
