import { palette, radius, spacing } from '@neuropeak/ui';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Button, Screen, Text, ThemeProvider, tapFeedback, useTheme } from '@/components/ui';
import type { Plan } from '@/lib/billing';
import { usePlanText, useT } from '@/lib/i18n';

/**
 * Kapat sembolü ayrı bir bileşen çünkü rengini koyu temadan
 * okuması gerekiyor; `ExitOffer`'ın kendisi o temayı sağlayan taraf
 * ve içeriden okusaydı dışarıdaki açık temanın rengini alırdı.
 */
function CloseSymbol() {
  const theme = useTheme();

  return <SymbolView name="xmark.circle.fill" size={28} tintColor={theme.colors.textMuted} />;
}

/** Teklifin görünür kalma süresi. */
const COUNTDOWN_SECONDS = 10 * 60;

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

type ExitOfferProps = {
  plan: Plan;
  busy: boolean;
  onAccept: () => void;
  onDismiss: () => void;
};

/**
 * Paywall kapatıldığında gösterilen tek seferlik indirim. Geri sayım
 * bitince teklif kapanır; yapay bir aciliyet değil, gerçekten süreli.
 */
export function ExitOffer({ plan, busy, onAccept, onDismiss }: ExitOfferProps) {
  const t = useT();
  const planText = usePlanText();
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);

  const period = planText.period(plan);
  const badge = planText.badge(plan);
  const perWeek = planText.perWeek(plan);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining === 0) {
      onDismiss();
    }
  }, [onDismiss, remaining]);

  return (
    <ThemeProvider name="dark">
      <Screen scroll>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('exitOffer.close')}
            hitSlop={12}
            onPress={() => {
              tapFeedback();
              onDismiss();
            }}
          >
            <CloseSymbol />
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.duration(280)} style={styles.header}>
          <Text variant="overline" color="warning">
            {t('exitOffer.eyebrow')}
          </Text>
          <Text variant="title" align="center">
            {t('exitOffer.title')}
          </Text>
          <Text variant="bodySmall" color="textSecondary" align="center">
            {t('exitOffer.subtitle')}
          </Text>
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(150).duration(320)} style={styles.ticket}>
          <Text variant="display" color="onBrand">
            {badge ?? t('exitOffer.fallbackBadge')}
          </Text>
        </Animated.View>

        <View style={styles.price}>
          {plan.strikethroughLabel !== undefined && (
            <Text variant="body" color="textMuted" style={styles.strikethrough}>
              {plan.strikethroughLabel}
            </Text>
          )}
          <Text variant="heading">
            {plan.priceLabel} / {period}
          </Text>
          {perWeek !== undefined && (
            <Text variant="bodySmall" color="textSecondary">
              {perWeek}
            </Text>
          )}
        </View>

        <View style={styles.countdown}>
          <Text variant="caption" color="textSecondary">
            {t('exitOffer.countdown', { time: formatCountdown(remaining) })}
          </Text>
        </View>

        <Button label={t('exitOffer.accept')} loading={busy} onPress={onAccept} />

        <Text variant="caption" color="textMuted" align="center" style={styles.disclosure}>
          {t('exitOffer.renewNote', { price: plan.priceLabel, period })}
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            tapFeedback();
            onDismiss();
          }}
          style={styles.decline}
        >
          <Text variant="caption" color="textMuted" align="center">
            {t('exitOffer.decline')}
          </Text>
        </Pressable>
      </Screen>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  countdown: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  decline: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  disclosure: {
    marginTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  price: {
    alignItems: 'center',
    gap: spacing.xs2,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  ticket: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: palette.violet500,
    borderRadius: radius.lg,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  topBar: {
    paddingTop: spacing.sm,
  },
});
