import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Button, globalStyles, colors } from '../components/common';
import { useStore } from '../store/useStore';
import { Mic } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const OnboardingScreen = () => {
  const { t } = useTheme();
  const { importMockVoiceProfile } = useStore();
  const [loading, setLoading] = useState(false);

  const handleVoiceSetup = async () => {
    setLoading(true);
    // Simulate your friend's voice AI module taking 2 seconds
    setTimeout(async () => {
      await importMockVoiceProfile('patient_001');
      setLoading(false);
      // The conditional routing in App.js will automatically detect the patient and transition!
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={{ fontSize: 60 }}>{t("🧠") || "🧠"}</Text>
        </View>
        <Text style={styles.title}>{t("Cognitive Care") || "Cognitive Care"}</Text>
        <Text style={styles.subtitle}>{t("Your AI companion for daily mental wellness and personalized care.") || "Your AI companion for daily mental wellness and personalized care."}</Text>
      </View>

      <View style={styles.footer}>
        <Button 
          icon={Mic} 
          onPress={handleVoiceSetup} 
          style={styles.startButton}
          variant="primary"
        >
          {loading ? 'Listening to voice...' : 'Setup via Voice AI'}
        </Button>
        <Text style={styles.footerText}>{t("(This simulates your friend's voice module)") || "(This simulates your friend's voice module)"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.textMain,
    marginBottom: 16,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 16,
  },
  footer: {
    marginBottom: 40,
  },
  startButton: {
    paddingVertical: 20,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  footerText: {
    textAlign: 'center',
    marginTop: 16,
    color: colors.textMuted,
    fontSize: 14,
  }
});
