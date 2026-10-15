import { spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/icons';
import { Section } from '@/components/section';
import { Card, Screen, Text, tapFeedback, useTheme } from '@/components/ui';
import { setDevProOverride } from '@/lib/billing';
import { usePro } from '@/lib/billing/context';
import { resetOnboarding } from '@/lib/onboarding';
import { useOnboardingGate } from '@/lib/onboarding-context';

type Row = {
  id: string;
  label: string;
  value?: string;
  icon: IconName;
  onPress?: () => void;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { setCompleted } = useOnboardingGate();
  const { isPro, refresh } = usePro();

  const preferences: Row[] = [
    { id: 'sound', label: 'Ses', value: 'Açık', icon: 'sound' },
    { id: 'language', label: 'Dil', value: 'Türkçe', icon: 'globe' },
    { id: 'notifications', label: 'Bildirimler', value: 'Açık', icon: 'bell' },
  ];

  const about: Row[] = [
    { id: 'privacy', label: 'Gizlilik Politikası', icon: 'shield' },
    { id: 'terms', label: 'Kullanım Şartları', icon: 'document' },
    { id: 'support', label: 'E-posta Desteği', icon: 'mail' },
  ];

  const developer: Row[] = [
    {
      id: 'showcase',
      label: 'Tasarım sistemi',
      icon: 'progress',
      onPress: () => router.push('/showcase'),
    },
    {
      id: 'reset-onboarding',
      label: "Onboarding'i sıfırla",
      icon: 'flame',
      onPress: () => {
        void resetOnboarding().then(() => {
          setCompleted(false);
        });
      },
    },
    {
      // Yalnızca geliştirme derlemelerinde çalışır; setDevProOverride
      // yayın derlemesinde hiçbir şey yapmaz.
      id: 'toggle-pro',
      label: 'PRO durumunu değiştir',
      value: isPro ? 'Açık' : 'Kapalı',
      icon: 'star',
      onPress: () => {
        void setDevProOverride(!isPro).then(() => refresh());
      },
    },
  ];

  return (
    <Screen scroll edges={['left', 'right']}>
      <Section title="Tercihler">
        <Card padding="xs">
          {preferences.map((row) => (
            <SettingsRow key={row.id} row={row} />
          ))}
        </Card>
      </Section>

      <Section title="Hakkında">
        <Card padding="xs">
          {about.map((row) => (
            <SettingsRow key={row.id} row={row} />
          ))}
        </Card>
      </Section>

      <Section title="Geliştirici">
        <Card padding="xs">
          {developer.map((row) => (
            <SettingsRow key={row.id} row={row} />
          ))}
        </Card>
      </Section>

      <Text variant="caption" color="textMuted" align="center" style={styles.disclaimer}>
        NeuroPeak testleri eğlence ve zihinsel egzersiz amaçlıdır; klinik veya psikometrik bir
        teşhis aracı değildir.
      </Text>
    </Screen>
  );
}

function SettingsRow({ row }: { row: Row }) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={row.label}
      onPress={() => {
        tapFeedback();
        row.onPress?.();
      }}
      style={styles.row}
    >
      <Icon name={row.icon} color={theme.colors.textSecondary} size={20} />
      <Text variant="body" style={styles.rowLabel}>
        {row.label}
      </Text>
      {row.value !== undefined && (
        <Text variant="bodySmall" color="textMuted">
          {row.value}
        </Text>
      )}
      <Icon name="chevronRight" color={theme.colors.textMuted} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disclaimer: {
    marginTop: spacing.xl,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  rowLabel: {
    flex: 1,
  },
});
