import { spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { ExitOffer } from '@/components/paywall/exit-offer';
import { PlanCard } from '@/components/paywall/plan-card';
import { Button, Screen, Text, tapFeedback, useTheme } from '@/components/ui';
import { EXIT_OFFER_PLAN, billing, type Plan, type PlanId } from '@/lib/billing';
import { track } from '@/lib/analytics';
import { usePro } from '@/lib/billing/context';
import { usePlanText, useT } from '@/lib/i18n';
import type { StringKey } from '@/lib/i18n';
import { useRemoteConfig } from '@/lib/remote/context';

export type PaywallVariant = 'onboarding' | 'result' | 'generic';

const HEADLINES: Record<PaywallVariant, { title: StringKey; subtitle: StringKey }> = {
  onboarding: {
    title: 'paywall.onboarding.title',
    subtitle: 'paywall.onboarding.subtitle',
  },
  result: { title: 'paywall.result.title', subtitle: 'paywall.result.subtitle' },
  generic: { title: 'paywall.generic.title', subtitle: 'paywall.generic.subtitle' },
};

const BENEFITS: StringKey[] = [
  'paywall.benefit1',
  'paywall.benefit2',
  'paywall.benefit3',
  'paywall.benefit4',
  'paywall.benefit5',
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
  const t = useT();
  const planText = usePlanText();
  const { purchase, restore } = usePro();
  const { getString } = useRemoteConfig();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState<PlanId>('weekly');
  const [busy, setBusy] = useState(false);
  const [showExitOffer, setShowExitOffer] = useState(false);

  useEffect(() => {
    void billing.getPlans().then(setPlans);
  }, []);

  useEffect(() => {
    track('paywall_view', { variant });
  }, [variant]);

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

      Alert.alert(t('paywall.alertTitle'), t(`billing.${outcome.issue}`));
    },
    [finishPurchase, purchase, t],
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
    Alert.alert(t('paywall.restoreAlertTitle'), t(`billing.${outcome.issue}`));
  }, [finishPurchase, restore, t]);

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
      ? t('paywall.trialCta', { days: selectedPlan.trialDays })
      : t('common.continueAction');

  const headline = HEADLINES[variant];
  // Panelden yazılan başlık varsa onu kullan; boşsa varyantın kendi
  // başlığı kalır.
  const remoteTitle = getString('paywall.title');
  const title = remoteTitle.length > 0 ? remoteTitle : t(headline.title);

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          hitSlop={12}
          onPress={close}
        >
          <Text variant="body" color="textMuted">
            ✕
          </Text>
        </Pressable>
        <Pressable accessibilityRole="button" hitSlop={12} onPress={() => void onRestore()}>
          <Text variant="caption" color="textMuted">
            {t('paywall.restore')}
          </Text>
        </Pressable>
      </View>

      <Animated.View entering={FadeIn.duration(260)} style={styles.header}>
        <Text variant="overline" color="brand">
          {t('paywall.brand')}
        </Text>
        <Text variant="title">{title}</Text>
        <Text variant="bodySmall" color="textSecondary">
          {t(headline.subtitle)}
        </Text>
      </Animated.View>

      <View style={styles.benefits}>
        {BENEFITS.map((benefit) => (
          <View key={benefit} style={styles.benefit}>
            <Icon name="check" color={theme.colors.success} size={18} strokeWidth={2.4} />
            <Text variant="body" style={styles.benefitText}>
              {t(benefit)}
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
        {selectedPlan === undefined
          ? ''
          : selectedPlan.trialDays !== undefined
            ? t('paywall.disclosureTrial', {
                days: selectedPlan.trialDays,
                price: selectedPlan.priceLabel,
                period: planText.period(selectedPlan),
              })
            : t('paywall.disclosurePlain', {
                price: selectedPlan.priceLabel,
                period: planText.period(selectedPlan),
              })}{' '}
        {t('paywall.cancelNote')}
      </Text>

      <View style={styles.links}>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(TERMS_URL)}>
          <Text variant="caption" color="textMuted">
            {t('paywall.terms')}
          </Text>
        </Pressable>
        <Text variant="caption" color="textMuted">
          ·
        </Text>
        <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(PRIVACY_URL)}>
          <Text variant="caption" color="textMuted">
            {t('paywall.privacy')}
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
