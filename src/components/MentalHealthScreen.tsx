import { useState } from 'react';
import { TopBar, IconBrain } from './primitives';
import { runPsychiatryOSCEAssessment, type PsychiatryCase } from '../agents/mentalHealthAgent';
import { store } from '../game/store';

const CASES: PsychiatryCase[] = [
  'Normal patient',
  'Mild depression',
  'Major depression',
  'Anxiety disorder',
  'Panic attack',
  'PTSD',
  'OCD',
  'Bipolar disorder',
  'Schizophrenia',
  'Suicide risk',
];

export default function MentalHealthScreen() {
  const [caseType, setCaseType] = useState<PsychiatryCase>('Major depression');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function submit() {
    setLoading(true);
    try {
      const r = await runPsychiatryOSCEAssessment(caseType, transcript);
      setResult(r);
    } catch (e) {
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen" style={{ background: 'transparent' }}>
      <TopBar here={0} showProfile onBack={() => store.setScreen('mode')} />

      <div style={{ padding: '24px 24px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--violet), var(--indigo))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconBrain size={28} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>AI Psychiatry OSCE Simulator</h1>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)' }}>
              Interview an AI psychiatric patient, then let the system evaluate the student's clinical and communication performance.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>
              Select case
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CASES.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCaseType(label)}
                  className={label === caseType ? 'chip' : 'chip'}
                  style={{
                    minWidth: 120,
                    cursor: 'pointer',
                    background: label === caseType ? 'var(--glass-highlight)' : undefined,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--ink-2)', marginBottom: 8 }}>
              Selected case
            </div>
            <div style={{ padding: 12, background: 'var(--glass-subtle)', borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 600 }}>
              {caseType}
            </div>
          </div>
        </div>

        <div
          style={{
            background: 'var(--glass)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-xl)',
            padding: 20,
            marginBottom: 24,
          }}
        >
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste the student's interview transcript, notes, or summary here..."
            style={{
              width: '100%',
              minHeight: 180,
              background: 'var(--glass-strong)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-lg)',
              padding: 16,
              color: 'var(--ink)',
              fontSize: 14,
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={submit}
            disabled={loading || transcript.trim() === ''}
            style={{ fontSize: 15, padding: '12px 24px' }}
          >
            {loading ? 'Evaluating…' : 'Run OSCE Evaluation'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setTranscript('')}
            style={{ fontSize: 15, padding: '12px 24px' }}
          >
            Clear
          </button>
        </div>

        {result && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
            {result.error ? (
              <div
                style={{
                  padding: 20,
                  background: 'var(--error-bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-lg)',
                  color: 'var(--error)',
                }}
              >
                {result.error}
              </div>
            ) : (
              <>
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ margin: '0 0 16px' }}>OSCE Evaluation</h3>

                  <div className="grid-2" style={{ marginBottom: 16 }}>
                    <div style={{ padding: 16, background: 'var(--glass-subtle)', borderRadius: 'var(--r-lg)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Communication</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--indigo)' }}>
                        {result.communicationScore}%
                      </div>
                    </div>
                    <div style={{ padding: 16, background: 'var(--glass-subtle)', borderRadius: 'var(--r-lg)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Clinical Reasoning</div>
                      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--violet)' }}>
                        {result.clinicalReasoningScore}%
                      </div>
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: 12, marginBottom: 16 }}>
                    <div style={{ padding: 12, background: 'var(--glass-subtle)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Asked about mood</div>
                      <div>{result.moodAsked ? 'Yes' : 'No'}</div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--glass-subtle)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Asked about sleep</div>
                      <div>{result.sleepAsked ? 'Yes' : 'No'}</div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--glass-subtle)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Assessed suicidal thoughts</div>
                      <div>{result.suicideAsked ? 'Yes' : 'No'}</div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--glass-subtle)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Empathy</div>
                      <div>{result.empathy}</div>
                    </div>
                  </div>

                  {result.missedQuestions && result.missedQuestions.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Missed questions</h4>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                        {result.missedQuestions.map((q: string, i: number) => (
                          <li key={i} style={{ marginBottom: 4 }}>
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.notes && (
                    <div>
                      <h4 style={{ margin: '0 0 8px', fontSize: 14 }}>Evaluator notes</h4>
                      <p style={{ margin: 0, fontSize: 14 }}>{result.notes}</p>
                    </div>
                  )}
                </div>

                <div className="card" style={{ padding: 20 }}>
                  <div
                    style={{
                      width: '100%',
                      height: 180,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--glass-subtle)',
                      borderRadius: 'var(--r-lg)',
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--indigo)' }}>
                        {(result.confidence * 100).toFixed(0)}%
                      </div>
                      <div style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-2)' }}>
                        Confidence rating
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: 12, background: 'var(--success-bg)', borderRadius: 'var(--r-md)', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700 }}>Overall rating</div>
                    <div>{result.overallRating}</div>
                  </div>

                  {result.recommendations && (
                    <div style={{ padding: 12, background: 'var(--warning-bg)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 8 }}>Recommended next steps</div>
                      <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13 }}>
                        {result.recommendations.map((item: string, i: number) => (
                          <li key={i} style={{ marginBottom: 4 }}>
                            {item}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {result.emergency && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        background: 'var(--error-bg)',
                        borderRadius: 'var(--r-md)',
                      }}
                    >
                      <strong>Emergency support needed</strong>
                      <p style={{ margin: '8px 0 0', fontSize: 13 }}>
                        Suicidality concerns detected. Encourage the student to connect the patient with emergency services and a trusted support person immediately.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}