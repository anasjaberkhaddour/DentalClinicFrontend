import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { API_ENDPOINTS } from '../constants/api-endpoints';
import { ApiResponse, PagedResult } from '../models/api-response.model';

export interface LabOrderListItem {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  dentalLabId: string;
  dentalLabName: string;
  labOrderTypeId: string;
  labOrderTypeName: string;
  status: number;
  orderedAt: string;
  expectedDeliveryDate?: string;
  receivedAt?: string;
  estimatedCost?: number;
  finalCost?: number;
  currencyCode: string;
  toothCount: number;
}

export interface LabOrderDetails {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  clinicId: string;
  clinicName: string;
  dentalLabId: string;
  dentalLabName: string;
  labOrderTypeId: string;
  labOrderTypeName: string;
  labOrderTypeNameAr: string;
  visitId?: string;
  orderedByUserId: string;
  currencyId: string;
  currencyCode: string;
  currencySymbol: string;
  estimatedCost?: number;
  finalCost?: number;
  orderedAt: string;
  expectedDeliveryDate?: string;
  receivedAt?: string;
  fittedAt?: string;
  status: number;
  shade?: string;
  material?: string;
  instructions?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  teeth: { patientToothId: string; toothNumber: number }[];
  payments: LabOrderPaymentDto[];
}

export interface LabOrderPaymentDto {
  id: string;
  amount: number;
  currencyCode: string;
  method: number;
  paidAt: string;
  reference?: string;
  notes?: string;
  paidByUserId: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class LabOrderService {
  private api = inject(ApiService);

  getByPatient(patientId: string, page = 1, pageSize = 50): Observable<ApiResponse<PagedResult<LabOrderListItem>>> {
    return this.api.getPaged<LabOrderListItem>(API_ENDPOINTS.labOrders.base, {
      patientId, page, pageSize
    });
  }

  getById(id: string): Observable<ApiResponse<LabOrderDetails>> {
    return this.api.get<LabOrderDetails>(API_ENDPOINTS.labOrders.byId(id));
  }

  create(request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.labOrders.base, request);
  }

  updateStatus(id: string, status: number, finalCost?: number): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.labOrders.status(id), { status, finalCost });
  }

  addPayment(id: string, request: any): Observable<ApiResponse<string>> {
    return this.api.post<string>(API_ENDPOINTS.labOrders.payments(id), request);
  }

  deletePayment(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.labOrders.deletePayment(id));
  }

  delete(id: string): Observable<ApiResponse<void>> {
    return this.api.delete<void>(API_ENDPOINTS.labOrders.byId(id));
  }

  update(id: string, request: any): Observable<ApiResponse<void>> {
    return this.api.put<void>(API_ENDPOINTS.labOrders.byId(id), request);
  }

  getAll(params?: any): Observable<ApiResponse<PagedResult<LabOrderListItem>>> {
    return this.api.getPaged<LabOrderListItem>(API_ENDPOINTS.labOrders.base, params);
  }
}