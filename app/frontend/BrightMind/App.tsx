import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';

// Providers
import { AuthProvider } from './src/context/AuthContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { ThemeProvider } from './src/context/ThemeContext';

// Navigation
import { RootNavigator } from './src/navigation/RootNavigator';

// Theme and Constants
import { theme } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <PaperProvider theme={theme}>
        <NetworkProvider>
          <AuthProvider>
            <ThemeProvider>
              <RootNavigator />
            </ThemeProvider>
          </AuthProvider>
        </NetworkProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
