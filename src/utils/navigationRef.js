import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

const PATIENT_TAB_SCREENS = ['PatientHome', 'GamesTab', 'RemindersTab'];
const PATIENT_STACK_SCREENS = ['FamiliarWorld', 'Progress', 'Activity', 'MedicineReminder'];
const CAREGIVER_STACK_SCREENS = ['PatientList', 'AddPatient', 'CaregiverDashboard'];

/**
 * Navigate smartly to any target screen regardless of nested hierarchy.
 * @param {string} name - Screen name
 * @param {object} params - Screen params (optional)
 */
export function navigateTo(name, params = {}) {
  if (!navigationRef.isReady()) {
    console.warn('[Nav] Navigation container is not ready yet');
    return;
  }

  try {
    if (PATIENT_TAB_SCREENS.includes(name)) {
      navigationRef.navigate('PatientStack', {
        screen: 'PatientTabs',
        params: { screen: name, params },
      });
    } else if (PATIENT_STACK_SCREENS.includes(name)) {
      navigationRef.navigate('PatientStack', {
        screen: name,
        params,
      });
    } else if (CAREGIVER_STACK_SCREENS.includes(name)) {
      navigationRef.navigate('CaregiverStack', {
        screen: name,
        params,
      });
    } else {
      navigationRef.navigate(name, params);
    }
  } catch (err) {
    console.warn(`[Nav] Error navigating to ${name}:`, err);
    try {
      navigationRef.navigate(name, params);
    } catch (fallbackErr) {
      console.error('[Nav] Fallback navigation failed:', fallbackErr);
    }
  }
}
