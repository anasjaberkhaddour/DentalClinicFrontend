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
  treatmentId?: string;
  treatmentName?: string;
  treatmentNameAr?: string;
  visitId?: string;
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
  treatmentCaseTitle?: string;
}

export enum ToothStatus {
  Sound = 1,
  Missing = 2,
  Extracted = 3,
  Impacted = 4,
  Unerupted = 5,
  Crown = 6,
  Bridge = 7,
  Implant = 8,
  Primary = 9,
  NeedsTreatment = 10,
  RestoredVitalPulp = 11,
  RootTreatedWithCrown = 12,
  RootTreatedWithoutCrown = 13,
  BridgeAbutment = 14,
  PrimaryUnerupted = 15,
  PrimaryTreatedWithoutCrown = 16,
  PrimaryTreatedWithCrown = 17
}

export enum ToothMobility {
  None = 0,
  Grade1 = 1,
  Grade2 = 2,
  Grade3 = 3
}

export const FDI_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
export const FDI_UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
export const FDI_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
export const FDI_LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];

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
    case ToothStatus.Sound:                     return '#ffffff';
    case ToothStatus.NeedsTreatment:            return '#fbbf24';
    case ToothStatus.RestoredVitalPulp:         return '#60a5fa';
    case ToothStatus.RootTreatedWithCrown:      return '#a78bfa';
    case ToothStatus.RootTreatedWithoutCrown:   return '#c4b5fd';
    case ToothStatus.BridgeAbutment:            return '#f472b6';
    case ToothStatus.Missing:                   return '#e5e7eb';
    case ToothStatus.Impacted:                  return '#f59e0b';
    case ToothStatus.Implant:                   return '#10b981';

    // Primary
    case ToothStatus.PrimaryUnerupted:          return '#94a3b8';
    case ToothStatus.PrimaryTreatedWithoutCrown:return '#7dd3fc';
    case ToothStatus.PrimaryTreatedWithCrown:   return '#c084fc';

    // Legacy
    case ToothStatus.Extracted:                 return '#ef4444';
    case ToothStatus.Unerupted:                 return '#94a3b8';
    case ToothStatus.Crown:                     return '#3b82f6';
    case ToothStatus.Bridge:                    return '#8b5cf6';
    case ToothStatus.Primary:                   return '#fbbf24';
    default:                                    return '#ffffff';
  }
}

export function getToothStatusBorderColor(status: number): string {
  switch (status) {
    case ToothStatus.Sound:                     return '#64748b';
    case ToothStatus.NeedsTreatment:            return '#d97706';
    case ToothStatus.RestoredVitalPulp:         return '#2563eb';
    case ToothStatus.RootTreatedWithCrown:      return '#6d28d9';
    case ToothStatus.RootTreatedWithoutCrown:   return '#7c3aed';
    case ToothStatus.BridgeAbutment:            return '#be185d';
    case ToothStatus.Missing:                   return '#9ca3af';
    case ToothStatus.Impacted:                  return '#b45309';
    case ToothStatus.Implant:                   return '#047857';

    case ToothStatus.PrimaryUnerupted:          return '#64748b';
    case ToothStatus.PrimaryTreatedWithoutCrown:return '#0284c7';
    case ToothStatus.PrimaryTreatedWithCrown:   return '#7c3aed';

    case ToothStatus.Extracted:                 return '#b91c1c';
    case ToothStatus.Unerupted:                 return '#64748b';
    case ToothStatus.Crown:                     return '#1d4ed8';
    case ToothStatus.Bridge:                    return '#6d28d9';
    case ToothStatus.Primary:                   return '#d97706';
    default:                                    return '#cbd5e1';
  }
}

export function getToothStatusName(status: number): string {
  const map: Record<number, string> = {
    1: 'سليم',
    2: 'غير موجود',
    3: 'مخلوع',
    4: 'منطمر',
    5: 'غير بازغ',
    6: 'تاج',
    7: 'جسر',
    8: 'زرعة',
    9: 'لبني',
    10: 'بحاجة علاج',
    11: 'ترميم مع جذور حية',
    12: 'معالج الجذور مع تاج',
    13: 'معالج الجذور بدون تاج',
    14: 'دمية',
    15: 'غير بازغ (لبني)',
    16: 'معالج بدون تاج',
    17: 'معالج مع تاج'
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