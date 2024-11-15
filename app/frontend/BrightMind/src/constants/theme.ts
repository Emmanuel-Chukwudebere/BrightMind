import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { Theme } from 'react-native-paper/lib/typescript/types';
import Colors from './Colors';

const fontConfig = {
  fontFamily: 'Inter-Regular',
  titleFontFamily: 'Inter-Bold',
};

export const theme: Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.primary,
    secondary: Colors.secondary,
    background: Colors.background,
    surface: Colors.surface,
    error: Colors.error,
    text: Colors.text,
    onSurface: Colors.text,
    backdrop: Colors.backdrop,
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 12,
};
