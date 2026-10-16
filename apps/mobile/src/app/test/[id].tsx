import {
  createRng,
  sample,
  scoreTest,
  seedFromString,
  type AnsweredQuestion,
  type QuestionKind,
  type ScoreResult,
} from '@neuropeak/core';
import { findTest, type ContentQuestion } from '@neuropeak/content';
import { radius, spacing } from '@neuropeak/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { Icon } from '@/components/icons';
import { ScoreReveal } from '@/components/test/score-reveal';
import { Button, Card, ProgressBar, Screen, Text, tapFeedback, useTheme } from '@/components/ui';
import { useProgress } from '@/lib/progress/context';
import { enqueueMutation } from '@/lib/sync';
import { saveTestResult, type StoredTestResult } from '@/lib/test-results';

type Phase = 'intro' | 'running' | 'result';

/**
 * Soru türünden "ölçülecek yetenek" kartına. Liste önceden sabitti ve
 * Sözel IQ testinin girişinde "sayı dizilerini çözme" yazıyordu;
 * artık testin kendi havuzundan türetiliyor.
 */
const SKILL_FOR_KIND: Record<QuestionKind, { title: string; hint: string }> = {
  number_series: { title: 'Örüntü tanıma', hint: 'Sayı dizilerindeki kuralı bulma' },
  arithmetic: { title: 'Aritmetik akıl yürütme', hint: 'İşlem sırasını doğru kurma' },
  verbal_analogy: { title: 'Sözel akıl yürütme', hint: 'Kavramlar arası bağ kurma' },
  odd_one_out: { title: 'Sınıflandırma', hint: 'Ortak özelliği ve istisnayı görme' },
  logic: { title: 'Mantıksal çıkarım', hint: 'Öncüllerden sonuca ulaşma' },
  coding: { title: 'Kural uygulama', hint: 'Verilen kuralı yeni duruma taşıma' },
  matrix: { title: 'Görsel örüntü', hint: 'Şekil ilişkilerini tamamlama' },
  shape_analogy: { title: 'Şekil analojisi', hint: 'Şekiller arası ilişki kurma' },
  spatial: { title: 'Uzamsal muhakeme', hint: 'Zihinde döndürme ve katlama' },
};

/** Havuzda en çok geçen üç soru türünün kartı. */
function skillBulletsFor(questions: readonly ContentQuestion[]) {
  const counts = new Map<QuestionKind, number>();
  for (const question of questions) {
    counts.set(question.kind, (counts.get(question.kind) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([kind]) => SKILL_FOR_KIND[kind]);
}

export default function TestRunnerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const { recordTestFinished } = useProgress();

  const test = findTest(id ?? '');

  const [phase, setPhase] = useState<Phase>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);

  // Oturum kimliği teste başlanınca üretilir: render saf kalsın ve her
  // deneme kendi soru alt kümesini alsın.
  const [sessionSeed, setSessionSeed] = useState<string | null>(null);

  const answersRef = useRef<AnsweredQuestion[]>([]);
  const questionStartedAt = useRef<number>(0);

  // Havuzdan oturuma özel bir alt küme seçilir; test tekrarlandığında
  // aynı sorular gelmez ama bir oturum içinde sıra sabit kalır.
  const questions = useMemo<ContentQuestion[]>(() => {
    if (test === undefined || sessionSeed === null) return [];
    const rng = createRng(seedFromString(sessionSeed));
    return sample(test.questions, test.questionCount, rng);
  }, [sessionSeed, test]);

  const finish = useCallback(
    async (answers: AnsweredQuestion[]) => {
      if (test === undefined) return;

      const score = scoreTest(answers, test.norm);
      setResult(score);
      setPhase('result');

      const stored: StoredTestResult = {
        id: `${test.id}-${Date.now()}`,
        testId: test.id,
        completedAt: new Date().toISOString(),
        score,
      };

      await saveTestResult(stored);
      await enqueueMutation({ kind: 'test_result', payload: stored });
      // XP, yıldız, seri ve günlük görevler tek kapıdan işlenir.
      await recordTestFinished(score.iq);
    },
    [recordTestFinished, test],
  );

  const answer = useCallback(
    (optionIndex: number) => {
      const question = questions[questionIndex];
      if (question === undefined) return;

      tapFeedback();
      setSelectedIndex(optionIndex);

      const elapsedMs = Date.now() - questionStartedAt.current;
      answersRef.current = [
        ...answersRef.current,
        {
          questionId: question.id,
          kind: question.kind,
          difficultyWeight: question.difficultyWeight,
          isCorrect: optionIndex === question.correctIndex,
          elapsedMs,
        },
      ];

      // Seçim kısa süre görünür kalsın, sonra sıradaki soruya geçilsin.
      setTimeout(() => {
        setSelectedIndex(null);
        if (questionIndex + 1 >= questions.length) {
          void finish(answersRef.current);
        } else {
          questionStartedAt.current = Date.now();
          setQuestionIndex((current) => current + 1);
        }
      }, 180);
    },
    [finish, questionIndex, questions],
  );

  if (test === undefined) {
    return (
      <Screen>
        <View style={styles.centered}>
          <Text variant="heading">Test bulunamadı</Text>
          <Button label="Geri dön" variant="secondary" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  if (phase === 'intro') {
    return (
      <Screen scroll>
        <View style={styles.introHeader}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kapat"
            hitSlop={10}
            onPress={() => router.back()}
          >
            <Icon name="chevronRight" color={theme.colors.textSecondary} size={22} />
          </Pressable>
        </View>

        <View style={styles.intro}>
          <Text variant="overline" color="brand">
            {test.questionCount} soru · {test.estMinutes[0]}-{test.estMinutes[1]} dk
          </Text>
          <Text variant="title">{test.title.tr}</Text>
          <Text variant="body" color="textSecondary">
            {test.description.tr}
          </Text>
        </View>

        <Text variant="overline" color="textMuted" style={styles.sectionLabel}>
          Ölçülecek yetenekler
        </Text>
        <View style={styles.bullets}>
          {skillBulletsFor(test.questions).map((bullet) => (
            <Card key={bullet.title}>
              <Text variant="subheading">{bullet.title}</Text>
              <Text variant="bodySmall" color="textSecondary">
                {bullet.hint}
              </Text>
            </Card>
          ))}
        </View>

        <Text variant="caption" color="textMuted" style={styles.disclaimer}>
          Bu test eğlence ve zihinsel egzersiz amaçlıdır; klinik veya psikometrik bir teşhis aracı
          değildir.
        </Text>

        <View style={styles.introAction}>
          <Button
            label="Teste başla"
            onPress={() => {
              setSessionSeed(`${test.id}-${Date.now()}`);
              questionStartedAt.current = Date.now();
              setPhase('running');
            }}
          />
        </View>
      </Screen>
    );
  }

  if (phase === 'result' && result !== null) {
    return <ScoreReveal result={result} testTitle={test.title.tr} onDone={() => router.back()} />;
  }

  const question = questions[questionIndex];
  if (question === undefined) {
    return <Screen />;
  }

  return (
    <Screen>
      {/* 20 soruda bölmeli çizgi okunmuyor; tek çubuk ve sayaç yeterli. */}
      <View style={styles.runnerHeader}>
        <View style={styles.runnerHeaderRow}>
          <Text variant="caption" color="textMuted">
            Soru {questionIndex + 1}/{questions.length}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Testten çık"
            hitSlop={10}
            onPress={() => router.back()}
          >
            <Text variant="caption" color="textMuted">
              Çık
            </Text>
          </Pressable>
        </View>
        <ProgressBar
          value={(questionIndex + 1) / questions.length}
          height={6}
          accessibilityLabel="Test ilerlemesi"
        />
      </View>

      <Animated.View
        key={question.id}
        entering={FadeInRight.duration(200)}
        exiting={FadeOutLeft.duration(140)}
        style={styles.questionArea}
      >
        <Text variant="heading" align="center" style={styles.prompt}>
          {question.prompt.tr}
        </Text>

        <View style={styles.options}>
          {question.options.map((option, index) => {
            const isSelected = selectedIndex === index;
            return (
              <Pressable
                key={option.tr}
                accessibilityRole="radio"
                accessibilityState={{ checked: isSelected }}
                disabled={selectedIndex !== null}
                onPress={() => answer(index)}
                style={[
                  styles.option,
                  {
                    backgroundColor: isSelected ? theme.colors.brand : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.brand : theme.colors.border,
                  },
                ]}
              >
                <Text variant="bodyStrong" color={isSelected ? 'onBrand' : 'textPrimary'}>
                  {option.tr}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  bullets: {
    gap: spacing.xs,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
  },
  disclaimer: {
    marginTop: spacing.lg,
  },
  intro: {
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  introAction: {
    marginTop: spacing.lg,
  },
  introHeader: {
    paddingTop: spacing.sm,
    transform: [{ rotate: '180deg' }],
    width: 22,
  },
  option: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  options: {
    gap: spacing.sm,
  },
  prompt: {
    marginBottom: spacing.xl,
  },
  questionArea: {
    flex: 1,
    justifyContent: 'center',
  },
  runnerHeader: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  runnerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
});
