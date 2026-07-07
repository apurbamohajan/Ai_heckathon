import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { store } from '../game/store';

/* ── Premium Medical Icons ────────────────────────────────────────────────── */

export function IconStethoscope({ size = 24, color = 'var(--indigo)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a2 2 0 0 1 2-2 8 8 0 0 1 16 0 2 2 0 0 1-2 2" />
      <path d="M12 12V6" />
      <path d="M8 12V6a4 4 0 0 1 8 0v6" />
    </svg>
  );
}

export function IconHeart({ size = 24, color = 'var(--rose)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function IconBrain({ size = 24, color = 'var(--violet)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a8 8 0 0 0-8 8c0 2.2.8 4.2 2 5.7V18a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.3a7.9 7.9 0 0 0 2-5.7 8 8 0 0 0-8-8z" />
      <path d="M12 12v8" />
      <path d="M8 16h8" />
    </svg>
  );
}

export function IconActivity({ size = 24, color = 'var(--cyan)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function IconMicrophone({ size = 24, color = 'var(--indigo)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
    </svg>
  );
}

export function IconUser({ size = 24, color = 'var(--ink)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function IconFileText({ size = 24, color = 'var(--ink-2)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

export function IconShield({ size = 24, color = 'var(--emerald)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function IconZap({ size = 24, color = 'var(--amber)' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 8 22 15 10 9 10" />
    </svg>
  );
}

/* ── Patient Avatar (Premium) ─────────────────────────────────────────────── */

export type FaceMood = 'neutral' | 'happy' | 'sad' | 'sick' | 'worried';
export type FaceStyle = 'cute' | 'portrait' | 'animal' | 'initials';
export type FaceAccessory = 'thermometer' | 'bandage';

interface PatientFaceProps {
  name?: string;
  style?: FaceStyle;
  skin?: string;
  hair?: string;
  size?: number;
  mood?: FaceMood;
  accessory?: FaceAccessory;
}

export function PatientFace({
  name = 'Aisha',
  style = 'cute',
  skin = '#FFD8B5',
  hair = '#3B2A1F',
  size = 120,
  mood = 'neutral',
  accessory,
}: PatientFaceProps) {
  if (style === 'initials') {
    const initials = name.split(' ').map((s) => s[0]).slice(0, 2).join('');
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${hair}, ${hair}dd)`,
          color: 'white',
          fontWeight: 800,
          fontSize: size * 0.36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid var(--line)`,
          boxShadow: 'var(--glow)',
        }}
      >
        {initials}
      </div>
    );
  }
  if (style === 'animal') return <AnimalFace size={size} />;
  if (style === 'portrait') return <PortraitFace size={size} skin={skin} hair={hair} />;
  return <CuteFace size={size} skin={skin} hair={hair} mood={mood} accessory={accessory} />;
}

interface CuteFaceProps {
  size?: number;
  skin?: string;
  hair?: string;
  mood?: FaceMood;
  accessory?: FaceAccessory;
}

export function CuteFace({ size = 120, skin = '#FFD8B5', hair = '#3B2A1F', mood = 'neutral', accessory }: CuteFaceProps) {
  const stroke = 'var(--line)';
  const mouthByMood: Record<FaceMood, ReactNode> = {
    neutral: <path d="M 80 132 Q 100 142 120 132" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />,
    happy: <path d="M 78 128 Q 100 150 122 128" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />,
    sad: <path d="M 78 138 Q 100 124 122 138" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />,
    sick: <path d="M 80 134 Q 90 128 100 134 T 120 134" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />,
    worried: <path d="M 82 134 Q 100 130 118 134" stroke={stroke} strokeWidth="4" fill="none" strokeLinecap="round" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="100" cy="86" rx="74" ry="78" fill={hair} filter="url(#glow)" />
      <circle cx="100" cy="104" r="62" fill={skin} stroke={stroke} strokeWidth="2" />
      <ellipse cx="74" cy="118" rx="9" ry="6" fill="#FF9DAA" opacity="0.7" />
      <ellipse cx="126" cy="118" rx="9" ry="6" fill="#FF9DAA" opacity="0.7" />
      <g className="blink" style={{ transformOrigin: '100px 105px' }}>
        <circle cx="82" cy="105" r="5" fill={stroke} />
        <circle cx="118" cy="105" r="5" fill={stroke} />
      </g>
      {mouthByMood[mood] ?? mouthByMood.neutral}
      {accessory === 'thermometer' && (
        <g>
          <rect x="118" y="128" width="34" height="8" rx="4" fill="white" stroke={stroke} strokeWidth="2" transform="rotate(-15 130 132)" />
          <circle cx="120" cy="135" r="6" fill="#00d4ff" stroke={stroke} strokeWidth="2" />
        </g>
      )}
      {accessory === 'bandage' && (
        <g transform="translate(100 78) rotate(-12)">
          <rect x="-22" y="-7" width="44" height="14" rx="6" fill="#FFD3A8" stroke={stroke} strokeWidth="2" />
          <circle cx="-10" cy="0" r="1.6" fill={stroke} />
          <circle cx="0" cy="0" r="1.6" fill={stroke} />
          <circle cx="10" cy="0" r="1.6" fill={stroke} />
        </g>
      )}
    </svg>
  );
}

export function PortraitFace({ size = 120, skin = '#FFD8B5', hair = '#3B2A1F' }: { size?: number; skin?: string; hair?: string }) {
  const stroke = 'var(--line)';
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <rect x="10" y="10" width="180" height="180" rx="20" fill="var(--glass)" stroke={stroke} strokeWidth="2" />
      <circle cx="100" cy="160" r="60" fill={hair} />
      <ellipse cx="100" cy="100" rx="46" ry="54" fill={skin} stroke={stroke} strokeWidth="2" />
      <path d="M 56 86 Q 70 50 100 50 Q 130 50 144 86 Q 132 76 100 74 Q 68 76 56 86 Z" fill={hair} />
      <circle cx="86" cy="102" r="3" fill={stroke} />
      <circle cx="114" cy="102" r="3" fill={stroke} />
      <path d="M 90 130 Q 100 138 110 130" stroke={stroke} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function AnimalFace({ size = 120 }: { size?: number }) {
  const stroke = 'var(--line)';
  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      <circle cx="62" cy="68" r="22" fill="#C58F5E" stroke={stroke} strokeWidth="2" />
      <circle cx="138" cy="68" r="22" fill="#C58F5E" stroke={stroke} strokeWidth="2" />
      <circle cx="100" cy="108" r="68" fill="#D9A574" stroke={stroke} strokeWidth="2" />
      <ellipse cx="100" cy="120" rx="34" ry="26" fill="#FFE6CC" />
      <circle cx="80" cy="100" r="5" fill={stroke} />
      <circle cx="120" cy="100" r="5" fill={stroke} />
      <ellipse cx="100" cy="118" rx="8" ry="6" fill={stroke} />
    </svg>
  );
}

/* ── Navigation Components ─────────────────────────────────────────────────── */

import type { Screen } from '../game/types';
const LABEL_TO_SCREEN: Record<string, Screen> = {
  Polyclinic: 'mode', GP: 'gpRoom', Case: 'library', Brief: 'brief', Encounter: 'encounter', Wrap: 'endConfirm', Debrief: 'debrief', Profile: 'home', History: 'history',
};

interface BreadcrumbProps {
  steps: string[];
  here: number;
}

export function Breadcrumb({ steps, here }: BreadcrumbProps) {
  return (
    <div className="breadcrumb">
      {steps.map((s, i) => {
        const target = LABEL_TO_SCREEN[s];
        const isHere = i === here;
        const clickable = !isHere && !!target;
        return (
          <Fragment key={i}>
            {isHere ? (
              <span className="current">{s}</span>
            ) : (
              <span
                onClick={clickable ? () => store.setScreen(target) : undefined}
                style={{ cursor: clickable ? 'pointer' : 'default' }}
              >
                {s}
              </span>
            )}
            {i < steps.length - 1 && <span className="sep">›</span>}
          </Fragment>
        );
      })}
    </div>
  );
}

interface TopBarProps {
  here?: number;
  steps?: string[];
  showProfile?: boolean;
  onBack?: () => void;
}

export function TopBar({ here = 0, steps = ['Polyclinic'], showProfile = true, onBack }: TopBarProps) {
  return (
    <div className="nav">
      <span
        className="interactive"
        onClick={() => (onBack ? onBack() : store.setScreen('splash'))}
        title="Back to start"
        style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--ink)' }}
      >
        <Wordmark size={24} />
      </span>
      <Breadcrumb steps={steps} here={here} />
      {showProfile ? (
        <div
          className="interactive"
          onClick={() => store.setScreen('home')}
          title="Open profile"
          style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-2)' }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>Dr. Bedirhan</span>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--indigo), var(--violet))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              color: 'white',
              boxShadow: 'var(--glow)',
            }}
          >
            B
          </div>
        </div>
      ) : <div style={{ width: 80 }} />}
    </div>
  );
}

interface WordmarkProps {
  size?: number;
  dark?: boolean;
}

export function Wordmark({ size = 36, dark = false }: WordmarkProps) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'Inter',
        fontWeight: 800,
        fontSize: size,
        color: dark ? 'white' : 'var(--ink)',
        letterSpacing: '-0.03em',
      }}
    >
      <span style={{ position: 'relative', display: 'inline-block' }}>
        auralis<span style={{ color: 'var(--indigo)', marginLeft: 4 }}>care</span>
      </span>
    </div>
  );
}

/* ── Premium UI Components ───────────────────────────────────────────────────── */

export function PremiumCard({
  children,
  title,
  subtitle,
  icon,
  glow = false,
  style,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  glow?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      className="card"
      style={{
        ...style,
        boxShadow: glow ? 'var(--glow-strong)' : undefined,
      }}
    >
      {(title || icon) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          {icon && (
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
          )}
          <div>
            {title && <h3 style={{ margin: 0 }}>{title}</h3>}
            {subtitle && (
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export function PremiumStat({
  value,
  label,
  sub,
  color = 'var(--indigo)',
}: {
  value: string | number;
  label: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="metric" style={{ textAlign: 'left' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-2)', marginTop: 4 }}>
        {label}
      </div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function PremiumProgressRing({
  value,
  max,
  label,
  color = 'var(--indigo)',
}: {
  value: number;
  max: number;
  label: string;
  color?: string;
}) {
  const pct = max > 0 ? value / max : 0;
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <div className="progress-ring">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--glass-subtle)" strokeWidth="8" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          transform="rotate(-90 32 32)"
        />
        <text x="32" y="38" textAnchor="middle" fontFamily="Inter" fontWeight="800" fontSize="16" fill="var(--ink)">
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
          {value}/{max} points
        </div>
      </div>
    </div>
  );
}