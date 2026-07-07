import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar, PatientFace, PremiumStat, PremiumProgressRing } from './primitives';
import { store, useTweaks } from '../game/store';
import { listEvalHistory, deleteEvalHistory, type EvalHistoryEntry } from '../data/evalHistory';

const VERDICT_COLOR: Record<EvalHistoryEntry['verdict'], string> = {
  excellent: 'var(--success-bg)',
  good: 'var(--success-bg)',
  satisfactory: 'var(--warning-bg)',
  borderline: 'var(--warning-bg)',
  'clear-fail': 'var(--error-bg)',
};

const VERDICT_LABEL: Record<EvalHistoryEntry['verdict'], string> = {
  excellent: 'Excellent',
  good: 'Good',
  satisfactory: 'Satisfactory',
  borderline: 'Borderline',
  'clear-fail': 'Clear fail',
};

function relativeDate(ms: number): string {
  const diffMs = Date.now() - ms;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const VERDICT_SCORE: Record<EvalHistoryEntry['verdict'], number> = {
  'clear-fail': 1,
  borderline: 2,
  satisfactory: 3,
  good: 4,
  excellent: 5,
};

const DOMAIN_META = [
  { key: 'data_gathering' as const, label: 'History & Examination', color: 'var(--indigo)', deep: 'var(--indigo-deep)' },
  { key: 'clinical_management' as const, label: 'Care Pathway', color: 'var(--violet)', deep: 'var(--violet-deep)' },
  { key: 'interpersonal' as const, label: 'Patient Rapport', color: 'var(--cyan)', deep: 'var(--cyan-deep)' },
];

interface TrainingStats {
  count: number;
  avgRating: number;
  domains: { key: 'data_gathering' | 'clinical_management' | 'interpersonal'; label: string; pct: number; color: string; deep: string }[];
  weakest: { label: string; pct: number; deep: string } | null;
  streakDays: number;
}

function computeStats(history: EvalHistoryEntry[]): TrainingStats {
  const count = history.length;
  if (count === 0) {
    return {
      count: 0,
      avgRating: 0,
      domains: DOMAIN_META.map((d) => ({ ...d, pct: 0 })),
      weakest: null,
      streakDays: 0,
    };
  }
  const avgRating = history.reduce((sum, e) => sum + (VERDICT_SCORE[e.verdict] ?? 0), 0) / count;
  const domains = DOMAIN_META.map((d) => {
    const ratios = history.map((e) => {
      const ds = e.evaluation.domain_scores[d.key];
      return ds && ds.max > 0 ? ds.raw / ds.max : null;
    }).filter((r): r is number => r !== null);
    const pct = ratios.length > 0 ? Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100) : 0;
    return { ...d, pct };
  });
  const weakestDomain = domains.reduce((min, d) => (d.pct < min.pct ? d : min), domains[0]);
  const weakest = { label: weakestDomain.label, pct: weakestDomain.pct, deep: weakestDomain.deep };
  const days = new Set(history.map((e) => new Date(e.savedAt).toISOString().slice(0, 10)));
  let streakDays = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streakDays += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return { count, avgRating, domains, weakest, streakDays };
}

export function HomeScreen() {
  const tweaks = useTweaks();
  const [history, setHistory] = useState<EvalHistoryEntry[]>([]);
  useEffect(() => {
    setHistory(listEvalHistory());
  }, []);
  const refresh = () => setHistory(listEvalHistory());
  const onDelete = (id: string) => {
    deleteEvalHistory(id);
    refresh();
  };
  const stats = computeStats(history);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="screen"
    >
      <TopBar here={0} steps={['Care Hub']} />

      <div style={{ padding: '32px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Hero section */}
        <div
          className="glass-panel"
          style={{
            padding: 32,
            marginBottom: 24,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 24,
            }}
          >
            <div style={{ flex: 1, minWidth: 280 }}>
              <div
                className="chip"
                style={{
                  marginBottom: 12,
                  background: 'var(--glass-highlight)',
                  color: 'var(--indigo)',
                }}
              >
                AI CARE OPERATIONS
              </div>
              <h1
                style={{
                  fontSize: 'clamp(28px, 4vw, 42px)',
                  margin: '0 0 12px',
                }}
              >
                {stats.count === 0 ? 'Your next case is ready' : 'Your AI care studio is live'}
              </h1>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'var(--ink-2)',
                  margin: 0,
                }}
              >
                {stats.count === 0
                  ? 'Launch a consultation, guide the patient conversation, and let the attending review every decision with grounded evidence.'
                  : 'Every encounter flows into a focused coaching loop for your next shift.'}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => store.setScreen('mode')}
                >
                  Start a consultation
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.history.pushState({}, '', '/agentic-rounds');
                    }
                    store.setScreen('agenticRounds');
                  }}
                >
                  Review the grading flow
                </button>
              </div>
            </div>

            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: 'var(--glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PatientFace
                style={tweaks.avatarStyle}
                skin="#f2c59d"
                hair="#101422"
                size={120}
                mood="neutral"
              />
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid-4" style={{ marginBottom: 24 }}>
          <PremiumStat
            value={stats.count > 0 ? String(stats.count) : '—'}
            label="Cases completed"
            sub={stats.count > 0 ? 'all time' : 'begin your journey'}
            color="var(--indigo)"
          />
          <PremiumStat
            value={stats.count > 0 ? stats.avgRating.toFixed(1) : '—'}
            label="Avg. score"
            sub={stats.count > 0 ? '/ 5 rating' : 'no data yet'}
            color="var(--violet)"
          />
          <PremiumStat
            value={stats.streakDays}
            label="Current streak"
            sub={stats.streakDays === 0 ? 'build momentum' : `${stats.streakDays}d active`}
            color="var(--cyan)"
          />
          <PremiumStat
            value={stats.weakest ? stats.weakest.pct : '—'}
            label="Focus area"
            sub={stats.weakest ? stats.weakest.label : 'not assessed'}
            color="var(--emerald)"
          />
        </div>

        {/* Domain performance */}
        <div
          className="card"
          style={{ marginBottom: 24 }}
        >
          <h3 style={{ margin: '0 0 16px' }}>Domain Performance</h3>
          <div className="grid-3">
            {stats.domains.map((d) => (
              <PremiumProgressRing
                key={d.key}
                value={d.pct}
                max={100}
                label={d.label}
                color={d.color}
              />
            ))}
          </div>
        </div>

        {/* Recent evaluations */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <h3 style={{ margin: 0 }}>Recent Evaluations</h3>
            {history.length > 0 && (
              <button
                type="button"
                className="btn"
                onClick={() => store.setScreen('history')}
                style={{ fontSize: 13 }}
              >
                View all →
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div
              style={{
                padding: 24,
                borderRadius: 'var(--r-lg)',
                border: '1px dashed var(--line)',
                textAlign: 'center',
                color: 'var(--ink-2)',
                fontWeight: 600,
              }}
            >
              No saved reviews yet — complete a consultation to see your AI debriefs here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {history.slice(0, 5).map((r) => (
                <div
                  key={r.id}
                  className="interactive"
                  onClick={() => store.viewEvalHistory(r.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--glass-subtle)',
                    border: '1px solid var(--line)',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: VERDICT_COLOR[r.verdict],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {VERDICT_LABEL[r.verdict][0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {r.caseName} <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>· {r.caseAge}{r.caseGender}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r.diagnosisLabel}</div>
                  </div>
                  <div
                    className="chip"
                    style={{
                      fontSize: 11,
                      background: VERDICT_COLOR[r.verdict],
                    }}
                  >
                    {VERDICT_LABEL[r.verdict]}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)', width: 80, textAlign: 'right' }}>
                    {relativeDate(r.savedAt)}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete review for ${r.caseName}?`)) onDelete(r.id);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--ink-2)',
                      cursor: 'pointer',
                      fontSize: 16,
                      fontWeight: 800,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}