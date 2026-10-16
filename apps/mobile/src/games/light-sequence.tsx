import { palette, radius, spacing } from '@neuropeak/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text, tapFeedback, useTheme } from '@/components/ui';
import type { GameProps } from '@/games/types';
import { useRoundFinish } from '@/games/use-round-finish';

const PADS = [
  { id: 0, color: palette.accentMemory },
  { id: 1, color: palette.accentMath },
  { id: 2, color: palette.accentAttention },
  { id: 3, color: palette.accentSpatial },
] as const;

/** Zorluğa göre her ışığın yanma süresi. */
const PLAYBACK_MS: Record<GameProps['difficulty'], number> = {
  easy: 700,
  medium: 520,
  hard: 380,
};

type Phase = 'watch' | 'repeat' | 'wrong';

/**
 * Işık Dizisi — sonsuz. Her turda diziye bir ışık eklenir; oyuncu diziyi
 * tekrarlayamazsa oyun biter. Skor, tamamlanan tur sayısıdır.
 */
export function LightSequenceGame({ difficulty, onFinish, onProgress }: GameProps) {
  const theme = useTheme();
  const playbackMs = PLAYBACK_MS[difficulty];

  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>('watch');
  const [activePad, setActivePad] = useState<number | null>(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [round, setRound] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const sequenceRef = useRef<number[]>([]);
  const { report, finishNow } = useRoundFinish(onFinish, onProgress);

  useEffect(() => {
    report({ score: round * 10, level: Math.max(1, round), completed: round > 0 });
  }, [report, round]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  /** Diziyi bir ışık uzatıp oynatır. */
  const playNextRound = useCallback(() => {
    const next = [...sequenceRef.current, Math.floor(Math.random() * PADS.length)];
    sequenceRef.current = next;

    setSequence(next);
    setPhase('watch');
    setInputIndex(0);

    next.forEach((pad, index) => {
      timers.current.push(
        setTimeout(() => setActivePad(pad), index * playbackMs + 300),
        setTimeout(() => setActivePad(null), index * playbackMs + 300 + playbackMs * 0.6),
      );
    });

    timers.current.push(setTimeout(() => setPhase('repeat'), next.length * playbackMs + 400));
  }, [playbackMs]);

  useEffect(() => {
    playNextRound();
  }, [playNextRound]);

  const onPadPress = useCallback(
    (padId: number) => {
      if (phase !== 'repeat') return;

      tapFeedback();
      setActivePad(padId);
      timers.current.push(setTimeout(() => setActivePad(null), 160));

      if (sequence[inputIndex] !== padId) {
        setPhase('wrong');
        timers.current.push(setTimeout(finishNow, 700));
        return;
      }

      const nextIndex = inputIndex + 1;
      if (nextIndex >= sequence.length) {
        setRound((current) => current + 1);
        timers.current.push(setTimeout(playNextRound, 600));
        return;
      }

      setInputIndex(nextIndex);
    },
    [finishNow, inputIndex, phase, playNextRound, sequence],
  );

  const statusText = phase === 'watch' ? 'İzle…' : phase === 'wrong' ? 'Yanlış dizi' : 'Sıra sende';

  return (
    <View style={styles.root}>
      <Text variant="subheading" color={phase === 'wrong' ? 'danger' : 'textSecondary'}>
        {statusText}
      </Text>

      <View style={styles.pads}>
        {PADS.map((pad) => {
          const isActive = activePad === pad.id;
          return (
            <Pressable
              key={pad.id}
              accessibilityRole="button"
              accessibilityLabel={`${pad.id + 1}. ışık`}
              disabled={phase !== 'repeat'}
              onPress={() => onPadPress(pad.id)}
              style={[
                styles.pad,
                {
                  backgroundColor: pad.color,
                  opacity: isActive ? 1 : 0.32,
                  borderColor: isActive ? theme.colors.textPrimary : 'transparent',
                },
              ]}
            />
          );
        })}
      </View>

      <Text variant="caption" color="textMuted">
        {sequence.length} ışık
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 128,
    width: 128,
  },
  pads: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginVertical: spacing.xl,
    width: 128 * 2 + spacing.sm,
  },
  root: {
    alignItems: 'center',
  },
});
