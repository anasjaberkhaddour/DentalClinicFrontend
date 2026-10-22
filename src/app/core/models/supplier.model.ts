export interface SupplierListItem {
    id: string;
    code: string;
    nameAr: string;
    city?: string;
    contactPerson?: string;
    isActive: boolean;
    contactCount: number;
    transactionsCount: number;
    primaryPhone?: string;
  }
  
  export interface SupplierDetails {
    id: string;
    code: string;
    nameAr: string;
    address?: string;
    city?: string;
    country?: string;
    taxNumber?: string;
    contactPerson?: string;
    notes?: string;
    isActive: boolean;
    createdAt: string;
    contacts: SupplierContact[];
  }
  
  export interface SupplierContact {
    id: string;
    ownerType: number;
    ownerId: string;
    type: number;
    value: string;
    label?: string;
    isPrimary: boolean;
    isEmergency: boolean;
    isActive: boolean;
    notes?: string;
  }
  
  export interface CreateSupplierRequest {
    code: string;
    nameAr: string;
    address?: string;
    city?: string;
    country?: string;
    taxNumber?: string;
    contactPerson?: string;
    notes?: string;
    isActive: boolean;
    contacts: { type: number; value: string; label?: string; isPrimary: boolean; isEmergency?: boolean }[];
  }
  
  export interface UpdateSupplierRequest {
    nameAr: string;
    address?: string;
    city?: string;
    country?: string;
    taxNumber?: string;
    contactPerson?: string;
    notes?: string;
    isActive: boolean;
  }
  
  export interface SupplierFilter {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }