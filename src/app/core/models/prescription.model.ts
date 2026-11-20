import { MedicationForm, MedicationFrequency, MedicationRoute } from '../constants/enums';

export interface PrescriptionItemDto {
  id: string;
  brandNameId: string;
  brandName: string;
  brandNameAr: string;
  activeIngredientNameAr: string;
  form: MedicationForm;
  strength?: string;
  dosage: string;
  frequency: MedicationFrequency;
  duration?: string;
  route: MedicationRoute;
  instructions?: string;
  quantity: number;
  displayOrder: number;
}

export interface PrescriptionDetails {
  id: string;
  visitId: string;
  visitDate: string;
  generalNotes?: string;
  createdAt: string;
  updatedAt?: string;
  items: PrescriptionItemDto[];
}

export interface PrescriptionListItem {
  id: string;
  visitId: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  itemsCount: number;
  createdAt: string;
}

export interface SavePrescriptionItemRequest {
  id?: string;
  brandNameId: string;
  dosage: string;
  frequency: MedicationFrequency;
  duration?: string;
  route: MedicationRoute;
  instructions?: string;
  quantity: number;
  displayOrder: number;
}

export interface SavePrescriptionRequest {
  visitId: string;
  generalNotes?: string;
  items: SavePrescriptionItemRequest[];
}

export interface PrescriptionFilter {
  search?: string;
  visitId?: string;
  patientId?: string;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
}