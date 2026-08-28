const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Available models — tried in order with fallbacks
const MODELS = [
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
];

/**
 * Format any object or array into clean, human-readable text
 */
function formatObjectToReadableText(obj) {
  if (!obj || typeof obj !== 'object') return String(obj ?? '');

  if (Array.isArray(obj)) {
    return obj
      .map((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          return `${idx + 1}. ` + Object.entries(item)
            .filter(([k]) => k !== 'id' && k !== 'patient_id')
            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
            .join(', ');
        }
        return `• ${item}`;
      })
      .join('\n');
  }

  // If it contains a patients array
  if (Array.isArray(obj.patients)) {
    const list = obj.patients
      .map((p) => `• ${p.name || 'Patient'} (Age: ${p.age || 'N/A'}, Location: ${p.location || 'N/A'})`)
      .join('\n');
    return obj.intro ? `${obj.intro}\n\n${list}` : list;
  }

  const keys = Object.keys(obj).filter((k) => k !== 'action' && k !== 'actionDescription');
  if (keys.length === 0) return 'Action executed successfully.';

  return keys
    .map((k) => `${k.replace(/_/g, ' ')}: ${typeof obj[k] === 'object' ? JSON.stringify(obj[k]) : obj[k]}`)
    .join('\n');
}

/**
 * Safely extracts a pure string message, valid action object, and action description
 */
function extractMessageAndAction(parsed, rawText) {
  let message = '';
  let action = { type: 'none' };
  let actionDescription = '';

  if (parsed && typeof parsed === 'object') {
    // 1. Resolve action
    if (parsed.action && typeof parsed.action === 'object' && !Array.isArray(parsed.action)) {
      action = parsed.action;
    } else if (typeof parsed.action === 'string') {
      action = { type: parsed.action };
    }

    // 2. Resolve actionDescription
    if (typeof parsed.actionDescription === 'string') {
      actionDescription = parsed.actionDescription;
    } else if (parsed.actionDescription && typeof parsed.actionDescription === 'object') {
      actionDescription = formatObjectToReadableText(parsed.actionDescription);
    }

    // 3. Resolve message string
    if (typeof parsed.message === 'string') {
      message = parsed.message;
    } else if (parsed.message && typeof parsed.message === 'object') {
      // If message is a nested object with its own message or text property
      if (typeof parsed.message.message === 'string') {
        message = parsed.message.message;
      } else if (typeof parsed.message.text === 'string') {
        message = parsed.message.text;
      } else {
        message = formatObjectToReadableText(parsed.message);
      }
    } else if (typeof parsed.reply === 'string') {
      message = parsed.reply;
    } else if (typeof parsed.text === 'string') {
      message = parsed.text;
    } else if (typeof parsed.response === 'string') {
      message = parsed.response;
    } else {
      message = formatObjectToReadableText(parsed);
    }
  } else if (typeof parsed === 'string') {
    message = parsed;
  } else {
    message = rawText || 'Action completed.';
  }

  return {
    message: typeof message === 'string' ? message : String(message || 'Action executed.'),
    action: action && typeof action === 'object' ? action : { type: 'none' },
    actionDescription: typeof actionDescription === 'string' ? actionDescription : '',
  };
}

/**
 * Agentic UI (AGUI) Prompt Definition
 */
function buildSystemPrompt(appContext = null) {
  let contextSection = '';

  if (appContext) {
    contextSection = `
== LIVE APPLICATION DATABASE & STATE CONTEXT ==
${appContext.allPatients && appContext.allPatients.length > 0 ? `Registered Patients:\n${JSON.stringify(appContext.allPatients, null, 2)}` : 'Registered Patients: Aunt Maya (Age 72, Guwahati, Assam)'}
${appContext.activePatient ? `Active Selected Patient: ${JSON.stringify(appContext.activePatient, null, 2)}` : ''}
${appContext.medications ? `Current Medications List: ${JSON.stringify(appContext.medications, null, 2)}` : ''}
${appContext.patientSettings ? `Current Settings: ${JSON.stringify(appContext.patientSettings, null, 2)}` : ''}
`;
  }

  return `You are an intelligent Agentic AI assistant embedded inside a healthcare & cognitive support app called "SIH" (for elderly patients, dementia/Alzheimer's patients, and caregivers).

Your job is BOTH to chat warmly & clearly AND to directly control the app's user interface (Agentic UI) based on what the user wants to do.
${contextSection}
== APP SCREENS YOU CAN NAVIGATE TO ==
- "PatientHome" -> Main patient daily plan, current tasks, today's schedule
- "GamesTab" -> Activity & cognitive games library (Memory Match, Word Connect, Pattern Recall, etc.)
- "RemindersTab" -> Medication list, dosage schedules, reminders
- "FamiliarWorld" -> Memory album, family photos ("My World", loved ones, past memories)
- "Progress" -> Cognitive progress, domain statistics (Memory, Attention, Language charts)
- "Activity" -> Daily activity & brain stimulation exercises
- "RoleSelection" -> Role switcher / Log out / Start screen
- "PatientList" -> Caregiver's patient list screen
- "CaregiverDashboard" -> Detailed caregiver analytics and patient insights

== SETTINGS YOU CAN ADJUST ==
- "highContrast" -> boolean (true: high contrast mode, false: normal)
- "colorBlindMode" -> boolean (true: color blind mode, false: normal)
- "fontSize" -> "Normal" | "Large" | "Extra Large"
- "language" -> "English" | "Tamil" | "Hindi" | "Assamese" | "Bengali"
- "voiceFeedback" -> boolean (true: enable voice narration, false: disable)

== ACTIONS YOU CAN PERFORM ==
1. "navigate": { "type": "navigate", "screen": "<ScreenName>" }
2. "setting": { "type": "setting", "key": "<settingKey>", "value": <settingValue> }
3. "markMedTaken": { "type": "markMedTaken", "name": "<optional med name>" }
4. "addMedication": { "type": "addMedication", "name": "<med name>", "time": "<time string e.g. 8:00 PM>" }
5. "addTimelineTask": { "type": "addTimelineTask", "title": "<task title>", "time": "<time string>" }
6. "none": { "type": "none" }

== RESPONSE FORMAT ==
You MUST ALWAYS respond with a single valid JSON object:
{
  "message": "<Friendly, supportive response in conversational string format. If listing patients or items, format them clearly in readable text>",
  "action": { ...action object... },
  "actionDescription": "<Short 2-4 word summary of action taken, e.g. 'Opening Patient List', 'Opening Games', 'High Contrast ON'>"
}

IMPORTANT: The "message" property MUST be a plain STRING (not a nested object).

Examples:
- User: "list me all the patient details" / "who are my patients?"
  Response: {"message": "Here are the registered patient details:\\n• Aunt Maya — Age 72, Location: Guwahati, Assam, Family: Priya (Daughter), Rahul (Grandson)\\n\\nOpening the Patient List screen now.", "action": {"type": "navigate", "screen": "PatientList"}, "actionDescription": "Opening Patient List"}

- User: "take me to games" / "play a game"
  Response: {"message": "Opening your cognitive games library! Let's exercise your memory today.", "action": {"type": "navigate", "screen": "GamesTab"}, "actionDescription": "Opening Games"}

- User: "show my medicines" / "did I take my pills?"
  Response: {"message": "Here is your medication schedule and reminders.", "action": {"type": "navigate", "screen": "RemindersTab"}, "actionDescription": "Opening Reminders"}

- User: "turn on high contrast" / "make colors brighter"
  Response: {"message": "I've enabled High Contrast mode for better readability.", "action": {"type": "setting", "key": "highContrast", "value": true}, "actionDescription": "High Contrast ON"}

- User: "make text larger" / "I can't read the small words"
  Response: {"message": "I've enlarged the font size for you to make reading easier.", "action": {"type": "setting", "key": "fontSize", "value": "Large"}, "actionDescription": "Font Size: Large"}

- User: "show my family photos" / "who is my daughter?" / "open my memories"
  Response: {"message": "Opening 'My World' with your cherished family memories and photos.", "action": {"type": "navigate", "screen": "FamiliarWorld"}, "actionDescription": "Opening My World"}

- User: "I took my morning medicine"
  Response: {"message": "Great job! I have marked your medication as taken.", "action": {"type": "markMedTaken", "name": "morning"}, "actionDescription": "Medication Marked Taken"}

- User: "how is my progress this week?"
  Response: {"message": "Let's check your cognitive scores and activity trends.", "action": {"type": "navigate", "screen": "Progress"}, "actionDescription": "Opening Progress"}

- User: "Hello, how are you?"
  Response: {"message": "Hello! I'm your AI health companion. I can help navigate the app, change display settings, check your medicines, or open brain games. What would you like to do?", "action": {"type": "none"}, "actionDescription": ""}

CRITICAL: Return raw JSON only. Do not wrap in markdown or backticks.`;
}

/**
 * Send a message and get an AGUI response with structured action.
 * @param {Array<{role: string, text: string}>} history
 * @param {string} newMessage
 * @param {object} [appContext]
 * @returns {Promise<{message: string, action: object, actionDescription?: string}>}
 */
export async function sendMessageToGemini(history, newMessage, appContext = null) {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.');
  }

  const systemInstruction = buildSystemPrompt(appContext);

  const contents = [
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: typeof msg.text === 'string' ? msg.text : JSON.stringify(msg.text) }],
    })),
    { role: 'user', parts: [{ text: newMessage }] },
  ];

  const errors = [];

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const body = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature: 0.4,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
          responseMimeType: 'application/json',
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const status = response.status;
        const errMsg = errData?.error?.message || `HTTP ${status}`;
        console.warn(`[Gemini] Model ${model} (${status}): ${errMsg}`);
        errors.push(`${model}: ${errMsg}`);

        if (status === 401 || status === 403) {
          throw new Error(`API key error (${status}): ${errMsg}\n\nPlease check your EXPO_PUBLIC_GEMINI_API_KEY.`);
        }
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        const reason = data?.candidates?.[0]?.finishReason || 'unknown';
        throw new Error(`Empty response (finishReason: ${reason})`);
      }

      console.log(`[Gemini AGUI] Success with model: ${model}`);

      try {
        const cleaned = rawText.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
        const parsed = JSON.parse(cleaned);
        return extractMessageAndAction(parsed, rawText);
      } catch (parseErr) {
        console.warn('[Gemini AGUI] JSON parse failed, extracting fallback:', parseErr);
        return {
          message: rawText.trim(),
          action: { type: 'none' },
          actionDescription: '',
        };
      }
    } catch (err) {
      if (err.message?.includes('API key error')) throw err;
      console.warn(`[Gemini] Error with ${model}:`, err.message);
      errors.push(`${model}: ${err.message}`);
    }
  }

  throw new Error(
    `All Gemini models failed:\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`
  );
}
