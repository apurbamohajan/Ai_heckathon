import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { store } from '../game/store';
import { IconStethoscope, IconHeart, IconBrain, IconActivity } from './primitives';

export function SplashScreen() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        store.beginFromSplash();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="screen" style={{ position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
      {/* Ambient background with mesh gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 15% 25%, rgba(99, 102, 241, 0.15), transparent 35%),
            radial-gradient(circle at 85% 75%, rgba(0, 212, 255, 0.12), transparent 35%),
            radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08), transparent 40%)
          `,
        }}
      />

      {/* Floating medical icons with subtle animation */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.06,
          pointerEvents: 'none',
        }}
      >
        <div
          className="float"
          style={{
            position: 'absolute',
            top: '15%',
            left: '10%',
            animationDelay: '0s',
          }}
        >
          <IconStethoscope size={48} color="var(--indigo)" />
        </div>
        <div
          className="float"
          style={{
            position: 'absolute',
            top: '70%',
            right: '15%',
            animationDelay: '1s',
          }}
        >
          <IconHeart size={56} color="var(--rose)" />
        </div>
        <div
          className="float"
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            animationDelay: '2s',
          }}
        >
          <IconBrain size={42} color="var(--violet)" />
        </div>
        <div
          className="float"
          style={{
            position: 'absolute',
            top: '30%',
            right: '25%',
            animationDelay: '1.5s',
          }}
        >
          <IconActivity size={50} color="var(--cyan)" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="glass-panel"
        style={{
          width: 'min(1000px, 90%)',
          margin: '0 auto',
          marginTop: '15vh',
          padding: '48px 40px',
          position: 'relative',
          zIndex: 1,
        }}
        onClick={() => store.beginFromSplash()}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 32,
          }}
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--indigo), var(--violet))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--glow-strong)',
                }}
              >
                <IconStethoscope size={32} color="white" />
              </div>
              <h1
                style={{
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                auralis<span style={{ color: 'var(--indigo)' }}>care</span>
              </h1>
            </div>
            <p
              style={{
                fontSize: 16,
                color: 'var(--ink-2)',
                fontWeight: 500,
                margin: 0,
                maxWidth: 500,
              }}
            >
              AI Clinical Operating System
            </p>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 700,
                lineHeight: 1.2,
                margin: 0,
                maxWidth: 600,
              }}
            >
              Premium clinical simulation for the next generation of healthcare teams
            </h2>
            <p
              style={{
                fontSize: 15,
                color: 'var(--ink-2)',
                fontWeight: 500,
                marginTop: 16,
                maxWidth: 500,
              }}
            >
              Train through real consultation flow, structured guidance, and AI-grade debriefing in a product experience designed for serious clinical learning.
            </p>
          </motion.div>

          {/* Stats grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="grid-3"
            style={{ width: '100%', maxWidth: 500 }}
          >
            <div className="metric">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--indigo)' }}>240+</div>
              <div className="metric-label">Cases</div>
            </div>
            <div className="metric">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--violet)' }}>11</div>
              <div className="metric-label">Specialties</div>
            </div>
            <div className="metric">
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--cyan)' }}>22</div>
              <div className="metric-label">Guidelines</div>
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                store.beginFromSplash();
              }}
              style={{ fontSize: 16, padding: '14px 28px' }}
            >
              Launch Platform
            </button>
            <button
              type="button"
              className="btn"
              onClick={(e) => {
                e.stopPropagation();
                store.beginFromSplash();
              }}
              style={{ fontSize: 16, padding: '14px 28px' }}
            >
              Explore Cases
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}