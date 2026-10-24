import { hasPlayed, pickSuggestedGame, recentlyPlayed, resumeLevel } from '@neuropeak/core';
import { categoryAccent, radius, spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { RewardedAdCard } from '@/components/rewarded-ad-card';
import { Section } from '@/components/section';
import { Badge, Button, Card, ProgressBar, Screen, Text, useTheme } from '@/components/ui';
import { findGameContent } from '@neuropeak/content';

import { GAME_DEFINITIONS } from '@/games/registry';
import { useAds } from '@/lib/ads/context';
import { useI18n, useLabels, useT } from '@/lib/i18n';
import { useRemoteConfig } from '@/lib/remote/context';
import { usePro } from '@/lib/billing/context';
import { useProgress } from '@/lib/progress/context';
import { TASK_LABEL_KEYS } from '@/lib/progress/templates';

/** Öneri yalnızca oynanabilir oyunlar arasından seçiliyor. */
const PLAYABLE_IDS = GAME_DEFINITIONS.map((game) => game.id);

/** "Kaldığın yerden" bölümünde gösterilecek oyun sayısı. */
const CONTINUE_COUNT = 3;

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const t = useT();
  const { localized } = useI18n();
  const labels = useLabels();
  const { getString } = useRemoteConfig();
  const announcement = getString('announcement.text');
  const { isPro } = usePro();
  const { state, level, neuropeak, userId } = useProgress();
  const { canWatchRewarded } = useAds();

  // Görev kimliği katalogda yoksa kimliğin kendisi görünür; sessizce
  // boş bir satır göstermekten iyi.
  const taskLabel = (id: string) => {
    const key = TASK_LABEL_KEYS[id];
    return key === undefined ? id : t(key);
  };

  const completedTasks = state.tasks.filter((task) => task.progress >= task.target).length;
  const streakDays = state.streak.currentDays;

  // Öneri günde bir kez değişiyor; görevlerle aynı tohumlama. Günü
  // `tasksDate` veriyor — açılışta bugüne ayarlanıyor ve render
  // sırasında saate bakmamızı gerektirmiyor.
  const suggestedId = pickSuggestedGame(PLAYABLE_IDS, state.games, {
    userId,
    dateKey: state.tasksDate ?? '',
  });
  const suggested = suggestedId === undefined ? undefined : findGameContent(suggestedId);
  const suggestionIsNew = suggestedId !== undefined && !hasPlayed(state.games, suggestedId);

  const continueGames = recentlyPlayed(state.games, CONTINUE_COUNT).flatMap((id) => {
    const game = findGameContent(id);
    return game === undefined ? [] : [{ game, record: state.games[id] }];
  });

  return (
    <Screen scroll>
      <AppHeader title={t('home.title')} />

      {announcement.length > 0 && (
        <Card padding="md">
          <Text variant="bodySmall">{announcement}</Text>
        </Card>
      )}

      <Card padding="lg">
        <View style={styles.streakRow}>
          <View style={[styles.flame, { backgroundColor: `${theme.colors.warning}1F` }]}>
            <Icon name="flame" color={theme.colors.warning} size={26} filled />
          </View>
          <View style={styles.streakText}>
            <Text variant="heading">
              {streakDays > 0 ? t('home.streakDays', { days: streakDays }) : t('home.streakStart')}
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              {streakDays > 0 ? t('home.streakKeep') : t('home.streakStartBody')}
            </Text>
          </View>
        </View>

        <View style={styles.levelRow}>
          <Text variant="caption" color="textSecondary">
            {t('common.levelLabel', { level: level.level })}
          </Text>
          <Text variant="caption" color="textMuted">
            {level.isMaxLevel
              ? t('home.levelMax')
              : t('home.levelNext', {
                  level: level.level + 1,
                  xp: level.xpForNextLevel - level.xpIntoLevel,
                })}
          </Text>
        </View>
        <ProgressBar value={level.ratio} accessibilityLabel={t('home.levelProgress')} />
      </Card>

      <Section
        title={t('home.dailyTasks')}
        meta={t('home.dailyTasksMeta', { done: completedTasks, total: state.tasks.length })}
      >
        <View style={styles.stack}>
          {state.tasks.map((task) => {
            const done = task.progress >= task.target;
            return (
              <Card key={task.id}>
                <View style={styles.taskHead}>
                  <View style={styles.taskTitle}>
                    {done && <Icon name="check" color={theme.colors.success} size={18} />}
                    <Text variant="subheading" color={done ? 'textMuted' : 'textPrimary'}>
                      {taskLabel(task.id)}
                    </Text>
                  </View>
                  <Badge label={`+${task.starReward}`} tone={done ? 'success' : 'neutral'} />
                </View>
                <ProgressBar
                  value={task.progress / task.target}
                  color={done ? theme.colors.success : undefined}
                  accessibilityLabel={t('home.taskProgressLabel', { task: taskLabel(task.id) })}
                />
              </Card>
            );
          })}
        </View>
      </Section>

      {canWatchRewarded && (
        <Section title={t('home.earnStars')}>
          <RewardedAdCard />
        </Section>
      )}

      <Section title={t('home.scoreSection')}>
        <Card padding="lg">
          <View style={styles.scoreRow}>
            <Text variant="display" color="brand">
              {neuropeak}
            </Text>
            <View style={styles.scoreMeta}>
              <Text variant="bodySmall" color="textSecondary">
                {t('home.scoreBody')}
              </Text>
            </View>
          </View>
          <Button
            label={isPro ? t('home.seeBrainMap') : t('home.openBrainMap')}
            variant="secondary"
            size="md"
            onPress={() => {
              if (!isPro) {
                router.push({ pathname: '/paywall', params: { variant: 'generic' } });
              }
            }}
            icon={isPro ? undefined : <Icon name="lock" color={theme.colors.textMuted} size={16} />}
          />
        </Card>
      </Section>

      {continueGames.length > 0 && (
        <Section title={t('home.continueSection')}>
          <View style={styles.stack}>
            {continueGames.map(({ game, record }) => (
              <Card
                key={game.id}
                accentColor={categoryAccent[game.category]}
                onPress={() => router.push({ pathname: '/game/[id]', params: { id: game.id } })}
              >
                <View style={styles.taskHead}>
                  <Text variant="subheading">{localized(game.title)}</Text>
                  <Badge label={labels.category(game.category)} />
                </View>
                <Text variant="bodySmall" color="textSecondary">
                  {record === undefined
                    ? localized(game.instruction)
                    : game.mode === 'levels'
                      ? t('games.levelOf', {
                          level: resumeLevel(record, game),
                          total: game.totalLevels,
                        })
                      : t('games.bestScore', { score: record.bestScore })}
                </Text>
              </Card>
            ))}
          </View>
        </Section>
      )}

      {suggested !== undefined && (
        <Section title={t('home.suggestionSection')}>
          <Card
            accentColor={categoryAccent[suggested.category]}
            onPress={() => router.push({ pathname: '/game/[id]', params: { id: suggested.id } })}
          >
            <View style={styles.taskHead}>
              <Text variant="subheading">{localized(suggested.title)}</Text>
              <Badge
                label={
                  suggestionIsNew ? t('home.suggestionNew') : labels.category(suggested.category)
                }
                tone={suggestionIsNew ? 'brand' : 'neutral'}
              />
            </View>
            <Text variant="bodySmall" color="textSecondary">
              {localized(suggested.instruction)}
            </Text>
          </Card>
        </Section>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flame: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
  },
  scoreMeta: {
    flex: 1,
  },
  scoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  stack: {
    gap: spacing.sm,
  },
  streakRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  streakText: {
    flex: 1,
    gap: spacing.xs2,
  },
  taskHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  taskTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: spacing.xs,
  },
});
