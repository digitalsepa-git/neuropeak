import { palette, radius, spacing } from '@neuropeak/ui';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { Button, Screen, Text, ThemeProvider, tapFeedback } from '@/components/ui';
import type { Plan } from '@/lib/billing';

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
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);

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
            accessibilityLabel="Teklifi kapat"
            hitSlop={12}
            onPress={() => {
              tapFeedback();
              onDismiss();
            }}
          >
            <Text variant="body" color="textMuted">
              ✕
            </Text>
          </Pressable>
        </View>

        <Animated.View entering={FadeInDown.duration(280)} style={styles.header}>
          <Text variant="overline" color="warning">
            Sana özel
          </Text>
          <Text variant="title" align="center">
            Gitmeden önce
          </Text>
          <Text variant="bodySmall" color="textSecondary" align="center">
            Bu teklif yalnızca bu ekranda geçerli.
          </Text>
        </Animated.View>

        <Animated.View entering={ZoomIn.delay(150).duration(320)} style={styles.ticket}>
          <Text variant="display" color="onBrand">
            {plan.badge ?? 'İndirim'}
          </Text>
        </Animated.View>

        <View style={styles.price}>
          {plan.strikethroughLabel !== undefined && (
            <Text variant="body" color="textMuted" style={styles.strikethrough}>
              {plan.strikethroughLabel}
            </Text>
          )}
          <Text variant="heading">
            {plan.priceLabel} / {plan.periodLabel}
          </Text>
          {plan.perWeekLabel !== undefined && (
            <Text variant="bodySmall" color="textSecondary">
              {plan.perWeekLabel}
            </Text>
          )}
        </View>

        <View style={styles.countdown}>
          <Text variant="caption" color="textSecondary">
            Teklifin bitmesine {formatCountdown(remaining)}
          </Text>
        </View>

        <Button label="Teklifi al" loading={busy} onPress={onAccept} />

        <Text variant="caption" color="textMuted" align="center" style={styles.disclosure}>
          {plan.priceLabel}/{plan.periodLabel} olarak otomatik yenilenir. İstediğin zaman App Store
          ayarlarından iptal edebilirsin.
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
            Teşekkürler, istemiyorum
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
