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
import { InvoiceService } from '../../../core/services/invoice.service';
import { ClinicService } from '../../../core/services/clinic.service';
import { InvoiceListItem } from '../../../core/models/patient.model';

@Component({
  selector: 'app-invoices-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, SelectModule,
    PaginatorModule, SkeletonModule
  ],
  templateUrl: './invoices-list.html',
  styleUrl: './invoices-list.scss'
})
export class InvoicesList implements OnInit {
  private invoiceService = inject(InvoiceService);
  private clinicService = inject(ClinicService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loading = signal(true);
  invoices = signal<InvoiceListItem[]>([]);
  totalRecords = signal(0);
  clinics = signal<{ label: string; value: string | null }[]>([]);

  filter: any = {
    page: 1,
    pageSize: 20,
    search: '',
    clinicId: null,
    status: null
  };

  statusOptions = [
    { label: 'الكل', value: null },
    { label: 'مسودة', value: 1 },
    { label: 'صادرة', value: 2 },
    { label: 'مدفوعة جزئياً', value: 3 },
    { label: 'مدفوعة', value: 4 },
    { label: 'متأخرة', value: 5 },
    { label: 'ملغاة', value: 6 },
  ];

  ngOnInit(): void {
    this.loadClinics();
    this.loadInvoices();
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

  loadInvoices(): void {
    this.loading.set(true);
    this.invoiceService.getAll(this.filter).subscribe({
      next: (res) => {
        this.invoices.set(res.value.items);
        this.totalRecords.set(res.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الفواتير.' });
      }
    });
  }

  onSearch(): void {
    this.filter.page = 1;
    this.loadInvoices();
  }

  onPageChange(event: any): void {
    this.filter.page = event.page + 1;
    this.filter.pageSize = event.rows;
    this.loadInvoices();
  }

  openInvoice(invoice: InvoiceListItem): void {
    this.router.navigate(['/patients', invoice.patientId, 'invoices', invoice.id]);
  }

  getStatusName(status: number): string {
    const map: Record<number, string> = {
      1: 'مسودة', 2: 'صادرة', 3: 'مدفوعة جزئياً',
      4: 'مدفوعة', 5: 'متأخرة', 6: 'ملغاة'
    };
    return map[status] ?? '—';
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1: return 'bg-slate-100 text-slate-700';
      case 2: return 'bg-blue-100 text-blue-700';
      case 3: return 'bg-amber-100 text-amber-700';
      case 4: return 'bg-emerald-100 text-emerald-700';
      case 5: return 'bg-red-100 text-red-700';
      case 6: return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  }
}