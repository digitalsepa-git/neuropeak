import { createRng } from '../random';

/**
 * Çoklu Takip — hareket eden topların arasında hedefleri gözle izleme.
 *
 * Hareket saf bir adım fonksiyonuyla ilerliyor: ekran yalnızca
 * `stepTracking`'i çağırıp sonucu çiziyor. Fizik bu yüzden testlenebilir
 * — topların kutudan çıkmadığı ve duvardan sekmesi testle doğrulanıyor,
 * simülatörde göz kararı değil.
 */

export type Ball = {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly isTarget: boolean;
};

export type TrackingRound = {
  readonly balls: readonly Ball[];
  readonly targetCount: number;
  /** Hedeflerin kaç saniye işaretli kalacağı. */
  readonly previewSeconds: number;
  /** Topların kaç saniye hareket edeceği. */
  readonly moveSeconds: number;
};

/** Oyun alanı birim kare kabul edilir; ekran kendi ölçeğine çarpar. */
export const FIELD = 1;

export const BALL_RADIUS = 0.07;

export function trackingBallsForLevel(level: number): number {
  return Math.min(10, 4 + Math.floor((level - 1) / 3));
}

export function trackingTargetsForLevel(level: number): number {
  return Math.min(4, 1 + Math.floor((level - 1) / 4));
}

export function generateTracking(level: number, seed: number): TrackingRound {
  const rng = createRng(seed);
  const count = trackingBallsForLevel(level);
  const targets = trackingTargetsForLevel(level);
  const speed = 0.1 + Math.min(0.2, level * 0.01);

  const balls: Ball[] = [];

  for (let id = 0; id < count; id += 1) {
    // Hız yönü rastgele ama büyüklüğü sabit; bazı topların neredeyse
    // durması izlemeyi anlamsız kolaylaştırırdı.
    const angle = rng() * Math.PI * 2;

    balls.push({
      id,
      x: BALL_RADIUS + rng() * (FIELD - BALL_RADIUS * 2),
      y: BALL_RADIUS + rng() * (FIELD - BALL_RADIUS * 2),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      isTarget: id < targets,
    });
  }

  return {
    balls,
    targetCount: targets,
    previewSeconds: 2,
    moveSeconds: Math.min(10, 4 + Math.floor(level / 2)),
  };
}

/** Topları `dt` saniye ilerletir; duvara çarpanı geri sektirir. */
export function stepTracking(balls: readonly Ball[], dt: number): Ball[] {
  return balls.map((ball) => {
    let x = ball.x + ball.vx * dt;
    let y = ball.y + ball.vy * dt;
    let vx = ball.vx;
    let vy = ball.vy;

    if (x < BALL_RADIUS) {
      x = BALL_RADIUS;
      vx = Math.abs(vx);
    } else if (x > FIELD - BALL_RADIUS) {
      x = FIELD - BALL_RADIUS;
      vx = -Math.abs(vx);
    }

    if (y < BALL_RADIUS) {
      y = BALL_RADIUS;
      vy = Math.abs(vy);
    } else if (y > FIELD - BALL_RADIUS) {
      y = FIELD - BALL_RADIUS;
      vy = -Math.abs(vy);
    }

    return { ...ball, x, y, vx, vy };
  });
}
