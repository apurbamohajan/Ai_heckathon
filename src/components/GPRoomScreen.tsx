import { useState, useMemo } from 'react';
import { TopBar, IconStethoscope, IconFileText } from './primitives';
import { CASES, getCase } from '../data/cases';
import { CLINIC_IDS, CLINIC_LABELS, type ClinicId } from '../game/clinic';
import { store, useGameState } from '../game/store';

const CLINIC_ICON: Record<ClinicId, string> = {
  'all-specialties': '🌐',
  'internal-medicine': '🩺',
  cardiology: '❤️',
  neurology: '🧠',
  neurosurgery: '🧠',
  dermatology: '🌿',
  endocrinology: '🍯',
  gastroenterology: '🍽️',
  pulmonology: '🫁',
  nephrology: '💧',
  rheumatology: '🦴',
  hematology: '🩸',
  oncology: '🎗️',
  'infectious-disease': '🦠',
  'allergy-immunology': '🌼',
  psychiatry: '💭',
  obgyn: '🌷',
  urology: '💧',
  ophthalmology: '👁️',
  ent: '👂',
  orthopedics: '🦴',
  pmr: '🏃',
  pediatrics: '🧸',
  'general-surgery': '🔪',
  'cardiothoracic-vascular-surgery': '🫀',
};

function ActionPanel({
  number,
  title,
  description,
  icon,
  onClick,
  disabled = false,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={disabled ? '' : 'interactive'}
      onClick={disabled ? undefined : onClick}
      style={{
        background: disabled
          ? 'var(--glass-subtle)'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(0, 212, 255, 0.08))',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-xl)',
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 200ms ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--indigo), var(--violet))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--indigo)',
          }}
        >
          {number}
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: 22 }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
    </div>
  );
}

export function GPRoomScreen() {
  const state = useGameState();
  const activeClinic = state.polyclinic.clinic;
  const [pickerOpen, setPickerOpen] = useState(false);

  const clinicCases = useMemo(() => {
    if (activeClinic === 'all-specialties') return CASES;
    return CASES.filter((c) => c.clinic === activeClinic);
  }, [activeClinic]);

  const nextId = store.pickNextCaseId() ?? clinicCases[0]?.id ?? CASES[0]?.id;
  const next = nextId ? getCase(nextId) : null;

  const availableClinics = useMemo(() => {
    return CLINIC_IDS.filter(
      (id) => id === 'all-specialties' || CASES.some((c) => c.clinic === id),
    );
  }, []);

  return (
    <div className="screen" style={{ background: 'transparent', position: 'relative' }}>
      <TopBar here={1} steps={['Polyclinic', 'GP']} />

      <div style={{ padding: '24px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '0 0 8px' }}>
            How would you like to start?
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: 0 }}>
            Pick a polyclinic and the next patient on the bench will walk straight in. Or browse the case folder.
          </p>
        </div>

        {/* Clinic picker */}
        <div style={{ marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            className="btn"
            style={{
              width: '100%',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 15,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--ink-2)',
                }}
              >
                Specialty
              </span>
              <span>
                {CLINIC_ICON[activeClinic]} {CLINIC_LABELS[activeClinic]}
              </span>
            </span>
            <span style={{ fontWeight: 800, color: 'var(--ink-2)' }}>{pickerOpen ? '▴' : '▾'}</span>
          </button>

          {pickerOpen && (
            <div
              className="card"
              style={{
                marginTop: 12,
                padding: 16,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              {availableClinics.map((id) => {
                const isActive = activeClinic === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      store.setPolyclinicClinic(id);
                      setPickerOpen(false);
                    }}
                    className="chip"
                    style={{
                      cursor: 'pointer',
                      background: isActive ? 'var(--glass-highlight)' : undefined,
                    }}
                  >
                    {CLINIC_ICON[id]} {CLINIC_LABELS[id]}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Action panels */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          <ActionPanel
            number="01 · ACCEPT"
            title="Accept the next patient"
            description={
              next
                ? `${next.name} walks in next — straight into the consultation.`
                : `No cases queued for ${CLINIC_LABELS[activeClinic]} yet.`
            }
            icon={<IconStethoscope size={20} color="white" />}
            onClick={() => next && store.acceptNextPatient()}
            disabled={!next}
          />

          <ActionPanel
            number="02 · BROWSE"
            title="Pick from the charts"
            description="Open the case folder, filter by specialty or red-flag, attempted ribbons on completed."
            icon={<IconFileText size={20} color="white" />}
            onClick={() => store.setScreen('library')}
          />
        </div>

        {/* Back button */}
        <div style={{ marginTop: 32 }}>
          <button
            type="button"
            className="btn"
            onClick={() => store.setScreen('mode')}
          >
            ← Back to corridor
          </button>
        </div>
      </div>
    </div>
  );
}