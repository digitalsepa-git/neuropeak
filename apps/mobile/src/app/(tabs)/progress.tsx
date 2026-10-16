import {
  BRAIN_AXES,
  INITIAL_AXIS_SCORE,
  categoriesForAxis,
  lastDays,
  rankCategories,
  toDateKey,
  weakestAxis,
  type BrainAxis,
} from '@neuropeak/core';
import { categoryAccent, palette, radius, spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { BrainRadar } from '@/components/progress/brain-radar';
import { WeeklyChart } from '@/components/progress/weekly-chart';
import { Section } from '@/components/section';
import { Badge, Card, ProgressBar, Screen, Text, useTheme } from '@/components/ui';
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

const BADGES = [
  { id: 'first-test', label: 'İlk test', earned: true },
  { id: 'streak-7', label: '7 gün', earned: true },
  { id: 'logic-master', label: 'Mantık ustası', earned: false },
  { id: 'all-categories', label: 'Kâşif', earned: false },
];

export default function ProgressScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { state, neuropeak, level } = useProgress();

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

      <Section title="Rozetler" meta="2/40">
        <View style={styles.badgeGrid}>
          {BADGES.map((badge) => (
            <View key={badge.id} style={styles.badgeItem}>
              <View
                style={[
                  styles.badgeCircle,
                  {
                    backgroundColor: badge.earned
                      ? `${theme.colors.brand}1F`
                      : theme.colors.surface,
                    borderColor: badge.earned ? theme.colors.brand : theme.colors.border,
                  },
                ]}
              >
                <Icon
                  name={badge.earned ? 'star' : 'lock'}
                  color={badge.earned ? theme.colors.brand : theme.colors.textMuted}
                  size={22}
                  filled={badge.earned}
                />
              </View>
              <Text
                variant="caption"
                color={badge.earned ? 'textSecondary' : 'textMuted'}
                align="center"
                numberOfLines={1}
              >
                {badge.label}
              </Text>
            </View>
          ))}
        </View>
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
  badgeCircle: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeItem: {
    alignItems: 'center',
    gap: spacing.xs2,
    width: 72,
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
