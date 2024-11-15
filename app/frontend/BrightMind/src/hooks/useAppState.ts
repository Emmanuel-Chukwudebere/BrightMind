// src/hooks/useAppState.ts
import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useAppState = () => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const isActive = appState === 'active';
  const isBackground = appState === 'background';
  const isInactive = appState === 'inactive';

  return {
    appState,
    isActive,
    isBackground,
    isInactive,
  };
};
