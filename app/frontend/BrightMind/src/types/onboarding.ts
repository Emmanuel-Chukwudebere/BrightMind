// src/types/onboarding.ts
export interface OnboardingDotsProps {
    currentScreen: number;
    totalScreens: number;
    onDotPress: (index: number) => void;
  }