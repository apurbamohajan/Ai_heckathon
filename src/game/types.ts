import type { PaletteName } from '../styles/palettes';
import type { ClinicId } from './clinic';


export type Screen =
  | 'splash'
  | 'onboarding'
  | 'home'
  | 'mode'
  | 'gpRoom'
  | 'library'
  | 'brief'
  | 'encounter'
  | 'endConfirm'
  | 'debrief'
  | 'history'
  | 'agenticRounds'
  | 'agentTopology'
  | 'mentalHealth';

export type AvatarStyle = 'cute' | 'portrait' | 'animal' | 'initials';
export type RoomLayout = 'side' | 'front';

export interface Tweaks {
  palette: PaletteName;
  avatarStyle: AvatarStyle;
  intensity: number;
  roomLayout: RoomLayout;
}

export interface EndConfirmChecks {
  sum: boolean;
  safe: boolean;
  ice: boolean;
}


export type Severity = 'critical' | 'urgent' | 'stable';

export interface AnamnesisQA {
  id: string;
  question: string;
  answer: string;
  relevant: boolean;
}

export interface TestResult {
  testId: string;
  result: string;
  abnormal: boolean;
}

export interface PatientCase {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  severity: Severity;
  arrivalBlurb: string;
  chiefComplaint: string;
  vitals: {
    hr: number;
    bp: string;
    spo2: number;
    temp: number;
    rr: number;
  };
  anamnesis: AnamnesisQA[];
  testResults: TestResult[];
  correctDiagnosisId: string;
  acceptableTreatmentIds: string[];
  criticalTreatmentIds: string[];
  diagnosisOptions: string[];
  rubric?: CaseRubric;
}


export type RubricFramework =
  | 'PLAB2'
  | 'RCGP'
  | 'NURSE'
  | 'SEGUE'
  | 'ICE'
  | 'SOCRATES'
  | 'OS-12';

export type RubricDomain =
  | 'data_gathering'
  | 'clinical_management'
  | 'interpersonal';

export interface RubricCriterion {
  /** Stable id, unique within the rubric. e.g. "dg-01", "cm-03". */
  criterion_id: string;
  /** Short label shown in the marking sheet UI. */
  label: string;
  /** Relative weight, 1–3. Drives the domain score. */
  weight: number;
  framework?: RubricFramework;

  guideline_ref?: string;

  evidence: string;
}

export interface SafetyNetCriterion {
  required_elements: string[];
  weight: number;
  guideline_ref?: string;
}

export interface CaseRubric {
  data_gathering: RubricCriterion[];
  clinical_management: RubricCriterion[];
  interpersonal: RubricCriterion[];
  safety_netting?: SafetyNetCriterion;

  global_rating: 'borderline-regression';
}



export interface Test {
  id: string;
  name: string;
  category: 'lab' | 'imaging' | 'bedside';
  turnaroundSec: number;
}

export interface Treatment {
  id: string;
  name: string;
  category: 'medication' | 'procedure' | 'disposition';
}

export interface Diagnosis {
  id: string;
  name: string;
}

export type PatientStatus =
  | 'waiting'
  | 'in-bed'
  | 'examining'
  | 'awaiting-results'
  | 'ready-to-diagnose'
  | 'treating'
  | 'discharged'
  | 'deceased';

export interface ActivePatient {
  case: PatientCase;
  bedIndex: number;
  status: PatientStatus;
  askedQuestionIds: string[];
  orderedTestIds: string[];
  testOrderedAt: Record<string, number>;
  completedTestIds: string[];
  givenTreatmentIds: string[];
  submittedDiagnosisId: string | null;
  arrivedAt: number;
  deadlineMs: number;
  prescriptions?: Array<{
    medicationId: string;
    dose: string;
    duration: string;
    prescribedAt: number;
  }>;
}

export interface PolyclinicSlice {
  clinic: ClinicId;
  patient: ActivePatient | null;
}

// ── Combined game state ──
export interface GameState {
  screen: Screen;
  tweaks: Tweaks;
  onboardingStep: number;
  endConfirm: EndConfirmChecks;
  selectedCaseId: string;
  hasOnboarded: boolean;

  polyclinic: PolyclinicSlice;

  lastEncounter: ActivePatient | null;

  viewedEvalHistoryId: string | null;
}
