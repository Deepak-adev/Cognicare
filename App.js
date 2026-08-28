import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RoleSelectionScreen } from './src/pages/RoleSelectionScreen';
import { CaregiverPatientListScreen } from './src/pages/CaregiverPatientListScreen';
import { AddPatientScreen } from './src/pages/AddPatientScreen';
import { CaregiverDashboard } from './src/pages/CaregiverDashboard';

import { PatientDashboard } from './src/pages/PatientDashboard';
import { FamiliarWorldScreen } from './src/pages/FamiliarWorldScreen';
import { ProgressScreen } from './src/pages/ProgressScreen';
import { ActivityScreen } from './src/pages/ActivityScreen';
import { DemoScenario } from './src/pages/DemoScenario';
import { MedicineReminderScreen } from './src/pages/MedicineReminderScreen';
import { ConfusionRescueScreen } from './src/pages/ConfusionRescueScreen';
import { ClockDrawingTestScreen } from './src/pages/ClockDrawingTestScreen';
import { VerbalFluencyTestScreen } from './src/pages/VerbalFluencyTestScreen';

import { GamesScreen } from './src/pages/GamesScreen';
import { LogOut, LayoutDashboard, Settings, Gamepad2, Pill, Brain } from 'lucide-react-native';
import { TouchableOpacity, View, LogBox, Text, Image } from 'react-native';

// Suppress known safe React Native Web warnings that clutter the console
LogBox.ignoreLogs(['Animated: `useNativeDriver`']);
import { useStore } from './src/store/useStore';
import { GeminiChatButton } from './src/components/GeminiChatButton';
import { navigationRef } from './src/utils/navigationRef';
import { useTheme } from './src/hooks/useTheme';
import { LocationService } from './src/services/LocationService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PatientTabs({ navigation }) {
  const { t } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { height: 80, paddingBottom: 20, paddingTop: 12 },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700', marginTop: 4, textTransform: 'capitalize' },
        headerShown: true,
        headerStyle: { backgroundColor: '#ffffff', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
        headerTitleStyle: { fontWeight: '800', fontSize: 20 },
        headerTitle: '',
        headerLeft: () => (
          <View style={{ marginLeft: 20, justifyContent: 'center', paddingVertical: 8 }}>
            <Image 
              source={require('./assets/cognicare_logo.png')} 
              style={{ width: 55, height: 55 }} 
              resizeMode="contain"
            />
          </View>
        ),
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RoleSelection' }] })}
            style={{ marginRight: 20, padding: 10, backgroundColor: '#f1f5f9', borderRadius: 14 }}
          >
            <LogOut color="#64748b" size={22} />
          </TouchableOpacity>
        )
      }}
    >
      <Tab.Screen 
        name="PatientHome" 
        component={PatientDashboard} 
        options={{
          title: t('myDay') || 'My Day',
          tabBarIcon: ({ color }) => <LayoutDashboard color={color} size={30} strokeWidth={2.5} />
        }}
      />
      <Tab.Screen 
        name="GamesTab" 
        component={GamesScreen} 
        options={{
          title: t('library') || 'Library',
          headerTitle: t('activityLibrary') || 'Activity Library',
          tabBarIcon: ({ color }) => <Gamepad2 color={color} size={30} strokeWidth={2.5} />
        }}
      />
      <Tab.Screen 
        name="RemindersTab" 
        component={MedicineReminderScreen} 
        options={{
          title: t('reminders') || 'Reminders',
          headerTitle: t('reminders') || 'Reminders',
          tabBarIcon: ({ color }) => <Pill color={color} size={30} strokeWidth={2.5} />
        }}
      />
    </Tab.Navigator>
  );
}

function PatientStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PatientTabs" component={PatientTabs} />
      <Stack.Screen name="FamiliarWorld" component={FamiliarWorldScreen} options={{ headerShown: true, title: 'My World', headerBackTitle: 'Back' }} />
      <Stack.Screen name="Progress" component={ProgressScreen} options={{ headerShown: true, title: 'My Progress', headerBackTitle: 'Back' }} />
      <Stack.Screen name="Activity" component={ActivityScreen} options={{ headerShown: true, title: 'Activity', headerBackTitle: 'Back' }} />
      <Stack.Screen name="ClockDrawingTest" component={ClockDrawingTestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VerbalFluencyTest" component={VerbalFluencyTestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MedicineReminder" component={MedicineReminderScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ConfusionRescue" component={ConfusionRescueScreen} options={{ headerShown: false, presentation: 'fullScreenModal' }} />
    </Stack.Navigator>
  );
}

function CaregiverStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientList" component={CaregiverPatientListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddPatient" component={AddPatientScreen} options={{ title: 'Add New Patient', headerBackTitle: 'Back' }} />
      <Stack.Screen name="CaregiverDashboard" component={CaregiverDashboard} options={{ title: 'Patient Insights', headerBackTitle: 'Patients' }} />
    </Stack.Navigator>
  );
}

import { VoicePatientLoginScreen } from './src/pages/VoicePatientLoginScreen';
import { VoiceOnboardingScreen } from './src/pages/VoiceOnboardingScreen';

export default function App() {
  const { loadPatientData, patient, seedMockDataIfEmpty, wanderAlertActive } = useStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('RoleSelection');

  useEffect(() => {
    const initApp = async () => {
      await seedMockDataIfEmpty();
      LocationService.init();
      
      try {
        await loadPatientData('patient_001');
      } catch (e) {
        console.log('No default patient loaded, waiting for role selection.');
      }
      setIsInitializing(false);
    };
    
    initApp();
  }, [loadPatientData, seedMockDataIfEmpty]);

  const hiddenRoutes = ['RoleSelection', 'PatientLogin', 'VoiceOnboarding', 'PatientList', 'AddPatient', 'CaregiverDashboard'];

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer 
        ref={navigationRef}
        onReady={() => {
          if (navigationRef.current) {
            setCurrentRoute(navigationRef.current.getCurrentRoute().name);
          }
        }}
        onStateChange={() => {
          if (navigationRef.current) {
            setCurrentRoute(navigationRef.current.getCurrentRoute().name);
          }
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
          <Stack.Screen name="PatientLogin" component={VoicePatientLoginScreen} /> 
          <Stack.Screen name="VoiceOnboarding" component={VoiceOnboardingScreen} /> 
          <Stack.Screen name="CaregiverStack" component={CaregiverStack} />
          <Stack.Screen name="PatientStack" component={PatientStack} />
        </Stack.Navigator>
      </NavigationContainer>
      {/* Floating Gemini AI Chat Button - only visible on Patient screens */}
      {!hiddenRoutes.includes(currentRoute) && <GeminiChatButton />}
    </View>
  );
}
