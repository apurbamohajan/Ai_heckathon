import { TopBar, PatientFace } from './primitives';
import { getCase } from '../data/cases';
import { store, useStore, useTweaks } from '../game/store';
import type { EndConfirmChecks } from '../game/types';

interface Item {
  id: keyof EndConfirmChecks;
  label: string;
  sub: string;
}

const ITEMS: Item[] = [
  { id: 'sum', label: 'Have you summarised back to the patient?', sub: 'A short read-back of the story.' },
  { id: 'safe', label: 'Have you safety-netted?', sub: 'What to look for, when to come back.' },
  { id: 'ice', label: 'Have you addressed their ideas, concerns, expectations?', sub: 'Did the patient feel heard?' },
];

export function EndConfirmScreen() {
  const tweaks = useTweaks();
  const checked = useStore((s) => s.endConfirm);
  const caseId = useStore((s) => s.selectedCaseId);
  const c = getCase(caseId);

  return (
    <div className="screen" style={{ background: 'transparent', position: 'relative' }}>
      <TopBar here={5} steps={['Consult Room', 'GP', 'Case', 'Brief', 'Encounter', 'Wrap']} />

      <div
        style={{
          position: 'relative',
          inset: 0,
          top: 67,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <div
          className="glass-panel"
          style={{
            width: 'min(600px, 100%)',
            padding: 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
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
                size={50}
                mood="happy"
              />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 24 }}>Take a breath</h2>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)' }}>
                One last check — these affect your debrief. Tick what you actually did.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {ITEMS.map((it) => {
              const on = checked[it.id];
              return (
                <button
                  key={it.id}
                  type="button"
                  className="interactive"
                  onClick={() => store.toggleEndConfirm(it.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    background: on ? 'var(--success-bg)' : 'var(--glass)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-lg)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: on ? 'var(--success)' : 'var(--glass-subtle)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 16,
                      color: on ? 'white' : 'var(--ink-2)',
                      flexShrink: 0,
                    }}
                  >
                    {on ? '✓' : ''}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{it.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>{it.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              className="btn"
              style={{ flex: 1 }}
              onClick={() => store.setScreen('encounter')}
            >
              ← Back to the room
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1.4 }}
              onClick={() => store.setScreen('debrief')}
            >
              End consultation →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}