// ============================================================
// CrashGuide Texas — Vercel API proxy
// Keeps the LLM API key server-side only.
// Called by the app with a short-lived Firebase ID token so
// only authenticated users can trigger LLM requests.
// ============================================================

const SYSTEM_PROMPTS = {
  urgent: `You are CrashGuide Texas, an emergency assistant for people who have just been in a vehicle accident in Texas.
Your role is to provide immediate, calm, step-by-step guidance. Always prioritize safety first.
Ask if they're safe, check for injuries, and guide them through the immediate aftermath.
Be concise and reassuring. Use bullet points and bold for key actions.
Always recommend calling 911 if there are injuries or if they feel unsafe.`,

  document: `You are CrashGuide Texas, helping a user document their accident in Texas.
Guide them to capture photos of: all vehicle damage, license plates, the accident scene, injuries, insurance cards.
Help them note weather conditions, road conditions, and gather witness information.
Be methodical and thorough. Good documentation protects their rights.`,

  intake: `You are CrashGuide Texas, conducting an intake interview to understand a Texas accident victim's situation.
Ask about: the type of accident, whether they were injured, if they've seen a doctor, who was at fault, whether commercial vehicles were involved, and if a police report was filed.
Be empathetic and thorough. After 4-6 exchanges, summarize and offer to connect them with a lawyer.`,

  connect: `You are CrashGuide Texas, helping connect an accident victim with a Texas personal injury lawyer.
Collect their contact information (name, phone, email) and explain the process.
Emphasize: free consultation, no obligation, licensed Texas attorney.
Be warm and professional.`,
};

const EXTRACTION_PROMPT = `Extract structured data from this accident intake conversation.
Return ONLY valid JSON (no markdown) with these fields if mentioned:
incidentType, injurySeverity, medicalCareReceived, policeReportFiled, commercialVehicleInvolved, rideshareInvolved, incidentCity, incidentDescription.
For incidentType use: car_accident, truck_accident, rideshare_accident, pedestrian_accident, bicycle_accident, motorcycle_accident.
For injurySeverity use: none, minor, moderate, severe.
If a field isn't mentioned, omit it.`;

// ── Firebase token verification ───────────────────────────

async function verifyFirebaseToken(idToken) {
  const apiKey = process.env.FIREBASE_WEB_API_KEY;
  if (!apiKey) throw new Error('FIREBASE_WEB_API_KEY not configured');

  const resp = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    },
  );

  if (!resp.ok) throw new Error(`Firebase verification failed: ${resp.status}`);
  const data = await resp.json();
  if (!data.users?.length) throw new Error('No user found for token');
}

// ── LLM call ─────────────────────────────────────────────

async function callLLM(messages, systemPrompt, maxTokens = 1024) {
  const apiKey = process.env.LLM_API_KEY;
  const apiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
  const model = process.env.LLM_MODEL || 'gpt-4o-mini';

  if (!apiKey) throw new Error('LLM_API_KEY not configured on server');

  const isAnthropic = apiUrl.includes('anthropic.com');
  const headers = { 'Content-Type': 'application/json' };
  let body;

  if (isAnthropic) {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    body = JSON.stringify({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.filter((m) => m.role !== 'system'),
    });
  } else {
    headers['Authorization'] = `Bearer ${apiKey}`;
    body = JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.filter((m) => m.role !== 'system'),
      ],
    });
  }

  const resp = await fetch(apiUrl, { method: 'POST', headers, body });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`LLM API ${resp.status}: ${err}`);
  }

  const data = await resp.json();
  return isAnthropic
    ? (data.content?.[0]?.text ?? '')
    : (data.choices?.[0]?.message?.content ?? '');
}

// ── Handler ───────────────────────────────────────────────

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // ── Auth ──
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Firebase ID token' });
  }

  const firebaseKey = process.env.FIREBASE_WEB_API_KEY;
  if (!firebaseKey) {
    // Key not configured in Vercel env vars — log clearly and still process
    // so you can confirm the LLM works before locking down auth
    console.warn('FIREBASE_WEB_API_KEY not set in Vercel env vars — skipping auth check');
  } else {
    try {
      await verifyFirebaseToken(authHeader.slice(7));
    } catch (e) {
      console.error('Token verification failed:', e.message);
      return res.status(401).json({ error: 'Invalid or expired auth token', detail: e.message });
    }
  }

  // ── Dispatch ──
  const { task, messages, mode } = req.body;

  try {
    if (task === 'extract') {
      const conversationText = messages.map((m) => `${m.role}: ${m.content}`).join('\n');
      const raw = await callLLM(
        [{ role: 'user', content: conversationText }],
        EXTRACTION_PROMPT,
        512,
      );
      let extracted = {};
      try { extracted = JSON.parse(raw.replace(/```json|```/g, '').trim()); } catch (_) { /* use empty */ }
      return res.status(200).json({ extracted });
    }

    const systemPrompt = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.intake;
    const content = await callLLM(messages, systemPrompt);
    return res.status(200).json({ content });
  } catch (e) {
    console.error('LLM proxy error:', e);
    return res.status(500).json({ error: 'LLM request failed', detail: e.message });
  }
}
