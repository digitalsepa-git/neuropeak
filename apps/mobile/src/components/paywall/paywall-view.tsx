import { spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { ExitOffer } from '@/components/paywall/exit-offer';
import { PlanCard } from '@/components/paywall/plan-card';
import { Button, Screen, Text, tapFeedback, useTheme } from '@/components/ui';
import { EXIT_OFFER_PLAN, billing, type Plan, type PlanId } from '@/lib/billing';
import { usePro } from '@/lib/billing/context';

export type PaywallVariant = 'onboarding' | 'result' | 'generic';

const HEADLINES: Record<PaywallVariant, { title: string; subtitle: string }> = {
  onboarding: {
    title: 'Zihnini her gün biraz daha ileri taşı',
    subtitle: 'Planın hazır. PRO ile tüm testler, detaylı raporlar ve reklamsız deneyim açılır.',
  },
  result: {
    title: 'Detaylı raporunu aç',
    subtitle:
      'Güçlü ve zayıf alanların, yaş grubuna göre karşılaştırma ve sana özel gelişim planı.',
  },
  generic: {
    title: 'NeuroPeak PRO',
    subtitle: 'Zihnini geliştirmek için ihtiyacın olan her şey tek abonelikte.',
  },
};

const BENEFITS = [
  'Tüm IQ ve kişilik testleri',
  'Her testte detaylı rapor ve gelişim planı',
  'Reklamsız deneyim',
  'Sınırsız ipucu ve yıldız',
  'Beyin haritası geçmişi ve haftalık trend',
];

const TERMS_URL = 'https://neuropeak.app/terms';
const PRIVACY_URL = 'https://neuropeak.app/privacy';

type PaywallViewProps = {
  variant: PaywallVariant;
  /** Kullanıcı satın almadan çıktığında. */
  onDismiss: () => void;
  /** Satın alma tamamlandığında; verilmezse onDismiss çağrılır. */
  onPurchased?: () => void;
  /** Kapatınca indirimli teklif gösterilsin mi. */
  withExitOffer?: boolean;
};

export function PaywallView({
  variant,
  onDismiss,
  onPurchased,
  withExitOffer = true,
}: PaywallViewProps) {
  const theme = useTheme();
  const { purchase, restore } = usePro();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<PlanId>('weekly');
  const [busy, setBusy] = useState(false);
  const [showExitOffer, setShowExitOffer] = useState(false);

  useEffect(() => {
    void billing.getPlans().then(setPlans);
  }, []);

  const finishPurchase = useCallback(() => {
    if (onPurchased !== undefined) {
      onPurchased();
    } else {
      onDismiss();
    }
  }, [onDismiss, onPurchased]);

  const buy = useCallback(
    async (planId: PlanId) => {
      setBusy(true);
      const outcome = await purchase(planId);
      setBusy(false);

      if (outcome.status === 'purchased') {
        finishPurchase();
        return;
      }
      if (outcome.status === 'cancelled') {
        return;
      }

      Alert.alert('Abonelik', outcome.message);
    },
    [finishPurchase, purchase],
  );

  const onRestore = useCallback(async () => {
    setBusy(true);
    const outcome = await restore();
    setBusy(false);

    if (outcome.status === 'purchased') {
      finishPurchase();
      return;
    }
    if (outcome.status === 'cancelled') {
      return;
    }
    Alert.alert('Satın alımları geri yükle', outcome.message);
  }, [finishPurchase, restore]);

  const close = useCallback(() => {
    tapFeedback();
    if (withExitOffer && !showExitOffer) {
      setShowExitOffer(true);
      return;
    }
    onDismiss();
  }, [onDismiss, showExitOffer, withExitOffer]);

  if (showExitOffer) {
    return (
      <ExitOffer
        plan={EXIT_OFFER_PLAN}
        busy={busy}
        onAccept={() => void buy(EXIT_OFFER_PLAN.id)}
        onDismiss={onDismiss}
      />
    );
  }

  const selectedPlan = plans.find((plan) => plan.id === selected);
  const ctaLabel =
    selectedPlan?.trialDays !== undefined
      ? `${selectedPlan.trialDays} gün ücretsiz dene`
      : 'Devam et';

  const headline = HEADLINES[variant];

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          hitSlop={12}
          onPress={close}
        >
          <Text variant="body" color="textMuted">
            ✕
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={() => void onRestore()}>
          <Text variant="caption" color="textMuted">
            Geri yükle
          </Text>
        </Pressable>
      </View>

      <Animated.View entering={FadeIn.duration(260)} style={styles.header}>
        <Text variant="overline" color="brand">
          NeuroPeak PRO
        </Text>
        <Text variant="title">{headline.title}</Text>
        <Text variant="bodySmall" color="textSecondary">
          {headline.subtitle}
        </Text>
      </Animated.View>

      <View style={styles.benefits}>
        {BENEFITS.map((benefit) => (
          <View key={benefit} style={styles.benefit}>
            <Icon name="check" color={theme.colors.success} size={18} strokeWidth={2.4} />
            <Text variant="body" style={styles.benefitText}>
              {benefit}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={selected === plan.id}
            onPress={() => setSelected(plan.id)}
          />
        ))}
      </View>

      <Button label={ctaLabel} loading={busy} onPress={() => void buy(selected)} />

      {/* App Store, fiyat ve yenileme koşullarının paywall'da görünmesini şart koşuyor. */}
      <Text variant="caption" color="textMuted" align="center" style={styles.disclosure}>
        {selectedPlan?.trialDays !== undefined
          ? `${selectedPlan.trialDays} günlük ücretsiz deneme sonunda ${selectedPlan.priceLabel}/${selectedPlan.periodLabel} olarak otomatik yenilenir.`
          : `${selectedPlan?.priceLabel ?? ''}/${selectedPlan?.periodLabel ?? ''} olarak otomatik yenilenir.`}{' '}
        İstediğin zaman App Store ayarlarından iptal edebilirsin.
      </Text>

      <View style={styles.links}>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(TERMS_URL)}>
          <Text variant="caption" color="textMuted">
            Kullanım Şartları
          </Text>
        </Pressable>
        <Text variant="caption" color="textMuted">
          ·
        </Text>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(PRIVACY_URL)}>
          <Text variant="caption" color="textMuted">
            Gizlilik Politikası
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  benefit: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  benefitText: {
    flex: 1,
  },
  benefits: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  disclosure: {
    marginTop: spacing.md,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  links: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  plans: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
});
