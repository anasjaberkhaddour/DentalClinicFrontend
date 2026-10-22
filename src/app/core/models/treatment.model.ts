export interface TreatmentListItem {
    id: string;
    code: string;
    nameAr: string;
    categoryAr?: string;
    estimatedPrice: number;
    currencyCode?: string;
    currencySymbol?: string;
    estimatedDurationMinutes: number;
    requiresTooth: boolean;
    requiresSurface: boolean;
    createsLabOrder: boolean;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface TreatmentDetails {
    id: string;
    code: string;
    nameAr: string;
    categoryAr?: string;
    descriptionAr?: string;
    estimatedPrice: number;
    currencyId?: string;
    currencyCode?: string;
    currencySymbol?: string;
    estimatedDurationMinutes: number;
    requiresTooth: boolean;
    requiresSurface: boolean;
    createsLabOrder: boolean;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
  }
  
  export interface CreateTreatmentRequest {
    code: string;
    nameAr: string;
    categoryAr?: string;
    descriptionAr?: string;
    estimatedPrice: number;
    currencyId?: string;
    estimatedDurationMinutes: number;
    requiresTooth: boolean;
    requiresSurface: boolean;
    createsLabOrder: boolean;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface UpdateTreatmentRequest {
    nameAr: string;
    categoryAr?: string;
    descriptionAr?: string;
    estimatedPrice: number;
    currencyId?: string;
    estimatedDurationMinutes: number;
    requiresTooth: boolean;
    requiresSurface: boolean;
    createsLabOrder: boolean;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface TreatmentFilter {
    search?: string;
    isActive?: boolean;
    categoryAr?: string;
    page?: number;
    pageSize?: number;
  }