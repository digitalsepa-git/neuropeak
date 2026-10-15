import { useLocalSearchParams, useRouter } from 'expo-router';

import { PaywallView, type PaywallVariant } from '@/components/paywall/paywall-view';

const VARIANTS: PaywallVariant[] = ['onboarding', 'result', 'generic'];

function parseVariant(value: string | undefined): PaywallVariant {
  return VARIANTS.find((variant) => variant === value) ?? 'generic';
}

export default function PaywallScreen() {
  const router = useRouter();
  const { variant } = useLocalSearchParams<{ variant?: string }>();

  return <PaywallView variant={parseVariant(variant)} onDismiss={() => router.back()} />;
}
