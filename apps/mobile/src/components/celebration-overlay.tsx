import { radius, spacing } from '@neuropeak/ui';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icons';
import { Button, Text, useTheme } from '@/components/ui';
import { useProgress, type Celebration } from '@/lib/progress/context';

function contentFor(celebration: Celebration): {
  icon: IconName;
  title: string;
  body: string;
} {
  switch (celebration.type) {
    case 'level_up':
      return {
        icon: 'star',
        title: `Seviye ${celebration.level}`,
        body: 'Yeni seviyeye ulaştın. Bonus yıldızların hesabına eklendi.',
      };
    case 'streak':
      return {
        icon: 'flame',
        title: `${celebration.days} günlük seri`,
        body: 'Üst üste geldin. Yarın da gel, seriyi büyüt.',
      };
    case 'tasks_done':
      return {
        icon: 'check',
        title: 'Görev tamam',
        body: `+${celebration.stars} yıldız kazandın.`,
      };
  }
}

/** Seviye atlama, seri eşiği ve görev tamamlama kutlaması. */
export function CelebrationOverlay() {
  const theme = useTheme();
  const { celebration, clearCelebration } = useProgress();

  if (celebration === null) return null;

  const content = contentFor(celebration);

  return (
    <Modal transparent animationType="fade" visible onRequestClose={clearCelebration}>
      <Animated.View
        entering={FadeIn.duration(180)}
        style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
      >
        <Pressable style={styles.backdropPress} onPress={clearCelebration} />

        <Animated.View
          entering={ZoomIn.duration(260)}
          style={[styles.card, { backgroundColor: theme.colors.surface }]}
        >
          <View style={[styles.iconCircle, { backgroundColor: `${theme.colors.brand}1F` }]}>
            <Icon
              name={content.icon}
              color={theme.colors.brand}
              size={34}
              filled={celebration.type !== 'tasks_done'}
            />
          </View>

          <Text variant="heading" align="center">
            {content.title}
          </Text>
          <Text variant="bodySmall" color="textSecondary" align="center" style={styles.body}>
            {content.body}
          </Text>

          <Button label="Devam" size="md" onPress={clearCelebration} />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  backdropPress: {
    ...StyleSheet.absoluteFill,
  },
  body: {
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  card: {
    alignItems: 'center',
    borderRadius: radius.xl,
    maxWidth: 340,
    padding: spacing.lg,
    width: '100%',
  },
  iconCircle: {
    alignItems: 'center',
    borderRadius: radius.pill,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 72,
  },
});
