import { useStore } from '../store/useStore';
import { StyleSheet } from 'react-native';
import TTSService from '../services/TTSService';
import { translate } from '../utils/i18n';

// Base Colors
export const baseColors = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  success: '#10b981',
  danger: '#f43f5e',
  textMain: '#0f172a',
  textMuted: '#64748b',
  cardBg: '#ffffff',
  bgSubtle: '#f8fafc',
  border: 'rgba(15, 23, 42, 0.04)'
};

// High Contrast Colors
export const highContrastColors = {
  primary: '#0000FF',
  primaryLight: '#0000FF',
  primaryDark: '#000080',
  accent: '#FFD700',
  accentLight: '#FFFF00',
  success: '#008000',
  danger: '#FF0000',
  textMain: '#000000',
  textMuted: '#333333',
  cardBg: '#ffffff',
  bgSubtle: '#eeeeee',
  border: '#000000'
};

// Color Blind Colors (Example: Deuteranopia safe)
export const colorBlindColors = {
  ...baseColors,
  success: '#0072B2', // Blue instead of green
  danger: '#D55E00', // Vermillion instead of red
};

export const useTheme = () => {
  const { patientSettings } = useStore();

  let themeColors = baseColors;
  if (patientSettings?.highContrast) {
    themeColors = highContrastColors;
  } else if (patientSettings?.colorBlindMode) {
    themeColors = colorBlindColors;
  }

  let fontScale = 1;
  if (patientSettings?.fontSize === 'Large') fontScale = 1.2;
  if (patientSettings?.fontSize === 'Extra Large') fontScale = 1.4;

  const themeStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.bgSubtle,
      padding: 24,
    },
    headerText: {
      fontSize: 34 * fontScale,
      fontWeight: '900',
      color: themeColors.textMain,
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subHeaderText: {
      fontSize: 22 * fontScale,
      fontWeight: '700',
      color: themeColors.textMain,
      marginBottom: 16,
    },
    text: {
      fontSize: 18 * fontScale,
      color: themeColors.textMain,
      lineHeight: 26 * fontScale,
    },
    textMuted: {
      fontSize: 18 * fontScale,
      color: themeColors.textMuted,
      lineHeight: 26 * fontScale,
    }
  });

  const speak = (text) => {
    if (patientSettings?.voiceFeedback) {
      TTSService.speak(text);
    }
  };

  const t = (key) => translate(key, patientSettings?.language);

  return {
    colors: themeColors,
    globalStyles: themeStyles,
    settings: patientSettings,
    fontScale,
    speak,
    t
  };
};
