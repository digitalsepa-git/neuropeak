import { TR_DISPLAY_NAMES } from '@neuropeak/content';
import {
  LEAGUE_TIERS,
  generatePracticeCohort,
  standings,
  tierAfter,
  weekProgress,
  weekStartKey,
  type LeagueMember,
  type LeagueTier,
} from '@neuropeak/core';

import { type LeagueState } from './storage';

const USER_NAME = 'Sen';

/** İki kademeden yüksek olanı. */
function bestOf(a: LeagueTier, b: LeagueTier): LeagueTier {
  return LEAGUE_TIERS.indexOf(a) >= LEAGUE_TIERS.indexOf(b) ? a : b;
}

/**
 * Lig grubu. Supabase projesi bağlanana kadar rakipler yerel
 * üretiliyor; arayüz bunu "deneme ligi" diye etiketliyor.
 */
export function cohortFor(
  league: LeagueState,
  userId: string,
  weekStart: string,
  progress: number,
): LeagueMember[] {
  return generatePracticeCohort({
    names: TR_DISPLAY_NAMES,
    tier: league.tier,
    weekStart,
    userId,
    userName: USER_NAME,
    userXp: league.weeklyXp,
    progress,
  });
}

export function currentCohort(league: LeagueState, userId: string, now: Date): LeagueMember[] {
  return cohortFor(league, userId, weekStartKey(now), weekProgress(now));
}

/**
 * Hafta değiştiyse geçen haftayı kapatır: sıralama hesaplanır, terfi
 * ya da düşme uygulanır, haftalık XP sıfırlanır. Aynı hafta içinde
 * çağrılırsa durumu değiştirmez.
 */
export function rolloverLeague(league: LeagueState, now: Date, userId: string): LeagueState {
  const thisWeek = weekStartKey(now);

  if (league.weekStart === null) {
    return { ...league, weekStart: thisWeek, weeklyXp: 0 };
  }

  if (league.weekStart === thisWeek) return league;

  // Geçen haftanın grubu tohumdan birebir yeniden üretilebiliyor;
  // sıralamayı kapatmak için sunucuya gerek yok.
  const finished = cohortFor(league, userId, league.weekStart, 1);
  const table = standings(finished);
  const user = table.find((row) => row.id === userId);

  if (user === undefined) {
    return { ...league, weekStart: thisWeek, weeklyXp: 0 };
  }

  const tier = tierAfter(league.tier, user.outcome);

  return {
    ...league,
    tier,
    weekStart: thisWeek,
    weeklyXp: 0,
    lastResult: { tier: league.tier, rank: user.rank, outcome: user.outcome },
    bestTier: bestOf(league.bestTier, tier),
  };
}
