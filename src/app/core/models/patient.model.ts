export interface PatientListItem {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  nationalId?: string;
  dateOfBirth?: string;
  gender?: number;
  bloodType?: number;
  isEmergency: boolean;
  registrationDate: string;
  registrationClinicId: string;
  registrationClinicName: string;
  photoUrl?: string;
  primaryPhone?: string;
  lastVisitDate?: string;
  hasCriticalAlerts: boolean;
  outstandingBalance: number;
  hasInvoices: boolean;
  fileNumber: number
}
  
  export interface PatientDetails {
    id: string;
    personId: string;
    firstName: string;
    fatherName?: string;
    motherName?: string;
    lastName: string;
    nationalId?: string;
    dateOfBirth?: string;
    gender?: number;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
    bloodType?: number;
    isEmergency: boolean;
    registrationDate: string;
    registrationClinicId: string;
    registrationClinicName: string;
    medicalHistory?: MedicalHistory;
    contacts: ContactDto[];
    guardians: GuardianDto[];
    photoUrl?: string;
    fileNumber: number
}
  
  export interface MedicalHistory {
    id: string;
    chronicDiseases?: string;
    pastMedicalHistory?: string;
    pastSurgicalHistory?: string;
    currentMedications?: string;
    drugAllergies?: string;
    materialAllergies?: string;
    foodAllergies?: string;
    isPregnant: boolean;
    isBreastfeeding: boolean;
    smokes: boolean;
    consumesAlcohol: boolean;
    otherHabits?: string;
    criticalAlerts?: string;
    additionalNotes?: string;
  }
  
  export interface ContactDto {
    id: string;
    ownerType: number;
    ownerId: string;
    type: number;
    value: string;
    label?: string;
    isPrimary: boolean;
    isEmergency: boolean;
    isActive: boolean;
    notes?: string;
  }
  
  export interface GuardianDto {
    id: string;
    personId: string;
    firstName: string;
    lastName: string;
    nationalId?: string;
    relationship: number;
    isLegalGuardian: boolean;
  }
  
  export interface CreatePatientRequest {
    firstName: string;
    fatherName?: string;
    motherName?: string;
    lastName: string;
    nationalId?: string;
    dateOfBirth?: string;
    gender?: number;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
    bloodType?: number;
    isEmergency: boolean;
    registrationClinicId: string;
  }
  
  export interface UpdatePatientRequest {
    firstName: string;
    fatherName?: string;
    motherName?: string;
    lastName: string;
    nationalId?: string;
    dateOfBirth?: string;
    gender?: number;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
    bloodType?: number;
    isEmergency: boolean;
  }
  
  export interface PatientFilter {
    search?: string;
    isEmergency?: boolean;
    clinicId?: string;
    page?: number;
    pageSize?: number;
  }

  export interface UpdateMedicalHistoryRequest {
    chronicDiseases?: string;
    pastMedicalHistory?: string;
    pastSurgicalHistory?: string;
    currentMedications?: string;
    drugAllergies?: string;
    materialAllergies?: string;
    foodAllergies?: string;
    isPregnant: boolean;
    isBreastfeeding: boolean;
    smokes: boolean;
    consumesAlcohol: boolean;
    otherHabits?: string;
    criticalAlerts?: string;
    additionalNotes?: string;
  }

  export interface VisitListItem {
    id: string;
    patientId: string;
    patientName: string;
    clinicId: string;
    clinicName: string;
    doctorId: string;
    doctorName: string;
    visitDate: string;
    chiefComplaint?: string;
    diagnosis?: string;
  }

  export interface VisitDetails {
    id: string;
    patientId: string;
    patientName: string;
    clinicId: string;
    clinicName: string;
    doctorId: string;
    doctorName: string;
    visitDate: string;
    treatmentCaseId?: string;
    treatmentCaseNumber?: string;
    clinicalExamination?: string;
    proceduresPerformed?: string;
    prescription?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    toothNumbers: number[];
    proceduresCount: number;
  }
  
  export interface UpdateVisitRequest {
    visitDate?: string;
    clinicalExamination?: string;
    proceduresPerformed?: string;
    prescription?: string;
    notes?: string;
    patientToothIds: string[];
  }

  export interface AppointmentListItem {
    id: string;
    patientId: string;
    patientName: string;
    clinicId: string;
    clinicName: string;
    doctorId: string;
    doctorName: string;
    scheduledAt: string;
    durationMinutes: number;
    status: number;
    reason?: string;
    visitId?: string;
  }

  export interface InvoiceListItem {
    id: string;
    invoiceNumber: string;
    patientId: string;
    patientName: string;
    clinicId: string;
    clinicName: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    currencyCode: string;
    status: number;
    invoiceDate: string;
  }

  export interface InvoiceDetails {
    id: string;
    invoiceNumber: string;
    patientId: string;
    patientName: string;
    clinicId: string;
    clinicName: string;
    currencyId: string;
    currencyCode: string;
    currencySymbol: string;
    invoiceDate: string;
    dueDate?: string;
    subTotal: number;
    discountAmount: number;
    discountPercent: number;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: number;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    items: InvoiceItemDto[];
    visitIds: string[];
    payments: PaymentDto[];
  }
  
  export interface InvoiceItemDto {
    id: string;
    treatmentId?: string;
    treatmentCode?: string;
    description: string;
    descriptionAr?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    patientToothId?: string;
    toothNumber?: number;
    notes?: string;
    displayOrder: number;
  }
  
  export interface PaymentDto {
    id: string;
    amount: number;
    currencyCode: string;
    method: number;
    paidAt: string;
    reference?: string;
    notes?: string;
    receivedByUserId: string;
    createdAt: string;
  }