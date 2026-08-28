import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useStore } from '../store/useStore';
import { Card, globalStyles, colors } from '../components/common';
import { Activity, Brain, ShieldAlert, MapPin, Calendar, Settings, Type, Eye, EyeOff, Minimize, Hand, Volume2, Globe, Home, Flame, Gamepad2, CalendarDays, TrendingUp, TrendingDown, Minus, Clock, Pill, Plus, Fingerprint, User, Edit3 } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const CaregiverHomeTab = () => {
  const { patient, isOffline } = useStore();
  
  if (!patient) return <View style={globalStyles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 10 }}>
        <View>
          <Text style={{ fontSize: 18, color: colors.textMuted, fontWeight: '600', marginBottom: 4 }}>Caregiver View</Text>
          <Text style={globalStyles.headerText}>{patient.name}</Text>
        </View>
        {isOffline && (
          <View style={{ backgroundColor: colors.danger + '20', padding: 8, borderRadius: 12 }}>
            <Text style={{ color: colors.danger, fontWeight: 'bold' }}>Offline</Text>
          </View>
        )}
      </View>

      {/* Safety & Location Tracking */}
      {patient.safety && (
        <Card style={{ backgroundColor: patient.safety.status === 'Safe' ? '#ecfdf5' : '#fef2f2', borderColor: patient.safety.status === 'Safe' ? colors.success : colors.danger }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ backgroundColor: patient.safety.status === 'Safe' ? '#d1fae5' : '#fee2e2', padding: 12, borderRadius: 16, marginRight: 16 }}>
                {patient.safety.status === 'Safe' ? <MapPin color={colors.success} size={28} /> : <ShieldAlert color={colors.danger} size={28} />}
              </View>
              <View>
                <Text style={{ fontSize: 16, color: patient.safety.status === 'Safe' ? colors.success : colors.danger, fontWeight: '800', textTransform: 'uppercase' }}>
                  Safety Status: {patient.safety.status}
                </Text>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textMain, marginTop: 4 }}>{patient.safety.location}</Text>
              </View>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 14 }}>{patient.safety.lastUpdated}</Text>
          </View>
        </Card>
      )}

      {/* Upcoming Appointments */}
      {patient.appointments && patient.appointments.length > 0 && (
        <Card>
          <View style={styles.cardHeader}>
            <Calendar color={colors.primary} size={32} />
            <Text style={styles.cardTitle}>Upcoming Appointments</Text>
          </View>
          {patient.appointments.map(app => (
            <View key={app.id} style={styles.row}>
              <View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textMain }}>{app.type}</Text>
                <Text style={{ fontSize: 16, color: colors.textMuted, marginTop: 4 }}>{app.date} • {app.doctor}</Text>
              </View>
              <View style={{ backgroundColor: colors.primaryLight + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' }}>
                <Text style={{ color: colors.primary, fontWeight: '700' }}>Manage</Text>
              </View>
            </View>
          ))}
        </Card>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const CaregiverHealthTab = () => {
  const { cognitiveProfile, activityStats, recentSessions, cognitiveFingerprint } = useStore();
  if (!cognitiveProfile) return <View style={globalStyles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      
      {/* Overall Brain Health Score */}
      <Card style={{ backgroundColor: colors.primary, borderColor: colors.primaryDark }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', opacity: 0.9 }}>Overall Cognitive Age</Text>
            <Text style={{ color: '#ffffff', fontSize: 42, fontWeight: '900', marginTop: 4 }}>{activityStats?.cognitiveAge || 70} <Text style={{ fontSize: 20, fontWeight: '600', opacity: 0.8 }}>yrs</Text></Text>
          </View>
          <View style={{ backgroundColor: '#ffffff20', padding: 16, borderRadius: 24 }}>
            <Brain color="#ffffff" size={40} />
          </View>
        </View>
      </Card>

      {/* Game Activity Stats */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Card style={[styles.statBox, { flex: 1, marginRight: 8, padding: 16 }]}>
          <Gamepad2 color={colors.primary} size={24} style={{ marginBottom: 8 }} />
          <Text style={styles.statBoxLabel}>Games Played</Text>
          <Text style={styles.statBoxValue}>{activityStats?.totalGamesPlayed || 0}</Text>
        </Card>
        <Card style={[styles.statBox, { flex: 1, marginHorizontal: 4, padding: 16 }]}>
          <Flame color={colors.accent} size={24} style={{ marginBottom: 8 }} />
          <Text style={styles.statBoxLabel}>Current Streak</Text>
          <Text style={styles.statBoxValue}>{activityStats?.currentStreak || 0} <Text style={{ fontSize: 14 }}>days</Text></Text>
        </Card>
        <Card style={[styles.statBox, { flex: 1, marginLeft: 8, padding: 16 }]}>
          <CalendarDays color={colors.success} size={24} style={{ marginBottom: 8 }} />
          <Text style={styles.statBoxLabel}>Active Days</Text>
          <Text style={styles.statBoxValue}>{activityStats?.activeDaysThisWeek || 0}/7</Text>
        </Card>
      </View>

      {/* Weekly Memory Performance Trend */}
      <Card>
        <View style={styles.cardHeader}>
          <TrendingDown color={colors.danger} size={28} />
          <Text style={styles.cardTitle}>Cognitive Progress</Text>
        </View>
        
        <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textMain, marginBottom: 16 }}>
          Memory Performance (This Week)
        </Text>
        
        {/* Simple Bar Chart UI representing the trend */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, marginBottom: 10 }}>
          {[
            { day: 'M', value: 100 },
            { day: 'T', value: 80 },
            { day: 'W', value: 80 },
            { day: 'T', value: 60 },
            { day: 'F', value: 60 },
          ].map((point, i) => (
            <View key={i} style={{ alignItems: 'center', width: 40 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: 4 }}>{point.value}%</Text>
              <View style={{ 
                width: 12, 
                height: `${point.value}%`, 
                backgroundColor: point.value > 70 ? colors.success : colors.danger,
                borderRadius: 6,
                marginBottom: 8
              }} />
              <Text style={{ color: colors.textMain, fontWeight: '700' }}>{point.day}</Text>
            </View>
          ))}
        </View>

        {/* The Exact Alert Required by User */}
        <View style={{ marginTop: 16, backgroundColor: colors.bgSubtle, padding: 16, borderRadius: 16 }}>
          <Text style={{ fontSize: 16, color: colors.textMain, fontWeight: '600', marginBottom: 12, lineHeight: 24 }}>
            ✅ A significant change in cognitive-task performance was observed.
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.accent + '20', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
            <ShieldAlert color={colors.accentDark || '#b45309'} size={20} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.accentDark || '#b45309', fontWeight: '800', fontSize: 16 }}>⚠ Review Recommended</Text>
          </View>
        </View>
      </Card>

      {/* AI Cognitive Fingerprint */}
      <Card>
        <View style={styles.cardHeader}>
          <Fingerprint color={colors.primary} size={28} />
          <Text style={styles.cardTitle}>Cognitive Fingerprint</Text>
        </View>
        <Text style={{ color: colors.textMuted, marginBottom: 16 }}>AI analysis of how the patient performs beyond flat scores.</Text>
        
        {cognitiveFingerprint && Object.entries(cognitiveFingerprint).map(([domain, traits]) => (
          <View key={domain} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textMain, marginBottom: 8 }}>{domain}</Text>
            <View style={{ marginLeft: 8, borderLeftWidth: 2, borderLeftColor: colors.bgSubtle, paddingLeft: 16 }}>
              {traits.map((t, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {/* Visual tree branch */}
                    <View style={{ position: 'absolute', left: -16, top: 10, width: 12, height: 2, backgroundColor: colors.bgSubtle }} />
                    <Text style={{ fontSize: 16, color: colors.textMuted, fontWeight: '600' }}>{t.trait}</Text>
                  </View>
                  <View style={{ 
                    backgroundColor: t.status === 'Strong' ? colors.success + '20' : t.status === 'Weak' ? colors.danger + '20' : colors.accent + '20', 
                    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 
                  }}>
                    <Text style={{ 
                      color: t.status === 'Strong' ? colors.success : t.status === 'Weak' ? colors.danger : colors.accentDark || '#b45309', 
                      fontWeight: '800', fontSize: 14 
                    }}>{t.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </Card>

      {/* Cognitive Domains Breakdown */}
      <Card>
        <View style={styles.cardHeader}>
          <Activity color={colors.primary} size={28} />
          <Text style={styles.cardTitle}>Cognitive Domains</Text>
        </View>
        
        {Object.entries(cognitiveProfile.skills).map(([skill, data], idx) => {
          const diff = data.current - data.baseline;
          let trendColor = colors.textMuted;
          let trendIcon = <Minus color={trendColor} size={16} />;
          if (diff > 2) { trendColor = colors.success; trendIcon = <TrendingUp color={trendColor} size={16} />; }
          else if (diff < -2) { trendColor = colors.danger; trendIcon = <TrendingDown color={trendColor} size={16} />; }

          return (
            <View key={skill} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={styles.skillName}>{skill.replace('_', ' ')}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontWeight: '700', fontSize: 16, color: colors.textMain }}>{data.current}/100</Text>
                  {trendIcon}
                </View>
              </View>
              {/* Progress Bar */}
              <View style={{ height: 12, backgroundColor: colors.bgSubtle, borderRadius: 6, overflow: 'hidden' }}>
                <View style={{ width: `${data.current}%`, height: '100%', backgroundColor: trendColor === colors.danger ? colors.accent : colors.primary, borderRadius: 6 }} />
              </View>
            </View>
          );
        })}
      </Card>

      {/* Recent Game Sessions */}
      <Card>
        <View style={styles.cardHeader}>
          <Gamepad2 color={colors.accent} size={28} />
          <Text style={styles.cardTitle}>Recent Activity</Text>
        </View>
        
        {(recentSessions || []).map((session, index) => (
          <View key={session.id} style={[styles.sessionRow, index !== (recentSessions?.length - 1) && { borderBottomWidth: 1 }]}>
            <View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textMain }}>{session.game}</Text>
              <Text style={{ fontSize: 14, color: colors.textMuted, marginTop: 4 }}>{session.domain} • {session.date}</Text>
            </View>
            <View style={{ backgroundColor: session.trend === 'up' ? colors.success + '20' : session.trend === 'down' ? colors.danger + '20' : colors.bgSubtle, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ 
                color: session.trend === 'up' ? colors.success : session.trend === 'down' ? colors.danger : colors.textMuted, 
                fontWeight: '700' 
              }}>{session.performance}</Text>
            </View>
          </View>
        ))}
      </Card>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const CaregiverInsightsTab = () => {
  const { insights, patient, updatePatientProfile } = useStore();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editData, setEditData] = useState({ name: '', age: '', location: '', interests: '', family: '' });

  const handleOpenEdit = () => {
    setEditData({
      name: patient?.name || '',
      age: patient?.age ? patient.age.toString() : '',
      location: patient?.location && patient.location !== 'Not provided' ? patient.location : '',
      interests: Array.isArray(patient?.interests) ? patient.interests.join(', ') : (patient?.interests !== 'Not provided' ? patient?.interests || '' : ''),
      family: Array.isArray(patient?.family_members) ? patient.family_members.join(', ') : (patient?.family !== 'Not provided' ? patient?.family || '' : ''),
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = () => {
    if (patient) {
      updatePatientProfile(patient.patient_id, {
        name: editData.name || 'Unknown',
        age: parseInt(editData.age) || 70,
        location: editData.location || 'Not provided',
        interests: editData.interests || 'Not provided',
        family: editData.family || 'Not provided',
      });
    }
    setIsEditingProfile(false);
  };

  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      
      {/* Extracted Personal Memory Profile */}
      <Card style={{ backgroundColor: '#f0f9ff', borderColor: '#e0f2fe', borderWidth: 1 }}>
        <View style={[styles.cardHeader, { justifyContent: 'space-between', marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <User color={colors.primary} size={32} />
            <Text style={styles.cardTitle}>Personal Memory Profile</Text>
          </View>
          <TouchableOpacity onPress={handleOpenEdit} style={{ backgroundColor: '#e0f2fe', padding: 8, borderRadius: 12 }}>
            <Edit3 color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>
        <Text style={{ color: colors.textMuted, marginBottom: 16 }}>Automatically extracted during patient voice onboarding. Verify and fill missing details.</Text>
        
        <View style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <Text style={{ fontWeight: '800', width: 90, color: colors.textMain }}>Name:</Text>
            <Text style={{ color: colors.textMuted, flex: 1 }}>{patient?.name || 'Unknown'}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <Text style={{ fontWeight: '800', width: 90, color: colors.textMain }}>Age:</Text>
            <Text style={{ color: colors.textMuted, flex: 1 }}>{patient?.age || 'Not provided'}</Text>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <Text style={{ fontWeight: '800', width: 90, color: colors.textMain }}>Interests:</Text>
            <Text style={{ color: patient?.interests === 'Not provided' ? '#ef4444' : colors.textMuted, flex: 1 }}>
              {Array.isArray(patient?.interests) ? patient.interests.join(', ') : (patient?.interests || 'Not provided')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            <Text style={{ fontWeight: '800', width: 90, color: colors.textMain }}>Family:</Text>
            <Text style={{ color: patient?.family === 'Not provided' || (Array.isArray(patient?.family_members) && patient.family_members.length === 0) ? '#ef4444' : colors.textMuted, flex: 1 }}>
              {Array.isArray(patient?.family_members) && patient.family_members.length > 0 ? patient.family_members.join(', ') : (patient?.family || 'Not provided')}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontWeight: '800', width: 90, color: colors.textMain }}>Location:</Text>
            <Text style={{ color: patient?.location === 'Not provided' ? '#ef4444' : colors.textMuted, flex: 1 }}>{patient?.location || 'Not provided'}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <Activity color={colors.accent} size={32} />
          <Text style={styles.cardTitle}>AI Insights</Text>
        </View>
        
        {insights.length === 0 ? (
          <Text style={{ color: colors.textMuted, fontSize: 16 }}>No significant changes detected recently.</Text>
        ) : (
          insights.map((insight, index) => (
            <View key={index} style={styles.insightBox}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontWeight: '800', textTransform: 'capitalize', fontSize: 18, color: colors.textMain }}>
                  {insight.category}
                </Text>
                <View style={{ backgroundColor: insight.trend === 'up' ? colors.success+'20' : insight.trend === 'down' ? colors.danger+'20' : colors.bgSubtle, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{
                    color: insight.trend === 'up' ? colors.success : insight.trend === 'down' ? colors.danger : colors.textMuted,
                    fontWeight: 'bold', fontSize: 14
                  }}>
                    {insight.trend === 'up' ? 'Improved' : insight.trend === 'down' ? 'Declined' : 'Stable'}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 17, fontWeight: '600', marginBottom: 6, color: colors.textMain, lineHeight: 24 }}>{insight.text}</Text>
              <Text style={{ fontSize: 15, color: colors.textMuted, lineHeight: 22 }}>{insight.reason}</Text>
            </View>
          ))
        )}
      </Card>
      {/* Edit Profile Modal */}
      <Modal visible={isEditingProfile} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: '90%' }]}>
            <Text style={styles.modalTitle}>Edit Memory Profile</Text>
            <Text style={{ color: colors.textMuted, marginBottom: 16 }}>Fill in details the AI missed.</Text>
            
            <Text style={styles.inputLabel}>Patient Name</Text>
            <TextInput 
              style={styles.modalInput} 
              value={editData.name} 
              onChangeText={(text) => setEditData({...editData, name: text})} 
            />
            
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput 
              style={styles.modalInput} 
              keyboardType="numeric"
              value={editData.age} 
              onChangeText={(text) => setEditData({...editData, age: text})} 
            />
            
            <Text style={styles.inputLabel}>Location (City, State)</Text>
            <TextInput 
              style={styles.modalInput} 
              placeholder="e.g. Chennai, Tamil Nadu"
              value={editData.location} 
              onChangeText={(text) => setEditData({...editData, location: text})} 
            />
            
            <Text style={styles.inputLabel}>Interests (comma separated)</Text>
            <TextInput 
              style={styles.modalInput} 
              placeholder="e.g. Gardening, Reading"
              value={editData.interests} 
              onChangeText={(text) => setEditData({...editData, interests: text})} 
            />
            
            <Text style={styles.inputLabel}>Family (comma separated)</Text>
            <TextInput 
              style={styles.modalInput} 
              placeholder="e.g. Priya (Daughter)"
              value={editData.family} 
              onChangeText={(text) => setEditData({...editData, family: text})} 
            />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, width: '100%' }}>
              <TouchableOpacity onPress={() => setIsEditingProfile(false)} style={[styles.modalBtn, { backgroundColor: '#f1f5f9', flex: 1, marginRight: 8 }]}>
                <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} style={[styles.modalBtn, { backgroundColor: colors.primary, flex: 1, marginLeft: 8 }]}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>Save Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const CaregiverSettingsTab = () => {
  const { patientSettings, updatePatientSettings } = useStore();
  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      <Card>
        <View style={styles.cardHeader}>
          <Settings color={colors.primary} size={32} />
          <Text style={styles.cardTitle}>App Personalization</Text>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 16, marginBottom: 20 }}>Remotely configure the patient's device experience.</Text>
        
        {/* Language */}
        <View style={styles.settingBlock}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
             <Globe color={colors.textMain} size={24} style={{ marginRight: 8 }} />
             <Text style={[styles.settingTitle, { marginBottom: 0 }]}>Language</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['English', 'Hindi', 'Assamese', 'Bengali', 'Bodo', 'Manipuri', 'Khasi', 'Garo', 'Mizo', 'Nepali'].map(lang => (
              <TouchableOpacity
                key={lang}
                onPress={() => updatePatientSettings({ language: lang })}
                style={[styles.optionBtn, patientSettings.language === lang && styles.optionBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, patientSettings.language === lang && styles.optionTextActive]}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Font Size */}
        <View style={styles.settingBlock}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
             <Type color={colors.textMain} size={24} style={{ marginRight: 8 }} />
             <Text style={[styles.settingTitle, { marginBottom: 0 }]}>Font Size</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {['Normal', 'Large', 'Extra Large'].map(size => (
              <TouchableOpacity
                key={size}
                onPress={() => updatePatientSettings({ fontSize: size })}
                style={[styles.optionBtn, patientSettings.fontSize === size && styles.optionBtnActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, patientSettings.fontSize === size && styles.optionTextActive]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Toggles Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <TouchableOpacity 
            style={[styles.gridSettingCard, patientSettings.highContrast && styles.gridSettingCardActive]}
            onPress={() => updatePatientSettings({ highContrast: !patientSettings.highContrast })}
          >
            <Eye color={patientSettings.highContrast ? '#ffffff' : colors.textMain} size={28} style={{ marginBottom: 12 }} />
            <Text style={[styles.gridSettingTitle, patientSettings.highContrast && { color: '#ffffff' }]}>High Contrast</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridSettingCard, patientSettings.colorBlindMode && styles.gridSettingCardActive]}
            onPress={() => updatePatientSettings({ colorBlindMode: !patientSettings.colorBlindMode })}
          >
            <EyeOff color={patientSettings.colorBlindMode ? '#ffffff' : colors.textMain} size={28} style={{ marginBottom: 12 }} />
            <Text style={[styles.gridSettingTitle, patientSettings.colorBlindMode && { color: '#ffffff' }]}>Color Blind Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridSettingCard, patientSettings.voiceFeedback && styles.gridSettingCardActive]}
            onPress={() => updatePatientSettings({ voiceFeedback: !patientSettings.voiceFeedback })}
          >
            <Volume2 color={patientSettings.voiceFeedback ? '#ffffff' : colors.textMain} size={28} style={{ marginBottom: 12 }} />
            <Text style={[styles.gridSettingTitle, patientSettings.voiceFeedback && { color: '#ffffff' }]}>Voice Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridSettingCard, patientSettings.simplifiedUI && styles.gridSettingCardActive]}
            onPress={() => updatePatientSettings({ simplifiedUI: !patientSettings.simplifiedUI })}
          >
            <Minimize color={patientSettings.simplifiedUI ? '#ffffff' : colors.textMain} size={28} style={{ marginBottom: 12 }} />
            <Text style={[styles.gridSettingTitle, patientSettings.simplifiedUI && { color: '#ffffff' }]}>Simplified UI</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.gridSettingCard, patientSettings.ignoreAccidentalTaps && styles.gridSettingCardActive, { width: '100%' }]} 
            onPress={() => updatePatientSettings({ ignoreAccidentalTaps: !patientSettings.ignoreAccidentalTaps })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Hand color={patientSettings.ignoreAccidentalTaps ? '#ffffff' : colors.textMain} size={28} style={{ marginRight: 16 }} />
              <View>
                <Text style={[styles.gridSettingTitle, patientSettings.ignoreAccidentalTaps && { color: '#ffffff' }]}>Ignore Accidental Taps</Text>
                <Text style={{ color: patientSettings.ignoreAccidentalTaps ? '#e2e8f0' : colors.textMuted, fontSize: 13, marginTop: 4 }}>Helps with hand tremors</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Card>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const CaregiverScheduleTab = () => {
  const { medications, timelineTasks, addMedication, addTimelineTask, routineAlerts, evaluateRoutine } = useStore();

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('');

  const [isAddingMed, setIsAddingMed] = useState(false);
  const [medName, setMedName] = useState('');
  const [medTime, setMedTime] = useState('');

  useEffect(() => {
    evaluateRoutine();
  }, [medications, timelineTasks, evaluateRoutine]);

  const handleSaveMedication = () => {
    if (!medName || !medTime) return;
    addMedication({ name: medName, time: medTime });
    setIsAddingMed(false);
    setMedName('');
    setMedTime('');
  };

  const handleSaveTask = () => {
    if (!taskTitle || !taskTime) return;
    addTimelineTask({ title: taskTitle, time: taskTime, icon: 'Activity' });
    setIsAddingTask(false);
    setTaskTitle('');
    setTaskTime('');
  };

  return (
    <ScrollView style={globalStyles.container} showsVerticalScrollIndicator={false}>
      
      {routineAlerts && routineAlerts.length > 0 && (
        <View style={{ backgroundColor: '#fff1f2', borderRadius: 24, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#fecdd3', shadowColor: '#e11d48', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ backgroundColor: '#ffe4e6', padding: 10, borderRadius: 16, marginRight: 12 }}>
              <ShieldAlert color="#e11d48" size={28} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: '#e11d48' }}>Routine Deviations</Text>
          </View>
          {routineAlerts.map(alert => (
            <View key={alert.id} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, backgroundColor: '#ffffff90', padding: 12, borderRadius: 12 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#e11d48', marginTop: 8, marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: '#be123c', fontWeight: '600', lineHeight: 22, flex: 1 }}>
                {alert.message.replace('⚠️ ', '')}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Card>
        <View style={styles.cardHeader}>
          <Clock color={colors.primary} size={32} />
          <Text style={styles.cardTitle}>Daily Schedule (My Day)</Text>
        </View>
        <Text style={{ color: colors.textMuted, marginBottom: 16 }}>Manage the patient's daily timeline tasks.</Text>
        
        {timelineTasks.map((task, index) => (
          <View key={task.id} style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            padding: 16, 
            backgroundColor: '#f8fafc', 
            borderRadius: 20, 
            marginBottom: 12,
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.03)',
            shadowColor: '#334155',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2
          }}>
            <View style={{ backgroundColor: '#e0e7ff', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
              <Clock color="#4f46e5" size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#1e293b' }}>{task.title}</Text>
              <Text style={{ fontSize: 15, color: '#64748b', marginTop: 2, fontWeight: '600' }}>{task.time}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity 
          onPress={() => setIsAddingTask(true)} 
          style={{ 
            marginTop: 16, 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 16, 
            backgroundColor: '#e0e7ff', // Soft primary tint
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#c7d2fe',
          }}
          activeOpacity={0.7}
        >
          <Plus color="#4f46e5" size={20} style={{ marginRight: 8 }} />
          <Text style={{ color: '#4f46e5', fontWeight: '800', fontSize: 16 }}>Add New Task</Text>
        </TouchableOpacity>
      </Card>

      <Card>
        <View style={styles.cardHeader}>
          <Pill color={colors.accent} size={32} />
          <Text style={styles.cardTitle}>Medication Reminders</Text>
        </View>
        <Text style={{ color: colors.textMuted, marginBottom: 16 }}>Manage the patient's medications. Status is synced instantly.</Text>
        
        {medications.map(med => (
          <View key={med.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textMain }}>{med.name}</Text>
              <Text style={{ fontSize: 16, color: colors.textMuted, marginTop: 4 }}>{med.time}</Text>
            </View>
            <View style={{ backgroundColor: med.taken ? colors.success + '20' : colors.accent + '20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
              <Text style={{ color: med.taken ? colors.success : (colors.accentDark || '#b45309'), fontWeight: '700' }}>
                {med.taken ? 'Taken' : 'Pending'}
              </Text>
            </View>
          </View>
        ))}

        {/* Premium Add Medication Button */}
        <TouchableOpacity 
          onPress={() => setIsAddingMed(true)} 
          style={{ 
            marginTop: 16, 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 16, 
            backgroundColor: '#ffedd5', // Soft accent tint
            borderRadius: 20,
            borderWidth: 1,
            borderColor: '#fed7aa',
          }}
          activeOpacity={0.7}
        >
          <Plus color="#ea580c" size={20} style={{ marginRight: 8 }} />
          <Text style={{ color: '#ea580c', fontWeight: '800', fontSize: 16 }}>Add New Medicine</Text>
        </TouchableOpacity>
      </Card>
      
      <View style={{ height: 40 }} />

      {/* Add Task Modal */}
      <Modal visible={isAddingTask} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Daily Task</Text>
            <TextInput 
              placeholder="Task Title (e.g. Evening Walk)" 
              style={styles.modalInput} 
              value={taskTitle} 
              onChangeText={setTaskTitle} 
              placeholderTextColor="#94a3b8"
            />
            <TextInput 
              placeholder="Time (e.g. 5:00 PM)" 
              style={styles.modalInput} 
              value={taskTime} 
              onChangeText={setTaskTime} 
              placeholderTextColor="#94a3b8"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, width: '100%' }}>
              <TouchableOpacity onPress={() => setIsAddingTask(false)} style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]}>
                <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveTask} style={[styles.modalBtn, { backgroundColor: '#4f46e5' }]}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>Save Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Medication Modal */}
      <Modal visible={isAddingMed} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Medication</Text>
            <TextInput 
              placeholder="Medicine Name (e.g. Aspirin)" 
              style={styles.modalInput} 
              value={medName} 
              onChangeText={setMedName} 
              placeholderTextColor="#94a3b8"
            />
            <TextInput 
              placeholder="Time (e.g. 8:00 AM)" 
              style={styles.modalInput} 
              value={medTime} 
              onChangeText={setMedTime} 
              placeholderTextColor="#94a3b8"
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, width: '100%' }}>
              <TouchableOpacity onPress={() => setIsAddingMed(false)} style={[styles.modalBtn, { backgroundColor: '#f1f5f9' }]}>
                <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveMedication} style={[styles.modalBtn, { backgroundColor: '#ea580c' }]}>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 16 }}>Save Medicine</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export const CaregiverDashboard = () => {
  const { patient, refreshInsights } = useStore();

  useEffect(() => {
    if (patient) refreshInsights(patient.patient_id);
  }, [patient, refreshInsights]);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 10 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="CaregiverHome" 
        component={CaregiverHomeTab} 
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="CaregiverHealth" 
        component={CaregiverHealthTab} 
        options={{
          title: 'Health',
          tabBarIcon: ({ color }) => <Brain color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="CaregiverInsights" 
        component={CaregiverInsightsTab} 
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => <Activity color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="CaregiverSchedule" 
        component={CaregiverScheduleTab} 
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="CaregiverSettings" 
        component={CaregiverSettingsTab} 
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textMain,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  skillName: {
    textTransform: 'capitalize',
    fontSize: 20,
    fontWeight: '600',
    color: colors.textMain,
  },
  trendBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  trendText: {
    fontWeight: '800',
    fontSize: 16,
  },
  statBox: {
    backgroundColor: colors.bgSubtle,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statBoxLabel: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomColor: colors.border,
  },
  insightBox: {
    backgroundColor: colors.bgSubtle,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingBlock: {
    paddingBottom: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 12
  },
  optionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.border
  },
  optionBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  optionText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#ffffff',
    width: '100%',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 8
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 6,
    marginLeft: 4
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: colors.textMain,
    marginBottom: 16
  },
  modalBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  optionTextActive: {
    color: '#ffffff'
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    padding: 3
  },
  toggleKnob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  gridSettingCard: {
    width: '48%',
    backgroundColor: colors.bgSubtle,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gridSettingCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  gridSettingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 8,
  }
});
