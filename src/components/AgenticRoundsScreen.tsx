import { Fragment, useState } from 'react';
import { TopBar, IconStethoscope, IconShield, IconUser, IconFileText } from './primitives';
import { GUIDELINES } from '../data/guidelines';
import { POLYCLINIC_CASES } from '../data/polyclinicPatients';
import { PATIENT_CASES } from '../data/patients';

const recCount = GUIDELINES.reduce((n, g) => n + g.recommendations.length, 0);

function collectAllCases() {
  let polyTotal = 0;
  let withRubric = 0;
  for (const [specialty, cases] of Object.entries(POLYCLINIC_CASES)) {
    if (specialty === 'all-specialties') continue;
    for (const c of cases) {
      polyTotal += 1;
      if (c.rubric) withRubric += 1;
    }
  }
  for (const c of PATIENT_CASES) {
    if (c.rubric) withRubric += 1;
  }
  return {
    total: polyTotal + PATIENT_CASES.length,
    withRubric,
    polyTotal,
    erTotal: PATIENT_CASES.length,
  };
}

const CASE_STATS = collectAllCases();

type TabKey = 'grading' | 'cases' | 'agent';

const TABS: Array<{ key: TabKey; label: string; sub: string }> = [
  { key: 'grading', label: 'Grading flow', sub: 'How the simulator grades you' },
  { key: 'cases', label: 'Cases', sub: 'How cases were produced' },
  { key: 'agent', label: 'The agent', sub: 'medkit-attending in detail' },
];

export function AgenticRoundsScreen() {
  const [tab, setTab] = useState<TabKey>('grading');

  return (
    <div className="screen" style={{ background: 'transparent', overflowY: 'auto' }}>
      <TopBar
        here={6}
        steps={['Consult Room', 'GP', 'Case', 'Brief', 'Encounter', 'Debrief', 'Architecture']}
      />

      <div style={{ padding: '24px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div>
            <div
              className="chip"
              style={{
                marginBottom: 12,
                background: 'var(--glass-highlight)',
                color: 'var(--indigo)',
              }}
            >
              AGENTIC ROUNDS
            </div>
            <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>
              {TABS.find((t) => t.key === tab)?.sub}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
              {CASE_STATS.total} cases · {CASE_STATS.withRubric} hero rubrics · {GUIDELINES.length} guidelines · {recCount} recs
            </p>
          </div>

          {/* Tab navigation */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className="btn"
                  style={{
                    background: active ? 'var(--glass-highlight)' : undefined,
                    fontSize: 14,
                    padding: '10px 16px',
                    minWidth: 180,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{t.sub}</div>
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          {tab === 'grading' && <GradingTab />}
          {tab === 'cases' && <CasesTab />}
          {tab === 'agent' && <AgentTab />}
        </div>
      </div>
    </div>
  );
}

function GradingTab() {
  return (
    <div className="card" style={{ padding: 24 }}>
      <h3 style={{ margin: '0 0 16px' }}>Grading Flow</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>
        Two flows wrap around one Managed Agent. <strong>Run-time</strong> is what happens during the encounter — voice, actions, debrief. <strong>Authoring</strong> is offline — society guidelines flow into a citation registry that the run-time agent must cite from.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginTop: 24,
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconUser size={20} color="var(--indigo)" />
            <span style={{ fontWeight: 700 }}>Trainee</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            Sees the 3D consult room, speaks to the patient out loud.
          </p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconStethoscope size={20} color="var(--violet)" />
            <span style={{ fontWeight: 700 }}>Voice Stack</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            LiveKit + Deepgram STT · Cartesia TTS · Haiku 4.5 patient persona.
          </p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconFileText size={20} color="var(--cyan)" />
            <span style={{ fontWeight: 700 }}>Encounter Log</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            Captures every action: questions, tests, treatments, prescriptions.
          </p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconShield size={20} color="var(--success)" />
            <span style={{ fontWeight: 700 }}>Attending</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            Claude Managed Agent · Opus 4.7 · scores three domains.
          </p>
        </div>
      </div>
    </div>
  );
}

function CasesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px' }}>Case Statistics</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 16,
          }}
        >
          <div className="metric">
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--indigo)' }}>{CASE_STATS.total}</div>
            <div className="metric-label">Total cases</div>
          </div>
          <div className="metric">
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--violet)' }}>{CASE_STATS.withRubric}</div>
            <div className="metric-label">Hero rubrics</div>
          </div>
          <div className="metric">
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--cyan)' }}>{GUIDELINES.length}</div>
            <div className="metric-label">Guidelines</div>
          </div>
          <div className="metric">
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)' }}>{recCount}</div>
            <div className="metric-label">Recommendations</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px' }}>The Authoring Pipeline</h3>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {['Society guideline', 'Curator skill', 'guidelines.ts', 'Rubric author', 'case.rubric'].map((step, i) => (
            <Fragment key={step}>
              <div className="chip" style={{ fontSize: 12 }}>
                {step}
              </div>
              {i < 4 && <span style={{ color: 'var(--ink-2)', fontWeight: 800 }}>→</span>}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px' }}>medkit-attending</h3>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)' }}>
          The senior clinician of the simulator. One agent observes the entire encounter and grades it at the end. Citation discipline is enforced at the system-prompt level.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginTop: 16,
          }}
        >
          <div className="metric">
            <div style={{ fontSize: 18, fontWeight: 800 }}>claude-opus-4-7</div>
            <div className="metric-label">Model</div>
          </div>
          <div className="metric">
            <div style={{ fontSize: 18, fontWeight: 800 }}>7</div>
            <div className="metric-label">Custom tools</div>
          </div>
          <div className="metric">
            <div style={{ fontSize: 18, fontWeight: 800 }}>2</div>
            <div className="metric-label">Modes</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px' }}>Hard Rules</h3>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.8 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Cite, don't invent</strong> — Every clinical_management criterion's guideline_ref MUST appear in the registry slice.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Specific evidence</strong> — Each verdict ties to a transcript quote or named action.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Safety first</strong> — A contraindicated drug or missed red-flag escalation populates safety_breach.
          </li>
          <li>
            <strong>No narration during encounter</strong> — The agent stays silent unless something is genuinely critical.
          </li>
        </ul>
      </div>
    </div>
  );
}