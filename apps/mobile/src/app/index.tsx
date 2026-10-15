import { GAME_CATEGORIES, type GameCategory } from '@neuropeak/core';
import { categoryAccent, spacing, textStyles, type TextVariant } from '@neuropeak/ui';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  Chip,
  ProgressBar,
  Screen,
  Text,
  ThemeProvider,
} from '@/components/ui';

/** Kategori adları PR#24'te i18n'e taşınacak. */
const CATEGORY_LABELS: Record<GameCategory, string> = {
  memory: 'Hafıza',
  attention: 'Odaklanma',
  logic: 'Mantık',
  math: 'Matematik',
  spatial: 'Görsel',
  speed: 'Hız',
  verbal: 'Sözel',
};

const TEXT_VARIANTS = Object.keys(textStyles) as TextVariant[];

const FILTERS = ['Tümü', 'Hafıza', 'Odaklanma', 'Mantık'] as const;

/**
 * Tasarım sistemi vitrini. PR#3'te 5 sekmeli gerçek navigasyonla değişecek;
 * o zamana kadar token'ların ve bileşenlerin canlı referansı.
 */
export default function ShowcaseScreen() {
  const [filter, setFilter] = useState<string>(FILTERS[0]);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text variant="overline" color="brand">
          NeuroPeak: IQ Arena
        </Text>
        <Text variant="title">Tasarım Sistemi</Text>
      </View>

      <Section title="Tipografi">
        <Card>
          {TEXT_VARIANTS.map((variant) => (
            <View key={variant} style={styles.typeRow}>
              <Text variant={variant}>{variant}</Text>
              <Text variant="caption" color="textMuted">
                {textStyles[variant].fontSize}/{textStyles[variant].lineHeight}
              </Text>
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Butonlar">
        <View style={styles.stack}>
          <Button label="Teste Başla" onPress={() => {}} />
          <Button label="Daha Sonra" variant="secondary" onPress={() => {}} />
          <Button label="Aboneliği İptal Et" variant="danger" size="md" onPress={() => {}} />
          <View style={styles.row}>
            <Button label="Geç" variant="ghost" size="md" fullWidth={false} onPress={() => {}} />
            <Button label="Yükleniyor" size="md" fullWidth={false} loading onPress={() => {}} />
            <Button label="Kilitli" size="md" fullWidth={false} disabled onPress={() => {}} />
          </View>
        </View>
      </Section>

      <Section title="Filtre çipleri">
        <View style={styles.row}>
          {FILTERS.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={filter === item}
              onPress={() => setFilter(item)}
            />
          ))}
        </View>
      </Section>

      <Section title="Kategori kartları">
        <View style={styles.stack}>
          {GAME_CATEGORIES.slice(0, 3).map((category, index) => (
            <Card key={category} accentColor={categoryAccent[category]} onPress={() => {}}>
              <View style={styles.cardHead}>
                <Text variant="subheading">{CATEGORY_LABELS[category]}</Text>
                <Badge label={`Seviye ${(index + 1) * 7}`} />
              </View>
              <Text variant="bodySmall" color="textSecondary" style={styles.cardBody}>
                {(index + 1) * 12} oyun tamamlandı
              </Text>
              <ProgressBar
                value={(index + 1) * 0.24}
                color={categoryAccent[category]}
                accessibilityLabel={`${CATEGORY_LABELS[category]} ilerlemesi`}
              />
            </Card>
          ))}
        </View>
      </Section>

      <Section title="Rozetler">
        <View style={styles.row}>
          <Badge label="PRO" tone="brand" />
          <Badge label="Yeni" tone="success" />
          <Badge label="7 gün seri" tone="warning" />
          <Badge label="Süre doldu" tone="danger" />
          <Badge label="+25 XP" />
        </View>
      </Section>

      <Section title="Koyu tema — oyun ekranları">
        <ThemeProvider name="dark">
          <DarkPreview />
        </ThemeProvider>
      </Section>
    </Screen>
  );
}

function DarkPreview() {
  return (
    <Card padding="lg">
      <View style={styles.cardHead}>
        <Text variant="caption" color="textSecondary">
          Seviye 12
        </Text>
        <Badge label="Zor · +125%" tone="brand" />
      </View>
      <Text variant="heading" style={styles.cardBody}>
        Renk Tuzağı
      </Text>
      <Text variant="bodySmall" color="textSecondary" style={styles.cardBody}>
        Yazının rengini seç, kelimeyi değil.
      </Text>
      <ProgressBar value={0.62} accessibilityLabel="Oyun ilerlemesi" />
      <View style={styles.darkActions}>
        <Button label="Devam Et" size="md" onPress={() => {}} />
      </View>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="overline" color="textMuted" style={styles.sectionTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cardBody: {
    marginBottom: spacing.sm,
  },
  cardHead: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  darkActions: {
    marginTop: spacing.md,
  },
  header: {
    gap: spacing.xs2,
    paddingTop: spacing.md,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  stack: {
    gap: spacing.sm,
  },
  typeRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs2,
  },
});
