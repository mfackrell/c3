const phases = [
  {
    title: 'Stabilize',
    points: ['Audit execution, financial visibility, and leadership bandwidth.', 'Create immediate decision rights and operating cadence.']
  },
  {
    title: 'Systemize',
    points: ['Install practical scorecards, planning cycles, and ownership structures.', 'Define role clarity across leadership and management layers.']
  },
  {
    title: 'Scale',
    points: ['Build repeatable executive routines that survive growth.', 'Transition day-to-day burden away from owner dependency.']
  }
];

export function ModelPage() {
  return (
    <section className="container page-stack">
      <p className="eyebrow">The C³ Model</p>
      <h1 className="page-title">A practical executive operating system for owner-led companies.</h1>
      <div className="three-grid">
        {phases.map((phase) => (
          <article key={phase.title} className="card">
            <h2>{phase.title}</h2>
            <ul>
              {phase.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
