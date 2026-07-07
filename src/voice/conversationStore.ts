import { Conversation, type ConversationListeners } from './conversation';
import { buildPersona, buildInitialLine, isPediatric, parentGenderFor } from './patientPersona';
import type { PatientCase } from '../game/types';

let sharedCtx: AudioContext | null = null;

export function ensureAudioContext(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (sharedCtx.state === 'suspended') {

    sharedCtx.resume().catch(() => undefined);
  }
  return sharedCtx;
}

interface CachedConversation {
  conv: Conversation;
  caseId: string;
}

const store = new Map<number, CachedConversation>();

/** Peek at an existing conversation without creating one. */
export function getExistingConversation(bedIndex: number): Conversation | null {
  return store.get(bedIndex)?.conv ?? null;
}

export function getOrCreatePatientConversation(
  bedIndex: number,
  patientCase: PatientCase,
  listeners: ConversationListeners
): Conversation {
  const existing = store.get(bedIndex);
  if (existing && existing.caseId === patientCase.id) {
    existing.conv.setListeners(listeners);
    return existing.conv;
  }
  if (existing) {

    existing.conv.dispose();
    store.delete(bedIndex);
  }
  // The polyclinic uses sentinel bedIndex -10; everything else is ER.
  const setting: 'polyclinic' | 'er' = bedIndex === -10 ? 'polyclinic' : 'er';
  const ctx = ensureAudioContext();
  // Speaker gender mirrors the rule in voiceForPatient (now retired):
  // pediatric → parent's gender, adult → patient's gender.
  const speakerGender: 'M' | 'F' = isPediatric(patientCase)
    ? parentGenderFor(patientCase)
    : patientCase.gender;
  const conv = new Conversation(ctx, listeners, {
    systemPrompt: buildPersona(patientCase, setting),
    initialMessage: buildInitialLine(patientCase),
    voiceGender: speakerGender,
    caseId: patientCase.id,
    // Persist per-patient history so refreshing the page or walking away
    // and back doesn't wipe the conversation — the patient remembers you.
    storageKey: `conv_history_${patientCase.id}`,
  });
  store.set(bedIndex, { conv, caseId: patientCase.id });
  return conv;
}

export function disposePatientConversation(bedIndex: number) {
  const entry = store.get(bedIndex);
  if (entry) {
    entry.conv.dispose();
    store.delete(bedIndex);
  }
}

export function clearAllPatientConversations() {
  for (const entry of store.values()) entry.conv.dispose();
  store.clear();
  if (sharedCtx) {
    try { sharedCtx.close(); } catch { /* noop */ }
    sharedCtx = null;
  }
}

export function clearAllConversationStorage() {
  if (typeof window === 'undefined') return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('conv_history_')) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // localStorage may be blocked — non-fatal
  }
}
