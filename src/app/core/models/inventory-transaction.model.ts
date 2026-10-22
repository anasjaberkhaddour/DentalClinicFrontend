export interface InventoryTransaction {
    id: string;
    inventoryItemId: string;
    inventoryItemNameAr: string;
    inventoryItemCode: string;
    clinicId: string;
    clinicName: string;
    type: number;
    quantity: number;
    quantityBefore: number;
    quantityAfter: number;
    unitCost?: number;
    currencyId?: string;
    currencySymbol?: string;
    supplierId?: string;
    supplierNameAr?: string;
    reference?: string;
    notes?: string;
    transactionDate: string;
    performedByUserId: string;
    createdAt: string;
    expiryDate?: string;
    sourceTransactionId?: string;
    batchRemaining?: number;
  }
  
  export interface CreateInventoryTransactionRequest {
    inventoryItemId: string;
    clinicId: string;
    type: number;
    quantity: number;
    unitCost?: number;
    currencyId?: string;
    supplierId?: string;
    reference?: string;
    notes?: string;
    transactionDate: string;
    expiryDate?: string;
    sourceTransactionId?: string;
  }
  
  export interface InventoryTransactionFilter {
    search?: string;
    clinicId?: string;
    inventoryItemId?: string;
    supplierId?: string;
    type?: number;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
    expiryFilter?: number;
    onlyWithRemaining?: boolean;
  }
  
  export interface InventoryBatchOption {
    id: string;
    label: string;
    remaining: number;
    expiryDate?: string;
  }