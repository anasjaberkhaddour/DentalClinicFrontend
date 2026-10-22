export interface AuditLog {
    id: string;
    userId?: string;
    userName?: string;
    ipAddress?: string;
    action: string;
    entityName: string;
    entityId?: string;
    oldValues?: string;
    newValues?: string;
    additionalData?: string;
    path?: string;
    method?: string;
    timestamp: string;
    statusCode: number;
    success: boolean;
  }
  
  export interface AuditLogFilter {
    search?: string;
    action?: string;
    entityName?: string;
    userId?: string;
    success?: boolean;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
  }