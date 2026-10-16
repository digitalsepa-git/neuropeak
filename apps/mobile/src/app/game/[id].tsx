import {
  DIFFICULTY_MULTIPLIERS,
  turkishDativeSuffix,
  xpForGameRound,
  type Difficulty,
} from '@neuropeak/core';
import { categoryAccent, radius, spacing } from '@neuropeak/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameShell } from '@/components/game/game-shell';
import { Icon } from '@/components/icons';
import {
  Badge,
  Button,
  Card,
  Screen,
  Text,
  ThemeProvider,
  tapFeedback,
  useTheme,
} from '@/components/ui';
import { findGame } from '@/games/registry';
import type { RoundOutcome } from '@/games/types';
import { useProgress } from '@/lib/progress/context';

type Phase = 'briefing' | 'playing' | 'result';

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Kolay',
  medium: 'Orta',
  hard: 'Zor',
};

const DIFFICULTY_HINTS: Record<Difficulty, string> = {
  easy: 'Zihnini ısıt',
  medium: 'Becerini dene',
  hard: 'Sınırlarını zorla',
};

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

/** Tamamlanmamış turu "tamamladın" diye göstermemek için. */
function resultSummary(mode: 'levels' | 'timed', result: RoundOutcome): string {
  if (!result.completed) {
    return mode === 'levels' ? 'Seviye tamamlanmadı' : 'Tur tamamlanmadı';
  }
  return mode === 'levels'
    ? `Seviye ${result.level}${turkishDativeSuffix(result.level)} ulaştın`
    : `${result.level} tur tamamladın`;
}

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { recordGameRound } = useProgress();

  const game = findGame(id ?? '');

  const [phase, setPhase] = useState<Phase>('briefing');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [status, setStatus] = useState<RoundOutcome>({ score: 0, level: 1, completed: false });
  const [outcome, setOutcome] = useState<RoundOutcome | null>(null);
  const [xpEarned, setXpEarned] = useState(0);

  const onFinish = useCallback(
    (result: RoundOutcome) => {
      if (game === undefined) return;

      setOutcome(result);
      setXpEarned(xpForGameRound({ baseXp: game.baseXp, difficulty, completed: result.completed }));
      setPhase('result');

      void recordGameRound({
        category: game.category,
        difficulty,
        completed: result.completed,
        baseXp: game.baseXp,
        mode: game.mode,
        level: result.level,
      });
    },
    [difficulty, game, recordGameRound],
  );

  if (game === undefined) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text variant="heading">Oyun bulunamadı</Text>
          <Button label="Geri dön" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (phase === 'briefing') {
    const accent = categoryAccent[game.category];

    return (
      <Screen scroll>
        <View style={styles.briefingTop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            hitSlop={12}
            onPress={() => router.back()}
            style={styles.backIcon}
          >
            <Icon name="chevronRight" color={theme.colors.textSecondary} size={22} />
          </Pressable>
        </View>

        <View style={[styles.cover, { backgroundColor: `${accent}1F` }]}>
          <View style={[styles.coverDot, { backgroundColor: accent }]} />
        </View>

        <Text variant="title" align="center">
          {game.title}
        </Text>
        <Text variant="bodySmall" color="textSecondary" align="center" style={styles.description}>
          {game.description}
        </Text>

        <Text variant="overline" color="textMuted" style={styles.sectionLabel}>
          Zorluk seç
        </Text>
        <View style={styles.difficulties}>
          {DIFFICULTIES.map((item) => {
            const selected = difficulty === item;
            const bonus = Math.round((DIFFICULTY_MULTIPLIERS[item] - 1) * 100);

            return (
              <Pressable
                key={item}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                onPress={() => {
                  tapFeedback();
                  setDifficulty(item);
                }}
                style={[
                  styles.difficultyCard,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: selected ? theme.colors.brand : theme.colors.border,
                    borderWidth: selected ? 2 : 1,
                  },
                ]}
              >
                <Badge
                  label={bonus === 0 ? 'Standart' : `+%${bonus} XP`}
                  tone={selected ? 'brand' : 'neutral'}
                />
                <Text variant="subheading" color={selected ? 'brand' : 'textPrimary'}>
                  {DIFFICULTY_LABELS[item]}
                </Text>
                <Text variant="caption" color="textMuted" align="center">
                  {DIFFICULTY_HINTS[item]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text variant="overline" color="textMuted" style={styles.sectionLabel}>
          Artırılacak yetenekler
        </Text>
        <View style={styles.skills}>
          {game.skills.map((skill) => (
            <Card key={skill} padding="sm">
              <View style={styles.skillRow}>
                <Icon name="check" color={theme.colors.success} size={16} strokeWidth={2.4} />
                <Text variant="bodySmall">{skill}</Text>
              </View>
            </Card>
          ))}
        </View>

        <View style={styles.startButton}>
          <Button
            label="Başla"
            onPress={() => {
              setStatus({ score: 0, level: 1, completed: false });
              setPhase('playing');
            }}
          />
        </View>
      </Screen>
    );
  }

  if (phase === 'playing') {
    const Game = game.Component;
    // Süreli oyunlar kendi etiketini (geri sayım) bildirir.
    const progressLabel =
      status.label ?? (game.mode === 'levels' ? `Seviye ${status.level}` : `Tur ${status.level}`);

    return (
      <ThemeProvider name="dark">
        <GameShell
          progressLabel={progressLabel}
          score={status.score}
          instruction={game.instruction}
          onExit={() => setPhase('result')}
        >
          <Game difficulty={difficulty} startLevel={1} onProgress={setStatus} onFinish={onFinish} />
        </GameShell>
      </ThemeProvider>
    );
  }

  const result = outcome ?? status;

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.duration(280)} style={styles.resultHeader}>
        <Text variant="overline" color="textMuted">
          {game.title}
        </Text>
        <Text variant="display" color="brand">
          {result.score}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          {resultSummary(game.mode, result)}
        </Text>
      </Animated.View>

      <Card padding="lg">
        <View style={styles.rewardRow}>
          <View style={styles.reward}>
            <Text variant="heading" color="brand">
              +{xpEarned}
            </Text>
            <Text variant="caption" color="textMuted">
              XP
            </Text>
          </View>
          <View style={[styles.rewardDivider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.reward}>
            <Text variant="heading" color="brand">
              +{result.completed ? 1 : 0}
            </Text>
            <Text variant="caption" color="textMuted">
              yıldız
            </Text>
          </View>
        </View>
      </Card>

      <View style={styles.resultActions}>
        <Button
          label="Tekrar oyna"
          onPress={() => {
            setOutcome(null);
            setStatus({ score: 0, level: 1, completed: false });
            setPhase('briefing');
          }}
        />
        <Button label="Bitti" variant="ghost" size="md" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backIcon: {
    transform: [{ rotate: '180deg' }],
    width: 22,
  },
  briefingTop: {
    paddingTop: spacing.sm,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  cover: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: radius.xl,
    height: 120,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
    width: 120,
  },
  coverDot: {
    borderRadius: radius.pill,
    height: 36,
    width: 36,
  },
  description: {
    marginTop: spacing.xs,
  },
  difficulties: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  difficultyCard: {
    alignItems: 'center',
    borderRadius: radius.md,
    flex: 1,
    gap: spacing.xs2,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
  },
  resultActions: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  resultHeader: {
    alignItems: 'center',
    gap: spacing.xs2,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xl,
  },
  reward: {
    alignItems: 'center',
    flex: 1,
  },
  rewardDivider: {
    height: 32,
    width: 1,
  },
  rewardRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  skillRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  skills: {
    gap: spacing.xs,
  },
  startButton: {
    marginTop: spacing.xl,
  },
});
