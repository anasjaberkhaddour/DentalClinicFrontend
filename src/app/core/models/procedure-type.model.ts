export interface ProcedureTypeListItem {
    id: string;
    code: string;
    nameAr: string;
    category?: string;
    categoryAr?: string;
    requiresSurface: boolean;
    requiresTooth: boolean;
    createsLabOrder: boolean;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface ProcedureTypeDetails {
    id: string;
    code: string;
    nameAr: string;
    category?: string;
    categoryAr?: string;
    requiresSurface: boolean;
    requiresTooth: boolean;
    createsLabOrder: boolean;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
  }
  
  export interface CreateProcedureTypeRequest {
    code: string;
    nameAr: string;
    category?: string;
    categoryAr?: string;
    requiresSurface: boolean;
    requiresTooth: boolean;
    createsLabOrder: boolean;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface UpdateProcedureTypeRequest {
    nameAr: string;
    category?: string;
    categoryAr?: string;
    requiresSurface: boolean;
    requiresTooth: boolean;
    createsLabOrder: boolean;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface ProcedureTypeFilter {
    search?: string;
    isActive?: boolean;
    category?: string;
    page?: number;
    pageSize?: number;
  }