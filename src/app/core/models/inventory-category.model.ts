export interface InventoryCategory {
    id: string;
    nameAr: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface CreateInventoryCategoryRequest {
    nameAr: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface UpdateInventoryCategoryRequest {
    nameAr: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface InventoryCategoryFilter {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }