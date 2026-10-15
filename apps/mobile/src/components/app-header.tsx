import { radius, spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Text, tapFeedback, useTheme } from '@/components/ui';
import { USER } from '@/data/placeholder';

/**
 * Her sekmenin üstündeki bar: ekran başlığı, yıldız bakiyesi, PRO rozeti
 * ve ayarlar. PRO rozeti abone olmayanlarda paywall'a götürür (PR#7).
 */
export function AppHeader({ title }: { title: string }) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View style={styles.row}>
      <Text variant="title" numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <View style={[styles.pill, { backgroundColor: theme.colors.surface }]}>
        <Icon name="star" color={theme.colors.brand} size={16} filled />
        <Text variant="caption">{USER.starBalance}</Text>
      </View>

      {!USER.isPro && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="PRO'ya geç"
          onPress={() => {
            tapFeedback();
            // Paywall PR#7'de bağlanacak.
          }}
          style={[styles.pill, { backgroundColor: theme.colors.brand }]}
        >
          <Text variant="overline" color="onBrand">
            PRO
          </Text>
        </Pressable>
      )}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ayarlar"
        hitSlop={8}
        onPress={() => {
          tapFeedback();
          router.push('/settings');
        }}
      >
        <Icon name="settings" color={theme.colors.textSecondary} size={22} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs2 + 2,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  title: {
    flex: 1,
  },
});
