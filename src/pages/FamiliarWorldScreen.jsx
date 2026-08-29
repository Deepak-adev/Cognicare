import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useStore } from '../store/useStore';
import { Card } from '../components/common';
import { Heart, Home, MapPin, Camera, Mic, X, Sparkles, Map, Globe, PlayCircle } from 'lucide-react-native';
import { useTheme } from '../hooks/useTheme';
import TTSService from '../services/TTSService';
import { reminiscenceService } from '../services/reminiscenceService';

export const FamiliarWorldScreen = () => {
  const { patient } = useStore();
  const { t, fontScale, colors, globalStyles } = useTheme();
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const memories = [
    { id: 1, type: 'family', title: 'Priya', subtitle: 'Daughter', icon: '👩🏽', color: '#fff0f2', prompt: "This is your daughter Priya. Do you remember when she visited last week?", voiceMessage: "Hi Appa! It's Priya. Just wanted to say I love you and I'm coming to see you this Sunday." },
    { id: 2, type: 'family', title: 'Ananya', subtitle: 'Granddaughter', icon: '👧🏽', color: '#fff0f2', prompt: "Your granddaughter Ananya loves drawing. She made you a card recently." },
    { id: 3, type: 'place', title: 'Guwahati', subtitle: 'Hometown', icon: '🏠', color: '#f0fdf4', prompt: "You spent many years in Guwahati. What was your favorite place to visit there?" },
    { id: 4, type: 'culture', title: 'Bihu Festival', subtitle: 'Tradition', icon: '🌾', color: '#fffbeb', prompt: "Bihu is such a beautiful festival. Did you usually make pitha during Bihu?" },
    { id: 5, type: 'culture', title: 'Assamese Japi', subtitle: 'Cultural Item', icon: '👒', color: '#fffbeb', prompt: "The Japi is a proud symbol of Assam. Did you have one in your home?" },
    { id: 6, type: 'memory', title: 'Old House', subtitle: 'Memory', icon: '🏡', color: '#f3e8ff', prompt: "This is your first house. Who were your neighbors?" },
  ];

  const handleMemoryPress = async (memory) => {
    setSelectedMemory(memory);
    
    const profileContext = patient ? {
      name: patient.name,
      interests: patient.interests,
      family: patient.family_members
    } : "No profile available";

    const photoMetadata = `${memory.title} - ${memory.subtitle}`;

    setIsGenerating(true);
    const narration = await reminiscenceService.narrateMemory(memory.id, photoMetadata, profileContext);
    setIsGenerating(false);

    setSelectedMemory({ ...memory, dynamicPrompt: narration });
    TTSService.speak(narration, { language: 'en-US', rate: 0.9, pitch: 1 });
  };

  const closeMemory = () => {
    TTSService.stop();
    setSelectedMemory(null);
  };

  const playVoiceMessage = () => {
    TTSService.stop();
    TTSService.speak(selectedMemory.voiceMessage, { language: 'en-IN', rate: 0.9, pitch: 1 });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
        
        <View style={{ alignItems: 'center', marginVertical: 40 }}>
          <View style={{ backgroundColor: colors.primary + '15', padding: 24, borderRadius: 40, marginBottom: 20 }}>
            <Globe color={colors.primary} size={48} />
          </View>
          <Text style={[globalStyles.headerText, { color: colors.primaryDark || '#1e3a8a', textAlign: 'center', fontSize: 36 * fontScale }]}>
            {t('myWorld') || 'Personal World'}
          </Text>
          <Text style={[globalStyles.textMuted, { textAlign: 'center', fontSize: 18 * fontScale, marginTop: 12, paddingHorizontal: 20, lineHeight: 26 }]}>{t("A culturally aware memory system, curated by your family.") || "A culturally aware memory system, curated by your family."}</Text>
        </View>

        <View style={styles.grid}>
          {memories.map((memory) => (
            <TouchableOpacity
              key={memory.id}
              style={[styles.gridItem, { backgroundColor: '#ffffff' }]}
              onPress={() => handleMemoryPress(memory)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: memory.color }]}>
                <Text style={{ fontSize: 52 * fontScale }}>{memory.icon}</Text>
                {memory.voiceMessage && (
                  <View style={{ position: 'absolute', top: -5, right: -5, backgroundColor: colors.accent, borderRadius: 20, padding: 4 }}>
                    <PlayCircle color="#ffffff" size={24} />
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 22 * fontScale, fontWeight: '900', color: '#1e293b', textAlign: 'center' }}>
                {memory.title}
              </Text>
              <Text style={{ fontSize: 16 * fontScale, color: '#64748b', textAlign: 'center', marginTop: 4, fontWeight: '600' }}>
                {memory.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* AI Reminiscence Modal */}
      <Modal visible={!!selectedMemory} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeBtn} onPress={closeMemory}>
              <X color="#94a3b8" size={32} />
            </TouchableOpacity>
            
            <Text style={{ fontSize: 80, textAlign: 'center', marginVertical: 20 }}>
              {selectedMemory?.icon}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Sparkles color={colors.primary} size={24} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 24 * fontScale, fontWeight: '900', color: colors.primary, textAlign: 'center' }}>
                {selectedMemory?.voiceMessage ? "Family Voice Time Capsule" : "AI Reminiscence Mode"}
              </Text>
            </View>

            <Text style={{ fontSize: 24 * fontScale, color: colors.textMain, textAlign: 'center', fontWeight: '600', lineHeight: 34, marginBottom: 32 }}>
              {selectedMemory?.voiceMessage ? `${selectedMemory?.title} sent you a message — want to hear it?` : (isGenerating ? "Thinking of a warm memory..." : `"${selectedMemory?.dynamicPrompt || selectedMemory?.prompt}"`)}
            </Text>

            {selectedMemory?.voiceMessage ? (
              <TouchableOpacity style={[styles.micBtn, { backgroundColor: colors.accent, shadowColor: colors.accent }]} onPress={playVoiceMessage}>
                <PlayCircle color="#ffffff" size={32} />
                <Text style={{ color: '#ffffff', fontSize: 20 * fontScale, fontWeight: '800', marginLeft: 12 }}>{t("Listen to Message") || "Listen to Message"}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.micBtn}>
                <Mic color="#ffffff" size={32} />
                <Text style={{ color: '#ffffff', fontSize: 20 * fontScale, fontWeight: '800', marginLeft: 12 }}>{t("Hold to Reply") || "Hold to Reply"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  gridItem: {
    width: '48%',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    shadowColor: '#334155',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
  },
  micBtn: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 32,
    width: '100%',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  }
});
