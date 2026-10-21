import { radius, spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/icons';
import { Text, tapFeedback, useTheme } from '@/components/ui';
import { useT } from '@/lib/i18n';
import { usePro } from '@/lib/billing/context';
import { useProgress } from '@/lib/progress/context';

/**
 * Her sekmenin üstündeki bar: ekran başlığı, yıldız bakiyesi, PRO rozeti
 * ve ayarlar. PRO rozeti abone olmayanlarda paywall'a götürür (PR#7).
 */
export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const t = useT();
  const theme = useTheme();
  const router = useRouter();
  const { isPro } = usePro();
  const { state } = useProgress();

  return (
    <View style={styles.row}>
      <View style={styles.title}>
        <Text variant="title" numberOfLines={1}>
          {title}
        </Text>
        {subtitle !== undefined && (
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={[styles.pill, { backgroundColor: theme.colors.surface }]}>
        <Icon name="star" color={theme.colors.brand} size={16} filled />
        <Text variant="caption">{state.stars}</Text>
      </View>

      {!isPro && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('header.goPro')}
          onPress={() => {
            tapFeedback();
            router.push({ pathname: '/paywall', params: { variant: 'generic' } });
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
        accessibilityLabel={t('settings.title')}
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
