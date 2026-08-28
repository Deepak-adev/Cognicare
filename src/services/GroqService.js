// src/services/GeminiService.js
// Handles interactions with the Groq API (Kept filename for import compatibility)

import { Platform } from 'react-native';

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL_NAME = 'groq/compound-mini';

// System prompt for the onboarding conversation
const ONBOARDING_SYSTEM_PROMPT = `
You are a warm, empathetic, and patient companion designed to interact with an elderly person who might be experiencing early signs of dementia or cognitive decline.
Your goal is to gently learn about their life, family, hobbies, and location without making it feel like an interrogation.
- Let them talk and "blabber" if they want to. Validate their stories.
- Keep your responses under 2-3 short sentences.
- Ask ONE open-ended question at a time to keep the conversation going.
- Be very encouraging, warm, and natural.
`;

export const GroqService = {
  
  /**
   * Generates the next conversational response.
   */
  chatTurn: async (history, newPatientText, patientName, preferredLangCode = 'en-US') => {
    // If no API key is provided, use a robust fallback logic
    if (!GROQ_API_KEY) {
      return simulateAIResponse(history, newPatientText);
    }

    try {
      // Build the conversation history for Groq (OpenAI format)
      const messages = history.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.text
      }));
      
      // Append the latest user message
      messages.push({
        role: 'user',
        content: newPatientText
      });

      let langInstruction = `CRITICAL INSTRUCTION: You are a multilingual AI. You MUST respond entirely in the exact same language and native script that the user just used!`;
      
      if (preferredLangCode === 'tanglish') {
        langInstruction = `CRITICAL INSTRUCTION: You MUST respond in conversational "Tanglish" (Tamil spoken naturally but written entirely using the English alphabet). Example: "Eppadi irukkinga? Saaptingala?" Do NOT use Tamil script.`;
      } else if (preferredLangCode === 'ta-IN') {
        langInstruction = `CRITICAL INSTRUCTION: You MUST respond entirely in the Tamil language using the native Tamil script.`;
      } else if (preferredLangCode === 'en-US') {
        langInstruction = `CRITICAL INSTRUCTION: You MUST respond entirely in English.`;
      }

      // Add system prompt at the beginning
      messages.unshift({
        role: 'system',
        content: ONBOARDING_SYSTEM_PROMPT + `\nThe patient's name is ${patientName}.\n${langInstruction}`
      });

      const payload = {
        model: MODEL_NAME,
        messages: messages,
        temperature: 0.7,
        max_tokens: 60,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('[Groq API Error]', data.error);
        return simulateAIResponse(history, newPatientText);
      }

      if (!data.choices || data.choices.length === 0) {
        console.error('[Groq API Unexpected Payload]', data);
        return simulateAIResponse(history, newPatientText);
      }

      const reply = data.choices[0].message.content;
      return reply;

    } catch (e) {
      console.error('[GeminiService] Network or parsing error:', e);
      return simulateAIResponse(history, newPatientText);
    }
  },

  /**
   * Extracts structured JSON data from the completed conversation.
   */
  extractProfile: async (history, patientName) => {
    // If no API key is provided, use fallback extraction
    if (!GROQ_API_KEY) {
      return simulateExtraction(history, patientName);
    }

    const conversationText = history.map(msg => `${msg.role === 'ai' ? 'AI' : 'Patient'}: ${msg.text}`).join('\n');

    const extractionPrompt = `
      Analyze the following conversation between an AI and an elderly patient named ${patientName}.
      Extract as much of the following information as possible.
      Return ONLY a raw JSON object (no markdown formatting, no backticks).
      Keys required: "interests" (string), "family" (string), "location" (string), "age" (number, default to 70 if not mentioned).
      If a field is not mentioned, return "Not provided".
      
      Conversation:
      ${conversationText}
    `;

    try {
      const payload = {
        model: MODEL_NAME,
        messages: [{ role: 'user', content: extractionPrompt }],
        temperature: 0.1,
        response_format: { type: "json_object" }
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      const rawText = data.choices[0].message.content;
      
      // Clean up in case the LLM returned markdown code blocks
      const cleanJsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(cleanJsonStr);
      return {
        name: patientName,
        age: parsed.age || 70,
        interests: parsed.interests || 'Not provided',
        family: parsed.family || 'Not provided',
        location: parsed.location || 'Not provided',
      };
    } catch (e) {
      console.error('[GeminiService Extraction Error]', e);
      return simulateExtraction(history, patientName);
    }
  },

  /**
   * Transcribes an audio file URI to text using Groq Whisper.
   */
  transcribeAudio: async (audioUri, languageCode = 'en-US') => {
    if (!GROQ_API_KEY) {
      return "I love spending time with my grandson Rahul."; // Mock text
    }

    try {
      // We let Whisper auto-detect the language so it can handle Tanglish natively
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const fetchResponse = await fetch(audioUri);
        const blob = await fetchResponse.blob();
        formData.append('file', blob, 'recording.m4a');
      } else {
        formData.append('file', {
          uri: audioUri,
          type: 'audio/m4a',
          name: 'recording.m4a'
        });
      }

      formData.append('model', 'whisper-large-v3-turbo');
      
      if (languageCode === 'en-US') formData.append('language', 'en');
      else if (languageCode === 'ta-IN') formData.append('language', 'ta');
      else if (languageCode === 'tanglish') {
        // Tanglish: Provide a prompt to prevent Whisper from translating it to English or hallucinating
        formData.append('prompt', 'This is a casual conversation in Tanglish (Tamil mixed with English). For example: Vanakkam, naan nalla irukken. Enakku briyani pudikum.');
      }
      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Accept': 'application/json',
          // Note: Content-Type is intentionally omitted for FormData in React Native
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.error) {
        console.error('[Groq Whisper API Error]', data.error);
        return null;
      }

      return data.text;
    } catch (e) {
      console.error('[GeminiService Transcription Error]', e);
      return null;
    }
  }
};

// ==========================================
// FALLBACK LOGIC IF NO API KEY IS PROVIDED
// ==========================================
const simulateAIResponse = async (history, newText) => {
  console.log('[Gemini Fallback] Using mock AI due to missing API key.');
  await new Promise(r => setTimeout(r, 1000)); // simulate network delay

  const t = newText.toLowerCase();
  
  if (t.includes('cricket') || t.includes('garden') || t.includes('read') || t.includes('hobby')) {
    return "That sounds wonderful. I love hearing about your passions! Who usually helps you around the house or visits you?";
  }
  if (t.includes('son') || t.includes('daughter') || t.includes('wife') || t.includes('husband') || t.includes('rahul')) {
    return "Family is so precious. It's lovely that you have them. Have you lived in your current town for a long time?";
  }
  if (t.includes('yes') || t.includes('delhi') || t.includes('mumbai') || t.includes('assam') || t.includes('town')) {
    return "It sounds like you have a rich life journey! Thank you for sharing these wonderful memories with me.";
  }
  
  return "That is really interesting, thank you for sharing! Tell me a bit more about what you like to do in your free time.";
};

const simulateExtraction = async (history, patientName) => {
  await new Promise(r => setTimeout(r, 1000));
  const fullText = history.map(h => h.text).join(' ').toLowerCase();
  
  return {
    name: patientName,
    age: 70,
    interests: fullText.includes('garden') ? 'Gardening' : fullText.includes('cricket') ? 'Cricket' : 'Not provided',
    family: fullText.includes('rahul') ? 'Grandson Rahul' : fullText.includes('son') ? 'Son' : 'Not provided',
    location: fullText.includes('assam') ? 'Assam' : 'Not provided'
  };
};
