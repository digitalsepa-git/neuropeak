import { APP_LANGUAGES, LANGUAGE_NAMES } from '@neuropeak/core';
import { spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/icons';
import { Section } from '@/components/section';
import { Card, Screen, Text, tapFeedback, useTheme } from '@/components/ui';
import { useI18n, useT } from '@/lib/i18n';
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
  const theme = useTheme();
  const t = useT();
  const { language, setLanguage } = useI18n();
  const { setCompleted } = useOnboardingGate();
  const { isPro, refresh } = usePro();

  const [languageOpen, setLanguageOpen] = useState(false);

  const preferences: Row[] = [
    { id: 'sound', label: t('settings.sound'), value: t('common.on'), icon: 'sound' },
    {
      id: 'language',
      label: t('settings.language'),
      value: LANGUAGE_NAMES[language],
      icon: 'globe',
      onPress: () => setLanguageOpen(true),
    },
    {
      id: 'notifications',
      label: t('settings.notifications'),
      value: t('common.on'),
      icon: 'bell',
    },
  ];

  const about: Row[] = [
    { id: 'privacy', label: t('settings.privacy'), icon: 'shield' },
    { id: 'terms', label: t('settings.terms'), icon: 'document' },
    { id: 'support', label: t('settings.support'), icon: 'mail' },
  ];

  const developer: Row[] = [
    {
      id: 'showcase',
      label: t('settings.designSystem'),
      icon: 'progress',
      onPress: () => router.push('/showcase'),
    },
    {
      id: 'reset-onboarding',
      label: t('settings.resetOnboarding'),
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
      label: t('settings.togglePro'),
      value: isPro ? t('common.on') : t('common.off'),
      icon: 'star',
      onPress: () => {
        void setDevProOverride(!isPro).then(() => refresh());
      },
    },
  ];

  return (
    <Screen scroll edges={['left', 'right']}>
      <Section title={t('settings.preferences')}>
        <Card padding="xs">
          {preferences.map((row) => (
            <SettingsRow key={row.id} row={row} />
          ))}
        </Card>
      </Section>

      <Section title={t('settings.about')}>
        <Card padding="xs">
          {about.map((row) => (
            <SettingsRow key={row.id} row={row} />
          ))}
        </Card>
      </Section>

      <Section title={t('settings.developer')}>
        <Card padding="xs">
          {developer.map((row) => (
            <SettingsRow key={row.id} row={row} />
          ))}
        </Card>
      </Section>

      <Text variant="caption" color="textMuted" align="center" style={styles.disclaimer}>
        {t('common.disclaimer')}
      </Text>

      <Modal
        visible={languageOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageOpen(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('common.close')}
          style={styles.backdrop}
          onPress={() => setLanguageOpen(false)}
        >
          <View style={styles.sheet}>
            <Card padding="xs">
              <Text variant="overline" color="textMuted" style={styles.sheetTitle}>
                {t('settings.languageSheetTitle')}
              </Text>
              {APP_LANGUAGES.map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: item === language }}
                  style={styles.row}
                  onPress={() => {
                    tapFeedback();
                    setLanguage(item);
                    setLanguageOpen(false);
                  }}
                >
                  <Text variant="body" style={styles.rowLabel}>
                    {LANGUAGE_NAMES[item]}
                  </Text>
                  {item === language && <Icon name="check" color={theme.colors.brand} size={18} />}
                </Pressable>
              ))}
            </Card>
          </View>
        </Pressable>
      </Modal>
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
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
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
  sheet: {
    paddingBottom: spacing.xl,
  },
  sheetTitle: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
  },
});
