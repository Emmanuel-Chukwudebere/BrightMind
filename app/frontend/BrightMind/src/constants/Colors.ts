/**
 * BrightMind color palette and theme configuration
 */

// Base Colors
const palette = {
  // Primary Colors
  primary: {
    main: '#247EBF',
    light: '#247EBF',
    dark: '#186AA4',
    contrast: '#FFFFFF',
  },

  // Secondary Colors
  secondary: {
    main: '#4D4D4D',
    light: '#757575',
    dark: '#1A1A1A',
    contrast: '#FFFFFF',
  },

  // Accent Colors
  accent: {
    blue: '#186AA4',
    green: '#34C759',
    yellow: '#F5A623',
    red: '#C00F0C',
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    background: '#FDFDFD',
    surface: '#F3F3F3',
    border: '#E5E5E5',
    placeholder: '#A0A0A0',
  },

  // Semantic Colors
  semantic: {
    success: '#34C759',
    warning: '#F5A623',
    error: '#C00F0C',
    info: '#247EBF',
  },
} as const;

// Light Theme
export const lightTheme = {
  text: {
    primary: palette.secondary.dark,
    secondary: palette.secondary.main,
    disabled: palette.secondary.light,
    hint: palette.secondary.light,
    contrast: palette.neutral.white,
  },
  background: {
    default: palette.neutral.background,
    paper: palette.neutral.white,
    surface: palette.neutral.surface,
  },
  primary: {
    main: palette.primary.main,
    light: palette.primary.light,
    dark: palette.primary.dark,
    contrast: palette.primary.contrast,
  },
  secondary: {
    main: palette.secondary.main,
    light: palette.secondary.light,
    dark: palette.secondary.dark,
    contrast: palette.secondary.contrast,
  },
  accent: palette.accent,
  border: palette.neutral.border,
  placeholder: palette.neutral.placeholder,
  status: palette.semantic,
} as const;

// Dark Theme
export const darkTheme = {
  text: {
    primary: palette.neutral.white,
    secondary: palette.neutral.surface,
    disabled: palette.secondary.light,
    hint: palette.secondary.light,
    contrast: palette.secondary.dark,
  },
  background: {
    default: palette.secondary.dark,
    paper: palette.secondary.main,
    surface: palette.secondary.light,
  },
  primary: {
    main: palette.primary.light,
    light: palette.primary.main,
    dark: palette.primary.dark,
    contrast: palette.primary.contrast,
  },
  secondary: {
    main: palette.neutral.surface,
    light: palette.neutral.border,
    dark: palette.neutral.white,
    contrast: palette.secondary.dark,
  },
  accent: {
    ...palette.accent,
    blue: palette.primary.light,
  },
  border: palette.secondary.light,
  placeholder: palette.secondary.light,
  status: {
    ...palette.semantic,
    info: palette.primary.light,
  },
} as const;

// Default theme
export const Colors = {
  light: lightTheme,
  dark: darkTheme,
} as const;
