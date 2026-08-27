# 🧠 NeuroCare AI

> **Voice-First AI Cognitive Assistance & Remote Monitoring Platform for Alzheimer's & Dementia Patients**  
> *Developed for Smart India Hackathon (SIH)*

---

## 📌 Overview

**NeuroCare AI** is an assistive healthcare platform designed to bridge the gap between cognitive care patients (Alzheimer's / Dementia) and their caregivers. By replacing complex user interfaces with intuitive voice interaction, biometrics, and personalized reminiscence modules, NeuroCare AI empowers patients to maintain independence while providing caregivers with real-time analytics and peace of mind.

---

## ✨ Key Features

### 🎙️ 1. Voice-First Interaction & Biometrics
- **Voice-Based Authentication:** Hands-free, biometric voice login allowing patients with cognitive impairments to access their personal profiles effortlessly.
- **Conversational Companion:** Voice-driven interaction engine guiding patients through daily schedules, reminders, and activities.

### ☀️ 2. Patient Dashboard ("My Day")
- **High-Accessibility UI:** High-contrast text, clear typography, and large buttons tailored for accessibility.
- **Daily Routines & Reminders:** Step-by-step visual and audible reminders for medication, hydration, meals, and appointments.
- **Real-Time Status:** Clear indicators of current time, weather, and immediate upcoming tasks.

### 👨‍👩‍👧 3. Familiar World (Reminiscence Therapy)
- **Personalized Memory Triggers:** Interactive family gallery with tagged photos, voice notes, and familiar music.
- **Agitation Reduction:** Instant access to comforting memory prompts during periods of confusion or distress.

### 🎮 4. Cognitive Games & Activity Library
- **Brain Stimulation Exercises:** Engaging memory matching, pattern recognition, and visual recognition games.
- **Automated Score & Latency Tracking:** Measures response speed and memory recall accuracy to evaluate cognitive trends.

### 📊 5. Caregiver Analytics & Portal
- **Patient Monitoring:** View real-time patient status, completed activities, and medication adherence.
- **Cognitive Health Insights:** Data-driven metrics, trend analysis, and behavioral notifications.
- **Multi-Patient Support:** Multi-patient listing and profile management for professional caregivers and family members.

### 📶 6. Offline-First Architecture
- **Persistent Local Sync:** Built using local storage engines (AsyncStorage & IndexedDB) to operate smoothly without internet connectivity and automatically sync upon reconnection.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | React Native / Expo (`expo ~52.0.0`), React 18, React DOM |
| **Web Support** | `react-native-web` |
| **Navigation** | `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack` |
| **State Management** | Zustand (`zustand ^5.0.15`) |
| **Icons & UI Elements** | `lucide-react-native`, `expo-linear-gradient`, `react-native-svg` |
| **Local Storage / Offline** | `@react-native-async-storage/async-storage`, IndexedDB |
| **Voice Processing** | `@react-native-voice/voice` |

---

## 📁 Project Structure

```text
sih/
├── App.js                     # Main React Native Application Entry Point & Navigation Setup
├── app.json                   # Expo Configuration
├── package.json               # Dependencies & Scripts
├── src/
│   ├── App.jsx                # Web Router Entry
│   ├── components/            # Reusable UI Components (Cards, Buttons, Modals)
│   ├── db/                    # Local Database & Mock Data Seeding (IndexedDB / Local Storage)
│   ├── data/                  # Static Data & Initial Mock Datasets
│   ├── pages/                 # Main App Screens:
│   │   ├── RoleSelectionScreen.jsx      # Role Selector (Patient vs Caregiver)
│   │   ├── VoicePatientLoginScreen.jsx  # Voice Biometric Authentication
│   │   ├── PatientDashboard.jsx         # "My Day" Patient Portal
│   │   ├── CaregiverDashboard.jsx       # Caregiver Metrics & Patient Overview
│   │   ├── CaregiverPatientListScreen.jsx # Patient List for Caregivers
│   │   ├── FamiliarWorldScreen.jsx      # Reminiscence Therapy & Family Photos
│   │   ├── GamesScreen.jsx              # Brain Training & Cognitive Games
│   │   ├── ActivityScreen.jsx           # Interactive Activity Execution
│   │   ├── ProgressScreen.jsx           # Cognitive Trends & Metrics
│   │   └── DemoScenario.jsx             # Admin / Demo Sandbox
│   ├── services/              # Core Logic (Cognitive Profile, Game Analytics, Patient Profiles)
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

3. **Start the application:**

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
