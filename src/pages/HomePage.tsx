const outcomes = [
  'Stop being the bottleneck for high-impact decisions.',
  'Install operating rhythm and accountable ownership.',
  'Turn scattered leadership effort into predictable execution.'
];

export function HomePage() {
  return (
    <section className="container hero-grid">
      <div>
        <p className="eyebrow">Bridge the Executive Gap</p>
        <h1 className="hero-title">Move from founder-reliant to operator-led.</h1>
        <p className="hero-subtitle">
          C³ provides fractional executive leadership for companies that are growing faster than their current systems.
          We help owners reclaim strategic focus while execution quality goes up.
        </p>
        <div className="outcome-list">
          {outcomes.map((outcome) => (
            <p key={outcome}>✓ {outcome}</p>
          ))}
        </div>
        <div className="button-row">
          <a className="btn primary" href="https://calendly.com/mfackrell79/30min">
            Book Gap Review
          </a>
          <a className="btn secondary" href="/model">
            See the model
          </a>
        </div>
      </div>
      <div className="card">
        <h2>Is this your current reality?</h2>
        <ul>
          <li>Leadership escalates problems to you instead of solving them.</li>
          <li>Forecasting confidence is low and surprises are frequent.</li>
          <li>Operational drift is increasing as growth complexity rises.</li>
          <li>Your time is spent inside the business, not on it.</li>
        </ul>
      </div>
    </section>
  );
}
