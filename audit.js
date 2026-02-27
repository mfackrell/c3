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
  const form = document.getElementById('interactive-scorecard-form');

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

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('submit-audit');
      if (!btn) return;
  
      btn.innerText = 'ANALYZING...';
      btn.disabled = true;
  
      const payload = {
        name: document.getElementById('lead-name')?.value || '',
        email: document.getElementById('lead-email')?.value || '',
        source: 'CEO Bottleneck Audit',
        ...audit.data
      };
  
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
  
        if (!response.ok) throw new Error(`Submission failed with ${response.status}`);
  
        const data = await response.json();
  
        document.getElementById('step-final').style.display = 'none';
        document.getElementById('audit-success').style.display = 'block';
  
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
        btn.innerText = 'TRY AGAIN';
        btn.disabled = false;
      }
    });
  }
});
