import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service for Reminiscence Therapy Narration
 * Uses Groq to generate warm, personalized narrations based on patient profile and photo metadata.
 */

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;
const CACHE_PREFIX = 'reminiscence_cache_';

export const reminiscenceService = {
  /**
   * Generates or retrieves a personalized narration for a specific photo.
   * @param {string} photoId Unique identifier for the photo
   * @param {object|string} photoMetadata Context about the photo (e.g. "Daughter Priya", "Guwahati house")
   * @param {object|string} profileContext Patient's background (e.g. interests, family members)
   * @returns {Promise<string>} The narration text to be spoken
   */
  narrateMemory: async (photoId, photoMetadata, profileContext) => {
    const cacheKey = `${CACHE_PREFIX}${photoId}`;

    try {
      // 1. Check Cache (Offline First Support)
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        return cached;
      }

      // 2. Prepare LLM Call
      const systemPrompt = `You are generating a short, warm spoken narration for a dementia patient looking at a photo, as part of reminiscence therapy — a real, evidence-based technique that helps reduce anxiety and reinforce identity in dementia care.
Rules:
- 2-3 sentences maximum. This will be spoken aloud via TTS, not read.
- Use simple, concrete words. No abstract language, no complex clauses.
- Always state the relationship first ("This is your daughter, Priya"), then one warm, specific, positive detail tied to the profile data provided — never invent details not present in the profile context.
- Tone: calm, gentle, present-tense, never clinical, never asks a question that could cause distress if unanswerable (e.g. avoid "Do you remember...?").
- If profile context for this photo is sparse or missing, default to a warm but generic line acknowledging the person is family/loved one — do not fabricate names, dates, or events.
- Never mention memory loss, dementia, or the patient's condition in the narration itself.
Output only the narration text, nothing else — no preamble, no quotation marks.`;

      const userContent = `Patient profile context: ${typeof profileContext === 'object' ? JSON.stringify(profileContext) : profileContext}
Photo metadata (who/when/tags): ${typeof photoMetadata === 'object' ? JSON.stringify(photoMetadata) : photoMetadata}`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      let narration = data.choices?.[0]?.message?.content;
      
      if (!narration) throw new Error("Empty response from LLM");

      narration = narration.replace(/^["']|["']$/g, '').trim(); // Strip quotes if any

      // 3. Cache the generated narration
      await AsyncStorage.setItem(cacheKey, narration);
      
      return narration;

    } catch (err) {
      console.warn('[ReminiscenceService] Failed to generate narration:', err);
      // Fall back to a generic warm line if offline or API fails
      return "This is someone who cares about you very much.";
    }
  }
};
