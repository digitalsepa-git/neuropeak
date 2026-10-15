import { categoryAccent, radius, spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { Section } from '@/components/section';
import { Badge, Button, Card, ProgressBar, Screen, Text, useTheme } from '@/components/ui';
import { CATEGORY_LABELS, GAMES } from '@/data/placeholder';
import { usePro } from '@/lib/billing/context';
import { useProgress } from '@/lib/progress/context';
import { TASK_LABELS } from '@/lib/progress/templates';

const SUGGESTED = GAMES[3];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { isPro } = usePro();
  const { state, level } = useProgress();

  const completedTasks = state.tasks.filter((task) => task.progress >= task.target).length;
  const streakDays = state.streak.currentDays;

  return (
    <Screen scroll>
      <AppHeader title="Ana Sayfa" />

      <Card padding="lg">
        <View style={styles.streakRow}>
          <View style={[styles.flame, { backgroundColor: `${theme.colors.warning}1F` }]}>
            <Icon name="flame" color={theme.colors.warning} size={26} filled />
          </View>
          <View style={styles.streakText}>
            <Text variant="heading">
              {streakDays > 0 ? `${streakDays} günlük seri` : 'Seriyi başlat'}
            </Text>
            <Text variant="bodySmall" color="textSecondary">
              {streakDays > 0
                ? 'Bugün bir oyun oyna, seriyi sürdür.'
                : 'Bugün bir test veya oyun bitir, seri başlasın.'}
            </Text>
          </View>
        </View>

        <View style={styles.levelRow}>
          <Text variant="caption" color="textSecondary">
            Seviye {level.level}
          </Text>
          <Text variant="caption" color="textMuted">
            {level.isMaxLevel
              ? 'En yüksek seviye'
              : `Seviye ${level.level + 1}'e ${level.xpForNextLevel - level.xpIntoLevel} XP`}
          </Text>
        </View>
        <ProgressBar value={level.ratio} accessibilityLabel="Seviye ilerlemesi" />
      </Card>

      <Section title="Günün görevleri" meta={`${completedTasks}/${state.tasks.length} tamamlandı`}>
        <View style={styles.stack}>
          {state.tasks.map((task) => {
            const done = task.progress >= task.target;
            return (
              <Card key={task.id}>
                <View style={styles.taskHead}>
                  <View style={styles.taskTitle}>
                    {done && <Icon name="check" color={theme.colors.success} size={18} />}
                    <Text variant="subheading" color={done ? 'textMuted' : 'textPrimary'}>
                      {TASK_LABELS[task.id] ?? task.id}
                    </Text>
                  </View>
                  <Badge label={`+${task.starReward}`} tone={done ? 'success' : 'neutral'} />
                </View>
                <ProgressBar
                  value={task.progress / task.target}
                  color={done ? theme.colors.success : undefined}
                  accessibilityLabel={`${TASK_LABELS[task.id] ?? task.id} ilerlemesi`}
                />
              </Card>
            );
          })}
        </View>
      </Section>

      <Section title="NeuroPeak skorun">
        <Card padding="lg">
          <View style={styles.scoreRow}>
            <Text variant="display" color="brand">
              {/* Beyin haritası PR#16'da gerçek veriyle dolacak. */}
              {state.xp > 0 ? Math.min(99, 40 + Math.round(state.xp / 40)) : 0}
            </Text>
            <View style={styles.scoreMeta}>
              <Text variant="bodySmall" color="textSecondary">
                Beş eksenin ağırlıklı ortalaması. Oynadıkça yükselir.
              </Text>
            </View>
          </View>
          <Button
            label={isPro ? 'Beyin haritanı gör' : 'Beyin haritanı aç'}
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

      {SUGGESTED !== undefined && (
        <Section title="Bugünün önerisi">
          <Card accentColor={categoryAccent[SUGGESTED.category]} onPress={() => {}}>
            <View style={styles.taskHead}>
              <Text variant="subheading">{SUGGESTED.title}</Text>
              <Badge label={CATEGORY_LABELS[SUGGESTED.category]} />
            </View>
            <Text variant="bodySmall" color="textSecondary">
              Seviye {SUGGESTED.level} · dikkat ve tepki hızını çalıştırır
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
