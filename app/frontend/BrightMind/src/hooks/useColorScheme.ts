import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';

export default function useColorScheme(): ColorSchemeName {
  return _useColorScheme() || 'light'; // Defaults to 'dark'
}
