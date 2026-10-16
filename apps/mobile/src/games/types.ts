import type { Difficulty } from '@neuropeak/core';

export type RoundOutcome = {
  /** Oyunun kendi puanı; oyunlar arası karşılaştırılmaz. */
  readonly score: number;
  /** Seviyeli oyunlarda ulaşılan seviye, süreli oyunlarda son tur. */
  readonly level: number;
  /** Oyun hedefine ulaşılarak mı bitti, yoksa yarıda mı kaldı. */
  readonly completed: boolean;
  /**
   * Üst barda seviye/tur yerine gösterilecek metin — süreli oyunlarda
   * geri sayım. Yalnızca oyun sürerken kullanılır.
   */
  readonly label?: string;
};

export type GameProps = {
  readonly difficulty: Difficulty;
  /** Başlanacak seviye; süreli oyunlarda 1. */
  readonly startLevel: number;
  /** Oyun ilerledikçe çağrılır; kabuk üst bardaki skoru buradan okur. */
  onProgress: (outcome: RoundOutcome) => void;
  onFinish: (outcome: RoundOutcome) => void;
};
