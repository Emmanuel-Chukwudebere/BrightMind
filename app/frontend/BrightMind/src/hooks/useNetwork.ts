import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  showOfflineMessage: boolean;
}

export const useNetwork = () => {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    showOfflineMessage: false,
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState(prev => ({
        isConnected: !!state.isConnected,
        showOfflineMessage: prev.isConnected && !state.isConnected,
      }));

      // Auto-hide offline message after 5 seconds
      if (!state.isConnected) {
        setTimeout(() => {
          setNetworkState(prev => ({ ...prev, showOfflineMessage: false }));
        }, 5000);
      }
    });

    return () => unsubscribe();
  }, []);

  return networkState;
};
