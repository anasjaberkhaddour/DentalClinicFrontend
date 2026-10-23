export interface DiagnosisType {
    id: string;
    code: string;
    nameAr: string;
    categoryAr?: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface DiagnosisTypeFilter {
    search?: string;
    isActive?: boolean;
    categoryAr?: string;
    page?: number;
    pageSize?: number;
  }