// ============================================================
// CrashGuide Texas - LLM Service
// ============================================================
// Two-pass LLM pattern:
// 1. User-facing helpful response
// 2. Hidden JSON extraction for lead packet

import { ChatMessage, ChatMode, AccidentReport } from '../types';
import { SYSTEM_PROMPTS, EXTRACTION_PROMPT } from '../constants/prompts';

// Configuration - supports OpenAI-compatible APIs and Anthropic
// Only attempts API calls when EXPO_PUBLIC_LLM_API_KEY is set
const LLM_API_KEY = (process.env.EXPO_PUBLIC_LLM_API_KEY || '').trim();

const LLM_CONFIG = {
  apiUrl: process.env.EXPO_PUBLIC_LLM_API_URL || 'https://api.openai.com/v1/chat/completions',
  apiKey: LLM_API_KEY,
  model: process.env.EXPO_PUBLIC_LLM_MODEL || 'gpt-4o-mini',
  maxTokens: 1024,
  get isConfigured(): boolean {
    return LLM_API_KEY.length > 0;
  },
  get provider(): 'openai-compatible' | 'anthropic' {
    if (this.apiUrl.includes('anthropic.com')) return 'anthropic';
    return 'openai-compatible';
  },
};

interface LLMResponse {
  content: string;
  extractedData?: Partial<AccidentReport>;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  mode: ChatMode,
): Promise<LLMResponse> {
  const systemPrompt = SYSTEM_PROMPTS[mode];

  // If no API key is configured, use the built-in response generator
  if (!LLM_CONFIG.isConfigured) {
    return generateLocalResponse(messages, mode);
  }

  try {
    const isAnthropic = LLM_CONFIG.provider === 'anthropic';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let body: string;

    if (isAnthropic) {
      headers['x-api-key'] = LLM_CONFIG.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = JSON.stringify({
        model: LLM_CONFIG.model,
        max_tokens: LLM_CONFIG.maxTokens,
        system: systemPrompt,
        messages: messages
          .filter((m) => m.role !== 'system')
          .map((m) => ({ role: m.role, content: m.content })),
      });
    } else {
      // OpenAI-compatible format (Kimi/Moonshot, OpenAI, etc.)
      headers['Authorization'] = `Bearer ${LLM_CONFIG.apiKey}`;
      body = JSON.stringify({
        model: LLM_CONFIG.model,
        max_tokens: LLM_CONFIG.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
            .filter((m) => m.role !== 'system')
            .map((m) => ({ role: m.role, content: m.content })),
        ],
      });
    }

    const response = await fetch(LLM_CONFIG.apiUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data = await response.json();

    // Parse response based on provider format
    const content = isAnthropic
      ? data.content?.[0]?.text
      : data.choices?.[0]?.message?.content;

    return { content: content || 'I apologize, but I had trouble responding. Could you try again?' };
  } catch (error) {
    console.error('LLM API error:', error);
    return generateLocalResponse(messages, mode);
  }
}

export async function extractReportData(
  messages: ChatMessage[],
): Promise<Partial<AccidentReport>> {
  if (!LLM_CONFIG.isConfigured) {
    return extractLocally(messages);
  }

  try {
    const conversationText = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const isAnthropic = LLM_CONFIG.provider === 'anthropic';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let body: string;

    if (isAnthropic) {
      headers['x-api-key'] = LLM_CONFIG.apiKey;
      headers['anthropic-version'] = '2023-06-01';
      body = JSON.stringify({
        model: LLM_CONFIG.model,
        max_tokens: 512,
        system: EXTRACTION_PROMPT,
        messages: [{ role: 'user', content: conversationText }],
      });
    } else {
      headers['Authorization'] = `Bearer ${LLM_CONFIG.apiKey}`;
      body = JSON.stringify({
        model: LLM_CONFIG.model,
        max_tokens: 512,
        messages: [
          { role: 'system', content: EXTRACTION_PROMPT },
          { role: 'user', content: conversationText },
        ],
      });
    }

    const response = await fetch(LLM_CONFIG.apiUrl, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      throw new Error(`Extraction API error: ${response.status}`);
    }

    const data = await response.json();
    const text = isAnthropic
      ? data.content?.[0]?.text || '{}'
      : data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(text);
  } catch (error) {
    console.error('Extraction error:', error);
    return extractLocally(messages);
  }
}

// ----- Local fallback responses (no API key needed) -----

function generateLocalResponse(
  messages: ChatMessage[],
  mode: ChatMode,
): LLMResponse {
  const lastMessage = messages[messages.length - 1];
  const userText = lastMessage?.content?.toLowerCase() || '';

  switch (mode) {
    case 'urgent':
      return generateUrgentResponse(userText, messages.length);
    case 'document':
      return generateDocumentResponse(userText, messages.length);
    case 'intake':
      return generateIntakeResponse(userText, messages.length);
    case 'connect':
      return generateConnectResponse(userText, messages.length);
    default:
      return { content: 'How can I help you?' };
  }
}

function generateUrgentResponse(userText: string, messageCount: number): LLMResponse {
  // Check for emergency keywords
  if (
    userText.includes('bleeding') ||
    userText.includes('unconscious') ||
    userText.includes('can\'t move') ||
    userText.includes('cant move') ||
    userText.includes('can\'t breathe')
  ) {
    return {
      content:
        'This sounds like it could be a medical emergency. Please call 911 immediately if you haven\'t already.\n\nWhile you wait for help:\n- Stay as still as possible\n- If someone is bleeding, apply gentle pressure with a clean cloth\n- Stay on the line with 911 \u2014 they can guide you\n\nAre emergency services on the way?',
    };
  }

  if (messageCount <= 2) {
    return {
      content:
        'I\'m here to help. Let\'s take this one step at a time.\n\n**First \u2014 are you in a safe place right now?** Are you off the road and away from traffic?\n\nIf anyone is seriously injured, please call **911** right away.',
    };
  }

  if (userText.includes('safe') || userText.includes('yes') || userText.includes('ok')) {
    return {
      content:
        'Good, I\'m glad you\'re safe. Here\'s what to do next:\n\n1. **Turn on your hazard lights** if you haven\'t already\n2. **Check for injuries** \u2014 yourself and any passengers\n3. **Call the police** if there\'s significant damage or any injuries\n4. **Don\'t move your vehicle** unless it\'s blocking traffic and it\'s safe to do so\n\nAre you or anyone else experiencing any pain or symptoms?',
    };
  }

  if (
    userText.includes('hurt') ||
    userText.includes('pain') ||
    userText.includes('neck') ||
    userText.includes('head') ||
    userText.includes('back')
  ) {
    return {
      content:
        'I\'m sorry to hear you\'re in pain. **Please seek medical attention** \u2014 even if it doesn\'t feel serious right now.\n\nSome injuries, especially whiplash and concussions, can take hours or days to fully show symptoms.\n\n**I recommend:**\n- Visit an ER or urgent care today\n- Tell them about the accident\n- Document all symptoms, even minor ones\n\nWould you like help documenting the accident, or would you like to speak with a Texas injury lawyer?',
    };
  }

  return {
    content:
      'Here are your next steps:\n\n1. **Document everything** \u2014 take photos of all vehicles, damage, license plates, and the scene\n2. **Exchange information** with the other driver (name, phone, insurance)\n3. **Get witness info** if anyone saw what happened\n4. **File a police report** if there are injuries or significant damage\n5. **See a doctor** within 72 hours, even if you feel fine\n\nWould you like me to help you document the accident step by step?',
  };
}

function generateDocumentResponse(userText: string, messageCount: number): LLMResponse {
  if (messageCount <= 2) {
    return {
      content:
        'Let\'s document your accident thoroughly. Good documentation protects your rights.\n\n**Start by taking photos of:**\n1. All vehicle damage (every angle)\n2. License plates of all vehicles involved\n3. The overall accident scene\n4. Any visible injuries\n\nTap the camera button below to start capturing photos. I\'ll help you organize everything.',
    };
  }

  if (userText.includes('photo') || userText.includes('picture') || userText.includes('took')) {
    return {
      content:
        'Great work documenting! Make sure you\'ve also captured:\n\n- **Road conditions** (wet, construction, potholes)\n- **Traffic signs or signals** near the scene\n- **Skid marks** or debris on the road\n- **Weather conditions**\n\nHave you exchanged information with the other driver yet? You\'ll want their:\n- Full name and phone number\n- Insurance company and policy number\n- Driver\'s license number\n- Vehicle make, model, and color',
    };
  }

  return {
    content:
      'Here\'s what else to document:\n\n- **Date and time** of the accident\n- **Exact location** (street names, landmarks)\n- **Weather and road conditions**\n- **Names and numbers of witnesses**\n- **Officer\'s name and badge number** (if police respond)\n- **Police report number**\n\nWould you like to start organizing this information for your records?',
  };
}

function generateIntakeResponse(userText: string, messageCount: number): LLMResponse {
  if (messageCount <= 2) {
    return {
      content:
        'I\'d like to understand what happened so I can point you in the right direction.\n\n**Can you tell me briefly what happened?** For example:\n- What type of accident was it? (car, truck, pedestrian, etc.)\n- Where did it happen?',
    };
  }

  if (messageCount <= 4) {
    return {
      content:
        'Thank you for sharing that. A couple more questions:\n\n- **Were you injured?** Any pain, even if it seems minor?\n- **Have you seen a doctor**, or do you plan to?',
    };
  }

  if (messageCount <= 6) {
    return {
      content:
        'I appreciate you sharing this. Just a few more details:\n\n- **Who do you think was at fault?** (It\'s okay if you\'re not sure)\n- **Were any commercial vehicles, trucks, or rideshare vehicles** (Uber/Lyft) involved?\n- **Was a police report filed?**',
    };
  }

  return {
    content:
      'Thank you \u2014 I have a good picture of your situation.\n\nBased on what you\'ve shared, I can connect you with a **Texas personal injury lawyer** who handles cases like this. The consultation is free and there\'s no obligation.\n\nWould you like me to connect you with a lawyer now?',
  };
}

function generateConnectResponse(userText: string, messageCount: number): LLMResponse {
  if (messageCount <= 2) {
    return {
      content:
        'I can connect you with a **Texas personal injury lawyer** who handles accident cases.\n\nHere\'s how it works:\n- You share your contact info\n- A qualified Texas lawyer will reach out to you\n- The initial consultation is **free and no-obligation**\n- You can ask questions and decide if you want to proceed\n\nTo get started, could you share your:\n- **First and last name**\n- **Phone number**\n- **Email address**',
    };
  }

  if (
    userText.includes('yes') ||
    userText.includes('sure') ||
    userText.includes('ok') ||
    userText.includes('connect')
  ) {
    return {
      content:
        'Before I connect you, I want to make sure:\n\n**Do you consent to sharing your accident information and contact details with a Texas personal injury lawyer?** They will use this information only to evaluate your situation and contact you.\n\nYour privacy is important \u2014 your information will not be sold or shared with anyone else.',
    };
  }

  return {
    content:
      'A Texas personal injury lawyer will be reaching out to you shortly. They\'ll review the details of your accident and let you know how they can help.\n\n**What to expect:**\n- You\'ll receive a call or text within 24 hours\n- The initial consultation is completely free\n- There\'s no obligation to hire anyone\n\nIn the meantime, remember to:\n- Seek medical attention if you haven\'t already\n- Keep documenting any symptoms\n- Don\'t discuss fault with the other driver\'s insurance\n\nIs there anything else I can help you with?',
  };
}

function extractLocally(messages: ChatMessage[]): Partial<AccidentReport> {
  const text = messages.map((m) => m.content.toLowerCase()).join(' ');

  const report: Partial<AccidentReport> = {};

  // Incident type detection
  if (text.includes('rear-end') || text.includes('rear end')) {
    report.incidentType = 'car_accident';
  } else if (text.includes('truck') || text.includes('18-wheel') || text.includes('semi')) {
    report.incidentType = 'truck_accident';
  } else if (text.includes('uber') || text.includes('lyft') || text.includes('rideshare')) {
    report.incidentType = 'rideshare_accident';
    report.rideshareInvolved = true;
  } else if (text.includes('pedestrian') || text.includes('walking') || text.includes('crosswalk')) {
    report.incidentType = 'pedestrian_accident';
  } else if (text.includes('bicycle') || text.includes('bike') || text.includes('cycling')) {
    report.incidentType = 'bicycle_accident';
  } else if (text.includes('scooter')) {
    report.incidentType = 'scooter_accident';
  } else if (text.includes('motorcycle')) {
    report.incidentType = 'motorcycle_accident';
  } else if (text.includes('car') || text.includes('vehicle') || text.includes('accident') || text.includes('crash')) {
    report.incidentType = 'car_accident';
  }

  // Injury detection
  if (text.includes('not hurt') || text.includes('no injuries') || text.includes('i\'m fine')) {
    report.injurySeverity = 'none';
  } else if (text.includes('severe') || text.includes('hospital') || text.includes('ambulance') || text.includes('emergency')) {
    report.injurySeverity = 'severe';
  } else if (text.includes('hurt') || text.includes('pain') || text.includes('sore') || text.includes('neck') || text.includes('back') || text.includes('head')) {
    report.injurySeverity = 'moderate';
  }

  // Medical care
  if (text.includes('doctor') || text.includes('er') || text.includes('hospital') || text.includes('medical')) {
    report.medicalCareReceived = true;
  }

  // Police report
  if (text.includes('police') || text.includes('officer') || text.includes('report')) {
    report.policeReportFiled = true;
  }

  // Commercial vehicle
  if (text.includes('truck') || text.includes('commercial') || text.includes('18-wheel') || text.includes('semi')) {
    report.commercialVehicleInvolved = true;
  }

  return report;
}
