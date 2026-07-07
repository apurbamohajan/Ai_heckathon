

export type ClinicId =
  | 'all-specialties'
  | 'internal-medicine'
  | 'cardiology'
  | 'neurology'
  | 'neurosurgery'
  | 'dermatology'
  | 'endocrinology'
  | 'gastroenterology'
  | 'pulmonology'
  | 'nephrology'
  | 'rheumatology'
  | 'hematology'
  | 'oncology'
  | 'infectious-disease'
  | 'allergy-immunology'
  | 'psychiatry'
  | 'obgyn'
  | 'urology'
  | 'ophthalmology'
  | 'ent'
  | 'orthopedics'
  | 'pmr'
  | 'pediatrics'
  | 'general-surgery'
  | 'cardiothoracic-vascular-surgery';


export const CLINIC_IDS: ClinicId[] = [
  'all-specialties',
  'internal-medicine',
  'cardiology',
  'neurology',
  'neurosurgery',
  'dermatology',
  'endocrinology',
  'gastroenterology',
  'pulmonology',
  'nephrology',
  'rheumatology',
  'hematology',
  'oncology',
  'infectious-disease',
  'allergy-immunology',
  'psychiatry',
  'obgyn',
  'urology',
  'ophthalmology',
  'ent',
  'orthopedics',
  'pmr',
  'pediatrics',
  'general-surgery',
  'cardiothoracic-vascular-surgery',
];

/** English display labels for each specialty. */
export const CLINIC_LABELS: Record<ClinicId, string> = {
  'all-specialties': 'All Specialties (mixed)',
  'internal-medicine': 'Internal Medicine',
  cardiology: 'Cardiology',
  neurology: 'Neurology',
  neurosurgery: 'Neurosurgery',
  dermatology: 'Dermatology',
  endocrinology: 'Endocrinology',
  gastroenterology: 'Gastroenterology',
  pulmonology: 'Pulmonology',
  nephrology: 'Nephrology',
  rheumatology: 'Rheumatology',
  hematology: 'Hematology',
  oncology: 'Oncology',
  'infectious-disease': 'Infectious Disease',
  'allergy-immunology': 'Allergy & Immunology',
  psychiatry: 'Psychiatry',
  obgyn: 'OB/GYN',
  urology: 'Urology',
  ophthalmology: 'Ophthalmology',
  ent: 'ENT',
  orthopedics: 'Orthopedics',
  pmr: 'Physical Medicine & Rehab',
  pediatrics: 'Pediatrics',
  'general-surgery': 'General Surgery',
  'cardiothoracic-vascular-surgery': 'Cardiothoracic & Vascular Surgery',
};

export const DEFAULT_CLINIC: ClinicId = 'internal-medicine';
