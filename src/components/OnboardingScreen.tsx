import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { store, useStore } from '../game/store';
import { IconStethoscope, IconBrain, IconShield } from './primitives';

interface Card {
  title: string;
  body: string;
  icon: ReactNode;
  tag: string;
}

const CARDS: Card[] = [
  {
    title: 'Clinical-grade simulation',
    body: 'Real-time voice interaction with AI patients. Every consultation is captured, analyzed, and transformed into actionable feedback.',
    icon: <IconStethoscope size={48} color="white" />,
    tag: '01 · SIMULATION',
  },
  {
    title: 'Evidence-based guidance',
    body: 'All recommendations cite NICE, ESC, and AHA guidelines. The AI never invents — it only references verified clinical evidence.',
    icon: <IconShield size={48} color="white" />,
    tag: '02 · EVIDENCE',
  },
  {
    title: 'Precision debriefing',
    body: 'Multi-domain scoring with specific feedback. Data gathering, clinical management, and interpersonal skills evaluated in detail.',
    icon: <IconBrain size={48} color="white" />,
    tag: '03 · DEBRIEF',
  },
];

export function OnboardingScreen() {
  const step = useStore((s) => s.onboardingStep);
  const card = CARDS[step];

  return (
    <div className="screen" style={{ position: 'relative' }}>
      {/* Ambient background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.12), transparent 30%),
            radial-gradient(circle at 80% 70%, rgba(0, 212, 255, 0.1), transparent 30%)
          `,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="glass-panel"
          style={{
            width: 'min(800px, 100%)',
            padding: 36,
          }}
        >
          {/* Progress indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
            {CARDS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 32 : 10,
                  height: 8,
                  borderRadius: 999,
                  background: i === step ? 'linear-gradient(135deg, var(--indigo), var(--violet))' : 'var(--glass-subtle)',
                  transition: 'width 200ms ease',
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {/* Icon circle */}
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--indigo), var(--violet))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                boxShadow: 'var(--glow-strong)',
              }}
            >
              {card.icon}
            </div>

            {/* Content */}
            <div style={{ textAlign: 'center' }}>
              <div
                className="chip"
                style={{
                  marginBottom: 12,
                  background: 'var(--glass-highlight)',
                  color: 'var(--indigo)',
                }}
              >
                {card.tag}
              </div>
              <h2
                style={{
                  fontSize: 'clamp(24px, 3vw, 32px)',
                  fontWeight: 700,
                  margin: '0 0 12px',
                }}
              >
                {card.title}
              </h2>
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: 'var(--ink-2)',
                  margin: 0,
                  maxWidth: 500,
                }}
              >
                {card.body}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <button
                type="button"
                className="btn"
                style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
                onClick={() => store.setOnboardingStep(step - 1)}
              >
                ← Back
              </button>
              {step < CARDS.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => store.setOnboardingStep(step + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => store.finishOnboarding()}
                >
                  Enter Workspace →
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}