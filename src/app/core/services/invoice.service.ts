import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';
import { InvoiceListItem } from '../models/patient.model';

export interface CreateInvoiceItemRequest {
  treatmentId?: string;
  description: string;
  descriptionAr?: string;
  quantity: number;
  unitPrice: number;
  patientToothId?: string;
  notes?: string;
  displayOrder: number;
}

export interface CreateInvoiceRequest {
  patientId: string;
  clinicId: string;
  currencyId: string;
  invoiceDate?: string;
  dueDate?: string;
  discountPercent: number;
  discountAmount: number;
  notes?: string;
  visitIds: string[];
  items: CreateInvoiceItemRequest[];
}

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private api = inject(ApiService);

  getByPatient(patientId: string, page = 1, pageSize = 50): Observable<ApiResponse<PagedResult<InvoiceListItem>>> {
    return this.api.getPaged<InvoiceListItem>(API_ENDPOINTS.invoices.base, {
      patientId, page, pageSize
    });
  }

  getById(id: string): Observable<ApiResponse<any>> {
    return this.api.get<any>(API_ENDPOINTS.invoices.byId(id));
  }

  create(request: CreateInvoiceRequest): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.invoices.base, request);
  }

  issue(id: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(API_ENDPOINTS.invoices.issue(id), {});
  }
  
  cancel(id: string, reason?: string): Observable<ApiResponse<void>> {
    return this.api.post<void>(API_ENDPOINTS.invoices.cancel(id), { reason });
  }
  
  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.invoices.byId(id));
  }
  
  // Payments
  getPayments(invoiceId: string): Observable<ApiResponse<any[]>> {
    return this.api.get<any[]>(API_ENDPOINTS.payments.byInvoice(invoiceId));
  }
  
  createPayment(invoiceId: string, request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.payments.create(invoiceId), request);
  }
  
  deletePayment(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.payments.byId(id));
  }
  
  update(id: string, request: any): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.invoices.byId(id), request);
  }

  getAll(params?: any): Observable<ApiResponse<PagedResult<InvoiceListItem>>> {
    return this.api.getPaged<InvoiceListItem>(API_ENDPOINTS.invoices.base, params);
  }
}