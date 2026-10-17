import {
  GROUP_SIZE,
  PROMOTION_COUNT,
  RELEGATION_COUNT,
  msUntilWeekEnd,
  remainingTime,
  standings,
  xpToPromotion,
  type LeagueStanding,
  type RemainingTime,
} from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { Section } from '@/components/section';
import { Badge, Card, Screen, Text, useTheme } from '@/components/ui';
import { useI18n, useLabels, useT } from '@/lib/i18n';
import { currentCohort } from '@/lib/progress/league';
import { useProgress } from '@/lib/progress/context';

/** Geri sayım dakikada bir yenilenir; saniye göstermiyoruz. */
const TICK_MS = 60_000;

export default function LeagueScreen() {
  const theme = useTheme();
  const t = useT();
  const { language } = useI18n();
  const labels = useLabels();
  const { state, userId } = useProgress();

  const formatRemaining = (value: RemainingTime): string => {
    switch (value.unit) {
      case 'days':
        return t('league.remainingDays', { days: value.days, hours: value.hours });
      case 'hours':
        return t('league.remainingHours', { hours: value.hours, minutes: value.minutes });
      case 'minutes':
        return t('league.remainingMinutes', { minutes: value.minutes });
    }
  };

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const table = useMemo(
    () => standings(currentCohort(state.league, userId, now, language, t('league.you'))),
    [language, now, state.league, t, userId],
  );

  const me = table.find((row) => row.isCurrentUser === true);
  const needed = xpToPromotion(table, userId);
  const remaining = formatRemaining(remainingTime(msUntilWeekEnd(now)));
  const result = state.league.lastResult;

  return (
    <Screen scroll>
      <AppHeader title={t('league.title')} />

      <Card padding="lg">
        <View style={styles.leagueHead}>
          <View style={[styles.trophy, { backgroundColor: `${theme.colors.warning}1F` }]}>
            <Icon name="league" color={theme.colors.warning} size={28} />
          </View>
          <View style={styles.leagueText}>
            <Text variant="heading">{labels.tier(state.league.tier)}</Text>
            <Text variant="bodySmall" color="textSecondary">
              {t('league.remaining', { time: remaining })}
            </Text>
          </View>
        </View>

        <Text variant="bodySmall" color="textSecondary" style={styles.leagueNote}>
          {me === undefined
            ? t('league.noteJoin', { count: PROMOTION_COUNT })
            : needed === 0
              ? t('league.notePromotionZone', {
                  rank: me.rank,
                  relegation: RELEGATION_COUNT,
                })
              : t('league.noteBehind', { rank: me.rank, xp: needed })}
        </Text>
      </Card>

      {result !== null && (
        <Card padding="lg">
          <Text variant="bodyStrong">{t('league.lastWeek', { rank: result.rank })}</Text>
          <Text variant="bodySmall" color="textSecondary">
            {t('league.lastWeekBody', {
              tier: labels.tier(result.tier),
              outcome: labels.outcome(result.outcome),
            })}
          </Text>
        </Card>
      )}

      <Section title={t('league.tableSection')} meta={t('league.tableMeta', { count: GROUP_SIZE })}>
        <Card padding="xs">
          {table.map((row, index) => (
            <View key={row.id}>
              <LeagueRowItem row={row} locale={language} />
              {index === PROMOTION_COUNT - 1 && (
                <ZoneDivider label={t('league.promotionZone')} color={theme.colors.success} />
              )}
              {index === table.length - RELEGATION_COUNT - 1 && (
                <ZoneDivider label={t('league.relegationZone')} color={theme.colors.danger} />
              )}
            </View>
          ))}
        </Card>
      </Section>

      <Card padding="lg">
        <Text variant="bodyStrong">{t('league.practiceTitle')}</Text>
        <Text variant="bodySmall" color="textSecondary">
          {t('league.practiceBody')}
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

function LeagueRowItem({ row, locale }: { row: LeagueStanding; locale: string }) {
  const theme = useTheme();
  const t = useT();
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
      {row.outcome === 'promote' && <Badge label={t('league.promoteBadge')} tone="success" />}
      {row.outcome === 'relegate' && <Badge label={t('league.relegateBadge')} tone="danger" />}
      <Text variant="caption" color="textSecondary">
        {row.weeklyXp.toLocaleString(locale)} XP
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
