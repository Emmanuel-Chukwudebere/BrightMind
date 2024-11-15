// src/hooks/useNavigationState.ts
import { useEffect, useState } from 'react';
import { useNavigationState as useReactNavigationState } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

interface NavigationStateInfo {
  currentRoute: keyof RootStackParamList | undefined;
  previousRoute: keyof RootStackParamList | undefined;
  isFirstRoute: boolean;
  routeParams: any;
  navigationHistory: string[];
}

export const useNavigationState = (): NavigationStateInfo => {
  const navigationState = useReactNavigationState(state => state);
  const [previousRoute, setPreviousRoute] = useState<keyof RootStackParamList>();
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);

  const currentRoute = navigationState?.routes[navigationState.index]?.name as keyof RootStackParamList;
  const routeParams = navigationState?.routes[navigationState.index]?.params;
  const isFirstRoute = navigationState?.index === 0;

  useEffect(() => {
    if (currentRoute) {
      setPreviousRoute(navigationHistory[navigationHistory.length - 1] as keyof RootStackParamList);
      setNavigationHistory(prev => [...prev, currentRoute]);
    }
  }, [currentRoute]);

  return {
    currentRoute,
    previousRoute,
    isFirstRoute,
    routeParams,
    navigationHistory,
  };
};
