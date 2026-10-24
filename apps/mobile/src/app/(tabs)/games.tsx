import {
  GAME_CATEGORIES,
  playedGameCount,
  resumeLevel,
  type GameCategory,
  type GameRecord,
} from '@neuropeak/core';
import { categoryAccent, radius, spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Section } from '@/components/section';
import { Badge, Card, Chip, Screen, Text } from '@/components/ui';
import { GAME_CATALOGUE, type ContentGame } from '@neuropeak/content';

import { GAME_DEFINITIONS, isGamePlayable } from '@/games/registry';
import { useI18n, useLabels, useT } from '@/lib/i18n';
import { useProgress } from '@/lib/progress/context';

type Filter = GameCategory | 'all';

export default function GamesScreen() {
  const [filter, setFilter] = useState<Filter>('all');
  const t = useT();
  const labels = useLabels();
  const { games } = useProgress();

  const played = playedGameCount(games);

  const visibleCategories = GAME_CATEGORIES.filter(
    (category) => filter === 'all' || filter === category,
  ).filter((category) => GAME_CATALOGUE.some((game) => game.category === category));

  return (
    <Screen scroll padded={false}>
      <View style={styles.padded}>
        <AppHeader
          title={t('games.title')}
          subtitle={t('games.playedCount', { played, total: GAME_DEFINITIONS.length })}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <Chip
          label={t('common.all')}
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        {GAME_CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={labels.category(category)}
            selected={filter === category}
            onPress={() => setFilter(category)}
          />
        ))}
      </ScrollView>

      <View style={styles.padded}>
        {visibleCategories.map((category) => (
          <Section key={category} title={labels.category(category)}>
            <View style={styles.grid}>
              {GAME_CATALOGUE.filter((game) => game.category === category).map((game) => (
                <GameCard key={game.id} game={game} record={games[game.id]} />
              ))}
            </View>
          </Section>
        ))}
      </View>
    </Screen>
  );
}

function GameCard({ game, record }: { game: ContentGame; record: GameRecord | undefined }) {
  const router = useRouter();
  const t = useT();
  const { localized } = useI18n();
  const accent = categoryAccent[game.category];
  const playable = isGamePlayable(game.id);

  return (
    <Card
      style={styles.gameCard}
      padding="sm"
      accessibilityLabel={localized(game.title)}
      onPress={() => {
        if (playable) {
          router.push({ pathname: '/game/[id]', params: { id: game.id } });
        }
      }}
    >
      <View style={[styles.thumb, { backgroundColor: `${accent}1F`, opacity: playable ? 1 : 0.5 }]}>
        <View style={[styles.thumbDot, { backgroundColor: accent }]} />
      </View>
      <Text variant="subheading" numberOfLines={1}>
        {localized(game.title)}
      </Text>
      {!playable ? (
        <Badge label={t('common.soon')} />
      ) : record === undefined || record.plays === 0 ? (
        <Text variant="caption" color="textMuted">
          {t('games.notPlayed')}
        </Text>
      ) : (
        <Text variant="caption" color="textMuted">
          {/* Seviyeli oyunda kalınan yer, süreli oyunda en iyi skor:
              süreli oyunun seviyesi yok. */}
          {game.mode === 'levels'
            ? t('games.levelOf', { level: resumeLevel(record, game), total: game.totalLevels })
            : t('games.bestScore', { score: record.bestScore })}
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  gameCard: {
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.xs2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
  thumb: {
    alignItems: 'center',
    borderRadius: radius.sm,
    height: 72,
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  thumbDot: {
    borderRadius: radius.pill,
    height: 22,
    width: 22,
  },
});
