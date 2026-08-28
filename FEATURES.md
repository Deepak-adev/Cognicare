# Cognitive Care Application - Features Documentation

This document outlines the core features and architecture of the Cognitive Care Application, a React Native (Expo) dual-interface application designed for Dementia/Alzheimer's patients and their Caregivers.

## 1. Dual-Interface System (Role Selection)
The app is built with a single codebase that serves two entirely different user experiences based on the selected role:
- **Patient Interface:** Highly simplified, high-contrast, accessible UI with large tap targets and zero typing required.
- **Caregiver Interface:** A rich, data-dense analytics dashboard for monitoring patient health, schedules, and cognitive trends.

## 2. Voice-Activated Patient Login
- **Frictionless Authentication:** Patients do not need passwords. They log in by simply tapping a large microphone button and saying their name (e.g., "I'm Ravi" or "Aunt Maya").
- **Smart Parsing:** The app cleans up spoken phrases and matches them against the local database of registered patients.
- **Auto-Registration:** If a new name is spoken, the app dynamically generates a new patient profile and logs them in instantly.
- **Mobile & Web Support:** Utilizes `window.SpeechRecognition` on the web and `@react-native-voice/voice` on native mobile. (Includes automatic fallback for network errors or ungranted permissions).

## 3. Patient App Features

### A. "My Day" Timeline
- A clean, vertical timeline showing the patient's daily schedule (Breakfast, Appointments, Evening Walks, etc.).
- The timeline is dynamically controlled and synced from the Caregiver's application.
- Uses large visual indicators to show what is "Next Up" and what is already completed.

### B. Medicine Reminders
- A dedicated screen for tracking daily medications.
- Requires zero typing: Patients simply tap a massive **"I TOOK IT"** button to log their adherence.
- Real-time synchronization with the Caregiver's dashboard.

### C. Activity & Games Library
- A curated library of cognitive exercises tailored to specific domains (Memory, Attention, Recognition, Visuospatial, Language).
- Uses a Personalization Engine to suggest the best games based on the patient's most recent cognitive assessment.

### D. "My World" (Familiar World)
- A grounding feature to help orient patients.
- Displays familiar faces, family relationships, and personal photos to combat memory loss and disorientation.

### E. Accessibility Settings
- **Simplified UI:** Strips away all non-essential navigation to prevent confusion.
- **High Contrast & Color Blind Modes:** Improves visibility for visually impaired users.
- **Tremor Support:** "Ignore Accidental Taps" feature specifically designed for users with hand tremors.
- **Multilingual Support:** Full UI localization (English, Hindi, Assamese) via a centralized `i18n.js` dictionary.

## 4. Caregiver App Features

### A. Patient Roster & Onboarding
- Caregivers can manage multiple patients from a single account.
- Quick onboarding forms to register new patients with their baseline cognitive scores and interests.

### B. Cognitive Progress Dashboard
- **Weekly Trends:** Visual bar charts tracking the patient's performance in specific cognitive domains (e.g., Memory Performance over the week).
- **Non-Alarmist Alerts:** Intelligent insights that detect decline (e.g., "A significant change in cognitive-task performance was observed. ⚠ Review Recommended") without using alarming diagnostic terms like "Dementia."
- **Domain Breakdown:** Detailed views into Memory, Attention, Language, and Problem Solving baselines vs. current scores.

### C. Schedule & Medication Manager
- **Dynamic Scheduling:** Caregivers can add tasks and appointments to the patient's "My Day" timeline remotely.
- **Adherence Tracking:** Real-time visibility into whether the patient has taken their medication (Pending vs. Taken).

## 5. Technical Architecture
- **State Management:** Powered by `Zustand` (`useStore.js`) for global, synchronous state across both the Patient and Caregiver interfaces.
- **Offline-First Database:** A custom `MockDBStore` wrapping React Native's `AsyncStorage` to ensure the app functions completely offline without internet connectivity.
- **Styling:** A centralized, accessible design system (`useTheme.js`, `common.jsx`) enforcing consistent color palettes, fonts, and large touch targets.
