export interface ExpenseCategory {
    id: string;
    code: string;
    nameAr: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface CreateExpenseCategoryRequest {
    code: string;
    nameAr: string;
    isActive: boolean;
    displayOrder: number;
  }
  
  export interface UpdateExpenseCategoryRequest {
    nameAr: string;
    isActive: boolean;
    displayOrder: number;
  }