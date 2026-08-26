import React, { useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { Card, globalStyles, colors } from '../components/common';
import { Activity, Brain, Clock, ShieldAlert, MapPin, Calendar } from 'lucide-react-native';

export const CaregiverDashboard = () => {
  const { patient, cognitiveProfile, insights, refreshInsights, isOffline } = useStore();

  useEffect(() => {
    if (patient) refreshInsights(patient.patient_id);
  }, [patient, refreshInsights]);

  if (!patient || !cognitiveProfile) return <View style={globalStyles.container}><Text>Loading...</Text></View>;

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

      {/* Cognitive Indicators */}
      <Card>
        <View style={styles.cardHeader}>
          <Brain color={colors.primary} size={32} />
          <Text style={styles.cardTitle}>Cognitive Health</Text>
        </View>
        
        {Object.entries(cognitiveProfile.skills).map(([skill, data], idx, arr) => {
          const diff = data.current - data.baseline;
          let trendColor = colors.textMuted;
          let trendIcon = '•';
          let trendBg = colors.bgSubtle;
          
          if (diff > 5) { trendColor = colors.success; trendIcon = '▲'; trendBg = colors.success + '15'; }
          else if (diff < -5) { trendColor = colors.danger; trendIcon = '▼'; trendBg = colors.danger + '15'; }

          const isLast = idx === arr.length - 1;

          return (
            <View key={skill} style={[styles.row, isLast && { borderBottomWidth: 0 }]}>
              <Text style={styles.skillName}>{skill}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '500' }}>Base: {data.baseline}</Text>
                <View style={[styles.trendBadge, { backgroundColor: trendBg }]}>
                  <Text style={[styles.trendText, { color: trendColor }]}>{trendIcon} {data.current}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </Card>

      {/* AI Insights Engine */}
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
      
      <View style={{ height: 40 }} />
    </ScrollView>
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
  insightBox: {
    backgroundColor: colors.bgSubtle,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  }
});
