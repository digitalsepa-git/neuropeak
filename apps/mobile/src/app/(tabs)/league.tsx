import {
  GROUP_SIZE,
  PROMOTION_COUNT,
  RELEGATION_COUNT,
  formatRemaining,
  msUntilWeekEnd,
  standings,
  xpToPromotion,
  type LeagueOutcome,
  type LeagueStanding,
  type LeagueTier,
} from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { Section } from '@/components/section';
import { Badge, Card, Screen, Text, useTheme } from '@/components/ui';
import { currentCohort } from '@/lib/progress/league';
import { useProgress } from '@/lib/progress/context';

const TIER_LABELS: Record<LeagueTier, string> = {
  bronze: 'Bronz Lig',
  silver: 'Gümüş Lig',
  gold: 'Altın Lig',
  platinum: 'Platin Lig',
  diamond: 'Elmas Lig',
  legend: 'Efsane Lig',
};

const OUTCOME_LABELS: Record<LeagueOutcome, string> = {
  promote: 'yükseldin',
  hold: 'ligde kaldın',
  relegate: 'düştün',
};

/** Geri sayım dakikada bir yenilenir; saniye göstermiyoruz. */
const TICK_MS = 60_000;

export default function LeagueScreen() {
  const theme = useTheme();
  const { state, userId } = useProgress();

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const table = useMemo(
    () => standings(currentCohort(state.league, userId, now)),
    [now, state.league, userId],
  );

  const me = table.find((row) => row.isCurrentUser === true);
  const needed = xpToPromotion(table, userId);
  const remaining = formatRemaining(msUntilWeekEnd(now));
  const result = state.league.lastResult;

  return (
    <Screen scroll>
      <AppHeader title="Lig" />

      <Card padding="lg">
        <View style={styles.leagueHead}>
          <View style={[styles.trophy, { backgroundColor: `${theme.colors.warning}1F` }]}>
            <Icon name="league" color={theme.colors.warning} size={28} />
          </View>
          <View style={styles.leagueText}>
            <Text variant="heading">{TIER_LABELS[state.league.tier]}</Text>
            <Text variant="bodySmall" color="textSecondary">
              Hafta bitimine {remaining}
            </Text>
          </View>
        </View>

        <Text variant="bodySmall" color="textSecondary" style={styles.leagueNote}>
          {me === undefined
            ? `İlk ${PROMOTION_COUNT} bir üst lige yükselir.`
            : needed === 0
              ? `${me.rank}. sıradasın — terfi bölgesindesin. Son ${RELEGATION_COUNT} bir alt lige düşer.`
              : `${me.rank}. sıradasın — terfi bölgesine ${needed} XP kaldı.`}
        </Text>
      </Card>

      {result !== null && (
        <Card padding="lg">
          <Text variant="bodyStrong">Geçen hafta {result.rank}. oldun</Text>
          <Text variant="bodySmall" color="textSecondary">
            {TIER_LABELS[result.tier]} sonunda {OUTCOME_LABELS[result.outcome]}.
          </Text>
        </Card>
      )}

      <Section title="Haftalık sıralama" meta={`${GROUP_SIZE} kişi`}>
        <Card padding="xs">
          {table.map((row, index) => (
            <View key={row.id}>
              <LeagueRowItem row={row} />
              {index === PROMOTION_COUNT - 1 && (
                <ZoneDivider label="Terfi bölgesi" color={theme.colors.success} />
              )}
              {index === table.length - RELEGATION_COUNT - 1 && (
                <ZoneDivider label="Düşme bölgesi" color={theme.colors.danger} />
              )}
            </View>
          ))}
        </Card>
      </Section>

      <Card padding="lg">
        <Text variant="bodyStrong">Deneme ligi</Text>
        <Text variant="bodySmall" color="textSecondary">
          Rakipler şimdilik cihazında üretiliyor; gerçek oyuncular sunucu bağlandığında gelecek.
          Sıralama, terfi ve düşme kuralları aynı çalışıyor.
        </Text>
      </Card>
    </Screen>
  );
}

function ZoneDivider({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.cutoff}>
      <View style={[styles.cutoffLine, { backgroundColor: color }]} />
      <Text variant="overline" style={{ color }}>
        {label}
      </Text>
      <View style={[styles.cutoffLine, { backgroundColor: color }]} />
    </View>
  );
}

function LeagueRowItem({ row }: { row: LeagueStanding }) {
  const theme = useTheme();
  const highlight = row.isCurrentUser === true;

  return (
    <View
      style={[
        styles.row,
        highlight && {
          backgroundColor: `${theme.colors.brand}14`,
          borderRadius: radius.sm,
        },
      ]}
    >
      <Text variant="bodyStrong" color={highlight ? 'brand' : 'textMuted'} style={styles.rank}>
        {row.rank}
      </Text>
      <Text
        variant="body"
        color={highlight ? 'brand' : 'textPrimary'}
        style={styles.name}
        numberOfLines={1}
      >
        {row.name}
      </Text>
      {row.outcome === 'promote' && <Badge label="Terfi" tone="success" />}
      {row.outcome === 'relegate' && <Badge label="Düşme" tone="danger" />}
      <Text variant="caption" color="textSecondary">
        {row.weeklyXp.toLocaleString('tr-TR')} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cutoff: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  cutoffLine: {
    flex: 1,
    height: 1,
    opacity: 0.4,
  },
  leagueHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  leagueNote: {
    marginTop: spacing.md,
  },
  leagueText: {
    flex: 1,
    gap: spacing.xs2,
  },
  name: {
    flex: 1,
  },
  rank: {
    minWidth: 24,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  trophy: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
});
