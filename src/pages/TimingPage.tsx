const nowSignals = [
  'Execution slows unless you directly push it.',
  'Managers escalate instead of owning outcomes.',
  'You cannot confidently trust reporting signals.'
];

const laterSignals = [
  'Revenue dips, margin erosion, and missed commitments.',
  'Culture fatigue from constant urgency and unclear priorities.',
  'Founder burnout and strategy paralysis.'
];

export function TimingPage() {
  return (
    <section className="container page-stack">
      <p className="eyebrow">Decision Timing</p>
      <h1 className="page-title">Most companies are already late when they ask this question.</h1>
      <div className="two-grid">
        <article className="card">
          <h2>You need fractional leadership now if:</h2>
          <ul>
            {nowSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </article>
        <article className="card muted">
          <h2>Waiting usually looks like:</h2>
          <ul>
            {laterSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </article>
      </div>
      <a className="btn primary" href="https://calendly.com/mfackrell79/30min">
        Book a 30-minute Gap Review
      </a>
    </section>
  );
}
