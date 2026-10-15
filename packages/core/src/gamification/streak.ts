/**
 * Günlük seri.
 *
 * Gün sınırı cihazın yerel tarihine göre belirlenir; kullanıcı gece
 * yarısını kendi saatiyle yaşar. Tarihler 'YYYY-MM-DD' biçiminde tutulur.
 */

export type StreakState = {
  readonly currentDays: number;
  readonly longestDays: number;
  readonly lastActiveDate: string | null;
  /** Elde kalan seri dondurma hakkı. */
  readonly freezesLeft: number;
};

export const EMPTY_STREAK: StreakState = {
  currentDays: 0,
  longestDays: 0,
  lastActiveDate: null,
  freezesLeft: 0,
};

/** Kutlama yapılan seri eşikleri. */
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function daysBetween(from: string, to: string): number {
  const fromTime = Date.parse(`${from}T00:00:00Z`);
  const toTime = Date.parse(`${to}T00:00:00Z`);
  return Math.round((toTime - fromTime) / 86_400_000);
}

export type StreakOutcome = {
  readonly state: StreakState;
  /** Seri bu etkinlikle arttı mı. */
  readonly extended: boolean;
  /** Bir gün kaçırılmış ama dondurma hakkıyla kurtarılmış. */
  readonly usedFreeze: boolean;
  /** Seri sıfırlandı. */
  readonly broken: boolean;
  /** Bu etkinlikle ulaşılan eşik, varsa. */
  readonly milestone: number | null;
};

/**
 * Bir etkinliği (oyun veya test tamamlama) seriye işler.
 *
 * - Aynı gün tekrar oynamak seriyi artırmaz.
 * - Ertesi gün oynamak seriyi bir artırır.
 * - Bir gün atlanmışsa ve dondurma hakkı varsa seri korunur, hak harcanır.
 * - Daha uzun boşlukta seri sıfırlanıp bir günden yeniden başlar.
 */
export function recordActivity(state: StreakState, today: string): StreakOutcome {
  if (state.lastActiveDate === null) {
    const next = {
      ...state,
      currentDays: 1,
      longestDays: Math.max(1, state.longestDays),
      lastActiveDate: today,
    };
    return {
      state: next,
      extended: true,
      usedFreeze: false,
      broken: false,
      milestone: milestoneFor(1),
    };
  }

  const gap = daysBetween(state.lastActiveDate, today);

  // Aynı gün ya da ileri sarılmış bir saat: seri değişmez.
  if (gap <= 0) {
    return { state, extended: false, usedFreeze: false, broken: false, milestone: null };
  }

  if (gap === 1) {
    const currentDays = state.currentDays + 1;
    return {
      state: {
        ...state,
        currentDays,
        longestDays: Math.max(currentDays, state.longestDays),
        lastActiveDate: today,
      },
      extended: true,
      usedFreeze: false,
      broken: false,
      milestone: milestoneFor(currentDays),
    };
  }

  // Tam bir gün kaçırılmış: dondurma hakkı varsa seri korunur.
  if (gap === 2 && state.freezesLeft > 0) {
    const currentDays = state.currentDays + 1;
    return {
      state: {
        ...state,
        currentDays,
        longestDays: Math.max(currentDays, state.longestDays),
        lastActiveDate: today,
        freezesLeft: state.freezesLeft - 1,
      },
      extended: true,
      usedFreeze: true,
      broken: false,
      milestone: milestoneFor(currentDays),
    };
  }

  return {
    state: { ...state, currentDays: 1, lastActiveDate: today },
    extended: true,
    usedFreeze: false,
    broken: true,
    milestone: null,
  };
}

/** Seri hâlâ canlı mı — bugün oynanmamış olsa bile dün oynandıysa canlıdır. */
export function isStreakAlive(state: StreakState, today: string): boolean {
  if (state.lastActiveDate === null) return false;
  return daysBetween(state.lastActiveDate, today) <= 1;
}

function milestoneFor(days: number): number | null {
  return STREAK_MILESTONES.find((milestone) => milestone === days) ?? null;
}
