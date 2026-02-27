export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });

  try {
    const body = req.body || {};
    const { name = '', email = '', source = '', ...answers } = body;

    const prompt = [
      'You are generating a CEO-facing scorecard result for an "Ownership Gap" audit.',
      'Write in a blunt, high-trust, operator tone. No fluff. No jargon.',
      '',
      'Return EXACTLY this structure (plain text):',
      'TITLE: <8 words>',
      'DIAGNOSIS: <1-2 sentences>',
      'WHAT THIS COSTS YOU: <2 bullets>',
      'THE COMPOUNDING FIX: <1-2 sentences>',
      'NEXT STEP: <1 sentence CTA to book a 30-minute gap review>',
      '',
      'Inputs:',
      `Name: ${name}`,
      `Email: ${email}`,
      `Source: ${source}`,
      'Answers:',
      JSON.stringify(answers, null, 2)
    ].join('\n');

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    const geminiResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 400
        }
      })
    });

    if (!geminiResp.ok) {
      const errText = await geminiResp.text();
      return res.status(500).json({ error: 'Gemini error', details: errText });
    }

    const geminiJson = await geminiResp.json();
    const result =
      geminiJson?.candidates?.[0]?.content?.parts?.map(p => p.text).join('')?.trim() || '';

    return res.status(200).json({ result });
  } catch (e) {
    return res.status(500).json({ error: 'Server error', details: String(e?.message || e) });
  }
}
