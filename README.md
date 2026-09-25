# 🧠 Cognicare AI

> **Voice-First AI Cognitive Assistance & Remote Monitoring Platform for Alzheimer's & Dementia Patients**  
> *Developed for Smart India Hackathon (SIH)*

---

## 📌 Overview

**Cognicare AI** is an assistive healthcare platform designed to bridge the gap between cognitive care patients (Alzheimer's / Dementia) and their caregivers. By replacing complex user interfaces with intuitive voice interaction, biometrics, and personalized reminiscence modules, NeuroCare AI empowers patients to maintain independence while providing caregivers with real-time analytics and peace of mind.

The app is built with a single codebase that serves two entirely different user experiences based on the selected role:
- **Patient Interface:** Highly simplified, high-contrast, accessible UI with large tap targets and zero typing required.
- **Caregiver Interface:** A rich, data-dense analytics dashboard for monitoring patient health, schedules, and cognitive trends.

---

## ✨ Key Features & Architecture

### 🎙️ 1. Voice-Activated Patient Login & AI Interaction
- **Voice-Based Authentication:** Hands-free, biometric voice login. Patients log in by simply tapping a large microphone button and saying their name (e.g., "I'm Ravi").
- **Smart Parsing & Auto-Registration:** The app cleans up spoken phrases, matches them against local DBs, and auto-registers new names instantly.
- **Conversational Companion:** Powered by Groq AI, the voice-driven interaction engine gently converses with the patient and extracts profile details seamlessly. It uses `window.SpeechRecognition` on the web and `@react-native-voice/voice` on native mobile.

### ☀️ 2. Patient Experience ("My Day")
- **High-Accessibility UI:** Strips away all non-essential navigation. High-contrast text, color blind modes, clear typography, and a tremor support feature ("Ignore Accidental Taps").
- **Daily Routines & Reminders:** A dynamic vertical timeline synced from the Caregiver's app. Step-by-step reminders for medication (tap "I TOOK IT" with zero typing).
- **Multilingual Support:** Full UI localization (English, Hindi, Assamese) via a centralized `i18n.js` dictionary.

### 👨‍👩‍👧 3. Familiar World (Reminiscence Therapy)
- **Personalized Memory Triggers:** Interactive family gallery with tagged photos, family relationships, and familiar music.
- **Agitation Reduction:** Grounding features provide instant access to comforting memory prompts during periods of confusion or distress.

### 🎮 4. Cognitive Games & Activity Library
- **Brain Stimulation Exercises:** Curated library of cognitive exercises tailored to specific domains (Memory, Attention, Recognition, Visuospatial, Language).
- **Personalization Engine:** Suggests the best games based on the patient's most recent cognitive assessment.
- **Automated Score & Latency Tracking:** Measures response speed and memory recall accuracy to evaluate cognitive trends.

### 📊 5. Caregiver Analytics & Portal
- **Patient Roster & Onboarding:** Manage multiple patients, register new ones with baseline cognitive scores and interests.
- **Cognitive Progress Dashboard:** Visual bar charts tracking weekly performance trends. Includes non-alarmist intelligent insights that detect decline (e.g., "A significant change in cognitive-task performance was observed. ⚠ Review Recommended").
- **Schedule & Medication Manager:** Dynamic scheduling allows remote updates to the patient's "My Day" timeline and real-time adherence tracking.

---

## 🛠️ Tech Stack & Architecture Details

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | React Native / Expo (`expo ~54.0.0`), React 19, React DOM |
| **Web Support** | `react-native-web` |
| **Navigation** | `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack` |
| **State Management** | Zustand (`zustand ^5.0.15`) for global, synchronous state across both interfaces. |
| **Icons & UI Elements** | `lucide-react-native`, `expo-linear-gradient`, `react-native-svg` |
| **Local Storage / Offline** | `@react-native-async-storage/async-storage`, Custom `MockDBStore` (Offline-First architecture) |
| **Voice Processing & AI** | `@react-native-voice/voice`, Groq API (`groq/compound-mini` for chat, `whisper-large-v3-turbo` for transcription) |

### Technical Architecture Highlights
- **State Management:** Powered by `Zustand` (`useStore.js`) for global, synchronous state across both the Patient and Caregiver interfaces.
- **Offline-First Database:** A custom `MockDBStore` wrapping React Native's `AsyncStorage` to ensure the app functions completely offline without internet connectivity.
- **Styling:** A centralized, accessible design system (`useTheme.js`, `common.jsx`) enforcing consistent color palettes, fonts, and large touch targets.

---

## 📁 Project Structure

```text
sih/
├── App.js                     # Main React Native Application Entry Point & Navigation Setup
├── app.json                   # Expo Configuration
├── package.json               # Dependencies & Scripts
├── FEATURES.md                # Detailed Features Documentation
├── src/
│   ├── App.jsx                # Web Router Entry
│   ├── components/            # Reusable UI Components (Cards, Buttons, Modals)
│   ├── db/                    # Local Database & Mock Data Seeding
│   ├── data/                  # Static Data & Initial Mock Datasets
│   ├── pages/                 # Main App Screens:
│   │   ├── RoleSelectionScreen.jsx
│   │   ├── VoicePatientLoginScreen.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── CaregiverDashboard.jsx
│   │   ├── CaregiverPatientListScreen.jsx
│   │   ├── FamiliarWorldScreen.jsx
│   │   ├── GamesScreen.jsx
│   │   ├── ActivityScreen.jsx
│   │   ├── ProgressScreen.jsx
│   │   └── DemoScenario.jsx
│   ├── services/              # Core Logic (Groq API Service, Analytics, Patient Profiles)
│   ├── store/                 # Zustand Global State Management
│   └── styles/                # Theme Configurations & CSS Styles
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or `yarn`
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/go) app on your mobile device (for Android/iOS testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Deepak-adev/sih.git
   cd sih
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your Groq API key:
   ```env
   EXPO_PUBLIC_GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Start the application:**

   - **Mobile (Expo):**
     ```bash
     npm run android   # For Android simulator / device
     # OR
     npm run ios       # For iOS simulator
     ```
     Or start Expo dev server:
     ```bash
     npx expo start
     ```

---

## 💡 Demo Workflow

1. **Role Selection:** Select **Patient** or **Caregiver** on startup.
2. **Voice Login:** Experience the hands-free voice enrollment/verification.
3. **Patient Experience ("My Day"):** Explore scheduled daily activities, launch cognitive memory games, or access the *Familiar World* memory bank.
4. **Caregiver View:** Access patient list, monitor real-time completion status, and inspect cognitive health analytics.
5. **Admin Demo Sandbox:** Test preset scenarios, reset voice profiles, and simulate network offline modes.

---

## 📄 License

This project is open-source and created as part of the **Smart India Hackathon (SIH)** initiative.
