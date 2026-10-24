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
import { PaywallView } from '@/components/paywall/paywall-view';
import { Button, ProgressBar, Text, tapFeedback, useTheme } from '@/components/ui';
import { useLabels, useT } from '@/lib/i18n';
import type { StringKey } from '@/lib/i18n';
import { useOnboardingGate } from '@/lib/onboarding-context';
import { enqueueMutation } from '@/lib/sync';
import { useContent } from '@/lib/content/context';
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
  'paywall',
] as const;

type StepId = (typeof STEPS)[number];

/** İlerleme çizgisinde sayılan adımlar — karşılama, plan ve izin ekranları hariç. */
const QUESTION_STEPS: StepId[] = ['age', 'focus', 'goal', 'concern', 'habit'];

const CONCERN_OPTIONS: { id: Concern; label: StringKey; hint: StringKey }[] = [
  {
    id: 'forgetfulness',
    label: 'onboarding.concern.forgetfulness',
    hint: 'onboarding.concern.forgetfulnessHint',
  },
  {
    id: 'distraction',
    label: 'onboarding.concern.distraction',
    hint: 'onboarding.concern.distractionHint',
  },
  {
    id: 'slowThinking',
    label: 'onboarding.concern.slowThinking',
    hint: 'onboarding.concern.slowThinkingHint',
  },
  { id: 'none', label: 'onboarding.concern.none', hint: 'onboarding.concern.noneHint' },
];

const HABIT_OPTIONS: { id: Habit; label: StringKey }[] = [
  { id: 'daily', label: 'onboarding.habit.daily' },
  { id: 'sometimes', label: 'onboarding.habit.sometimes' },
  { id: 'rarely', label: 'onboarding.habit.rarely' },
  { id: 'never', label: 'onboarding.habit.never' },
];

const GOAL_HINTS: Record<number, StringKey> = {
  5: 'onboarding.goal.hint5',
  10: 'onboarding.goal.hint10',
  20: 'onboarding.goal.hint20',
};

/** Karşılama metnindeki sayılar katalogdan; elle yazılınca eskiyordu. */

export default function OnboardingScreen() {
  const catalogue = useContent();
  const theme = useTheme();
  const t = useT();
  const labels = useLabels();

  const goalHint = (minutes: number) => {
    const key = GOAL_HINTS[minutes];
    return key === undefined ? undefined : t(key);
  };
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
      const finalAnswers = { ...answers, notificationsGranted: granted };
      await saveOnboardingResult(finalAnswers);
      await enqueueMutation({
        kind: 'onboarding_upsert',
        payload: finalAnswers,
        dedupeKey: 'self',
      });
      setSaving(false);
      // Cevaplar kaydedildi; son adım paywall. Kapı ancak oradan çıkınca
      // açılır, böylece onboarding yarıda kalmış sayılmaz.
      goNext();
    },
    [answers, goNext],
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

  // Paywall kendi tam ekranını çizer; onboarding kabuğunun dışında kalır.
  if (step === 'paywall') {
    return (
      <PaywallView
        variant="onboarding"
        onDismiss={() => setCompleted(true)}
        onPurchased={() => setCompleted(true)}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        {stepIndex > 0 && step !== 'plan' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
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
                {t('onboarding.welcome.title')}
              </Text>
              <Text variant="body" color="textSecondary" align="center">
                {t('onboarding.welcome.body', {
                  games: catalogue.games.length,
                  tests:
                    catalogue.tests.length +
                    catalogue.profileTests.length +
                    catalogue.measureTests.length,
                })}
              </Text>
            </View>
          )}

          {step === 'age' && (
            <StepBody
              title={t('onboarding.age.title')}
              description={t('onboarding.age.description')}
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
              title={t('onboarding.focus.title')}
              description={t('onboarding.focus.description')}
            >
              {GAME_CATEGORIES.map((category) => (
                <OptionRow
                  key={category}
                  multi
                  label={labels.category(category)}
                  selected={answers.focusAreas.includes(category)}
                  onPress={() => toggleFocusArea(category)}
                />
              ))}
            </StepBody>
          )}

          {step === 'goal' && (
            <StepBody
              title={t('onboarding.goal.title')}
              description={t('onboarding.goal.description')}
            >
              {DAILY_GOALS.map((minutes) => (
                <OptionRow
                  key={minutes}
                  label={t('onboarding.goal.minutes', { minutes })}
                  hint={goalHint(minutes)}
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
              title={t('onboarding.concern.title')}
              description={t('onboarding.concern.description')}
            >
              {CONCERN_OPTIONS.map((option) => (
                <OptionRow
                  key={option.id}
                  label={t(option.label)}
                  hint={t(option.hint)}
                  selected={answers.concern === option.id}
                  onPress={() => setAnswers((current) => ({ ...current, concern: option.id }))}
                />
              ))}
            </StepBody>
          )}

          {step === 'habit' && (
            <StepBody
              title={t('onboarding.habit.title')}
              description={t('onboarding.habit.description')}
            >
              {HABIT_OPTIONS.map((option) => (
                <OptionRow
                  key={option.id}
                  label={t(option.label)}
                  selected={answers.habit === option.id}
                  onPress={() => setAnswers((current) => ({ ...current, habit: option.id }))}
                />
              ))}
            </StepBody>
          )}

          {step === 'plan' && <PlanStep answers={answers} onDone={goNext} />}

          {step === 'notifications' && (
            <StepBody
              title={t('onboarding.notifications.title')}
              description={t('onboarding.notifications.description')}
            >
              <BenefitRow text={t('onboarding.notifications.benefit1')} />
              <BenefitRow text={t('onboarding.notifications.benefit2')} />
              <BenefitRow text={t('onboarding.notifications.benefit3')} />
            </StepBody>
          )}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {step === 'notifications' ? (
          <>
            <Button
              label={t('onboarding.notifications.enable')}
              loading={saving}
              onPress={() => {
                void requestNotifications();
              }}
            />
            <Button
              label={t('common.notNow')}
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
              label={step === 'welcome' ? t('onboarding.start') : t('common.continueAction')}
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

const PLAN_CAPTIONS: StringKey[] = [
  'onboarding.plan.caption1',
  'onboarding.plan.caption2',
  'onboarding.plan.caption3',
];

/** Cevapların bir karşılığı olduğunu hissettiren kısa bekleme ekranı. */
function PlanStep({ answers, onDone }: { answers: OnboardingAnswers; onDone: () => void }) {
  const t = useT();
  const labels = useLabels();
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

  const focusLabels = answers.focusAreas.map((area) => labels.category(area)).join(', ');

  return (
    <View style={styles.plan}>
      <Text variant="title" align="center">
        {t('onboarding.plan.title')}
      </Text>
      <Text variant="bodySmall" color="textSecondary" align="center">
        {t(PLAN_CAPTIONS[captionIndex] ?? 'onboarding.plan.caption1')}
      </Text>
      <View style={styles.planBar}>
        <ProgressBar
          value={progress}
          height={10}
          accessibilityLabel={t('onboarding.plan.progressLabel')}
        />
      </View>
      {focusLabels.length > 0 && (
        <Text variant="caption" color="textMuted" align="center">
          {t('onboarding.plan.focusAreas', { areas: focusLabels })}
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
