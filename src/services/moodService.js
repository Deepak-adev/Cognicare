/**
 * Service to analyze patient transcripts and classify mood using an LLM.
 */

// We will use the same Groq API pattern used in GroqService to classify the mood
// since it requires fast inference and strict JSON output.

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export const moodService = {
  /**
   * Classifies the emotional tone of a transcript.
   * @param {string} transcript The text the patient spoke
   * @param {object|string} audioFeatures Basic audio features if available, else 'unavailable'
   * @returns {Promise<{mood: string, confidence: number}>}
   */
  classifyMood: async (transcript, audioFeatures = 'unavailable') => {
    if (!transcript || transcript.trim() === '') {
      return { mood: 'calm', confidence: 1.0 }; // Default fallback
    }

    const systemPrompt = `You will receive a transcript of something a dementia patient just said, plus basic audio features if available (pitch variance, speech rate, pause count — pass "unavailable" if not).
Classify the emotional tone into exactly one of: calm, content, confused, anxious, agitated, distressed.
Guidelines:
- Base the judgment primarily on word choice, sentence fragmentation, and repetition in the transcript, not assumptions about dementia in general.
- Short, coherent, positive statements -> calm or content.
- Repeated questions, disjointed phrases, expressions of not knowing where they are -> confused.
- Explicit distress words, calls for help, crying mentioned -> distressed.
- Default to calm if genuinely ambiguous — do not over-flag agitation from short or quiet input.
Output strict JSON only: {"mood": "<one of the six values>", "confidence": <0-1 float>}`;

    const userContent = `Transcript: ${transcript}\nAudio features: ${
      typeof audioFeatures === 'object' ? JSON.stringify(audioFeatures) : audioFeatures
    }`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant', // Fast inference model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userContent },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        console.warn('[MoodService] Groq API returned an error:', response.status);
        return { mood: 'calm', confidence: 0.5 }; // Fail safely
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) return { mood: 'calm', confidence: 0.5 };

      const parsed = JSON.parse(content);
      return {
        mood: parsed.mood || 'calm',
        confidence: parsed.confidence || 0.5
      };
    } catch (err) {
      console.error('[MoodService] Failed to classify mood:', err);
      return { mood: 'calm', confidence: 0.5 }; // Fail safely
    }
  }
};
