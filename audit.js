const audit = {
  data: {},
  questions: [
    {
      id: 'ownership',
      q: 'When a major project stalls, who is the first person to notice and fix it?',
      opts: ['It’s always me.', 'A manager, but only after I ask about it.', 'A senior leader who owns that outcome entirely.']
    },
    {
      id: 'strategy',
      q: 'Does your leadership team bring you finished plans, or do they wait for your direction?',
      opts: ['I’m the primary engine.', 'We brainstorm, but I drive the final call.', 'They bring me data-backed strategies.']
    },
    {
      id: 'personnel',
      q: "How many of your executives were promoted because they were good 'doers' but lack exec-level ownership?",
      opts: ['Most of them—and it shows.', 'One or two are currently struggling.', 'None—we have seasoned operators in every seat.']
    },
    {
      id: 'vacation',
      q: 'If you went off-grid for 14 days, what would you come back to?',
      opts: ['A mountain of fires and stalled decisions.', "A business that survived, but didn't move forward.", 'A business that grew while I was away.']
    },
    {
      id: 'bottleneck',
      q: 'What is the #1 thing holding you back from your next revenue goal?',
      opts: ["I don't have enough time to manage everyone.", 'The people are there, but execution is sloppy.', 'We need a specific senior leader to own a seat.']
    }
  ],

  start() {
    this.data = {};
    const intro = document.getElementById('audit-intro');
    const qContainer = document.getElementById('question-container');
    if (intro) intro.style.display = 'none';
    if (qContainer) qContainer.style.display = 'block';
    this.showStep(1);
  },

  showStep(n) {
    const questionContainer = document.getElementById('question-container');
    const finalStep = document.getElementById('step-final');
    if (!questionContainer || !finalStep) return;

    if (n <= this.questions.length) {
      finalStep.style.display = 'none';
      const q = this.questions[n - 1];
      const html = `
        <div class="step active card">
          <span class="eyebrow" style="margin-bottom: 0;">Question ${n} of 5</span>
          <h3 style="margin: 12px 0 0; font-size: 22px;">${q.q}</h3>
          <div class="audit-options">
            ${q.opts.map((opt, idx) => `<button type="button" class="opt-btn" data-opt-index="${idx}">${opt}</button>`).join('')}
          </div>
        </div>
      `;
      questionContainer.innerHTML = html;

      questionContainer.querySelectorAll('.opt-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const index = Number(btn.dataset.optIndex);
          this.answer(q.id, q.opts[index], n + 1);
        });
      });
    } else {
      questionContainer.innerHTML = '';
      finalStep.style.display = 'block';
      if (typeof this.submit === 'function') this.submit();
    }
  },

  answer(key, val, next) {
    this.data[key] = val;

    if (typeof gtag === 'function') {
      gtag('event', 'audit_answer', {
        event_category: 'engagement',
        event_label: key,
        value: val
      });
    }

    if (typeof clarity === 'function') {
      clarity('set', 'last_question', key);
    }

    this.showStep(next);
  }
};


window.audit = audit;

document.addEventListener('DOMContentLoaded', () => {
  let latestResultText = '';
  let latestAuditEmail = '';
  const startBtn = document.getElementById('start-audit-btn');
  const auditDebug = new URLSearchParams(window.location.search).get('auditDebug') === '1';
  const debugLog = (...args) => {
    if (auditDebug) console.log('[audit.js]', ...args);
  };

  const ensureAuditDiagnostics = () => null;

  const writeDiag = () => {};

  const openModal = () => {
    const emailModal = document.getElementById('email-modal');
    const status = document.getElementById('email-status');
    if (status) status.innerText = '';
    if (emailModal) emailModal.style.display = 'flex';
  };

  const closeModal = () => {
    const emailModal = document.getElementById('email-modal');
    if (emailModal) emailModal.style.display = 'none';
  };

  document.addEventListener('click', (e) => {
    if (e.target.id === 'email-results-btn') {
      openModal();
    }

    if (e.target.id === 'close-email-modal') {
      closeModal();
    }
  });

  document.addEventListener('click', async (e) => {
    if (e.target.id === 'send-email-btn') {
      const emailInput = document.getElementById('email-input');
      const status = document.getElementById('email-status');
      const email = String(emailInput?.value || '').trim();

      if (!status) return;

      if (!email) {
        status.innerText = 'Please enter a valid email.';
        return;
      }

      status.innerText = 'Sending...';

      if (!latestResultText) {
        status.innerText = 'Your result is still loading. Please try again in a moment.';
        return;
      }

      try {
        await fetch('https://hooks.zapier.com/hooks/catch/19867794/ulikhom/', {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            result: latestResultText,
            source: 'CEO Bottleneck Audit'
          })
        });

        status.innerText = 'Sent. Check your inbox.';
        setTimeout(closeModal, 1500);
      } catch (err) {
        status.innerText = 'Something went wrong. Try again.';
      }
    }
  });

  const escapeHtml = (value) => String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

  const formatAuditResponse = (text) => {
    const sections = {
      title: '',
      diagnosis: '',
      costs: [],
      fix: '',
      next: ''
    };

    const lines = String(text || '').split('\n').map((line) => line.trim()).filter(Boolean);
    let current = '';
    const extractHeaderValue = (line, header) => {
      const matcher = new RegExp(`^[*\\s]*${header}[*\\s]*:[*\\s]*(.*)$`, 'i');
      return line.replace(matcher, '$1').trim();
    };

    lines.forEach((line) => {
      const cleanLine = line.replace(/\*/g, '').toUpperCase();

      if (cleanLine.startsWith('TITLE:')) {
        sections.title = extractHeaderValue(line, 'TITLE');
        current = 'title';
      } else if (cleanLine.startsWith('DIAGNOSIS:')) {
        sections.diagnosis = extractHeaderValue(line, 'DIAGNOSIS');
        current = 'diagnosis';
      } else if (cleanLine.includes('WHAT THIS COSTS YOU')) {
        current = 'costs';
      } else if (cleanLine.startsWith('THE COMPOUNDING FIX:')) {
        sections.fix = extractHeaderValue(line, 'THE COMPOUNDING FIX');
        current = 'fix';
      } else if (cleanLine.startsWith('NEXT STEP:')) {
        sections.next = extractHeaderValue(line, 'NEXT STEP');
        current = 'next';
      } else if (current === 'costs' && (line.startsWith('-') || line.startsWith('•'))) {
        sections.costs.push(line.replace(/^[-•]/, '').trim());
      } else if (current === 'diagnosis') {
        sections.diagnosis = `${sections.diagnosis} ${line}`.trim();
      } else if (current === 'fix') {
        sections.fix = `${sections.fix} ${line}`.trim();
      } else if (current === 'next') {
        sections.next = `${sections.next} ${line}`.trim();
      }
    });

    if (!sections.title && !sections.diagnosis && !sections.costs.length && !sections.fix && !sections.next) {
      return `<div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(text)}</div>`;
    }

    const title = escapeHtml(sections.title || 'Your Ownership Gap Diagnostic');
    const diagnosis = escapeHtml(sections.diagnosis || 'No diagnosis was returned.');
    const costs = sections.costs.length
      ? sections.costs.map((cost) => `<li>${escapeHtml(cost)}</li>`).join('')
      : '<li>No specific costs were provided.</li>';
    const fix = escapeHtml(sections.fix || 'No fix was returned.');
    const next = escapeHtml(sections.next || 'No next step was returned.');

    return `
      <div class="audit-report">
        <div class="audit-title">${title}</div>

        <div class="audit-section">
          <h4>Diagnosis</h4>
          <p>${diagnosis}</p>
        </div>

        <div class="audit-section">
          <h4>What this costs you</h4>
          <ul class="audit-list">${costs}</ul>
        </div>

        <div class="audit-section audit-highlight">
          <h4>The fix</h4>
          <p>${fix}</p>
        </div>

        <div class="audit-section">
          <h4>Next step</h4>
          <p>${next}</p>
        </div>
      </div>
    `;
  };

  const renderLoading = () => {
    const resultEl = document.getElementById('audit-result');
    if (!resultEl) return;
    resultEl.innerHTML = `
      <div class="audit-loading">
        <div class="audit-spinner-row">
          <div class="audit-spinner"></div>
          <div style="font-weight:700;">Building your scorecard…</div>
        </div>
        <div class="audit-progress">
          <div class="audit-step active" data-step="1"><span class="audit-dot"></span><span>Interpreting your answers</span></div>
          <div class="audit-step" data-step="2"><span class="audit-dot"></span><span>Diagnosing the ownership gap</span></div>
          <div class="audit-step" data-step="3"><span class="audit-dot"></span><span>Writing your action plan</span></div>
        </div>
        <div class="text-muted" style="font-size:13px;">Usually takes 3–8 seconds.</div>
      </div>
    `;
  };

  const setStep = (n) => {
    const resultEl = document.getElementById('audit-result');
    if (!resultEl) return;
    const steps = resultEl.querySelectorAll('.audit-step');
    steps.forEach((el) => {
      const s = Number(el.dataset.step);
      el.classList.remove('active', 'done');
      if (s < n) el.classList.add('done');
      if (s === n) el.classList.add('active');
    });
  };

  const runAuditGeneration = async () => {
    const finalStep = document.getElementById('step-final');
    if (!finalStep) return;
    if (finalStep.dataset.busy === '1') return;
    finalStep.dataset.busy = '1';

    const payload = {
      source: 'CEO Bottleneck Audit',
      ...audit.data
    };

    debugLog('submitting audit payload', { answerKeys: Object.keys(audit.data) });
    writeDiag('submit', { answerCount: Object.keys(audit.data).length });

    renderLoading();
    setStep(1);
    const t1 = setTimeout(() => setStep(2), 900);
    const t2 = setTimeout(() => setStep(3), 1800);

    if (typeof gtag === 'function') {
      gtag('event', 'audit_submit', {
        event_category: 'conversion',
        event_label: 'scorecard_completed'
      });
    }

    if (typeof clarity === 'function') {
      clarity('set', 'audit_completed', 'true');
    }

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      debugLog('api response', { status: response.status, ok: response.ok });
      writeDiag('api response', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        writeDiag('api error body', err);
        throw new Error(err?.details || err?.error || `Submission failed with ${response.status}`);
      }

      const data = await response.json();
      const resultText = String(data?.result || '');
      latestResultText = resultText;
      debugLog('api success payload', {
        model: data?.model,
        finishReason: data?.finishReason,
        complete: data?.complete,
        resultLength: resultText.length
      });
      writeDiag('api success', {
        model: data?.model,
        finishReason: data?.finishReason,
        complete: data?.complete,
        resultLength: resultText.length
      });

      clearTimeout(t1);
      clearTimeout(t2);
      setStep(4);

      const resultEl = document.getElementById('audit-result');
      if (resultEl) {
        const incompleteNote = data?.complete
          ? ''
          : '<div style="margin-top:10px;color:#b45309;font-size:12px;">Note: response may be truncated. Please retry if this result looks incomplete.</div>';

        resultEl.innerHTML = `
          ${formatAuditResponse(resultText)}
          ${incompleteNote}

          <div style="margin-top:20px;">
            <button id="email-results-btn" class="btn-primary">
              Email Me My Results
            </button>
          </div>
        `;
      }
    } catch (err) {
      console.error(err);
      debugLog('submit failed', String(err?.message || err));
      writeDiag('submit failed', { message: String(err?.message || err) });
      const resultEl = document.getElementById('audit-result');
      if (resultEl) {
        resultEl.innerHTML = `<div style="color:#b91c1c;font-weight:600;">Unable to generate your scorecard right now. ${String(err?.message || '')}</div>`;
      }
    } finally {
      finalStep.dataset.busy = '0';
    }
  };

  audit.submit = async () => {
    const gate = document.getElementById('audit-gate');
    const gatePost = document.getElementById('audit-gate-post');
    const resultEl = document.getElementById('audit-result');
    if (gatePost) gatePost.style.display = 'block';
    if (gate) gate.style.display = 'block';
    if (resultEl) {
      resultEl.innerHTML = '<div class="text-muted" style="font-size:14px;">Submit your email above to unlock your ownership gap diagnosis.</div>';
    }
  };

  const unlockBtn = document.getElementById('unlock-audit-btn');
  if (unlockBtn) {
    unlockBtn.addEventListener('click', async () => {
      const emailInput = document.getElementById('audit-email');
      const email = String(emailInput?.value || '').trim();
      if (!email || !email.includes('@')) {
        if (emailInput) emailInput.focus();
        return;
      }
      latestAuditEmail = email;
      const gate = document.getElementById('audit-gate');
      if (gate) gate.style.display = 'none';
      await runAuditGeneration();
    });
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (typeof gtag === 'function') {
        gtag('event', 'audit_start', {
          event_category: 'engagement',
          event_label: 'scorecard_start'
        });
      }

      if (typeof clarity === 'function') {
        clarity('set', 'audit_started', 'true');
      }

      audit.start();
    });
  }
});
