export type PsychiatryCase =
  | 'Normal patient'
  | 'Mild depression'
  | 'Major depression'
  | 'Anxiety disorder'
  | 'Panic attack'
  | 'PTSD'
  | 'OCD'
  | 'Bipolar disorder'
  | 'Schizophrenia'
  | 'Suicide risk';

export interface OSCEAssessment {
  caseType: PsychiatryCase;
  confidence: number;
  communicationScore: number;
  clinicalReasoningScore: number;
  moodAsked: boolean;
  sleepAsked: boolean;
  suicideAsked: boolean;
  empathy: 'High' | 'Moderate' | 'Low';
  missedQuestions: string[];
  notes: string;
  overallRating: string;
  recommendations: string[];
  emergency: boolean;
}

export async function runPsychiatryOSCEAssessment(
  caseType: PsychiatryCase,
  transcript: string,
): Promise<OSCEAssessment> {
  const prompt = `You are an AI evaluator for a psychiatric OSCE. The student interviewed a psychiatric patient in the following case: ${caseType}. Review the transcript below and evaluate whether the student asked about mood, asked about sleep, assessed suicidal thoughts, and showed empathy. Identify missed questions, assign a communication score, assign a clinical reasoning score, and recommend next steps. Also classify overall performance and whether emergency support is needed.

Transcript:
${transcript}

Return strict JSON with these fields:
- caseType
- confidence (0.0-1.0)
- communicationScore (0-100)
- clinicalReasoningScore (0-100)
- moodAsked (true/false)
- sleepAsked (true/false)
- suicideAsked (true/false)
- empathy (High|Moderate|Low)
- missedQuestions (array of strings)
- notes
- overallRating
- recommendations (array of strings)
- emergency (true/false)`;

  const res = await fetch('/agent/mental-health', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system: prompt, transcript }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini call failed: ${res.status} ${body}`);
  }
  const payload = await res.json();
  return payload as OSCEAssessment;
}
