import { GAME_CATEGORIES, type GameCategory } from '@neuropeak/core';
import { spacing } from '@neuropeak/ui';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icons';
import { HeroOrbit } from '@/components/onboarding/hero-orbit';
import { OptionRow } from '@/components/onboarding/option-row';
import { StepProgress } from '@/components/onboarding/step-progress';
import { Button, ProgressBar, Text, tapFeedback, useTheme } from '@/components/ui';
import { CATEGORY_LABELS } from '@/data/placeholder';
import { useOnboardingGate } from '@/lib/onboarding-context';
import {
  AGE_RANGES,
  DAILY_GOALS,
  EMPTY_ANSWERS,
  saveOnboardingResult,
  type Concern,
  type Habit,
  type OnboardingAnswers,
} from '@/lib/onboarding';

const STEPS = [
  'welcome',
  'age',
  'focus',
  'goal',
  'concern',
  'habit',
  'plan',
  'notifications',
] as const;

type StepId = (typeof STEPS)[number];

/** İlerleme çizgisinde sayılan adımlar — karşılama, plan ve izin ekranları hariç. */
const QUESTION_STEPS: StepId[] = ['age', 'focus', 'goal', 'concern', 'habit'];

const CONCERN_OPTIONS: { id: Concern; label: string; hint: string }[] = [
  { id: 'forgetfulness', label: 'Unutkanlık', hint: 'İsimler, yapılacaklar, nereye koyduğum' },
  { id: 'distraction', label: 'Dikkat dağınıklığı', hint: 'Bir işe uzun süre odaklanamıyorum' },
  { id: 'slowThinking', label: 'Yavaş düşünme', hint: 'Karar vermem eskisinden uzun sürüyor' },
  { id: 'none', label: 'Hiçbiri', hint: 'Sadece zihnimi geliştirmek istiyorum' },
];

const HABIT_OPTIONS: { id: Habit; label: string }[] = [
  { id: 'daily', label: 'Her gün' },
  { id: 'sometimes', label: 'Haftada birkaç kez' },
  { id: 'rarely', label: 'Nadiren' },
  { id: 'never', label: 'Hiç yapmadım' },
];

const GOAL_HINTS: Record<number, string> = {
  5: 'Kısa ve sürdürülebilir',
  10: 'Çoğu kişinin tercihi',
  20: 'Hızlı ilerlemek isteyenler için',
};

export default function OnboardingScreen() {
  const theme = useTheme();
  const { setCompleted } = useOnboardingGate();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ANSWERS);
  const [saving, setSaving] = useState(false);

  const step = STEPS[stepIndex] ?? 'welcome';
  const questionNumber = QUESTION_STEPS.indexOf(step) + 1;

  const goNext = useCallback(() => {
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  }, []);

  const goBack = useCallback(() => {
    tapFeedback();
    setStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  const finish = useCallback(
    async (granted: boolean) => {
      setSaving(true);
      await saveOnboardingResult({ ...answers, notificationsGranted: granted });
      // Kapı açılınca Stack.Protected sekmelere geçirir.
      // Paywall PR#7'de bu akışın sonuna eklenecek.
      setCompleted(true);
    },
    [answers, setCompleted],
  );

  const requestNotifications = useCallback(async () => {
    let granted = false;
    try {
      const result = await Notifications.requestPermissionsAsync();
      granted = result.granted;
    } catch {
      // İzin istenemezse akış durmaz; kullanıcı sonradan ayarlardan açabilir.
      granted = false;
    }
    await finish(granted);
  }, [finish]);

  const canContinue =
    (step === 'age' && answers.ageRange !== null) ||
    (step === 'focus' && answers.focusAreas.length > 0) ||
    (step === 'goal' && answers.dailyGoalMinutes !== null) ||
    (step === 'concern' && answers.concern !== null) ||
    (step === 'habit' && answers.habit !== null) ||
    step === 'welcome';

  const toggleFocusArea = (category: GameCategory) => {
    setAnswers((current) => ({
      ...current,
      focusAreas: current.focusAreas.includes(category)
        ? current.focusAreas.filter((item) => item !== category)
        : [...current.focusAreas, category],
    }));
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        {stepIndex > 0 && step !== 'plan' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Geri"
            hitSlop={10}
            onPress={goBack}
          >
            <View style={styles.backIcon}>
              <Icon name="chevronRight" color={theme.colors.textSecondary} size={22} />
            </View>
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <View style={styles.progressSlot}>
          {questionNumber > 0 && (
            <StepProgress current={questionNumber} total={QUESTION_STEPS.length} />
          )}
        </View>

        <View style={styles.backPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          key={step}
          entering={FadeInRight.duration(220)}
          exiting={FadeOutLeft.duration(160)}
        >
          {step === 'welcome' && (
            <View style={styles.welcome}>
              <HeroOrbit />
              <Text variant="title" align="center">
                Zihnini her gün biraz daha ileri taşı
              </Text>
              <Text variant="body" color="textSecondary" align="center">
                28 mini oyun ve 11 test ile hafızanı, odaklanmanı ve mantığını ölç, geliştir, takip
                et.
              </Text>
            </View>
          )}

          {step === 'age' && (
            <StepBody
              title="Kaç yaşındasın?"
              description="Sonuçlarını aynı yaş grubundakilerle karşılaştırabilmek için gerekli."
            >
              {AGE_RANGES.map((range) => (
                <OptionRow
                  key={range}
                  label={range}
                  selected={answers.ageRange === range}
                  onPress={() => setAnswers((current) => ({ ...current, ageRange: range }))}
                />
              ))}
            </StepBody>
          )}

          {step === 'focus' && (
            <StepBody
              title="Hangi alanları geliştirmek istiyorsun?"
              description="Birden fazla seçebilirsin. Günlük planın buna göre kurulur."
            >
              {GAME_CATEGORIES.map((category) => (
                <OptionRow
                  key={category}
                  multi
                  label={CATEGORY_LABELS[category]}
                  selected={answers.focusAreas.includes(category)}
                  onPress={() => toggleFocusArea(category)}
                />
              ))}
            </StepBody>
          )}

          {step === 'goal' && (
            <StepBody
              title="Günde ne kadar vakit ayırabilirsin?"
              description="Küçük başlamak, hiç başlamamaktan iyidir. Sonradan değiştirebilirsin."
            >
              {DAILY_GOALS.map((minutes) => (
                <OptionRow
                  key={minutes}
                  label={`${minutes} dakika`}
                  hint={GOAL_HINTS[minutes]}
                  selected={answers.dailyGoalMinutes === minutes}
                  onPress={() =>
                    setAnswers((current) => ({ ...current, dailyGoalMinutes: minutes }))
                  }
                />
              ))}
            </StepBody>
          )}

          {step === 'concern' && (
            <StepBody
              title="Son zamanlarda seni en çok ne zorluyor?"
              description="Planını bu alana ağırlık verecek şekilde kurarız."
            >
              {CONCERN_OPTIONS.map((option) => (
                <OptionRow
                  key={option.id}
                  label={option.label}
                  hint={option.hint}
                  selected={answers.concern === option.id}
                  onPress={() => setAnswers((current) => ({ ...current, concern: option.id }))}
                />
              ))}
            </StepBody>
          )}

          {step === 'habit' && (
            <StepBody
              title="Ne sıklıkla zihinsel egzersiz yapıyorsun?"
              description="Başlangıç zorluğunu buna göre ayarlarız."
            >
              {HABIT_OPTIONS.map((option) => (
                <OptionRow
                  key={option.id}
                  label={option.label}
                  selected={answers.habit === option.id}
                  onPress={() => setAnswers((current) => ({ ...current, habit: option.id }))}
                />
              ))}
            </StepBody>
          )}

          {step === 'plan' && <PlanStep answers={answers} onDone={goNext} />}

          {step === 'notifications' && (
            <StepBody
              title="Seriyi kaçırma"
              description="Günde en fazla bir hatırlatma göndeririz. İstediğin an kapatabilirsin."
            >
              <BenefitRow text="Serin bitmek üzereyken haber veririz" />
              <BenefitRow text="Günün görevleri hazır olduğunda hatırlatırız" />
              <BenefitRow text="Ligdeki sıralaman değişince bildiririz" />
            </StepBody>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {step === 'notifications' ? (
          <>
            <Button
              label="Bildirimleri aç"
              loading={saving}
              onPress={() => {
                void requestNotifications();
              }}
            />
            <Button
              label="Şimdi değil"
              variant="ghost"
              size="md"
              disabled={saving}
              onPress={() => {
                void finish(false);
              }}
            />
          </>
        ) : (
          step !== 'plan' && (
            <Button
              label={step === 'welcome' ? 'Başlayalım' : 'Devam et'}
              disabled={!canContinue}
              onPress={goNext}
            />
          )
        )}
      </View>
    </SafeAreaView>
  );
}

function StepBody({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.stepBody}>
      <Text variant="title">{title}</Text>
      <Text variant="bodySmall" color="textSecondary" style={styles.stepDescription}>
        {description}
      </Text>
      <View style={styles.options}>{children}</View>
    </View>
  );
}

function BenefitRow({ text }: { text: string }) {
  const theme = useTheme();

  return (
    <View style={styles.benefit}>
      <Icon name="check" color={theme.colors.success} size={18} strokeWidth={2.4} />
      <Text variant="body" style={styles.benefitText}>
        {text}
      </Text>
    </View>
  );
}

const PLAN_CAPTIONS = [
  'Cevapların işleniyor…',
  'Yetenek alanların eşleştiriliyor…',
  'Günlük planın hazırlanıyor…',
];

/** Cevapların bir karşılığı olduğunu hissettiren kısa bekleme ekranı. */
function PlanStep({ answers, onDone }: { answers: OnboardingAnswers; onDone: () => void }) {
  const [progress, setProgress] = useState(0.08);
  const [captionIndex, setCaptionIndex] = useState(0);

  useEffect(() => {
    const steps = [0.35, 0.7, 1];
    const timers = steps.map((value, index) =>
      setTimeout(
        () => {
          setProgress(value);
          setCaptionIndex(Math.min(index + 1, PLAN_CAPTIONS.length - 1));
        },
        700 * (index + 1),
      ),
    );
    const done = setTimeout(onDone, 700 * steps.length + 500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [onDone]);

  const focusLabels = answers.focusAreas.map((area) => CATEGORY_LABELS[area]).join(', ');

  return (
    <View style={styles.plan}>
      <Text variant="title" align="center">
        Planın hazırlanıyor
      </Text>
      <Text variant="bodySmall" color="textSecondary" align="center">
        {PLAN_CAPTIONS[captionIndex]}
      </Text>
      <View style={styles.planBar}>
        <ProgressBar value={progress} height={10} accessibilityLabel="Plan hazırlanıyor" />
      </View>
      {focusLabels.length > 0 && (
        <Text variant="caption" color="textMuted" align="center">
          Odak alanların: {focusLabels}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  backPlaceholder: {
    width: 22,
  },
  benefit: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  benefitText: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  footer: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  options: {
    gap: spacing.xs,
  },
  plan: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  planBar: {
    marginVertical: spacing.md,
    width: '100%',
  },
  progressSlot: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  stepBody: {
    gap: spacing.xs2,
  },
  stepDescription: {
    marginBottom: spacing.lg,
  },
  welcome: {
    alignItems: 'center',
    gap: spacing.md,
  },
});
