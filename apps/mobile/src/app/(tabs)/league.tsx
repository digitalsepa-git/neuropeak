import { radius, spacing } from '@neuropeak/ui';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Icon } from '@/components/icons';
import { Section } from '@/components/section';
import { Badge, Card, Screen, Text, useTheme } from '@/components/ui';
import { LEAGUE_ROWS, type LeagueRow } from '@/data/placeholder';

/** İlk 10 terfi eder, son 5 düşer — grupta 30 kişi olacak (PR#17). */
const PROMOTION_CUTOFF = 3;

export default function LeagueScreen() {
  const theme = useTheme();

  return (
    <Screen scroll>
      <AppHeader title="Lig" />

      <Card padding="lg">
        <View style={styles.leagueHead}>
          <View style={[styles.trophy, { backgroundColor: `${theme.colors.warning}1F` }]}>
            <Icon name="league" color={theme.colors.warning} size={28} />
          </View>
          <View style={styles.leagueText}>
            <Text variant="heading">Altın Lig</Text>
            <Text variant="bodySmall" color="textSecondary">
              Hafta bitimine 3 gün 14 saat
            </Text>
          </View>
        </View>
        <Text variant="bodySmall" color="textSecondary" style={styles.leagueNote}>
          İlk 3 Platin Lig&apos;e yükselir. Sen 4. sıradasın — terfi bölgesine 235 XP kaldı.
        </Text>
      </Card>

      <Section title="Haftalık sıralama">
        <Card padding="xs">
          {LEAGUE_ROWS.map((row, index) => (
            <View key={row.rank}>
              <LeagueRowItem row={row} />
              {index === PROMOTION_CUTOFF - 1 && (
                <View style={styles.cutoff}>
                  <View style={[styles.cutoffLine, { backgroundColor: theme.colors.success }]} />
                  <Text variant="overline" color="success">
                    Terfi bölgesi
                  </Text>
                  <View style={[styles.cutoffLine, { backgroundColor: theme.colors.success }]} />
                </View>
              )}
            </View>
          ))}
        </Card>
      </Section>

      <Section title="Küresel sıralama">
        <Card onPress={() => {}}>
          <View style={styles.globalRow}>
            <View style={styles.leagueText}>
              <Text variant="subheading">Türkiye&apos;de 1.284.</Text>
              <Text variant="caption" color="textMuted">
                Dünyada 48.902. · NeuroPeak skoruna göre
              </Text>
            </View>
            <Icon name="chevronRight" color={theme.colors.textMuted} size={20} />
          </View>
        </Card>
      </Section>
    </Screen>
  );
}

function LeagueRowItem({ row }: { row: LeagueRow }) {
  const theme = useTheme();
  const highlight = row.isCurrentUser === true;

  return (
    <View
      style={[
        styles.row,
        highlight && {
          backgroundColor: `${theme.colors.brand}14`,
          borderRadius: radius.sm,
        },
      ]}
    >
      <Text variant="bodyStrong" color={highlight ? 'brand' : 'textMuted'} style={styles.rank}>
        {row.rank}
      </Text>
      <Text variant="body" color={highlight ? 'brand' : 'textPrimary'} style={styles.name}>
        {row.name}
      </Text>
      {row.rank <= PROMOTION_CUTOFF && <Badge label="Terfi" tone="success" />}
      <Text variant="caption" color="textSecondary">
        {row.xp.toLocaleString('tr-TR')} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cutoff: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  cutoffLine: {
    flex: 1,
    height: 1,
    opacity: 0.4,
  },
  globalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  leagueHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  leagueNote: {
    marginTop: spacing.md,
  },
  leagueText: {
    flex: 1,
    gap: spacing.xs2,
  },
  name: {
    flex: 1,
  },
  rank: {
    minWidth: 24,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  trophy: {
    alignItems: 'center',
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
});
