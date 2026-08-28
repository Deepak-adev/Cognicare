# Cognitive Care Application - Features & Flow Architecture

This document outlines the core features, user journeys, and architecture of the Cognitive Care Application, a React Native (Expo) dual-interface application designed for Dementia/Alzheimer's patients and their Caregivers.

## 1. Dual-Interface System (Role Selection)
The app is built with a single codebase that serves two entirely different user experiences based on the selected role:
- **Patient Interface:** Highly simplified, high-contrast, accessible UI with large tap targets and zero typing required.
- **Caregiver Interface:** A rich, data-dense analytics dashboard for monitoring patient health, schedules, and cognitive trends.

When the application launches (`App.js`), it routes the user to the **Role Selection Screen**.
- **Path A:** Selects "I am a Patient" -> Navigates to **Voice Login / Onboarding**
- **Path B:** Selects "I am a Caregiver" -> Navigates to **Caregiver Patient List**

## 2. Voice-Activated Onboarding & Login
- **Frictionless Authentication:** Patients do not need passwords. They log in by simply tapping a large microphone button and saying their name (e.g., "I'm Ravi" or "Aunt Maya").
- **Voice Conversational Onboarding:** For new patients, an empathetic AI Agent (powered by Gemini/Groq) engages in a short conversation to learn about their background, family, and preferences without feeling like an interrogation.
- **Regional Languages & Tanglish:** Built-in support for Tanglish (Tamil-English mix) and Tamil. The AI will speak back using `expo-speech` with the correct language tag (`en-IN` or `ta-IN`), making it highly accessible to Indian elders.
- **Background Extraction:** During the onboarding conversation, the AI silently builds a patient profile and saves it to the database.

## 3. Agentic UI Assistant (AGUI)
- **Floating Companion:** A floating "✦" button is present on all patient screens, acting as a personal assistant.
- **Voice Mode:** Patients can tap the microphone to speak naturally (e.g., "I took my morning pills," or "Make the text bigger").
- **Lightning Fast Transcription:** Uses Groq's Whisper API to transcribe audio instantly.
- **Agentic Actions:** The AGUI doesn't just chat—it can navigate screens, log medication, and change accessibility settings automatically in real-time.

## 4. Patient App Flow & Features

### A. "My Day" Timeline
- A clean, vertical timeline showing the patient's daily schedule (Breakfast, Appointments, Evening Walks, etc.).
- Dynamically controlled and synced from the Caregiver's application.

### B. Medicine Reminders
- A dedicated screen for tracking daily medications.
- Requires zero typing: Patients tap a massive **"I TOOK IT"** button, or simply tell the AGUI "I took my medicine."

### C. Leveled Cognitive Games Library
- A curated library of cognitive exercises tailored to specific domains (Memory, Attention, Recognition, Language).
- **Leveled System:** Games dynamically adjust their difficulty (Levels 1-3) based on performance to prevent frustration.
- **AI Adaptive Generation:** An engine capable of creating real-time personalized games based on the patient's background.

### D. "My World" (Familiar World)
- Displays familiar faces, family relationships, and personal photos to combat memory loss and disorientation.

### E. Confusion Rescue Protocol
- An emergency screen triggered during severe disorientation (e.g. erratic tapping or saying "I am lost"). The UI strips down to a full-screen, calming view reminding the patient where they are, what time it is, and offering an immediate 1-tap call to their primary caregiver.

### F. Accessibility Settings
- High Contrast, Large Text modes, and "Ignore Accidental Taps" designed for users with hand tremors.

## 5. Caregiver App Flow & Features

### A. Patient Roster & Remote Monitoring
- Caregivers can manage multiple patients and view real-time adherence to medication and schedules.
- **Patient Insights:** Selecting a patient opens a deep-dive dashboard.

### B. Cognitive Progress Dashboard
- Visual bar charts tracking the patient's performance in specific cognitive domains.
- **Non-Alarmist Intelligent alerts:** Detects decline and notifies the caregiver without frightening terminology.

### C. Remote Management
- The caregiver can add tasks or medications. These changes update the global state, instantly reflecting on the patient's device.

## 6. Technical Architecture & Data Flow

### Application State
- **State Management:** Powered by `Zustand` (`useStore.js`) for global, synchronous state across both interfaces.
- **Offline-First Database:** A custom `MockDBStore` wrapping React Native's `AsyncStorage` to ensure the app functions completely offline without internet connectivity.

### AI Services Data Flow
- **GroqService.js:** Handles all fast-inference tasks. 
  - `transcribeAudio()`: Uses Whisper for Speech-to-Text.
  - `chatTurn()` & `extractProfile()`: Uses LLaMA/Compound models for conversational logic and structured JSON extraction.
- **GeminiService.js (AGUI):** Handles complex UI tool-calling and intent matching. Parses user requests into actionable JSON objects (`{ action: { type: 'navigate', screen: 'Games' } }`).
- **moodService.js:** Intercepts AGUI voice logs to classify emotional tone (e.g. calm, confused, anxious) using LLM analysis.
- **reminiscenceService.js:** Generates dynamic, warm narrations about family photos based on user context.
- **sundowningAnalyzer.js:** Analyzes recent interaction logs locally via `AsyncStorage` to detect deviations in response time and mood, triggering automated UI simplification.
- **End-to-End Pipeline:** `expo-av` (Audio Record) -> `GroqService` (Transcription) -> `Gemini/Groq API` (LLM processing) -> `expo-speech` (TTS Output) & `Zustand` (UI Action Execution).

## 7. Advanced AI Capabilities

### A. Voice Mood Tagging
The system silently analyzes the emotional tone (e.g., calm, distressed, anxious) of every voice interaction with the AGUI. It logs this alongside response latency to create an emotional baseline over time.

### B. Offline Sundowning Risk Detection
Operating entirely offline for privacy, the app constantly evaluates the last 14 days of mood logs. If it detects a sudden spike in negative mood or response delay (common symptoms of "Sundowning" syndrome), it automatically triggers a global state change. This forces the UI into a highly simplified mode (larger fonts, reduced options) to avoid overwhelming the patient.

### C. Reminiscence Therapy Narration
When viewing photos in "My World," the app uses an LLM to dynamically generate a warm, 2-3 sentence personalized narration. It combines the photo's metadata with the patient's learned profile to help reinforce identity and reduce anxiety. Narrations are aggressively cached offline for robust operation.
