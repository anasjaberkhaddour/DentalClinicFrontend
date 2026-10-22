export interface PatientTooth {
    id: string;
    toothNumber: number;
    status: number;
    mobility: number;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface ToothChart {
    patientId: string;
    patientName: string;
    teeth: PatientTooth[];
  }
  
  export interface ToothHistory {
    id: string;
    patientToothId: string;
    toothNumber: number;
    treatmentCaseId?: string;
    treatmentCaseNumber?: string;
    visitId?: string;
    procedureTypeId: string;
    procedureTypeName: string;
    procedureTypeNameAr: string;
    isMesial: boolean;
    isDistal: boolean;
    isBuccal: boolean;
    isLingual: boolean;
    isOcclusal: boolean;
    mobility: number;
    material?: string;
    notes?: string;
    performedByUserId: string;
    performedByUserName: string;
    performedAt: string;
  }
  
  export interface ProcedureType {
    id: string;
    code: string;
    name: string;
    nameAr: string;
    category?: string;
    categoryAr?: string;
    requiresSurface: boolean;
    requiresTooth: boolean;
    createsLabOrder: boolean;
    isActive: boolean;
    displayOrder: number;
  }
  
  export enum ToothStatus {
    Present = 1,
    Missing = 2,
    Extracted = 3,
    Impacted = 4,
    Unerupted = 5,
    Crown = 6,
    Bridge = 7,
    Implant = 8,
    Primary = 9
  }
  
  export enum ToothMobility {
    None = 0,
    Grade1 = 1,
    Grade2 = 2,
    Grade3 = 3
  }
  
  // FDI tooth numbering
  export const FDI_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
  export const FDI_UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
  export const FDI_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
  export const FDI_LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];
  
  // Tooth types for icon rendering
  export type ToothKind = 'incisor' | 'canine' | 'premolar' | 'molar';
  
  export function getToothKind(toothNumber: number): ToothKind {
    const n = toothNumber % 10;
    if (n >= 1 && n <= 2) return 'incisor';
    if (n === 3) return 'canine';
    if (n === 4 || n === 5) return 'premolar';
    return 'molar';
  }
  
  export function getToothStatusColor(status: number): string {
    switch (status) {
      case ToothStatus.Present:   return '#ffffff';
      case ToothStatus.Missing:   return '#e5e7eb';
      case ToothStatus.Extracted: return '#ef4444';
      case ToothStatus.Impacted:  return '#f59e0b';
      case ToothStatus.Unerupted: return '#94a3b8';
      case ToothStatus.Crown:     return '#3b82f6';
      case ToothStatus.Bridge:    return '#8b5cf6';
      case ToothStatus.Implant:   return '#10b981';
      case ToothStatus.Primary:   return '#fbbf24';
      default: return '#ffffff';
    }
  }
  
  export function getToothStatusBorderColor(status: number): string {
    switch (status) {
      case ToothStatus.Present:   return '#cbd5e1';
      case ToothStatus.Missing:   return '#9ca3af';
      case ToothStatus.Extracted: return '#b91c1c';
      case ToothStatus.Impacted:  return '#b45309';
      case ToothStatus.Unerupted: return '#64748b';
      case ToothStatus.Crown:     return '#1d4ed8';
      case ToothStatus.Bridge:    return '#6d28d9';
      case ToothStatus.Implant:   return '#047857';
      case ToothStatus.Primary:   return '#d97706';
      default: return '#cbd5e1';
    }
  }
  
  export function getToothStatusName(status: number): string {
    const map: Record<number, string> = {
      1: 'سليم', 2: 'مفقود', 3: 'مخلوع', 4: 'مدفون',
      5: 'غير بازغ', 6: 'تاج', 7: 'جسر', 8: 'زرع', 9: 'لبني'
    };
    return map[status] ?? '—';
  }
  
  export function getMobilityName(mobility: number): string {
    const map: Record<number, string> = {
      0: 'ثابت', 1: 'حركة 1', 2: 'حركة 2', 3: 'حركة 3'
    };
    return map[mobility] ?? '—';
  }

  export interface MaterialDto {
    id: string;
    code: string;
    name: string;
    nameAr: string;
    category?: string;
    categoryAr?: string;
    isActive: boolean;
    displayOrder: number;
  }