export interface MaterialListItem {
    id: string;
    code: string;
    nameAr: string;
    category?: string;
    categoryAr?: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface MaterialDetails {
    id: string;
    code: string;
    nameAr: string;
    category?: string;
    categoryAr?: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
  }
  
  export interface CreateMaterialRequest {
    code: string;
    nameAr: string;
    category?: string;
    categoryAr?: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface UpdateMaterialRequest {
    nameAr: string;
    category?: string;
    categoryAr?: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface MaterialFilter {
    search?: string;
    isActive?: boolean;
    category?: string;
    page?: number;
    pageSize?: number;
  }