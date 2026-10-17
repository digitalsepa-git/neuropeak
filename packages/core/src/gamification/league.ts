import { createRng, seedFromString, shuffle } from '../random';

/**
 * Haftalık lig.
 *
 * Hafta pazartesi başlar, pazar gecesi biter. Oyuncu otuz kişilik bir
 * gruba düşer; hafta sonunda ilk on terfi eder, son beş düşer. Sıralama
 * yalnızca o hafta kazanılan XP'ye bakar — toplam XP'ye değil, yoksa
 * eski oyuncular tabloyu kalıcı olarak kilitlerdi.
 *
 * Buradaki her şey saf: grup listesi dışarıdan geliyor, sıralama ve
 * terfi kararı bu listeden hesaplanıyor. Liste gerçek kullanıcılardan
 * da gelebilir, `generatePracticeCohort` ile yerel üretilmiş bir deneme
 * grubundan da.
 */

export const LEAGUE_TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'legend'] as const;

export type LeagueTier = (typeof LEAGUE_TIERS)[number];

export const GROUP_SIZE = 30;
export const PROMOTION_COUNT = 10;
export const RELEGATION_COUNT = 5;

export type LeagueOutcome = 'promote' | 'hold' | 'relegate';

export type LeagueMember = {
  readonly id: string;
  readonly name: string;
  readonly weeklyXp: number;
  readonly isCurrentUser?: boolean;
};

export type LeagueStanding = LeagueMember & {
  readonly rank: number;
  readonly outcome: LeagueOutcome;
};

const DAY_MS = 86_400_000;

/** Haftanın pazartesi tarihi; yerel güne göre, 'YYYY-MM-DD'. */
export function weekStartKey(date: Date): string {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // getDay() pazarı 0 verir; pazartesiyi haftanın başı saymak için kaydırılıyor.
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));

  const year = monday.getFullYear();
  const month = `${monday.getMonth() + 1}`.padStart(2, '0');
  const day = `${monday.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Hafta bitimine kalan milisaniye; bitmişse 0. */
export function msUntilWeekEnd(now: Date): number {
  const start = Date.parse(`${weekStartKey(now)}T00:00:00`);
  const end = start + 7 * DAY_MS;
  return Math.max(0, end - now.getTime());
}

/** "3 gün 14 saat" / "14 saat 20 dakika" / "12 dakika". */
/**
 * Kalan süre, en büyük iki birime indirgenmiş hâlde.
 *
 * Metin değil veri dönüyor: "3 gün 14 saat" ile "3d 14h" arasındaki
 * fark dilin işi, çekirdeğin değil.
 */
export type RemainingTime =
  | { readonly unit: 'days'; readonly days: number; readonly hours: number }
  | { readonly unit: 'hours'; readonly hours: number; readonly minutes: number }
  | { readonly unit: 'minutes'; readonly minutes: number };

export function remainingTime(ms: number): RemainingTime {
  const totalMinutes = Math.max(0, Math.floor(ms / 60_000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return { unit: 'days', days, hours };
  if (hours > 0) return { unit: 'hours', hours, minutes };
  return { unit: 'minutes', minutes };
}

export function outcomeForRank(rank: number, size: number): LeagueOutcome {
  if (rank <= PROMOTION_COUNT) return 'promote';
  if (rank > size - RELEGATION_COUNT) return 'relegate';
  return 'hold';
}

/**
 * XP'ye göre sıralar. Eşitlikte kimlik karşılaştırılıyor: sıralama her
 * açılışta aynı çıksın, liste her yenilendiğinde yer değiştirmesin.
 */
export function standings(members: readonly LeagueMember[]): LeagueStanding[] {
  const sorted = [...members].sort(
    (a, b) => b.weeklyXp - a.weeklyXp || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );

  return sorted.map((member, index) => ({
    ...member,
    rank: index + 1,
    outcome: outcomeForRank(index + 1, sorted.length),
  }));
}

export function tierAfter(tier: LeagueTier, outcome: LeagueOutcome): LeagueTier {
  const index = LEAGUE_TIERS.indexOf(tier);
  if (outcome === 'promote')
    return LEAGUE_TIERS[Math.min(LEAGUE_TIERS.length - 1, index + 1)] as LeagueTier;
  if (outcome === 'relegate') return LEAGUE_TIERS[Math.max(0, index - 1)] as LeagueTier;
  return tier;
}

/** Terfi bölgesine girmek için gereken XP; zaten içerideyse 0. */
export function xpToPromotion(table: readonly LeagueStanding[], userId: string): number {
  const user = table.find((row) => row.id === userId);
  if (user === undefined || user.rank <= PROMOTION_COUNT) return 0;

  const cutoff = table[PROMOTION_COUNT - 1];
  if (cutoff === undefined) return 0;

  // Eşitlik kimliğe göre çözüldüğü için bir XP fazlası garanti etmiyor;
  // sınırdakini geçmek için bir fazlası isteniyor.
  return Math.max(1, cutoff.weeklyXp - user.weeklyXp + 1);
}

/**
 * Yerel deneme grubu.
 *
 * Supabase projesi bağlanana kadar gerçek rakip yok. Boş bir tablo
 * göstermek yerine tohumlanmış bir grup üretiliyor; arayüz bunu
 * "deneme ligi" diye açıkça etiketliyor, gerçek oyuncu gibi
 * sunulmuyor. Grup hafta ve kullanıcıya göre tohumlandığı için hafta
 * boyunca aynı kalıyor.
 *
 * @param progress Haftanın ne kadarının geçtiği (0–1); rakiplerin XP'si
 * hafta ilerledikçe artsın diye.
 */
export function generatePracticeCohort(options: {
  readonly names: readonly string[];
  readonly tier: LeagueTier;
  readonly weekStart: string;
  readonly userId: string;
  readonly userName: string;
  readonly userXp: number;
  readonly progress: number;
}): LeagueMember[] {
  const rng = createRng(seedFromString(`${options.tier}:${options.weekStart}:${options.userId}`));
  const progress = Math.min(1, Math.max(0, options.progress));

  // Kademe yükseldikçe rakipler daha çok oynuyor.
  const tierIndex = LEAGUE_TIERS.indexOf(options.tier);
  const base = 400 + tierIndex * 450;

  const pool = shuffle([...options.names], rng);
  const members: LeagueMember[] = [
    { id: options.userId, name: options.userName, weeklyXp: options.userXp, isCurrentUser: true },
  ];

  for (let index = 0; index < GROUP_SIZE - 1; index += 1) {
    const target = Math.round(base * (0.35 + rng() * 1.3));

    members.push({
      id: `practice-${index}`,
      name: pool[index % pool.length] as string,
      weeklyXp: Math.round(target * progress),
    });
  }

  return members;
}

/** Haftanın ne kadarı geçti (0–1). */
export function weekProgress(now: Date): number {
  const start = Date.parse(`${weekStartKey(now)}T00:00:00`);
  return Math.min(1, Math.max(0, (now.getTime() - start) / (7 * DAY_MS)));
}
