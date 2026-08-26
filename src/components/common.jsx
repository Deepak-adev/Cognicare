import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Premium Dark Mode / Light Mode Colors with softer hues
export const colors = {
  primary: '#3b82f6',     // Softer vibrant blue
  primaryLight: '#60a5fa', 
  primaryDark: '#2563eb',
  accent: '#f59e0b',
  accentLight: '#fbbf24',
  success: '#10b981',
  danger: '#f43f5e',      // Rose-ish red, much softer than #ef4444
  textMain: '#0f172a',
  textMuted: '#64748b',
  cardBg: '#ffffff',
  bgSubtle: '#f8fafc',
  border: 'rgba(15, 23, 42, 0.04)'
};

// Apple-style soft, diffuse shadow generator
export const softShadow = {
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.04,
  shadowRadius: 24,
  elevation: 5,
};

// Animated Card for micro-animations
export const Card = ({ children, style, delay = 0 }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      })
    ]).start();
  }, [fadeAnim, translateY, delay]);

  return (
    <Animated.View style={[styles.card, style, { opacity: fadeAnim, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

export const Button = ({ children, onPress, variant = 'primary', icon: Icon, style }) => {
  const isAccent = variant === 'accent';
  
  if (variant === 'primary') {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={style}>
        <LinearGradient
          colors={[colors.primaryLight, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientButton}
        >
          {Icon && <Icon color="#ffffff" size={28} style={styles.icon} />}
          <Text style={styles.gradientButtonText}>{children}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.button, isAccent ? styles.buttonAccent : styles.buttonSecondary, style]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {Icon && <Icon color={isAccent ? colors.textMain : colors.primary} size={28} style={styles.icon} />}
      <Text style={[styles.buttonText, isAccent ? styles.buttonTextAccent : styles.buttonTextSecondary]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
    padding: 24, // increased padding for breathing room
  },
  headerText: {
    fontSize: 34,
    fontWeight: '900',
    color: colors.textMain,
    marginBottom: 8,
    letterSpacing: -0.5, // tighter letter spacing for modern feel
  },
  subHeaderText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 16,
  },
  text: {
    fontSize: 18,
    color: colors.textMain,
    lineHeight: 26,
  },
  textMuted: {
    fontSize: 18,
    color: colors.textMuted,
    lineHeight: 26,
  }
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 28, // sweepier, softer curves
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    ...softShadow // highly diffuse shadows
  },
  // Button Styles
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  gradientButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 30,
    borderWidth: 2,
  },
  buttonAccent: {
    backgroundColor: colors.accentLight + '20',
    borderColor: colors.accent,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
  },
  buttonTextAccent: {
    color: colors.textMain,
    fontSize: 20,
    fontWeight: '800',
  },
  buttonTextSecondary: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
  },
  icon: {
    marginRight: 10,
  }
});
