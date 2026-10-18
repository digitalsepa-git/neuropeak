import { spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { Section } from '@/components/section';
import { Badge, Card, Chip, Screen, Text, useTheme } from '@/components/ui';
import { BRAIN_AGE_STEPS, brainAgeTest, findProfileTest, findTest } from '@neuropeak/content';

import { TESTS, type PlaceholderTest } from '@/data/placeholder';
import { usePro } from '@/lib/billing/context';
import { useI18n, useT } from '@/lib/i18n';
import type { StringKey } from '@/lib/i18n';

const FILTERS = [
  { id: 'all', label: 'common.all' },
  { id: 'iq', label: 'tests.filterIq' },
  { id: 'fun', label: 'tests.filterFun' },
] as const satisfies readonly { id: string; label: StringKey }[];

type FilterId = (typeof FILTERS)[number]['id'];

export default function TestsScreen() {
  const [filter, setFilter] = useState<FilterId>('all');
  const t = useT();

  const iqTests = TESTS.filter((test) => test.group === 'iq');
  const funTests = TESTS.filter((test) => test.group === 'fun');

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
              {iqTests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </View>
          </Section>
        )}

        {(filter === 'all' || filter === 'fun') && (
          <Section title={t('tests.sectionFun')}>
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
  const t = useT();
  const { localized } = useI18n();
  const { isPro } = usePro();

  // Soru bankası yazılmamış testler listede kalır ama açılmaz;
  // yol haritası görünsün, boş ekran açılmasın.
  // Beyin Yaşı soru sormuyor, dört ölçüm yaptırıyor; profil
  // testlerinin doğru cevabı yok. Üçünün de kendi ekranı var.
  const isMeasureTest = test.id === brainAgeTest.id;
  const profile = findProfileTest(test.id);
  const content = findTest(test.id);
  const ready = content !== undefined || isMeasureTest || profile !== undefined;
  const locked = test.pro && !isPro;

  return (
    <Card
      accessibilityLabel={localized(test.title)}
      onPress={() => {
        if (!ready) return;
        if (locked) {
          router.push({ pathname: '/paywall', params: { variant: 'generic' } });
          return;
        }
        if (isMeasureTest) {
          router.push('/brain-age');
          return;
        }
        if (profile !== undefined) {
          router.push({ pathname: '/profile/[id]', params: { id: test.id } });
          return;
        }
        router.push({ pathname: '/test/[id]', params: { id: test.id } });
      }}
    >
      <View style={styles.row}>
        <View style={[styles.info, !ready && styles.dimmed]}>
          <View style={styles.titleRow}>
            <Text variant="subheading" numberOfLines={1}>
              {content !== undefined
                ? localized(content.title)
                : profile !== undefined
                  ? localized(profile.title)
                  : localized(test.title)}
            </Text>
            {!ready ? (
              <Badge label={t('common.soon')} />
            ) : test.pro ? (
              <Badge label="PRO" tone="brand" />
            ) : (
              <Badge label={t('common.free')} />
            )}
          </View>
          <Text variant="caption" color="textMuted">
            {content !== undefined
              ? `${t('common.questionCount', { count: content.questionCount })} · ${t('common.minutesShort', { value: `${content.estMinutes[0]}-${content.estMinutes[1]}` })}`
              : isMeasureTest
                ? t('brainAge.stepCount', {
                    count: BRAIN_AGE_STEPS.length,
                    minutes: brainAgeTest.estMinutes[1],
                  })
                : profile !== undefined
                  ? `${t('common.questionCount', { count: profile.questions.length })} · ${t('common.minutesShort', { value: `${profile.estMinutes[0]}-${profile.estMinutes[1]}` })}`
                  : `${t('common.questionCount', { count: test.questions })} · ${t('common.minutesShort', { value: test.minutes })}`}
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
