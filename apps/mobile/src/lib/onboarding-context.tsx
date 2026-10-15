import { createContext, use, useMemo, useState, type ReactNode } from 'react';

type OnboardingGate = {
  completed: boolean;
  /** Akış bitince çağrılır; yönlendirme Stack.Protected tarafından yapılır. */
  setCompleted: (value: boolean) => void;
};

const OnboardingGateContext = createContext<OnboardingGate>({
  completed: true,
  setCompleted: () => undefined,
});

export function OnboardingGateProvider({
  initialCompleted,
  children,
}: {
  initialCompleted: boolean;
  children: ReactNode;
}) {
  const [completed, setCompleted] = useState(initialCompleted);
  const value = useMemo(() => ({ completed, setCompleted }), [completed]);

  return <OnboardingGateContext value={value}>{children}</OnboardingGateContext>;
}

export function useOnboardingGate(): OnboardingGate {
  return use(OnboardingGateContext);
}
