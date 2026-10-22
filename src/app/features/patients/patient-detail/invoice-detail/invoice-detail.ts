import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InvoiceService } from '../../../../core/services/invoice.service';
import { InvoiceDetails } from '../../../../core/models/patient.model';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, SkeletonModule, DialogModule,
    InputNumberModule, InputTextModule, TextareaModule, SelectModule
  ],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.scss'
})
export class InvoiceDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  invoice = signal<InvoiceDetails | null>(null);
  actionLoading = signal(false);

  patientId!: string;
  invoiceId!: string;

  paymentDialog = signal(false);
  paymentSaving = signal(false);
  paymentForm = {
    amount: 0,
    currencyId: '',
    method: 1,
    reference: '',
    notes: ''
  };

  paymentMethods = [
    { label: 'نقدي', value: 1 },
    { label: 'بطاقة', value: 2 },
    { label: 'تحويل بنكي', value: 3 },
    { label: 'شيك', value: 4 },
    { label: 'أخرى', value: 99 },
  ];

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    this.invoiceId = this.route.snapshot.paramMap.get('invoiceId') ?? '';

    if (!this.patientId || !this.invoiceId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.loadInvoice();
  }

  loadInvoice(): void {
    this.loading.set(true);
    this.invoiceService.getById(this.invoiceId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.invoice.set(response.value);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الفاتورة.' });
        this.router.navigate(['/patients', this.patientId]);
      }
    });
  }

  issue(): void {
    this.confirmationService.confirm({
      message: 'هل تريد إصدار هذه الفاتورة؟ لن يمكن تعديلها بعد الإصدار.',
      header: 'تأكيد الإصدار',
      icon: 'pi pi-question-circle',
      acceptLabel: 'نعم، أصدر',
      rejectLabel: 'إلغاء',
      accept: () => {
        this.actionLoading.set(true);
        this.invoiceService.issue(this.invoiceId).subscribe({
          next: (res) => {
            this.actionLoading.set(false);
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إصدار الفاتورة.' });
              this.loadInvoice();
            }
          },
          error: () => {
            this.actionLoading.set(false);
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر إصدار الفاتورة.' });
          }
        });
      }
    });
  }

  cancelInvoice(): void {
    this.confirmationService.confirm({
      message: 'هل تريد إلغاء هذه الفاتورة؟',
      header: 'تأكيد الإلغاء',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، ألغِ',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.actionLoading.set(true);
        this.invoiceService.cancel(this.invoiceId, 'إلغاء يدوي').subscribe({
          next: (res) => {
            this.actionLoading.set(false);
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إلغاء الفاتورة.' });
              this.loadInvoice();
            }
          },
          error: () => {
            this.actionLoading.set(false);
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر إلغاء الفاتورة.' });
          }
        });
      }
    });
  }

  openPaymentDialog(): void {
    const inv = this.invoice();
    if (!inv) return;

    this.paymentForm = {
      amount: inv.remainingAmount,
      currencyId: inv.currencyId,
      method: 1,
      reference: '',
      notes: ''
    };
    this.paymentDialog.set(true);
  }

  savePayment(): void {
    if (this.paymentForm.amount <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'أدخل مبلغاً صحيحاً.' });
      return;
    }

    this.paymentSaving.set(true);
    this.invoiceService.createPayment(this.invoiceId, this.paymentForm).subscribe({
      next: (res) => {
        this.paymentSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تسجيل الدفعة.' });
          this.paymentDialog.set(false);
          this.loadInvoice();
        }
      },
      error: (err) => {
        this.paymentSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر تسجيل الدفعة.'
        });
      }
    });
  }

  deletePayment(id: string): void {
    this.confirmationService.confirm({
      message: 'هل تريد حذف هذه الدفعة؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.invoiceService.deletePayment(id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الدفعة.' });
              this.loadInvoice();
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر حذف الدفعة.' });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'invoices' } });
  }

  getStatusName(status: number): string {
    const map: Record<number, string> = {
      1: 'مسودة', 2: 'صادرة', 3: 'مدفوعة جزئياً',
      4: 'مدفوعة', 5: 'متأخرة', 6: 'ملغاة'
    };
    return map[status] ?? '—';
  }

  getPaymentMethodName(method: number): string {
    const map: Record<number, string> = {
      1: 'نقدي', 2: 'بطاقة', 3: 'تحويل بنكي', 4: 'شيك', 99: 'أخرى'
    };
    return map[method] ?? '—';
  }
}