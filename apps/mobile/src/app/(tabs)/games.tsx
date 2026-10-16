import { GAME_CATEGORIES, type GameCategory } from '@neuropeak/core';
import { categoryAccent, radius, spacing } from '@neuropeak/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { Section } from '@/components/section';
import { Badge, Card, Chip, Screen, Text } from '@/components/ui';
import { isGamePlayable } from '@/games/registry';
import { CATEGORY_LABELS, GAMES, type PlaceholderGame } from '@/data/placeholder';

type Filter = GameCategory | 'all';

export default function GamesScreen() {
  const [filter, setFilter] = useState<Filter>('all');

  const visibleCategories = GAME_CATEGORIES.filter(
    (category) => filter === 'all' || filter === category,
  ).filter((category) => GAMES.some((game) => game.category === category));

  return (
    <Screen scroll padded={false}>
      <View style={styles.padded}>
        <AppHeader title="Oyunlar" />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <Chip label="Tümü" selected={filter === 'all'} onPress={() => setFilter('all')} />
        {GAME_CATEGORIES.map((category) => (
          <Chip
            key={category}
            label={CATEGORY_LABELS[category]}
            selected={filter === category}
            onPress={() => setFilter(category)}
          />
        ))}
      </ScrollView>

      <View style={styles.padded}>
        {visibleCategories.map((category) => (
          <Section key={category} title={CATEGORY_LABELS[category]}>
            <View style={styles.grid}>
              {GAMES.filter((game) => game.category === category).map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </View>
          </Section>
        ))}
      </View>
    </Screen>
  );
}

function GameCard({ game }: { game: PlaceholderGame }) {
  const router = useRouter();
  const accent = categoryAccent[game.category];
  const isEndless = game.totalLevels === 0;
  const playable = isGamePlayable(game.id);

  return (
    <Card
      style={styles.gameCard}
      padding="sm"
      accessibilityLabel={game.title}
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
        {game.title}
      </Text>
      {playable ? (
        <Text variant="caption" color="textMuted">
          {isEndless ? `En iyi seviye ${game.level}` : `Seviye ${game.level}/${game.totalLevels}`}
        </Text>
      ) : (
        <Badge label="Yakında" />
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
