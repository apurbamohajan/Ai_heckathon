import { PatientFace, TopBar } from './primitives';
import { getCase, getPatientCase } from '../data/cases';
import { store, useStore, useTweaks } from '../game/store';

interface VitalCard {
  label: string;
  value: string;
  unit: string;
  color: string;
  icon: string;
}

function buildVitals(p?: { hr: number; bp: string; spo2: number; temp: number; rr: number }): VitalCard[] {
  return [
    { label: 'HR', value: String(p?.hr ?? 88), unit: 'bpm', color: 'var(--rose)', icon: '❤' },
    { label: 'BP', value: p?.bp ?? '120/80', unit: 'mmHg', color: 'var(--peach)', icon: '⌥' },
    { label: 'RR', value: String(p?.rr ?? 16), unit: '/min', color: 'var(--sky)', icon: '~' },
    { label: 'SpO₂', value: String(p?.spo2 ?? 98), unit: '%', color: 'var(--mint)', icon: '○' },
    { label: 'Temp', value: (p?.temp ?? 36.7).toFixed(1), unit: '°C', color: 'var(--butter)', icon: '☼' },
  ];
}

export function BriefScreen() {
  const tweaks = useTweaks();
  const caseId = useStore((s) => s.selectedCaseId);
  const c = getCase(caseId);
  const patient = getPatientCase(caseId);
  const VITALS = buildVitals(patient?.vitals);
  const chiefComplaint = patient?.chiefComplaint ?? c.complaint;
  const arrivalBlurb = patient?.arrivalBlurb ?? 'Looks well. No acute distress.';
  const severityChip =
    patient?.severity === 'critical'
      ? { label: 'Critical · Resuscitate', tone: 'var(--error)' }
      : patient?.severity === 'urgent'
        ? { label: 'Urgent', tone: 'var(--warning)' }
        : { label: 'First Presentation', tone: 'var(--indigo)' };

  return (
    <div className="screen" style={{ position: 'relative', background: 'transparent' }}>
      <TopBar here={3} steps={['Consult Room', 'GP', 'Case', 'Brief']} />

      <div
        style={{
          padding: '24px 24px 40px',
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: 24,
          }}
        >
          {/* Left: Patient brief */}
          <div
            className="card"
            style={{
              padding: 28,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                className="chip"
                style={{
                  background: 'var(--glass-highlight)',
                  color: 'var(--indigo)',
                }}
              >
                DOORWAY BRIEF
              </div>
              <div className="chip" style={{ fontSize: 11 }}>
                Case #{caseId?.slice(-3) ?? '000'}
              </div>
            </div>

            <h2 style={{ margin: '0 0 8px', fontSize: 28 }}>{c.name}</h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--ink-2)' }}>
              {c.age} y · {c.sex === 'F' ? 'Female' : 'Male'} · {c.cond}
            </p>

            <div
              style={{
                background: 'var(--glass-subtle)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-lg)',
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ink-2)',
                  marginBottom: 6,
                }}
              >
                Chief Complaint
              </div>
              <p style={{ margin: 0, fontSize: 16, fontStyle: 'italic' }}>
                "{chiefComplaint}"
              </p>
            </div>

            <div
              style={{
                background: 'var(--glass-subtle)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-lg)',
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ink-2)',
                  marginBottom: 6,
                }}
              >
                On the bench
              </div>
              <p style={{ margin: 0, fontSize: 14 }}>{arrivalBlurb}</p>
            </div>

            <div
              style={{
                background: 'linear-gradient(135deg, var(--indigo), var(--violet))',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-lg)',
                padding: 16,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: 8,
                }}
              >
                Your Task
              </div>
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 14, color: 'white' }}>
                <li style={{ marginBottom: 4 }}>Take a focused history</li>
                <li style={{ marginBottom: 4 }}>Examine if appropriate</li>
                <li>Agree a plan with the patient</li>
              </ol>
            </div>
          </div>

          {/* Right: Patient info and vitals */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Patient card */}
            <div
              className="card"
              style={{
                padding: 20,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PatientFace
                  style={tweaks.avatarStyle}
                  skin={c.skin}
                  hair={c.hair}
                  size={70}
                  mood={c.mood}
                  accessory={c.accessory}
                />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{c.name.split(' ')[0]}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Currently waiting</div>
                <div
                  className="chip"
                  style={{
                    marginTop: 6,
                    fontSize: 11,
                    background: severityChip.tone,
                    color: 'white',
                  }}
                >
                  {severityChip.label}
                </div>
              </div>
            </div>

            {/* Vitals */}
            <div className="card" style={{ padding: 20 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ink-2)',
                  marginBottom: 12,
                }}
              >
                Triage Vitals
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 8,
                }}
              >
                {VITALS.map((v) => (
                  <div
                    key={v.label}
                    style={{
                      background: v.color,
                      border: '1px solid var(--line)',
                      borderRadius: 'var(--r-lg)',
                      padding: '10px 6px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 16 }}>{v.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1 }}>{v.value}</div>
                    <div style={{ fontSize: 10, fontWeight: 600 }}>
                      {v.label} <span style={{ opacity: 0.6 }}>{v.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time indicator */}
            <div className="card" style={{ padding: 20 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'var(--ink-2)',
                    }}
                  >
                    Your Time
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--peach)' }}>8:00</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 28,
                        borderRadius: 4,
                        background: 'var(--indigo)',
                        border: '1px solid var(--line)',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: 18, padding: '16px 0' }}
              onClick={() => store.setScreen('encounter')}
            >
              Knock and enter →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}