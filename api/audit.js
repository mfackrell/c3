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
      'You are an elite executive advisor and interim COO/CFO.',
      'Your tone is professional, sophisticated, and unflinchingly direct.',
      'Avoid conversational filler. Use high-impact, executive-level vocabulary.',
      'Analyze the following leadership audit data and provide a concise strategic diagnosis.',
      'Return EXACTLY this structure (do not use Markdown or bolding):',
      'TITLE: [Professional, high-impact headline]',
      'DIAGNOSIS: [A sophisticated 1-2 sentence analysis of the operational gap]',
      'WHAT THIS COSTS YOU: [Exactly 2 bullet points using high-level business metrics]',
      'THE COMPOUNDING FIX: [A strategic recommendation for immediate stabilization]',
      'NEXT STEP: [A clear, professional call to action]',
      '',
      'Inputs:',
      `Source: ${source}`,
      'Answers:',
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

    const expectedSections = [
      'TITLE:',
      'DIAGNOSIS:',
      'WHAT THIS COSTS YOU:',
      'THE COMPOUNDING FIX:',
      'NEXT STEP:'
    ];
    const hasAllSections = expectedSections.every((section) => result.includes(section));
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
