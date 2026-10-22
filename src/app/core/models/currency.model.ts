export interface Currency {
    id: string;
    code: string;
    name: string;
    nameAr: string;
    symbol: string;
    isBase: boolean;
    isActive: boolean;
  }
  
  export interface CreateCurrencyRequest {
    code: string;
    name: string;
    nameAr: string;
    symbol: string;
    isBase: boolean;
    isActive: boolean;
  }
  
  export interface UpdateCurrencyRequest {
    name: string;
    nameAr: string;
    symbol: string;
    isBase: boolean;
    isActive: boolean;
  }
  
  export interface CurrencyFilter {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }