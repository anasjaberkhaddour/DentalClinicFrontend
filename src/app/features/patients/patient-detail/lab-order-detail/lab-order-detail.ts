import { Component, OnInit, inject, signal, computed  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';
import { LabOrderService, LabOrderDetails } from '../../../../core/services/lab-order.service';
import { ToothChartService } from '../../../../core/services/tooth-chart.service';
import { MaterialDto } from '../../../../core/models/tooth-chart.model';
import { ShadePicker } from '../../../../shared/components/shade-picker/shade-picker';

@Component({
  selector: 'app-lab-order-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, SkeletonModule, DialogModule, InputNumberModule,
    InputTextModule, TextareaModule, SelectModule, MultiSelectModule, DatePickerModule, ShadePicker
  ],
  templateUrl: './lab-order-detail.html',
  styleUrl: './lab-order-detail.scss'
})
export class LabOrderDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private labOrderService = inject(LabOrderService);
  private toothChartService = inject(ToothChartService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  order = signal<LabOrderDetails | null>(null);
  actionLoading = signal(false);

  materials = signal<MaterialDto[]>([]);
  materialOptions = computed(() =>
    this.materials().map(m => ({ label: m.nameAr, value: m.name }))
  );

  patientId!: string;
  labOrderId!: string;

  paymentDialog = signal(false);
  paymentSaving = signal(false);
  paymentForm = {
    amount: 0,
    currencyId: '',
    method: 1,
    reference: '',
    notes: ''
  };

  finalCostDialog = signal(false);
  finalCostSaving = signal(false);
  finalCostValue = signal<number | null>(null);
  pendingStatus = signal<number | null>(null);

  editDialog = signal(false);
  editSaving = signal(false);
  teethOptions = signal<{ label: string; value: string }[]>([]);
  editForm = {
    estimatedCost: null as number | null,
    expectedDeliveryDate: null as string | null,
    shade: '',
    material: '',
    instructions: '',
    notes: '',
    patientToothIds: [] as string[]
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
    this.labOrderId = this.route.snapshot.paramMap.get('labOrderId') ?? '';

    if (!this.patientId || !this.labOrderId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.loadOrder();
    this.loadMaterials();
  }

  loadMaterials(): void {
    this.toothChartService.getMaterials('Prosthetic').subscribe({
      next: (res) => {
        if (res.isSuccess) this.materials.set(res.value);
      }
    });
  }

  loadOrder(): void {
    this.loading.set(true);
    this.labOrderService.getById(this.labOrderId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.order.set(res.value);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الطلب.' });
        this.router.navigate(['/patients', this.patientId]);
      }
    });
  }

  updateStatus(newStatus: number, needsCost: boolean = false): void {
    const labels: Record<number, string> = {
      2: 'إرسال إلى المخبر',
      4: 'استلام العمل',
      5: 'تسجيل التركيب',
      6: 'إلغاء الطلب',
      7: 'طلب إعادة تصنيع'
    };

    if (needsCost) {
      const o = this.order();
      this.finalCostValue.set(o?.finalCost ?? o?.estimatedCost ?? 0);
      this.pendingStatus.set(newStatus);
      this.finalCostDialog.set(true);
      return;
    }

    this.confirmationService.confirm({
      message: `هل تريد ${labels[newStatus]}؟`,
      header: 'تأكيد',
      icon: 'pi pi-question-circle',
      acceptLabel: 'نعم',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: newStatus === 6 ? 'p-button-danger' : 'p-button-primary',
      accept: () => this.applyStatusChange(newStatus)
    });
  }

  confirmFinalCost(): void {
    const cost = this.finalCostValue();
    const status = this.pendingStatus();

    if (cost === null || cost < 0 || status === null) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'أدخل تكلفة صحيحة.' });
      return;
    }

    this.finalCostSaving.set(true);
    this.labOrderService.updateStatus(this.labOrderId, status, cost).subscribe({
      next: (res) => {
        this.finalCostSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث الطلب.' });
          this.finalCostDialog.set(false);
          this.pendingStatus.set(null);
          this.loadOrder();
        }
      },
      error: () => {
        this.finalCostSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحديث الطلب.' });
      }
    });
  }

  private applyStatusChange(newStatus: number, finalCost?: number): void {
    this.actionLoading.set(true);
    this.labOrderService.updateStatus(this.labOrderId, newStatus, finalCost).subscribe({
      next: (res) => {
        this.actionLoading.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث الحالة.' });
          this.loadOrder();
        }
      },
      error: () => {
        this.actionLoading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحديث الحالة.' });
      }
    });
  }

  openPaymentDialog(): void {
    const o = this.order();
    if (!o) return;

    this.paymentForm = {
      amount: o.finalCost ?? o.estimatedCost ?? 0,
      currencyId: o.currencyId,
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
    this.labOrderService.addPayment(this.labOrderId, this.paymentForm).subscribe({
      next: (res) => {
        this.paymentSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تسجيل الدفعة.' });
          this.paymentDialog.set(false);
          this.loadOrder();
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
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.labOrderService.deletePayment(id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الدفعة.' });
              this.loadOrder();
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر حذف الدفعة.' });
          }
        });
      }
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا الطلب؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.labOrderService.delete(this.labOrderId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الطلب.' });
              this.router.navigate(['/patients', this.patientId]);
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر حذف الطلب.' });
          }
        });
      }
    });
  }

  openEdit(): void {
    const o = this.order();
    if (!o) return;

    this.editForm = {
      estimatedCost: o.estimatedCost ?? null,
      expectedDeliveryDate: o.expectedDeliveryDate ?? null,
      shade: o.shade ?? '',
      material: o.material ?? '',
      instructions: o.instructions ?? '',
      notes: o.notes ?? '',
      patientToothIds: o.teeth.map(t => t.patientToothId)
    };

    this.loadTeethOptions();
    this.editDialog.set(true);
  }

  loadTeethOptions(): void {
    this.toothChartService.getChart(this.patientId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.teethOptions.set(
            res.value.teeth.map((t: any) => ({
              label: `سن ${t.toothNumber}`,
              value: t.id
            }))
          );
        }
      }
    });
  }

  saveEdit(): void {
    this.editSaving.set(true);

    const payload = {
      estimatedCost: this.editForm.estimatedCost,
      expectedDeliveryDate: this.editForm.expectedDeliveryDate,
      shade: this.editForm.shade || null,
      material: this.editForm.material || null,
      instructions: this.editForm.instructions || null,
      notes: this.editForm.notes || null,
      patientToothIds: this.editForm.patientToothIds
    };

    this.labOrderService.update(this.labOrderId, payload).subscribe({
      next: (res) => {
        this.editSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تعديل الطلب.' });
          this.editDialog.set(false);
          this.loadOrder();
        }
      },
      error: (err) => {
        this.editSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر تعديل الطلب.'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'lab-orders' } });
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

  getPaymentMethodName(m: number): string {
    const map: Record<number, string> = { 1: 'نقدي', 2: 'بطاقة', 3: 'تحويل بنكي', 4: 'شيك', 99: 'أخرى' };
    return map[m] ?? '—';
  }

  totalPaid(): number {
    return this.order()?.payments.reduce((s, p) => s + p.amount, 0) ?? 0;
  }

  remaining(): number {
    const o = this.order();
    if (!o) return 0;
    const cost = o.finalCost ?? o.estimatedCost ?? 0;
    return Math.max(0, cost - this.totalPaid());
  }

  canSend(): boolean { return this.order()?.status === 1; }
  canReceive(): boolean { return this.order()?.status === 2; }
  canFit(): boolean { return this.order()?.status === 4; }
  canRemake(): boolean { return this.order()?.status === 4; }
  canCancel(): boolean { return this.order()?.status === 1 || this.order()?.status === 2; }
  canDelete(): boolean { return this.order()?.status === 1 || this.order()?.status === 6; }
  canPay(): boolean { return this.order()?.status !== 6; }
  canResend(): boolean { return this.order()?.status === 7; }
  canEdit(): boolean { return this.order()?.status === 1; }
}