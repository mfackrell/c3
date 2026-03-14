export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });

  const debug = process.env.AUDIT_DEBUG === 'true';
  const requestId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const log = (...args) => {
    if (debug) console.log('[api/audit]', requestId, ...args);
  };

  try {
    const startedAt = Date.now();
    const body = req.body || {};
    const { source = '', ...answers } = body;
    log('request received', {
      source,
      answerKeys: Object.keys(answers)
    });

    const prompt = [
      'Role: Elite Executive Advisor (Interim COO/CFO).',
      'Tone: Direct, professional, sophisticated, high-stakes.',
      'Task: Analyze leadership audit data and provide a concise strategic diagnosis.',
      'Vocabulary: Use terms like "valuation discounting," "autonomous scaling," and "operational cadence."',
      'Constraint: Do NOT use Markdown, bolding, or italics.',
      'Structure (Strictly follow this):',
      'TITLE: [8 words max]',
      'DIAGNOSIS: [25 words max]',
      'OPERATIONAL FRICTION: [2 bullets, 15 words each, start with "-"]',
      'THE STABILIZATION FIX: [25 words max]',
      'NEXT STEP: [12 words max]',
      '',
      'Answers:',
      `Source: ${source}`,
      JSON.stringify(answers, null, 2)
    ].join('\n');

    const requestedModel = process.env.GEMINI_MODEL || 'gemini-3.1-pro-preview';
    const modelFallbacks = ['gemini-2.5-pro', 'gemini-1.5-pro'];
    const modelsToTry = [requestedModel, ...modelFallbacks.filter((m) => m !== requestedModel)];
    log('model chain', modelsToTry);

    let selectedModel = requestedModel;
    let geminiJson = null;
    let lastErrorText = '';

    for (const model of modelsToTry) {
      selectedModel = model;
      const modelStart = Date.now();
      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const geminiResp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048
          }
        })
      });

      if (geminiResp.ok) {
        geminiJson = await geminiResp.json();
        log('model success', {
          model,
          status: geminiResp.status,
          elapsedMs: Date.now() - modelStart
        });
        log('FULL GEMINI RESPONSE', JSON.stringify(geminiJson, null, 2));
        break;
      }

      lastErrorText = await geminiResp.text();
      log('model failure', {
        model,
        status: geminiResp.status,
        elapsedMs: Date.now() - modelStart,
        detailsPreview: lastErrorText.slice(0, 240)
      });
    }

    if (!geminiJson) {
      log('all models failed', {
        totalElapsedMs: Date.now() - startedAt,
        modelTried: modelsToTry
      });
      return res.status(500).json({
        error: 'Gemini error',
        details: lastErrorText,
        modelTried: modelsToTry
      });
    }

    const firstCandidate = geminiJson?.candidates?.[0];
    const finishReason = firstCandidate?.finishReason || 'UNKNOWN';
    const result =
      firstCandidate?.content?.parts
        ?.filter((p) => typeof p?.text === 'string')
        .map((p) => p.text)
        .join('')
        ?.trim() || '';

    const normalizedResult = result.toUpperCase();
    const expectedSections = [
      /TITLE\s*:/,
      /DIAGNOSIS\s*:/,
      /OPERATIONAL\s+FRICTION\s*:/,
      /THE\s+STABILIZATION\s+FIX\s*:/,
      /NEXT\s+STEP\s*:/
    ];
    const hasAllSections = expectedSections.every((section) => section.test(normalizedResult));
    const isLikelyTruncated = finishReason !== 'STOP' || !hasAllSections;

    if (isLikelyTruncated) {
      log('truncated_or_incomplete_response', {
        selectedModel,
        finishReason,
        hasAllSections,
        resultLength: result.length,
        promptFeedback: geminiJson?.promptFeedback || null,
        safetyRatings: firstCandidate?.safetyRatings || []
      });
    }

    log('request complete', {
      selectedModel,
      finishReason,
      hasAllSections,
      totalElapsedMs: Date.now() - startedAt,
      resultLength: result.length
    });

    return res.status(200).json({
      result,
      model: selectedModel,
      finishReason,
      complete: hasAllSections
    });
  } catch (e) {
    log('handler exception', String(e?.message || e));
    return res.status(500).json({ error: 'Server error', details: String(e?.message || e) });
  }
}
