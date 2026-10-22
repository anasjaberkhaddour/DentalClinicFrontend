export interface LabOrderTypeListItem {
    id: string;
    code: string;
    nameAr: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface LabOrderTypeDetails {
    id: string;
    code: string;
    nameAr: string;
    isActive: boolean;
    displayOrder: number;
    createdAt: string;
  }
  
  export interface CreateLabOrderTypeRequest {
    code: string;
    nameAr: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface UpdateLabOrderTypeRequest {
    nameAr: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface LabOrderTypeFilter {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }