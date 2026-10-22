import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoiceListItem } from '../../../../core/models/patient.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patient-invoices',
  standalone: true,
  imports: [CommonModule, ButtonModule, SkeletonModule, RouterLink],
  templateUrl: './patient-invoices.html',
  styleUrl: './patient-invoices.scss'
})
export class PatientInvoices implements OnInit {
  @Input() patientId!: string;

  private invoiceService = inject(InvoiceService);
  private messageService = inject(MessageService);

  loading = signal(true);
  invoices = signal<InvoiceListItem[]>([]);

  totalBilled = computed(() => this.invoices().reduce((s, i) => s + i.totalAmount, 0));
  totalPaid = computed(() => this.invoices().reduce((s, i) => s + i.paidAmount, 0));
  totalRemaining = computed(() => this.invoices().reduce((s, i) => s + i.remainingAmount, 0));

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.invoiceService.getByPatient(this.patientId).subscribe({
      next: (response) => {
        this.invoices.set(response.value.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'تعذّر تحميل الفواتير.'
        });
      }
    });
  }

  getStatusName(status: number): string {
    const map: Record<number, string> = {
      1: 'مسودة',
      2: 'صادرة',
      3: 'مدفوعة جزئياً',
      4: 'مدفوعة',
      5: 'متأخرة',
      6: 'ملغاة'
    };
    return map[status] ?? '—';
  }
}