import type { BrainAgeMeasure, Localized } from '@neuropeak/core';

/**
 * Beyin Yaşı Testi.
 *
 * Diğer testler gibi soru sormuyor; dört kısa ölçüm yaptırıyor ve
 * sonucu bir yaş olarak gösteriyor. Bu yüzden `ContentTest` değil:
 * o tip soru havuzu etrafında kurulu ve burada soru yok.
 *
 * Sonuç ekranı ham ölçümleri de gösteriyor. Yaş bizim seçtiğimiz bir
 * ölçek, ölçümler ise gerçek — hangisinin ne olduğu kullanıcıya
 * açıkça söyleniyor.
 */
export type BrainAgeStep = {
  readonly measure: BrainAgeMeasure;
  readonly title: Localized;
  readonly instruction: Localized;
  /** Ölçümün yaklaşık süresi; giriş ekranında toplamı gösteriliyor. */
  readonly seconds: number;
};

export const BRAIN_AGE_STEPS: readonly BrainAgeStep[] = [
  {
    measure: 'reaction',
    title: { tr: 'Tepki', en: 'Reaction' },
    instruction: {
      tr: 'Ekran yeşile dönünce hemen dokun. Beş ölçüm alınacak.',
      en: 'Tap the moment the screen turns green. Five measurements.',
    },
    seconds: 30,
  },
  {
    measure: 'memory',
    title: { tr: 'Menzil', en: 'Span' },
    instruction: {
      tr: 'Rakamları aklında tut, sonra sırayla gir. Doğru bildikçe uzuyor.',
      en: 'Hold the digits in mind, then type them in order. They grow as you go.',
    },
    seconds: 60,
  },
  {
    measure: 'speed',
    title: { tr: 'Hız', en: 'Speed' },
    instruction: {
      tr: '30 saniyede olabildiğince çok işlem çöz.',
      en: 'Solve as many sums as you can in 30 seconds.',
    },
    seconds: 30,
  },
  {
    measure: 'focus',
    title: { tr: 'Dürtü kontrolü', en: 'Impulse control' },
    instruction: {
      tr: 'Yeşil daireye dokun, kırmızı kareye dokunma.',
      en: 'Tap the green circle, never the red square.',
    },
    seconds: 30,
  },
];

export const brainAgeTest = {
  id: 'brain-age',
  title: { tr: 'Beyin Yaşı Testi', en: 'Brain Age Test' },
  description: {
    tr: 'Tepki, menzil, hız ve dürtü kontrolü — dört kısa ölçüm, bir sayı.',
    en: 'Reaction, span, speed and impulse control — four short measurements, one number.',
  },
  /**
   * Yaşın bir ölçüm olmadığı giriş ekranında da yazıyor; testin
   * sonunda tekrar ediliyor.
   */
  caveat: {
    tr: 'Çıkan yaş biyolojik bir ölçüm değil, dört ölçümü tek sayıda toplayan eğlencelik bir ölçek. Ölçümlerin kendisi sonuç ekranında ayrıca gösteriliyor.',
    en: 'The age is not a biological measurement — it is a playful scale that sums up four measurements. The measurements themselves are shown separately on the result screen.',
  },
  estMinutes: [3, 5] as const,
  isPro: true,
  steps: BRAIN_AGE_STEPS,
};
