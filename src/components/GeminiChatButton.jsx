import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Mic, MicOff } from 'lucide-react-native';
import { sendMessageToGemini } from '../services/geminiService';
import { GroqService } from '../services/GroqService';
import { navigateTo } from '../utils/navigationRef';
import { useStore } from '../store/useStore';
import { db } from '../db/db';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Quick AGUI Prompt Chips ──────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: '👥 Patients', prompt: 'List all patient details' },
  { label: '🎮 Play Games', prompt: 'Take me to cognitive games' },
  { label: '💊 My Medicines', prompt: 'Show my medication reminders' },
  { label: '🖼️ My Memories', prompt: 'Open My World to see family photos' },
  { label: '👁️ High Contrast', prompt: 'Turn on high contrast mode' },
  { label: '🔍 Large Text', prompt: 'Make font size Large' },
  { label: '📊 My Progress', prompt: 'Show my cognitive progress' },
  { label: '✅ Took Medicine', prompt: 'I took my morning medicine' },
  { label: '🔊 Voice On', prompt: 'Turn on voice feedback' },
];

// Helper to safely convert anything into a string for React Text
const safeString = (val) => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (typeof val.message === 'string') return val.message;
    if (typeof val.text === 'string') return val.text;
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
};

// ── Single chat message bubble ─────────────────────────────────────────────────
const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const textContent = safeString(message.text);
  const badgeContent = safeString(message.actionDescription);

  return (
    <Animated.View
      style={[
        styles.bubbleRow,
        isUser ? styles.bubbleRowUser : styles.bubbleRowAI,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarIcon}>✦</Text>
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
          {textContent}
        </Text>

        {/* AGUI Action Badge */}
        {!isUser && badgeContent ? (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeIcon}>⚡</Text>
            <Text style={styles.actionBadgeText}>{badgeContent}</Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};

// ── Typing indicator ───────────────────────────────────────────────────────────
const TypingDots = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(500),
        ])
      ).start();

    animate(dot1, 0);
    animate(dot2, 140);
    animate(dot3, 280);
  }, []);

  return (
    <View style={styles.bubbleRow}>
      <View style={styles.aiAvatar}>
        <Text style={styles.aiAvatarIcon}>✦</Text>
      </View>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
          />
        ))}
      </View>
    </View>
  );
};

// ── Main Agentic UI (AGUI) Floating Chat Assistant ─────────────────────────────
export const GeminiChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      text: "Hello! I am your Agentic AI assistant ✦\nAsk me anything or tell me to change the app (e.g. 'list all patients', 'open games', 'turn on high contrast', 'show my medicines', 'large text').",
      actionDescription: 'Agentic UI Ready',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [wasVoiceQuery, setWasVoiceQuery] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabGlow = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  // Store actions and state
  const {
    updatePatientSettings,
    markMedicationTaken,
    addMedication,
    addTimelineTask,
    medications,
    patientSettings,
    patient,
  } = useStore();

  // Pulsing glow animation on FAB
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabGlow, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(fabGlow, { toValue: 0, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const openChat = () => {
    setIsOpen(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
    Animated.spring(fabScale, { toValue: 0.85, useNativeDriver: true }).start();
  };

  const closeChat = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 280,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
      Animated.spring(fabScale, { toValue: 1, useNativeDriver: true }).start();
    });
  };

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startRecording = async () => {
    if (recording) return;
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(newRec);
      setIsRecording(true);
    } catch (err) {
      console.error('[AGUI] Failed to start recording', err);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recording.getURI();
      setRecording(null);

      setIsLoading(true);
      setInputText('Listening...');
      const transcribed = await GroqService.transcribeAudio(uri, 'en-US');
      if (transcribed) {
        setWasVoiceQuery(true);
        setInputText('');
        handleSend(transcribed, true);
      } else {
        setInputText('');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('[AGUI] Failed to stop recording', err);
      setIsLoading(false);
      setInputText('');
    }
  };

  /**
   * Execute Agentic UI Action on the live application
   */
  const executeAgenticAction = useCallback((action) => {
    if (!action || action.type === 'none') return;

    try {
      switch (action.type) {
        case 'navigate': {
          if (action.screen) {
            console.log('[AGUI] 🧭 Navigating to screen:', action.screen);
            navigateTo(action.screen);
          }
          break;
        }

        case 'setting': {
          if (action.key !== undefined) {
            console.log('[AGUI] ⚙️ Applying setting:', action.key, '=', action.value);
            updatePatientSettings({ [action.key]: action.value });
          }
          break;
        }

        case 'markMedTaken': {
          const untaken = medications.find((m) => !m.taken);
          if (action.id) {
            markMedicationTaken(action.id);
          } else if (untaken) {
            markMedicationTaken(untaken.id);
          }
          console.log('[AGUI] 💊 Medication marked as taken');
          break;
        }

        case 'addMedication': {
          if (action.name) {
            addMedication({
              name: action.name,
              time: action.time || '8:00 AM',
            });
            console.log('[AGUI] 💊 Added medication:', action.name);
          }
          break;
        }

        case 'addTimelineTask': {
          if (action.title) {
            addTimelineTask({
              title: action.title,
              time: action.time || '10:00 AM',
              icon: 'Activity',
            });
            console.log('[AGUI] 📅 Added timeline task:', action.title);
          }
          break;
        }

        default:
          console.log('[AGUI] Unhandled action type:', action.type);
      }
    } catch (err) {
      console.warn('[AGUI] Action execution error:', err);
    }
  }, [medications, updatePatientSettings, markMedicationTaken, addMedication, addTimelineTask]);

  const handleSend = useCallback(async (textToSend, forceVoice = false) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const isVoice = forceVoice || wasVoiceQuery;
    setWasVoiceQuery(false); // reset immediately after tracking this request

    const userMsg = { id: Date.now().toString(), role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const history = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-8)
      .map((m) => ({
        role: m.role,
        text: safeString(m.text),
      }));

    try {
      // Gather live DB & state context for Gemini
      const allPatients = await db.patients.toArray().catch(() => []);
      const appContext = {
        allPatients: allPatients.map((p) => ({
          name: p.name,
          age: p.age,
          location: p.location,
          interests: p.interests,
          family: p.family || p.family_members,
        })),
        activePatient: patient
          ? {
              name: patient.name,
              age: patient.age,
              location: patient.location,
              safety: patient.safety,
            }
          : null,
        medications: medications.map((m) => ({ name: m.name, time: m.time, taken: m.taken })),
        patientSettings,
      };

      const response = await sendMessageToGemini(history, query, appContext);

      const aiText = safeString(response.message || 'Action executed.');
      let actionDesc = safeString(response.actionDescription);
      if (!actionDesc && response.action?.type && response.action.type !== 'none') {
        actionDesc = `Applied ${response.action.type}`;
      }

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiText,
        action: response.action,
        actionDescription: actionDesc,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Execute live AGUI changes immediately
      if (response.action && response.action.type !== 'none') {
        executeAgenticAction(response.action);
      }

      // Voice output if enabled in settings or it was a voice query
      if (patientSettings?.voiceFeedback || isVoice) {
        Speech.speak(aiText);
      }
    } catch (err) {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: `⚠️ Agentic UI couldn't reach the AI:\n${safeString(err.message)}`,
        actionDescription: 'Error',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages, executeAgenticAction, patientSettings, patient, medications]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, isLoading]);

  const fabGlowOpacity = fabGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0.8],
  });

  return (
    <>
      {/* ── Floating AGUI Action Button ── */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <Animated.View style={[styles.fabGlow, { opacity: fabGlowOpacity }]} />
        <Animated.View style={{ transform: [{ scale: fabScale }] }}>
          <TouchableOpacity
            style={styles.fab}
            onPress={isOpen ? closeChat : openChat}
            activeOpacity={0.85}
          >
            <Text style={styles.fabIcon}>{isOpen ? '✕' : '✦'}</Text>
          </TouchableOpacity>
        </Animated.View>
        {!isOpen && (
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>AGUI</Text>
          </View>
        )}
      </View>

      {/* ── Agentic UI Modal Panel ── */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={closeChat}
        statusBarTranslucent
      >
        <View style={styles.overlay} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeChat}
          />

          <Animated.View
            style={[styles.panel, { transform: [{ translateY: slideAnim }] }]}
          >
            {/* Header */}
            <View style={styles.panelHeader}>
              <View style={styles.panelHeaderLeft}>
                <View style={styles.headerIconWrap}>
                  <Text style={styles.headerIconText}>✦</Text>
                </View>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.panelTitle}>Agentic UI Assistant</Text>
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>LIVE AGENT</Text>
                    </View>
                  </View>
                  <Text style={styles.panelSubtitle}>Voice & UI Controller (Gemini AI)</Text>
                </View>
              </View>
              <TouchableOpacity onPress={closeChat} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Quick AGUI Action Chips */}
            <View style={styles.chipsContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                {QUICK_PROMPTS.map((chip, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chip}
                    onPress={() => handleSend(chip.prompt)}
                    disabled={isLoading}
                  >
                    <Text style={styles.chipText}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.divider} />

            {/* Messages */}
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <MessageBubble message={item} />}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={isLoading ? <TypingDots /> : null}
              />

              {/* Input Bar */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder={isRecording ? "Listening..." : "Tell me what to do or ask..."}
                  placeholderTextColor="#94a3b8"
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={() => handleSend(inputText)}
                  returnKeyType="send"
                  multiline
                  maxLength={500}
                  editable={!isLoading && !isRecording}
                />
                
                <Animated.View style={{ transform: [{ scale: pulseAnim }], marginRight: 8 }}>
                  <TouchableOpacity
                    style={[styles.micBtn, isRecording && styles.micBtnActive, isLoading && styles.sendBtnDisabled]}
                    onPress={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    {isRecording ? <MicOff color="#fff" size={20} /> : <Mic color="#fff" size={20} />}
                  </TouchableOpacity>
                </Animated.View>
                <TouchableOpacity
                  style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
                  onPress={() => handleSend(inputText)}
                  disabled={!inputText.trim() || isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.sendIcon}>➤</Text>
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.78;
const FAB_SIZE = 58;

const styles = StyleSheet.create({
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 95,
    right: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    elevation: 25,
  },
  fabGlow: {
    position: 'absolute',
    width: FAB_SIZE + 18,
    height: FAB_SIZE + 18,
    borderRadius: (FAB_SIZE + 18) / 2,
    backgroundColor: '#6366f1',
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 16,
  },
  fabIcon: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '800',
  },
  fabBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: '#0f172a',
  },
  fabBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Modal overlay
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  // Slide-up panel
  panel: {
    height: PANEL_HEIGHT,
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 30,
  },

  // Header
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 10,
  },
  panelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  headerIconText: {
    fontSize: 18,
    color: '#fff',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: -0.3,
  },
  activePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  activePillText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
  },
  panelSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '700',
  },

  // Quick Chips
  chipsContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  chipsScroll: {
    gap: 8,
    paddingHorizontal: 6,
  },
  chip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginHorizontal: 18,
    marginTop: 4,
  },

  // Messages
  messageList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    maxWidth: SCREEN_WIDTH * 0.88,
  },
  bubbleRowUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  bubbleRowAI: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
    flexShrink: 0,
  },
  aiAvatarIcon: {
    fontSize: 13,
    color: '#fff',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: SCREEN_WIDTH * 0.74,
  },
  bubbleUser: {
    backgroundColor: '#4f46e5',
    borderBottomRightRadius: 6,
  },
  bubbleAI: {
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#f1f5f9',
    fontWeight: '500',
  },
  bubbleTextAI: {
    color: '#e2e8f0',
    fontWeight: '400',
  },

  // Action badge pill
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.22)',
    borderColor: '#6366f1',
    borderWidth: 1,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  actionBadgeIcon: {
    fontSize: 11,
    color: '#fbbf24',
  },
  actionBadgeText: {
    fontSize: 11,
    color: '#818cf8',
    fontWeight: '700',
  },

  // Typing dots
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 5,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#6366f1',
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    color: '#f1f5f9',
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  micBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  sendBtnDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
