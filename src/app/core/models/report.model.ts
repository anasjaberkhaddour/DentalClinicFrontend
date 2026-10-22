export interface TreatmentPlanReport {
  patientId: string;
  patientFullName: string;
  patientPhone?: string;
  patientGender?: string;
  patientAge?: number;
  medicalHistory?: string;
  drugAllergies?: string;
  chronicDiseases?: string;

  fileNumber?: string;

  treatmentCaseId: string;
  caseNumber: string;
  title?: string;
  startDate: string;
  chiefComplaint?: string;
  clinicalFindings?: string;
  treatmentPlanSummary?: string;
  diagnoses: { nameAr: string; notes?: string }[];
  teethNumbers: number[];

  doctorFullName: string;
  clinicName?: string;
  clinicAddress?: string;
  clinicPhone?: string;
}

export interface FinancialItem {
  date: string;
  description: string;
  amount: number;
  paid: number;
  remaining: number;
}

export interface FinancialFollowUpReport {
  patientId: string;
  patientFullName: string;
  fileNumber?: string;
  doctorFullName?: string;
  reportDate: string;
  items: FinancialItem[];
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  currencySymbol: string;
}