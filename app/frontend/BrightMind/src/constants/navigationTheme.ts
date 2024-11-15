import { DefaultTheme } from '@react-navigation/native';
import Colors from './Colors';

export const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.surface,
    text: Colors.text,
    border: Colors.border,
    notification: Colors.notification,
  },
};
