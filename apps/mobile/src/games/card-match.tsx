import { createRng, sample, seedFromString, shuffle } from '@neuropeak/core';
import { radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';
import { useT } from '@/lib/i18n';

const SYMBOLS = ['🍓', '🥑', '🍋', '🍇', '🍊', '🥝', '🍒', '🫐', '🍑', '🥥'] as const;

/** Kartların kapanma gecikmesi — eşleşmeyen çifti görecek kadar. */
const FLIP_BACK_MS = 700;

type Card = {
  readonly id: number;
  readonly symbol: string;
  matched: boolean;
};

function pairsForLevel(level: number, difficulty: GameProps['difficulty']): number {
  const offset = difficulty === 'easy' ? -1 : difficulty === 'hard' ? 1 : 0;
  return Math.max(3, Math.min(10, 3 + Math.floor(level / 3) + offset));
}

function buildDeck(level: number, pairCount: number): Card[] {
  const rng = createRng(seedFromString(`card-match:${level}:${pairCount}`));
  const symbols = sample(SYMBOLS, pairCount, rng);

  const cards = symbols.flatMap((symbol, index) => [
    { id: index * 2, symbol, matched: false },
    { id: index * 2 + 1, symbol, matched: false },
  ]);

  return shuffle(cards, rng);
}

/**
 * Kart Eşleme — seviyeli. Her seviyede çift sayısı artar; oyuncu çıkana
 * kadar seviyeler birbirini izler. Başarısızlık yok, hız ve hata sayısı
 * puana yansır.
 */
export function CardMatchGame({ difficulty, startLevel, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const t = useT();

  const [level, setLevel] = useState(startLevel);
  const [cards, setCards] = useState<Card[]>(() =>
    buildDeck(startLevel, pairsForLevel(startLevel, difficulty)),
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const levelsCleared = useRef(0);
  const { report } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({ score, level, completed: levelsCleared.current > 0 });
  }, [level, report, score]);

  const columns = cards.length <= 8 ? 3 : 4;

  const startNextLevel = useCallback(() => {
    setLevel((current) => {
      const next = current + 1;
      setCards(buildDeck(next, pairsForLevel(next, difficulty)));
      return next;
    });
    setFlipped([]);
    setMoves(0);
  }, [difficulty]);

  const onCardPress = useCallback(
    (cardId: number) => {
      if (locked) return;
      const card = cards.find((item) => item.id === cardId);
      if (card === undefined || card.matched || flipped.includes(cardId)) return;

      tapFeedback();
      const nextFlipped = [...flipped, cardId];
      setFlipped(nextFlipped);

      if (nextFlipped.length < 2) return;

      setMoves((current) => current + 1);
      setLocked(true);

      const [firstId, secondId] = nextFlipped;
      const first = cards.find((item) => item.id === firstId);
      const second = cards.find((item) => item.id === secondId);

      if (first !== undefined && second !== undefined && first.symbol === second.symbol) {
        const updated = cards.map((item) =>
          item.id === firstId || item.id === secondId ? { ...item, matched: true } : item,
        );
        setCards(updated);
        setFlipped([]);
        setLocked(false);
        setScore((current) => current + 10);

        if (updated.every((item) => item.matched)) {
          levelsCleared.current += 1;
          // Az hamleyle bitirmek bonus getirir.
          const perfectMoves = updated.length / 2;
          setScore((current) => current + Math.max(0, 40 - (moves + 1 - perfectMoves) * 4));
          setTimeout(startNextLevel, 600);
        }
        return;
      }

      setTimeout(() => {
        setFlipped([]);
        setLocked(false);
      }, FLIP_BACK_MS);
    },
    [cards, flipped, locked, moves, startNextLevel],
  );

  const tileSize = useMemo(() => (columns === 3 ? 92 : 74), [columns]);

  return (
    <View style={styles.root}>
      <View style={[styles.grid, { width: columns * (tileSize + spacing.xs) }]}>
        {cards.map((card) => {
          const isOpen = card.matched || flipped.includes(card.id);
          return (
            <Pressable
              key={card.id}
              accessibilityRole="button"
              accessibilityLabel={isOpen ? card.symbol : t('play.hiddenCard')}
              onPress={() => onCardPress(card.id)}
              style={[
                styles.tile,
                {
                  backgroundColor: isOpen ? theme.colors.surfaceElevated : theme.colors.surface,
                  borderColor: card.matched ? theme.colors.success : theme.colors.border,
                  height: tileSize,
                  opacity: card.matched ? 0.55 : 1,
                  width: tileSize,
                },
              ]}
            >
              {isOpen && (
                <Animated.Text entering={FadeIn.duration(120)} style={styles.symbol}>
                  {card.symbol}
                </Animated.Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <Text variant="caption" color="textMuted" style={styles.moves}>
        {moves} hamle
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  moves: {
    marginTop: spacing.lg,
  },
  root: {
    alignItems: 'center',
  },
  symbol: {
    fontSize: 34,
  },
  tile: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1.5,
    justifyContent: 'center',
  },
});
