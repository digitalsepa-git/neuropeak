import { BRAIN_AXES, type BrainAxis } from '@neuropeak/core';
import { palette, radius, spacing } from '@neuropeak/ui';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { Section } from '@/components/section';
import { Badge, Card, ProgressBar, Screen, Text, useTheme } from '@/components/ui';
import { AXIS_LABELS, BRAIN_MAP_SCORES, USER } from '@/data/placeholder';

/** Eksen renkleri — radar grafiğiyle aynı paleti kullanacak (PR#16). */
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

  return (
    <Screen scroll>
      <AppHeader title="İlerleme" />

      <Card padding="lg">
        <Text variant="overline" color="textMuted">
          NeuroPeak skoru
        </Text>
        <View style={styles.scoreRow}>
          <Text variant="display" color="brand">
            {USER.neuropeakScore}
          </Text>
          <Badge label="Bu hafta +4" tone="success" />
        </View>
        <Text variant="bodySmall" color="textSecondary">
          Skor geçmişi ve haftalık trend grafiği PRO ile açılır.
        </Text>
      </Card>

      <Section title="Beyin haritası">
        <Card padding="lg">
          <View style={styles.axes}>
            {BRAIN_AXES.map((axis) => (
              <View key={axis} style={styles.axis}>
                <View style={styles.axisHead}>
                  <Text variant="caption">{AXIS_LABELS[axis]}</Text>
                  <Text variant="caption" color="textMuted">
                    {BRAIN_MAP_SCORES[axis]}
                  </Text>
                </View>
                <ProgressBar
                  value={BRAIN_MAP_SCORES[axis] / 100}
                  color={AXIS_COLORS[axis]}
                  accessibilityLabel={`${AXIS_LABELS[axis]} puanı`}
                />
              </View>
            ))}
          </View>
          <Text variant="caption" color="textMuted" style={styles.note}>
            Radar grafiği ve paylaşılabilir kart PR#16&apos;da gelecek.
          </Text>
        </Card>
      </Section>

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
});
