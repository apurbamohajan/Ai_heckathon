import { TopBar, IconStethoscope, IconBrain } from './primitives';
import { store } from '../game/store';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  available?: boolean;
  locked?: boolean;
  tags?: string[];
  onClick?: () => void;
}

function ModuleCard({ title, description, icon, available, locked, tags = [], onClick }: ModuleCardProps) {
  return (
    <div
      className={available ? 'interactive' : ''}
      onClick={available ? onClick : undefined}
      style={{
        background: locked
          ? 'var(--glass-subtle)'
          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-xl)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        cursor: locked ? 'default' : 'pointer',
        opacity: locked ? 0.5 : 1,
        transition: 'all 200ms ease',
        maxWidth: 320,
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
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: locked
              ? 'var(--glass-subtle)'
              : 'linear-gradient(135deg, var(--indigo), var(--violet))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{title}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>{description}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((t, i) => (
          <span
            key={i}
            className="chip"
            style={{
              fontSize: 11,
              background: available ? 'var(--glass-highlight)' : 'var(--glass-subtle)',
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ModeSelectScreen() {
  return (
    <div className="screen" style={{ background: 'transparent' }}>
      <TopBar here={0} showProfile />

      <div style={{ padding: '32px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '0 0 8px' }}>
            Choose your training mode
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: 0 }}>
            Select a clinical environment to begin your simulation
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          <ModuleCard
            title="Polyclinics"
            description="Outpatient consultations across 11 specialties. Choose a case, take history, examine, and agree on a management plan."
            icon={<IconStethoscope size={28} color="white" />}
            available
            tags={['Open now', '24 specialties']}
            onClick={() => store.setScreen('gpRoom')}
          />

          <ModuleCard
            title="AI Psychiatry OSCE"
            description="Medical students interview AI psychiatric patients with real-time voice interaction and structured assessment."
            icon={<IconBrain size={28} color="white" />}
            available
            tags={['Start simulation']}
            onClick={() => store.setScreen('mentalHealth')}
          />

          <ModuleCard
            title="Emergency Department"
            description="ED triage and resuscitation scenarios with critical care decision-making and time-pressure elements."
            icon={<IconStethoscope size={28} color="white" />}
            locked
            tags={['Coming soon']}
          />
        </div>
      </div>
    </div>
  );
}