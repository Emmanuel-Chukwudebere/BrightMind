// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkStatus {
  isConnected: boolean;
  isWifi: boolean;
  isCellular: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isWifi: false,
    isCellular: false,
    isInternetReachable: null,
    type: 'unknown',
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    return () => unsubscribe();
  }, []);

  return networkStatus;
};
