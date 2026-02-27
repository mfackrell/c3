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
    if (intro) intro.style.display = 'none';
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
  const startBtn = document.getElementById('start-audit-btn');
  const auditDebug = new URLSearchParams(window.location.search).get('auditDebug') === '1';
  const debugLog = (...args) => {
    if (auditDebug) console.log('[audit.js]', ...args);
  };

  const ensureAuditDiagnostics = () => {
    let el = document.getElementById('audit-diagnostics');
    if (!el) {
      el = document.createElement('pre');
      el.id = 'audit-diagnostics';
      el.style.whiteSpace = 'pre-wrap';
      el.style.fontSize = '12px';
      el.style.padding = '10px';
      el.style.border = '1px dashed #cbd5e1';
      el.style.borderRadius = '8px';
      el.style.marginTop = '10px';
      el.style.background = '#f8fafc';
      const finalStep = document.getElementById('step-final');
      if (finalStep) finalStep.appendChild(el);
    }
    return el;
  };

  const writeDiag = (msg, data) => {
    const el = ensureAuditDiagnostics();
    const line = `[${new Date().toISOString()}] ${msg}${data ? ` ${JSON.stringify(data)}` : ''}`;
    el.textContent += (el.textContent ? '\n' : '') + line;
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

  audit.submit = async () => {
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
      debugLog('api success payload', { model: data?.model, resultLength: String(data?.result || '').length });
      writeDiag('api success', { model: data?.model, resultLength: String(data?.result || '').length });

      clearTimeout(t1);
      clearTimeout(t2);
      setStep(4);

      const resultEl = document.getElementById('audit-result');
      if (resultEl) {
        resultEl.innerHTML = `
          <div style="white-space: pre-wrap; line-height: 1.6;">
            ${String(data.result || '').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}
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
