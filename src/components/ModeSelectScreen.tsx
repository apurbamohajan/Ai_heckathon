import { useState } from 'react';
import { TopBar, IconStethoscope, IconBrain } from './primitives';
import { store } from '../game/store';

interface WingProps {
  wing: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  accent2: string;
  stat: { value: string; label: string };
  cta: string;
  onClick: () => void;
}

function WingPanel({ wing, title, description, icon, accent, accent2, stat, cta, onClick }: WingProps) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
      style={{
        position: 'relative',
        flex: '1 1 340px',
        maxWidth: 420,
        minHeight: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        padding: '30px 28px',
        borderRadius: 22,
        cursor: 'pointer',
        overflow: 'hidden',
        background: 'var(--glass)',
        border: '1px solid var(--line)',
        transform: hover ? 'translateY(-6px) rotate(-0.3deg)' : 'translateY(0) rotate(0deg)',
        boxShadow: hover
          ? `0 22px 40px -18px ${accent}66, 0 0 0 1px ${accent}55`
          : '0 1px 0 var(--line)',
        transition: 'transform 260ms cubic-bezier(.2,.8,.2,1), box-shadow 260ms ease, border-color 260ms ease',
      }}
    >
      {/* Left accent rail — the "door edge" */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: 5,
          background: `linear-gradient(180deg, ${accent}, ${accent2})`,
          opacity: hover ? 1 : 0.65,
          transition: 'opacity 260ms ease',
        }}
      />

      {/* Ambient wash unique to this wing */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at 100% 0%, ${accent}22, transparent 55%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: accent,
          }}
        >
          {wing}
        </span>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${accent}, ${accent2})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: hover ? `0 8px 20px -6px ${accent}88` : 'none',
            transition: 'box-shadow 260ms ease',
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ position: 'relative', flex: 1 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 25, letterSpacing: '-0.01em' }}>{title}</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--ink-2)' }}>{description}</p>
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          paddingTop: 16,
          borderTop: '1px solid var(--line)',
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1 }}>{stat.value}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-2)', marginTop: 4 }}>{stat.label}</div>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--ink)',
          }}
        >
          {cta}
          <span style={{ transform: hover ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 200ms ease' }}>
            →
          </span>
        </span>
      </div>
    </div>
  );
}

export function ModeSelectScreen() {
  return (
    <div className="screen" style={{ background: 'transparent' }}>
      <TopBar here={0} showProfile />

      <div style={{ padding: '32px 24px 40px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: '0 0 8px' }}>
            Choose your training mode
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-2)', margin: 0 }}>
            Two wings are open. Walk into either — your case load picks up where you left off.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: 24,
          }}
        >
          <WingPanel
            wing="Outpatient Wing"
            title="Consult Rooms"
            description="Outpatient consultations across 11 specialties. Choose a case, take a history, examine, and agree a management plan with the patient."
            icon={<IconStethoscope size={22} color="white" />}
            accent="var(--indigo)"
            accent2="var(--violet)"
            stat={{ value: '24', label: 'specialties open' }}
            cta="Open now"
            onClick={() => store.setScreen('gpRoom')}
          />

          <WingPanel
            wing="Behavioral Health Wing"
            title="AI Psychiatry OSCE"
            description="Interview AI psychiatric patients with real-time voice interaction, then get a structured assessment of your consultation."
            icon={<IconBrain size={22} color="white" />}
            accent="var(--violet)"
            accent2="var(--cyan)"
            stat={{ value: '10', label: 'case presentations' }}
            cta="Start simulation"
            onClick={() => store.setScreen('mentalHealth')}
          />
        </div>
      </div>
    </div>
  );
}