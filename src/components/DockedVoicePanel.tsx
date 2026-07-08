import { useEffect, useRef, useState } from 'react';
import { POLYCLINIC_BED_INDEX } from '../game/store';
import { getExistingConversation } from '../voice/conversationStore';
import type { ConversationStatus, SubtitleEvent } from '../voice/conversation';



interface Props {
  patientName: string;
  patientLabel: string; // e.g. "34F"
}

export function DockedVoicePanel({ patientName, patientLabel }: Props) {
  const [status, setStatus] = useState<ConversationStatus>('uninitialized');
  const [subtitle, setSubtitle] = useState<SubtitleEvent>({ who: 'patient', text: '…' });


  useEffect(() => {
    let disposed = false;
    let attempt = 0;
    let stopMessages: (() => void) | null = null;

    const tryAttach = () => {
      if (disposed) return;
      const conv = getExistingConversation(POLYCLINIC_BED_INDEX);
      if (!conv) {
        if (attempt++ < 20) window.setTimeout(tryAttach, 100);
        return;
      }

      setStatus(conv.getStatus());
      const msgs = conv.getMessages();
      const last = [...msgs].reverse().find((m) => m.role === 'assistant' || m.role === 'user');
      if (last) {
        setSubtitle({ who: last.role === 'user' ? 'you' : 'patient', text: last.content });
      }
      stopMessages = conv.subscribeMessages((all) => {
        const lastMsg = [...all].reverse().find((m) => m.role === 'assistant' || m.role === 'user');
        if (lastMsg) {
          setSubtitle({ who: lastMsg.role === 'user' ? 'you' : 'patient', text: lastMsg.content });
        }
      });
    };
    tryAttach();

    // Cheap status polling — the conv doesn't expose a status subscriber.
    const tick = window.setInterval(() => {
      if (disposed) return;
      const conv = getExistingConversation(POLYCLINIC_BED_INDEX);
      if (conv) setStatus(conv.getStatus());
    }, 500);

    return () => {
      disposed = true;
      window.clearInterval(tick);
      stopMessages?.();
    };
  }, []);

  const firstName = patientName.split(' ')[0];
  const statusLabel =
    status === 'listening' ? 'LISTENING…' :
    status === 'thinking' ? 'THINKING…' :
    status === 'speaking' ? `${firstName.toUpperCase()} SPEAKING` :
    status === 'loading' ? 'CONNECTING…' :
    status === 'ready' ? 'LIVE' :
    'OFFLINE';

  const live = status === 'listening' || status === 'speaking' || status === 'thinking' || status === 'ready';
  const statusColor =
    status === 'speaking' ? 'var(--peach-deep)' :
    status === 'listening' ? 'var(--mint-deep)' :
    status === 'thinking' ? 'var(--butter-deep)' :
    live ? 'var(--mint-deep)' : '#666666';

  const showSubtitle = !!subtitle.text && subtitle.text !== '…';
  const speakerLabel = subtitle.who === 'you' ? 'You' : firstName;

  // Auto-scroll to bottom when subtitle changes.
  const scrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [subtitle.text]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 18,
        right: 18,
        zIndex: 60,
        width: 260,
        background: 'white',
        border: '3px solid var(--line)',
        borderRadius: 'var(--r-md)',
        boxShadow: '0 6px 0 var(--line), 0 14px 28px rgba(43,30,22,0.18)',
        padding: '12px 14px',
        fontFamily: 'Nunito, system-ui, sans-serif',
        color: '#1a1a1a',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 900 }}>
          {patientName}
          <span style={{ fontSize: 10, color: '#555555', marginLeft: 6, fontWeight: 700 }}>
            {patientLabel}
          </span>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 9,
            letterSpacing: '0.12em',
            color: statusColor,
            textTransform: 'uppercase',
            fontWeight: 900,
            whiteSpace: 'nowrap',
            padding: '3px 7px',
            borderRadius: 'var(--r-pill)',
            background: 'var(--cream)',
            border: '2px solid var(--line)',
          }}
        >
          <span
            className={live ? 'breathe' : undefined}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: statusColor,
              display: 'inline-block',
            }}
          />
          {statusLabel}
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          fontStyle: showSubtitle ? 'italic' : 'normal',
          fontSize: 12,
          lineHeight: 1.4,
          color: showSubtitle ? '#1a1a1a' : '#666666',
          fontWeight: 600,
          maxHeight: 110,
          overflowY: 'auto',
          background: 'var(--cream-2)',
          border: '2px solid var(--line)',
          borderRadius: 10,
          padding: '8px 10px',
        }}
      >
        {showSubtitle ? (
          <>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: '#444444',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 2,
                fontStyle: 'normal',
              }}
            >
              {speakerLabel}
            </div>
            "{subtitle.text}"
          </>
        ) : (
          'Voice live · just talk'
        )}
      </div>
    </div>
  );
}