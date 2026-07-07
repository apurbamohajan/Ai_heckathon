import { TopBar, PremiumStat } from './primitives';
import { store } from '../game/store';
import { listEvalHistory } from '../data/evalHistory';

function TrendChart() {
  const series = [
    { color: 'var(--indigo)', pts: [40, 42, 38, 44, 46, 48, 52, 50, 55, 58, 54, 60] },
    { color: 'var(--violet)', pts: [55, 58, 60, 58, 62, 64, 66, 68, 68, 70, 72, 74] },
    { color: 'var(--cyan)', pts: [60, 62, 65, 64, 68, 70, 72, 74, 75, 76, 78, 76] },
  ];
  const W = 980;
  const H = 180;
  const P = 16;
  const x = (i: number) => P + (i / 11) * (W - 2 * P);
  const y = (v: number) => H - P - (v / 100) * (H - 2 * P);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 180 }}>
      {[0, 25, 50, 75, 100].map((g, i) => (
        <g key={i}>
          <line
            x1={P}
            y1={y(g)}
            x2={W - P}
            y2={y(g)}
            stroke="var(--line)"
            strokeWidth="1"
          />
          <text x={4} y={y(g) + 4} fontSize="9" fontFamily="Inter" fontWeight="600" fill="var(--ink-2)">
            {g}
          </text>
        </g>
      ))}
      {series.map((s, si) => (
        <g key={si}>
          <path
            d={s.pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {s.pts.map((v, i) => (
            <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="var(--glass)" stroke={s.color} strokeWidth="2" />
          ))}
        </g>
      ))}
    </svg>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        color: 'var(--ink-2)',
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 4,
          background: color,
          border: '1px solid var(--line)',
        }}
      />
      {label}
    </span>
  );
}

export function HistoryScreen() {
  const history = listEvalHistory();

  return (
    <div className="screen" style={{ background: 'transparent', overflowY: 'auto' }}>
      <TopBar here={1} steps={['Profile', 'History']} />

      <div style={{ padding: '24px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', margin: '0 0 4px' }}>
              Your training log
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
              The story is the trend, not any single case.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="chip" style={{ fontSize: 12 }}>
              last 30 days
            </span>
            <button
              type="button"
              className="btn"
              style={{ fontSize: 13, padding: '8px 14px' }}
              onClick={() => store.setScreen('home')}
            >
              ← Profile
            </button>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <PremiumStat value={String(history.length)} label="Total cases" sub="all time" color="var(--indigo)" />
          <PremiumStat value={String(history.filter((h) => h.verdict === 'excellent' || h.verdict === 'good').length)} label="Passed" sub="good/excellent" color="var(--success)" />
          <PremiumStat value={String(history.filter((h) => h.verdict === 'borderline' || h.verdict === 'clear-fail').length)} label="Needs work" sub="borderline/fail" color="var(--warning)" />
          <PremiumStat value={String(history.filter((h) => h.evaluation.safety_breach).length)} label="Safety breaches" sub="flagged" color="var(--error)" />
        </div>

        {/* Trend chart */}
        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-2)',
              marginBottom: 12,
            }}
          >
            Domain Trends · last 30 days
          </div>
          <TrendChart />
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 12,
              justifyContent: 'center',
              fontSize: 12,
            }}
          >
            <Legend color="var(--indigo)" label="Data Gathering" />
            <Legend color="var(--violet)" label="Clinical Management" />
            <Legend color="var(--cyan)" label="Interpersonal" />
          </div>
        </div>

        {/* Case timeline */}
        <div className="card" style={{ marginBottom: 24, padding: 20 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-2)',
              marginBottom: 16,
            }}
          >
            Case Timeline
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.length === 0 ? (
              <p style={{ color: 'var(--ink-2)', fontWeight: 600 }}>
                No cases completed yet. Start a consultation to build your history.
              </p>
            ) : (
              history.map((r, i) => (
                <div
                  key={r.id}
                  className="interactive"
                  onClick={() => store.viewEvalHistory(r.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 28px 1fr 100px 24px',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 8px',
                    borderBottom: i < history.length - 1 ? '1px solid var(--line)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>
                    {new Date(r.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background:
                        r.verdict === 'excellent' || r.verdict === 'good'
                          ? 'var(--success)'
                          : r.verdict === 'satisfactory'
                            ? 'var(--warning)'
                            : 'var(--error)',
                      border: '1px solid var(--line)',
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.caseName}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r.diagnosisLabel}</div>
                  </div>
                  <span
                    className="chip"
                    style={{
                      fontSize: 11,
                      background:
                        r.verdict === 'excellent' || r.verdict === 'good'
                          ? 'var(--success-bg)'
                          : r.verdict === 'satisfactory'
                            ? 'var(--warning-bg)'
                            : 'var(--error-bg)',
                    }}
                  >
                    {r.verdict}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink-2)' }}>›</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Focus area */}
        <div
          className="card"
          style={{
            marginBottom: 24,
            padding: 20,
            background: 'linear-gradient(135deg, var(--warning-bg), var(--error-bg))',
          }}
        >
          <div className="chip" style={{ marginBottom: 10, background: 'var(--glass)' }}>
            🎯 Focus Area
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
            {history.length > 0 ? 'Data Gathering' : 'No data yet'}
          </div>
          <p style={{ fontSize: 13, margin: 0 }}>
            {history.length > 0
              ? "You're missing ICE in 6 of your last 10 cases. Tomorrow's suggested case is built around it."
              : 'Complete cases to identify your focus area for improvement.'}
          </p>
        </div>

        {/* Guidelines touched */}
        <div className="card" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--ink-2)',
              marginBottom: 12,
            }}
          >
            Guidelines You've Touched
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['NICE NG136', 'NICE NG28', 'GINA 2025', 'ESC 2023', 'BSG 2024'].map((g) => (
              <span key={g} className="chip" style={{ fontSize: 11 }}>
                📖 {g}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}