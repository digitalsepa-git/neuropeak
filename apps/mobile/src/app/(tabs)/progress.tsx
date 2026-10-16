import {
  BRAIN_AXES,
  INITIAL_AXIS_SCORE,
  categoriesForAxis,
  lastDays,
  rankCategories,
  showcaseOrder,
  toDateKey,
  weakestAxis,
  type BadgeContext,
  type BrainAxis,
} from '@neuropeak/core';
import { categoryAccent, palette, radius, spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { BadgeShowcase } from '@/components/progress/badge-showcase';
import { BrainRadar } from '@/components/progress/brain-radar';
import { WeeklyChart } from '@/components/progress/weekly-chart';
import { Section } from '@/components/section';
import { Badge, Card, ProgressBar, Screen, Text } from '@/components/ui';
import { AXIS_LABELS, CATEGORY_LABELS } from '@/data/placeholder';
import { GAME_DEFINITIONS } from '@/games/registry';
import { useProgress } from '@/lib/progress/context';

/** Eksen renkleri — radar grafiğiyle aynı paleti kullanır. */
const AXIS_COLORS: Record<BrainAxis, string> = {
  memory: palette.accentMemory,
  focus: palette.accentAttention,
  logic: palette.accentLogic,
  speed: palette.accentSpeed,
  problemSolving: palette.accentMath,
};

export default function ProgressScreen() {
  const router = useRouter();
  const { state, neuropeak, level, badges } = useProgress();

  const today = toDateKey(new Date());
  const week = useMemo(() => lastDays(state.history, today, 7), [state.history, today]);
  const categories = useMemo(() => rankCategories(state.categoryRounds), [state.categoryRounds]);

  const weekXp = week.reduce((total, day) => total + day.xp, 0);
  const weekRounds = week.reduce((total, day) => total + day.rounds, 0);
  const playedAny = weekRounds > 0 || Object.keys(state.categoryRounds).length > 0;

  // Öneri en zayıf eksenden geliyor; o eksene yazan kategorilerden
  // oynanabilir bir oyun seçiliyor.
  const focusAxis = weakestAxis(state.brainMap);
  const suggestion = useMemo(() => {
    const wanted = new Set(categoriesForAxis(focusAxis));
    return GAME_DEFINITIONS.find((game) => wanted.has(game.category));
  }, [focusAxis]);

  const mostPlayed = categories[0]?.count ?? 1;

  const badgeContext: BadgeContext = useMemo(
    () => ({
      level: level.level,
      xp: state.xp,
      longestStreak: state.streak.longestDays,
      totalRounds: Object.values(state.categoryRounds).reduce((total, count) => total + count, 0),
      testsFinished: state.testsFinished,
      categoryRounds: state.categoryRounds,
      brainMap: state.brainMap,
      neuropeak,
      bestLeagueTier: state.league.bestTier,
      bestWeeklyXp: state.league.bestWeeklyXp,
      bestIq: state.bestIq,
    }),
    [level.level, neuropeak, state],
  );

  // `showcaseOrder` tanımları süzüp sıralıyor; içerik paketinin
  // başlıklı tipi korunsun diye sonuç geri eşleniyor.
  const visibleBadges = useMemo(() => {
    const byId = new Map(badges.map((badge) => [badge.id, badge]));
    return showcaseOrder(badges, badgeContext, state.badges).flatMap((badge) => {
      const found = byId.get(badge.id);
      return found === undefined ? [] : [found];
    });
  }, [badgeContext, badges, state.badges]);

  return (
    <Screen scroll>
      <AppHeader title="İlerleme" />

      <Card padding="lg">
        <Text variant="overline" color="textMuted">
          NeuroPeak skoru
        </Text>
        <View style={styles.scoreRow}>
          <Text variant="display" color="brand">
            {neuropeak}
          </Text>
          <Badge label={`Seviye ${level.level}`} tone="success" />
        </View>
        <Text variant="bodySmall" color="textSecondary">
          {playedAny
            ? 'Skor beş eksenin ağırlıklı ortalaması. Oyun oynadıkça eksenler güncel performansına yaklaşır.'
            : 'Henüz oyun oynamadın. Skor 50’den başlar ve oynadıkça performansına göre değişir.'}
        </Text>
      </Card>

      <Section title="Beyin haritası">
        <Card padding="lg">
          <BrainRadar map={state.brainMap} />

          <View style={styles.axes}>
            {BRAIN_AXES.map((axis) => (
              <View key={axis} style={styles.axis}>
                <View style={styles.axisHead}>
                  <Text variant="caption">{AXIS_LABELS[axis]}</Text>
                  <Text variant="caption" color="textMuted">
                    {state.brainMap[axis]}
                  </Text>
                </View>
                <ProgressBar
                  value={state.brainMap[axis] / 100}
                  color={AXIS_COLORS[axis]}
                  accessibilityLabel={`${AXIS_LABELS[axis]} puanı`}
                />
              </View>
            ))}
          </View>

          <Text variant="caption" color="textMuted" style={styles.note}>
            Harita bir ölçüm değil, oyunlardaki güncel performansının özeti. Her eksen{' '}
            {INITIAL_AXIS_SCORE} puandan başlar.
          </Text>
        </Card>
      </Section>

      {suggestion !== undefined && (
        <Section title="Bugün neye çalış?">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${suggestion.title} oyna`}
            onPress={() => router.push(`/game/${suggestion.id}`)}
          >
            <Card padding="lg">
              <View style={styles.suggestion}>
                <View
                  style={[
                    styles.suggestionIcon,
                    { backgroundColor: `${AXIS_COLORS[focusAxis]}26` },
                  ]}
                >
                  <Icon name="games" color={AXIS_COLORS[focusAxis]} size={22} />
                </View>
                <View style={styles.suggestionText}>
                  <Text variant="bodyStrong">{suggestion.title}</Text>
                  <Text variant="caption" color="textMuted">
                    En düşük eksenin {AXIS_LABELS[focusAxis]} — bu oyun oraya çalışıyor
                  </Text>
                </View>
              </View>
            </Card>
          </Pressable>
        </Section>
      )}

      <Section title="Bu hafta" meta={`${weekXp} XP · ${weekRounds} tur`}>
        <Card padding="lg">
          <WeeklyChart days={week} />
        </Card>
      </Section>

      {categories.length > 0 && (
        <Section title="Kategori dağılımı">
          <Card padding="lg">
            <View style={styles.axes}>
              {categories.map(({ category, count }) => (
                <View key={category} style={styles.axis}>
                  <View style={styles.axisHead}>
                    <Text variant="caption">{CATEGORY_LABELS[category]}</Text>
                    <Text variant="caption" color="textMuted">
                      {count} tur
                    </Text>
                  </View>
                  <ProgressBar
                    value={count / mostPlayed}
                    color={categoryAccent[category]}
                    accessibilityLabel={`${CATEGORY_LABELS[category]} tur sayısı`}
                  />
                </View>
              ))}
            </View>
          </Card>
        </Section>
      )}

      <Section title="Rozetler" meta={`${state.badges.length}/${badges.length}`}>
        <BadgeShowcase badges={visibleBadges} earned={state.badges} context={badgeContext} />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  axes: {
    gap: spacing.md,
  },
  axis: {
    gap: spacing.xs2,
  },
  axisHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  note: {
    marginTop: spacing.md,
  },
  scoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  suggestion: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  suggestionIcon: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  suggestionText: {
    flex: 1,
    gap: 2,
  },
});
