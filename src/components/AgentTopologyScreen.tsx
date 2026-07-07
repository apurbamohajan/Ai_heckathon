import { TopBar, IconStethoscope, IconHeart, IconActivity, IconShield, IconZap, IconUser, IconFileText } from './primitives';
import { store } from '../game/store';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  icon: React.ReactNode;
}

const NODES: Node[] = [
  { id: 'trainee', label: 'Trainee', x: 100, y: 120, color: 'var(--indigo)', icon: <IconUser size={20} color="white" /> },
  { id: 'voice', label: 'Voice Stack', x: 280, y: 120, color: 'var(--violet)', icon: <IconStethoscope size={20} color="white" /> },
  { id: 'log', label: 'Encounter Log', x: 460, y: 120, color: 'var(--cyan)', icon: <IconFileText size={20} color="white" /> },
  { id: 'attending', label: 'Attending', x: 640, y: 120, color: 'var(--success)', icon: <IconShield size={20} color="white" /> },
  { id: 'patient', label: 'Patient', x: 280, y: 280, color: 'var(--rose)', icon: <IconHeart size={20} color="white" /> },
  { id: 'tests', label: 'Tests', x: 460, y: 280, color: 'var(--amber)', icon: <IconActivity size={20} color="white" /> },
  { id: 'treatments', label: 'Treatments', x: 640, y: 280, color: 'var(--emerald)', icon: <IconZap size={20} color="white" /> },
];

const EDGES: Array<{ from: string; to: string }> = [
  { from: 'trainee', to: 'voice' },
  { from: 'trainee', to: 'log' },
  { from: 'voice', to: 'patient' },
  { from: 'log', to: 'attending' },
  { from: 'patient', to: 'attending' },
  { from: 'attending', to: 'tests' },
  { from: 'attending', to: 'treatments' },
];

export function AgentTopologyScreen() {
  return (
    <div className="screen" style={{ background: 'transparent', overflowY: 'auto' }}>
      <TopBar
        here={6}
        steps={['Polyclinic', 'GP', 'Case', 'Brief', 'Encounter', 'Debrief', 'Architecture']}
      />

      <div style={{ padding: '24px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>Agent Topology</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
            The data flow through the AI clinical simulation system.
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            marginBottom: 24,
          }}
        >
          <svg viewBox="0 0 800 400" style={{ width: '100%', height: 400 }}>
            {/* Edges */}
            {EDGES.map((e, i) => {
              const from = NODES.find((n) => n.id === e.from)!;
              const to = NODES.find((n) => n.id === e.to)!;
              return (
                <line
                  key={i}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="var(--line)"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              );
            })}

            {/* Nodes */}
            {NODES.map((n) => (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r="32"
                  fill={n.color}
                  stroke="var(--line)"
                  strokeWidth="2"
                />
                <foreignObject x={n.x - 32} y={n.y - 32} width="64" height="64">
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {n.icon}
                  </div>
                </foreignObject>
                <text
                  x={n.x}
                  y={n.y + 50}
                  textAnchor="middle"
                  fontFamily="Inter"
                  fontSize="12"
                  fontWeight="600"
                  fill="var(--ink-2)"
                >
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {NODES.map((n) => (
            <div key={n.id} className="card" style={{ padding: 16 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: n.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {n.icon}
                </div>
                <span style={{ fontWeight: 700 }}>{n.label}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: 0 }}>
                {n.id === 'trainee' && 'The medical student or doctor in training.'}
                {n.id === 'voice' && 'LiveKit + Deepgram + Cartesia for real-time voice interaction.'}
                {n.id === 'log' && 'Captures all actions during the encounter for debriefing.'}
                {n.id === 'attending' && 'Claude Managed Agent that grades the encounter.'}
                {n.id === 'patient' && 'AI patient persona with medical history and symptoms.'}
                {n.id === 'tests' && 'Laboratory and imaging tests available in the case.'}
                {n.id === 'treatments' && 'Medications and interventions for the case.'}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            className="btn"
            onClick={() => store.setScreen('home')}
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
}