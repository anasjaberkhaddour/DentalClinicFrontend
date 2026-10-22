import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { LabOrderService, LabOrderListItem } from '../../../core/services/lab-order.service';
import { LabService } from '../../../core/services/lab.service';
import { ClinicService } from '../../../core/services/clinic.service';

@Component({
  selector: 'app-lab-orders-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, SelectModule,
    PaginatorModule, SkeletonModule
  ],
  templateUrl: './lab-orders-list.html',
  styleUrl: './lab-orders-list.scss'
})
export class LabOrdersList implements OnInit {
  private labOrderService = inject(LabOrderService);
  private labService = inject(LabService);
  private clinicService = inject(ClinicService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loading = signal(true);
  orders = signal<LabOrderListItem[]>([]);
  totalRecords = signal(0);

  clinics = signal<{ label: string; value: string | null }[]>([]);
  labs = signal<{ label: string; value: string | null }[]>([]);

  filter: any = {
    page: 1,
    pageSize: 20,
    search: '',
    clinicId: null,
    dentalLabId: null,
    status: null
  };

  statusOptions = [
    { label: 'الكل', value: null },
    { label: 'مسودة', value: 1 },
    { label: 'مُرسل', value: 2 },
    { label: 'قيد التنفيذ', value: 3 },
    { label: 'مُستلم', value: 4 },
    { label: 'مُركَّب', value: 5 },
    { label: 'ملغى', value: 6 },
    { label: 'إعادة تصنيع', value: 7 },
  ];

  ngOnInit(): void {
    this.loadClinics();
    this.loadLabs();
    this.loadOrders();
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const options = [{ label: 'كل العيادات', value: null }];
          res.value.forEach((c: any) => options.push({ label: c.name, value: c.id }));
          this.clinics.set(options);
        }
      }
    });
  }

  loadLabs(): void {
    this.labService.getAllLabs().subscribe({
      next: (res: any) => {
        const items = res.value?.items ?? res.value ?? [];
        const options = [{ label: 'كل المخابر', value: null }];
        items.forEach((l: any) => options.push({ label: l.nameAr, value: l.id }));
        this.labs.set(options);
      }
    });
  }

  loadOrders(): void {
    this.loading.set(true);
    this.labOrderService.getAll(this.filter).subscribe({
      next: (res) => {
        this.orders.set(res.value.items);
        this.totalRecords.set(res.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الطلبات.' });
      }
    });
  }

  onSearch(): void {
    this.filter.page = 1;
    this.loadOrders();
  }

  onPageChange(event: any): void {
    this.filter.page = event.page + 1;
    this.filter.pageSize = event.rows;
    this.loadOrders();
  }

  openOrder(order: LabOrderListItem): void {
    this.router.navigate(['/patients', order.patientId, 'lab-orders', order.id]);
  }

  getStatusName(status: number): string {
    const map: Record<number, string> = {
      1: 'مسودة', 2: 'مُرسل', 3: 'قيد التنفيذ', 4: 'مُستلم',
      5: 'مُركَّب', 6: 'ملغى', 7: 'إعادة تصنيع'
    };
    return map[status] ?? '—';
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1: return 'bg-slate-100 text-slate-700';
      case 2: return 'bg-blue-100 text-blue-700';
      case 3: return 'bg-amber-100 text-amber-700';
      case 4: return 'bg-emerald-100 text-emerald-700';
      case 5: return 'bg-purple-100 text-purple-700';
      case 6: return 'bg-red-100 text-red-700';
      case 7: return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}