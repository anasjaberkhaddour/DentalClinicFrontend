export interface TreatmentCaseListItem {
    id: string;
    caseNumber: string;
    title?: string;
    clinicId: string;
    clinicName: string;
    patientId: string;
    patientName: string;
    status: number;
    startDate: string;
    completedDate?: string;
    diagnosisCount: number;
    toothCount: number;
    visitCount: number;
    chiefComplaint?: string;
  }
  
  export interface TreatmentCaseDetails {
    id: string;
    caseNumber: string;
    title?: string;
    clinicId: string;
    clinicName: string;
    patientId: string;
    patientName: string;
    status: number;
    startDate: string;
    completedDate?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    chiefComplaint?: string;
    clinicalFindings?: string;
    treatmentPlanSummary?: string;
    notes?: string;
    createdByUserId: string;
    createdByUserName?: string;
    createdAt: string;
    updatedAt?: string;
    diagnoses: TreatmentCaseDiagnosis[];
    teeth: TreatmentCaseTooth[];
    visits: TreatmentCaseVisit[];
  }

  export interface TreatmentCaseVisit {
    id: string;
    visitDate: string;
    summary?: string;
    visitNumber: number;
  }

  export interface TreatmentCaseDiagnosis {
    id: string;
    diagnosisTypeId: string;
    diagnosisTypeName: string;
    diagnosisTypeNameAr: string;
    notes?: string;
  }
  
  export interface TreatmentCaseTooth {
    patientToothId: string;
    toothNumber: number;
  }
  
  export interface CreateTreatmentCaseRequest {
    patientId: string;
    title?: string;
    chiefComplaint?: string;
    clinicalFindings?: string;
    treatmentPlanSummary?: string;
    notes?: string;
    diagnosisTypeIds: string[];
    patientToothIds: string[];
  }
  
  export interface UpdateTreatmentCaseRequest {
    title?: string;
    chiefComplaint?: string;
    clinicalFindings?: string;
    treatmentPlanSummary?: string;
    notes?: string;
    diagnosisTypeIds: string[];
    patientToothIds: string[];
  }
  
  export interface UpdateTreatmentCaseStatusRequest {
    status: number;
    cancellationReason?: string;
  }
  
  export interface DiagnosisType {
    id: string;
    code: string;
    name: string;
    nameAr: string;
    category?: string;
    categoryAr?: string;
    isActive: boolean;
    displayOrder: number;
  }