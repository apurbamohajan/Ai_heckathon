export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const PATIENT_STREAM_URL = '/agent/patient/stream';

/** Max number of retry attempts on a 429 rate-limit response. */
const MAX_RETRIES = 3;
/** Base delay in ms for exponential back-off (429 retries). */
const RETRY_BASE_MS = 1500;

export function hasClaudeKey(): boolean {
  return true;
}

/** Parse a single SSE `data:` payload and extract the text delta.
 *
 *  The Railway backend (Gemini) emits:
 *    { choices: [{ delta: { content: "..." } }] }
 *
 *  A legacy / fallback shape also supported:
 *    { text: "..." }   – direct text field
 *    { done: true }    – stream done sentinel
 *    { error: "..." }  – error sentinel
 */
function extractDelta(raw: string): { text?: string; done?: boolean; error?: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }

  if (parsed === null || typeof parsed !== 'object') return {};
  const p = parsed as Record<string, unknown>;

  // Error sentinel
  if (typeof p.error === 'string') return { error: p.error };

  // Done sentinel
  if (p.done === true) return { done: true };

  // Direct text (legacy)
  if (typeof p.text === 'string') return { text: p.text };

  // Gemini / OpenAI-compatible choices delta
  const choices = p.choices;
  if (Array.isArray(choices) && choices.length > 0) {
    const delta = (choices[0] as Record<string, unknown>)?.delta;
    if (delta && typeof delta === 'object') {
      const content = (delta as Record<string, unknown>).content;
      if (typeof content === 'string') return { text: content };
    }
    // finish_reason signals the end of the stream
    const finishReason = (choices[0] as Record<string, unknown>)?.finish_reason;
    if (finishReason != null && finishReason !== 'null') return { done: true };
  }

  return {};
}

export async function* streamClaude(
  systemPrompt: string,
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  let attempt = 0;

  while (true) {
    let res: Response;
    try {
      res = await fetch(PATIENT_STREAM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system: systemPrompt, messages }),
        signal,
      });
    } catch (err) {
      // Network-level error (offline, CORS, abort)
      if ((err as Error)?.name === 'AbortError') return;
      throw new Error(`Patient stream connection failed: ${(err as Error).message}`);
    }

    // Rate limited — exponential back-off and retry
    if (res.status === 429) {
      if (attempt >= MAX_RETRIES) {
        throw new Error(
          'The AI service is receiving too many requests right now. Please wait a moment and try again.'
        );
      }
      const delay = RETRY_BASE_MS * Math.pow(2, attempt);
      attempt++;
      await new Promise<void>((resolve, reject) => {
        const t = window.setTimeout(resolve, delay);
        signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
      });
      continue; // retry
    }

    if (!res.ok || !res.body) {
      const detail = await res.text().catch(() => '');
      // Strip raw Request ID noise from Railway error bodies
      const clean = detail.replace(/\bRequest ID:?\s*[\w-]+/gi, '').trim();
      throw new Error(
        `Patient stream error (${res.status})${clean ? ': ' + clean : ''}`.trim()
      );
    }

    // Stream the response
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buf.indexOf('\n\n')) >= 0) {
        const frame = buf.slice(0, sep);
        buf = buf.slice(sep + 2);

        const dataLines = frame
          .split('\n')
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).trimStart());

        if (!dataLines.length) continue;

        const { text, done: streamDone, error } = extractDelta(dataLines.join('\n'));
        if (error) throw new Error(error);
        if (streamDone) return;
        if (typeof text === 'string' && text.length > 0) yield text;
      }
    }

    // If we reach here the stream closed cleanly
    return;
  }
}
