import { radius, spacing } from '@neuropeak/ui';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/icons';
import { Button, Text, useTheme } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { useProgress, type Celebration } from '@/lib/progress/context';

type Translate = ReturnType<typeof useT>;

function contentFor(
  celebration: Celebration,
  t: Translate,
): {
  icon: IconName;
  title: string;
  body: string;
} {
  switch (celebration.type) {
    case 'level_up':
      return {
        icon: 'star',
        title: t('common.levelLabel', { level: celebration.level }),
        body: t('celebration.levelUpBody'),
      };
    case 'streak':
      return {
        icon: 'flame',
        title: t('home.streakDays', { days: celebration.days }),
        body: t('celebration.streakBody'),
      };
    case 'tasks_done':
      return {
        icon: 'check',
        title: t('celebration.tasksTitle'),
        body: t('celebration.starsEarned', { stars: celebration.stars }),
      };
    case 'badge':
      return {
        icon: 'shield',
        // Bir turda birden çok rozet açılabiliyor; tek rozetin adını
        // yazıp hepsinin yıldızını göstermek yanıltıcı oluyordu.
        title:
          celebration.count > 1
            ? t('celebration.badgeCount', { count: celebration.count })
            : celebration.title,
        body:
          celebration.count > 1
            ? t('celebration.badgeMultiBody', {
                title: celebration.title,
                others: celebration.count - 1,
                stars: celebration.stars,
              })
            : t('celebration.badgeSingleBody', { stars: celebration.stars }),
      };
  }
}

/** Seviye atlama, seri eşiği ve görev tamamlama kutlaması. */
export function CelebrationOverlay() {
  const theme = useTheme();
  const t = useT();
  const { celebration, clearCelebration } = useProgress();

  if (celebration === null) return null;

  const content = contentFor(celebration, t);

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

          <Button label={t('common.continue')} size="md" onPress={clearCelebration} />
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
