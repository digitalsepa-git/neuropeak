import { categoryAccent, radius, spacing } from '@neuropeak/ui';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { Section } from '@/components/section';
import { Badge, Button, Card, ProgressBar, Screen, Text, useTheme } from '@/components/ui';
import { CATEGORY_LABELS, DAILY_TASKS, GAMES, USER } from '@/data/placeholder';

const SUGGESTED = GAMES[3];
const completedTasks = DAILY_TASKS.filter((task) => task.done >= task.target).length;

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <Screen scroll>
      <AppHeader title="Ana Sayfa" />

      <Card padding="lg">
        <View style={styles.streakRow}>
          <View style={[styles.flame, { backgroundColor: `${theme.colors.warning}1F` }]}>
            <Icon name="flame" color={theme.colors.warning} size={26} filled />
          </View>
          <View style={styles.streakText}>
            <Text variant="heading">{USER.streakDays} günlük seri</Text>
            <Text variant="bodySmall" color="textSecondary">
              Bugün bir oyun oyna, seriyi sürdür.
            </Text>
          </View>
        </View>

        <View style={styles.levelRow}>
          <Text variant="caption" color="textSecondary">
            Seviye {USER.level}
          </Text>
          <Text variant="caption" color="textMuted">
            Seviye {USER.level + 1}&apos;e %{Math.round(USER.levelProgress * 100)}
          </Text>
        </View>
        <ProgressBar value={USER.levelProgress} accessibilityLabel="Seviye ilerlemesi" />
      </Card>

      <Section title="Günün görevleri" meta={`${completedTasks}/${DAILY_TASKS.length} tamamlandı`}>
        <View style={styles.stack}>
          {DAILY_TASKS.map((task) => {
            const done = task.done >= task.target;
            return (
              <Card key={task.id}>
                <View style={styles.taskHead}>
                  <View style={styles.taskTitle}>
                    {done && <Icon name="check" color={theme.colors.success} size={18} />}
                    <Text variant="subheading" color={done ? 'textMuted' : 'textPrimary'}>
                      {task.title}
                    </Text>
                  </View>
                  <Badge label={`+${task.reward}`} tone={done ? 'success' : 'neutral'} />
                </View>
                <ProgressBar
                  value={task.done / task.target}
                  color={done ? theme.colors.success : undefined}
                  accessibilityLabel={`${task.title} ilerlemesi`}
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
              {USER.neuropeakScore}
            </Text>
            <View style={styles.scoreMeta}>
              <Text variant="bodySmall" color="textSecondary">
                Beş eksenin ağırlıklı ortalaması. Oynadıkça yükselir.
              </Text>
            </View>
          </View>
          <Button
            label="Beyin haritanı gör"
            variant="secondary"
            size="md"
            onPress={() => {}}
            icon={<Icon name="lock" color={theme.colors.textMuted} size={16} />}
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
