export interface InventoryItem {
    id: string;
    code: string;
    nameAr: string;
    clinicId: string;
    clinicName: string;
    categoryId?: string;
    categoryNameAr?: string;
    unit: number;
    currentStock: number;
    minimumStock: number;
    isLowStock: boolean;
    unitCost?: number;
    currencyId?: string;
    currencyCode?: string;
    currencySymbol?: string;
    barcode?: string;
    manufacturer?: string;
    expiryDate?: string;
    isActive: boolean;
    createdAt: string;
    nearestExpiryDate?: string;
  }
  
  export interface CreateInventoryItemRequest {
    code: string;
    nameAr: string;
    clinicId: string;
    categoryId?: string;
    unit: number;
    minimumStock: number;
    unitCost?: number;
    currencyId?: string;
    barcode?: string;
    manufacturer?: string;
    expiryDate?: string;
    isActive: boolean;
  }
  
  export interface UpdateInventoryItemRequest {
    nameAr: string;
    categoryId?: string;
    unit: number;
    minimumStock: number;
    unitCost?: number;
    currencyId?: string;
    barcode?: string;
    manufacturer?: string;
    expiryDate?: string;
    isActive: boolean;
  }
  
  export interface InventoryItemFilter {
    search?: string;
    clinicId?: string;
    categoryId?: string;
    isActive?: boolean;
    lowStockOnly?: boolean;
    page?: number;
    pageSize?: number;
    expiryFilter?: number;
  }