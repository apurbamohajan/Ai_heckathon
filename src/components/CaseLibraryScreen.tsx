import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TopBar } from './primitives';
import { CASES, CONDITION_COLORS, type Case } from '../data/cases';
import { CLINIC_IDS, CLINIC_LABELS, type ClinicId } from '../game/clinic';
import { store } from '../game/store';

interface CaseCardProps {
  c: Case;
  delay?: number;
}

function CaseCard({ c, delay = 0 }: CaseCardProps) {
  const bg = CONDITION_COLORS[c.cond] ?? 'var(--indigo)';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="interactive"
      onClick={() => store.selectCase(c.id)}
      style={{
        background: 'var(--glass)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-xl)',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
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
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 20,
          }}
        >
          {c.cond === 'hypertension' && '🩺'}
          {c.cond === 'diabetes' && '🍯'}
          {c.cond === 'pneumonia' && '🫁'}
          {c.cond === 'depression' && '💭'}
          {c.cond === 'anxiety' && '😰'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{c.name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
            {c.age} · {c.sex === 'F' ? 'Female' : 'Male'}
          </div>
        </div>
        {c.attempted && c.score && (
          <div
            className="chip"
            style={{
              fontSize: 11,
              background: 'var(--success-bg)',
            }}
          >
            {c.score}
          </div>
        )}
      </div>

      <p
        style={{
          fontSize: 13,
          color: 'var(--ink-2)',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        "{c.complaint}"
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {c.tags.slice(0, 2).map((t) => (
          <span key={t} className="chip" style={{ fontSize: 11 }}>
            {t}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

type ClinicFilter = ClinicId | 'all' | 'red-flag';

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

export function CaseLibraryScreen() {
  const [filter, setFilter] = useState<ClinicFilter>('all');

  const grouped = useMemo(() => {
    const map = new Map<ClinicId, Case[]>();
    for (const id of CLINIC_IDS) {
      if (id === 'all-specialties') continue;
      map.set(id, []);
    }
    for (const c of CASES) {
      const list = map.get(c.clinic);
      if (list) list.push(c);
    }
    return map;
  }, []);

  const visibleGroups = useMemo<Array<[ClinicId, Case[]]>>(() => {
    if (filter === 'red-flag') {
      const out: Array<[ClinicId, Case[]]> = [];
      for (const [clinic, list] of grouped) {
        const reds = list.filter((c) => c.tags.some((t) => t.toLowerCase().includes('red flag')));
        if (reds.length) out.push([clinic, reds]);
      }
      return out;
    }
    if (filter === 'all') {
      return Array.from(grouped.entries()).filter(([, list]) => list.length > 0);
    }
    const list = grouped.get(filter as ClinicId) ?? [];
    return list.length ? [[filter as ClinicId, list]] : [];
  }, [grouped, filter]);

  const totalVisible = visibleGroups.reduce((n, [, list]) => n + list.length, 0);

  const shuffle = () => {
    const pool = visibleGroups.flatMap(([, list]) => list);
    const fallback = pool.length > 0 ? pool : CASES;
    const pick = fallback[Math.floor(Math.random() * fallback.length)];
    store.selectCase(pick.id);
  };

  const clinicChips: Array<{ id: ClinicFilter; label: string; icon?: string }> = [
    { id: 'all', label: 'All clinics', icon: '🌐' },
    { id: 'red-flag', label: 'Red-flag only', icon: '🚩' },
    ...CLINIC_IDS.filter((id) => id !== 'all-specialties' && (grouped.get(id)?.length ?? 0) > 0).map(
      (id) => ({ id: id as ClinicFilter, label: CLINIC_LABELS[id], icon: CLINIC_ICON[id] }),
    ),
  ];

  return (
    <div className="screen" style={{ background: 'transparent' }}>
      <TopBar here={2} steps={['Polyclinic', 'GP', 'Case']} />

      <div style={{ padding: '24px 24px 40px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', margin: '0 0 4px' }}>
              Pick a patient
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', margin: 0 }}>
              Cases are grouped by polyclinic — pick a specialty chip to focus.
            </p>
          </div>
          <button
            type="button"
            className="btn"
            onClick={shuffle}
            style={{ fontSize: 14, padding: '10px 18px', whiteSpace: 'nowrap' }}
          >
            🔀 Shuffle ({totalVisible})
          </button>
        </div>

        {/* Back button */}
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            className="btn"
            onClick={() => store.setScreen('gpRoom')}
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            ← Back
          </button>
        </div>

        {/* Filter chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 24,
          }}
        >
          {clinicChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className="chip"
              onClick={() => setFilter(chip.id)}
              style={{
                cursor: 'pointer',
                background: filter === chip.id ? 'var(--glass-highlight)' : undefined,
              }}
            >
              {chip.icon ? `${chip.icon} ` : ''}
              {chip.label}
            </button>
          ))}
        </div>

        {/* Case grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {visibleGroups.map(([clinic, list]) => (
            <section key={clinic}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 20 }}>{CLINIC_ICON[clinic] ?? '🏥'}</span>
                <h2 style={{ margin: 0, fontSize: 20 }}>{CLINIC_LABELS[clinic]}</h2>
                <span className="chip" style={{ fontSize: 11 }}>
                  {list.length} case{list.length === 1 ? '' : 's'}
                </span>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {list.map((c, i) => (
                  <CaseCard key={c.id} c={c} delay={(i % 8) * 0.04} />
                ))}
              </div>
            </section>
          ))}

          {visibleGroups.length === 0 && (
            <div
              className="card"
              style={{
                padding: 24,
                textAlign: 'center',
                color: 'var(--ink-2)',
                fontWeight: 600,
              }}
            >
              No cases match this filter — try another chip.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}