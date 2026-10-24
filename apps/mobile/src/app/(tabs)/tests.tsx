import { spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { Section } from '@/components/section';
import { Badge, Card, Chip, Screen, Text, useTheme } from '@/components/ui';

import { usePro } from '@/lib/billing/context';
import { useI18n, useT } from '@/lib/i18n';
import type { StringKey } from '@/lib/i18n';
import { useContent } from '@/lib/content/context';
import { entriesInGroup, testEntries, type TestEntry } from '@/lib/content/test-list';

const FILTERS = [
  { id: 'all', label: 'common.all' },
  { id: 'iq', label: 'tests.filterIq' },
  { id: 'fun', label: 'tests.filterFun' },
] as const satisfies readonly { id: string; label: StringKey }[];

type FilterId = (typeof FILTERS)[number]['id'];

export default function TestsScreen() {
  const [filter, setFilter] = useState<FilterId>('all');
  const t = useT();

  // Liste katalogdan: panelden eklenen test burada da görünsün,
  // kaldırılan da kaybolsun. Katalogda olmayan bir testi "Yakında"
  // diye göstermiyoruz artık — gösterilecek bir şey yok.
  const catalogue = useContent();
  const entries = testEntries(catalogue);
  const iqTests = entriesInGroup(entries, 'iq');
  const funTests = entriesInGroup(entries, 'fun');

  return (
    <Screen scroll padded={false}>
      <View style={styles.padded}>
        <AppHeader title={t('tests.title')} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {FILTERS.map((item) => (
          <Chip
            key={item.id}
            label={t(item.label)}
            selected={filter === item.id}
            onPress={() => setFilter(item.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.padded}>
        {(filter === 'all' || filter === 'iq') && (
          <Section title={t('tests.sectionIq')}>
            <View style={styles.stack}>
              {iqTests.map((entry) => (
                <TestCard key={entry.test.id} entry={entry} />
              ))}
            </View>
          </Section>
        )}

        {(filter === 'all' || filter === 'fun') && (
          <Section title={t('tests.sectionFun')}>
            <View style={styles.stack}>
              {funTests.map((entry) => (
                <TestCard key={entry.test.id} entry={entry} />
              ))}
            </View>
          </Section>
        )}
      </View>
    </Screen>
  );
}

function TestCard({ entry }: { entry: TestEntry }) {
  const theme = useTheme();
  const router = useRouter();
  const t = useT();
  const { localized } = useI18n();
  const { isPro } = usePro();

  const { test } = entry;
  const locked = test.isPro && !isPro;

  return (
    <Card
      accessibilityLabel={localized(test.title)}
      onPress={() => {
        if (locked) {
          router.push({ pathname: '/paywall', params: { variant: 'generic' } });
          return;
        }
        // Üç türün ekranı ayrı: Beyin Yaşı ölçüm yaptırıyor, profil
        // testinin doğru cevabı yok, kalanı soru soruyor.
        if (entry.kind === 'measure') {
          router.push('/brain-age');
          return;
        }
        if (entry.kind === 'profile') {
          router.push({ pathname: '/profile/[id]', params: { id: test.id } });
          return;
        }
        router.push({ pathname: '/test/[id]', params: { id: test.id } });
      }}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text variant="subheading" numberOfLines={1}>
              {localized(test.title)}
            </Text>
            {test.isPro ? <Badge label="PRO" tone="brand" /> : <Badge label={t('common.free')} />}
          </View>
          <Text variant="caption" color="textMuted">
            <TestSummary entry={entry} />
          </Text>
        </View>
        <Icon
          name={locked ? 'lock' : 'chevronRight'}
          color={theme.colors.textMuted}
          size={locked ? 18 : 20}
        />
      </View>
    </Card>
  );
}

/** Kart altındaki "şu kadar soru · şu kadar dakika" satırı. */
function TestSummary({ entry }: { entry: TestEntry }) {
  const t = useT();

  if (entry.kind === 'measure') {
    return (
      <>
        {t('brainAge.stepCount', {
          count: entry.test.steps.length,
          minutes: entry.test.estMinutes[1],
        })}
      </>
    );
  }

  const count = entry.kind === 'profile' ? entry.test.questions.length : entry.test.questionCount;
  const [min, max] = entry.test.estMinutes;

  return (
    <>
      {t('common.questionCount', { count })} ·{' '}
      {t('common.minutesShort', { value: `${min}-${max}` })}
    </>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
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
