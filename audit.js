const audit = {
    step: 0,
    data: {},
    questions: [
        {
            id: "ownership",
            q: "When a major project stalls, who is the first person to notice and fix it?",
            opts: ["It’s always me.", "A manager, but only after I ask about it.", "A senior leader who owns that outcome entirely."]
        },
        {
            id: "strategy",
            q: "Does your leadership team bring you finished plans, or do they wait for your direction?",
            opts: ["I’m the primary engine.", "We brainstorm, but I drive the final call.", "They bring me data-backed strategies."]
        },
        {
            id: "personnel",
            q: "How many of your executives were promoted because they were good 'doers' but lack exec-level ownership?",
            opts: ["Most of them—and it shows.", "One or two are currently struggling.", "None—we have seasoned operators in every seat."]
        },
        {
            id: "vacation",
            q: "If you went off-grid for 14 days, what would you come back to?",
            opts: ["A mountain of fires and stalled decisions.", "A business that survived, but didn't move forward.", "A business that grew while I was away."]
        },
        {
            id: "bottleneck",
            q: "What is the #1 thing holding back your next $5M in revenue?",
            opts: ["I don't have enough time to manage everyone.", "The people are there, but execution is sloppy.", "We need a specific senior leader to own a seat."]
        }
    ],

    start: function() {
        this.showStep(1);
    },

    showStep: function(n) {
        document.querySelectorAll('.step').forEach(s => s.style.display = 'none');
        
        if (n <= this.questions.length) {
            const q = this.questions[n-1];
            const html = `
                <div class="step active">
                    <span style="color: var(--gold); font-size: 11px; font-weight: 700;">QUESTION ${n} OF 5</span>
                    <h3 style="color: #fff; margin: 15px 0; font-size: 22px;">${q.q}</h3>
                    <div class="audit-options">
                        ${q.opts.map(opt => `<button type="button" class="opt-btn" onclick="audit.answer('${q.id}', '${opt}', ${n+1})">${opt}</button>`).join('')}
                    </div>
                </div>
            `;
            document.getElementById('question-container').innerHTML = html;
        } else {
            document.getElementById('question-container').innerHTML = '';
            document.getElementById('step-final').style.display = 'block';
        }
    },

    answer: function(key, val, next) {
        this.data[key] = val;
        this.showStep(next);
    }
};

// Form Submission to Zapier
document.getElementById('interactive-scorecard-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submit-audit');
    btn.innerText = "ANALYZING...";
    btn.disabled = true;

    const payload = {
        name: document.getElementById('lead-name').value,
        email: document.getElementById('lead-email').value,
        source: "CEO Bottleneck Audit",
        ...audit.data // This spreads all 5 questions into the Zapier payload
    };

    try {
        // REPLACE WITH YOUR ACTUAL ZAPIER WEBHOOK URL
        await fetch('YOUR_ZAPIER_WEBHOOK_URL', {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        document.getElementById('step-final').style.display = 'none';
        document.getElementById('audit-success').style.display = 'block';
    } catch (err) {
        console.error(err);
        btn.innerText = "TRY AGAIN";
        btn.disabled = false;
    }
});
