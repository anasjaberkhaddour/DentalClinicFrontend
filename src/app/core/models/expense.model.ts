export interface Expense {
    id: string;
    clinicId: string;
    clinicName: string;
    categoryId: string;
    categoryNameAr: string;
    amount: number;
    currencyId: string;
    currencyCode: string;
    currencySymbol: string;
    expenseDate: string;
    description?: string;
    reference?: string;
    paymentMethod?: number;
    supplierId?: string;
    supplierNameAr?: string;
    recordedByUserId?: string;
    createdAt: string;
  }
  
  export interface CreateExpenseRequest {
    clinicId: string;
    categoryId: string;
    amount: number;
    currencyId: string;
    expenseDate: string;
    description?: string;
    reference?: string;
    paymentMethod?: number;
    supplierId?: string;
  }
  
  export interface UpdateExpenseRequest {
    categoryId: string;
    amount: number;
    currencyId: string;
    expenseDate: string;
    description?: string;
    reference?: string;
    paymentMethod?: number;
    supplierId?: string;
  }
  
  export interface ExpenseFilter {
    search?: string;
    clinicId?: string;
    categoryId?: string;
    supplierId?: string;
    paymentMethod?: number;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }