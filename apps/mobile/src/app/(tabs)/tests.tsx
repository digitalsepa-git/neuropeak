import { spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { Section } from '@/components/section';
import { Badge, Card, Chip, Screen, Text, useTheme } from '@/components/ui';
import { findTest } from '@neuropeak/content';

import { TESTS, type PlaceholderTest } from '@/data/placeholder';
import { usePro } from '@/lib/billing/context';

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'iq', label: 'IQ Testleri' },
  { id: 'fun', label: 'Keşfet' },
] as const;

type FilterId = (typeof FILTERS)[number]['id'];

export default function TestsScreen() {
  const [filter, setFilter] = useState<FilterId>('all');

  const iqTests = TESTS.filter((test) => test.group === 'iq');
  const funTests = TESTS.filter((test) => test.group === 'fun');

  return (
    <Screen scroll padded={false}>
      <View style={styles.padded}>
        <AppHeader title="Testler" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {FILTERS.map((item) => (
          <Chip
            key={item.id}
            label={item.label}
            selected={filter === item.id}
            onPress={() => setFilter(item.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.padded}>
        {(filter === 'all' || filter === 'iq') && (
          <Section title="IQ Testleri">
            <View style={styles.stack}>
              {iqTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </View>
          </Section>
        )}

        {(filter === 'all' || filter === 'fun') && (
          <Section title="Keşfet">
            <View style={styles.stack}>
              {funTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </View>
          </Section>
        )}
      </View>
    </Screen>
  );
}

function TestCard({ test }: { test: PlaceholderTest }) {
  const theme = useTheme();
  const router = useRouter();
  const { isPro } = usePro();

  // Soru bankası yazılmamış testler listede kalır ama açılmaz;
  // yol haritası görünsün, boş ekran açılmasın.
  const content = findTest(test.id);
  const ready = content !== undefined;
  const locked = test.pro && !isPro;

  return (
    <Card
      accessibilityLabel={test.title}
      onPress={() => {
        if (!ready) return;
        if (locked) {
          router.push({ pathname: '/paywall', params: { variant: 'generic' } });
          return;
        }
        router.push({ pathname: '/test/[id]', params: { id: test.id } });
      }}
    >
      <View style={styles.row}>
        <View style={[styles.info, !ready && styles.dimmed]}>
          <View style={styles.titleRow}>
            <Text variant="subheading" numberOfLines={1}>
              {test.title}
            </Text>
            {!ready ? (
              <Badge label="Yakında" />
            ) : test.pro ? (
              <Badge label="PRO" tone="brand" />
            ) : (
              <Badge label="Ücretsiz" />
            )}
          </View>
          <Text variant="caption" color="textMuted">
            {ready
              ? `${content.questionCount} soru · ${content.estMinutes[0]}-${content.estMinutes[1]} dk`
              : `${test.questions} soru · ${test.minutes} dk`}
          </Text>
        </View>
        {ready && (
          <Icon
            name={locked ? 'lock' : 'chevronRight'}
            color={theme.colors.textMuted}
            size={locked ? 18 : 20}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  dimmed: {
    opacity: 0.55,
  },
  info: {
    flex: 1,
    gap: spacing.xs2,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.sm,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
});
