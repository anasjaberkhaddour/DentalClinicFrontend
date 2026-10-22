import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TreatmentService } from '../../../core/services/treatment.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { TreatmentListItem, TreatmentFilter } from '../../../core/models/treatment.model';
import { Currency } from '../../../core/models/currency.model';

@Component({
  selector: 'app-treatments-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule,
    TextareaModule, SelectModule, SkeletonModule, DialogModule,
    ToggleSwitchModule, TooltipModule, PaginatorModule
  ],
  templateUrl: './treatments-list.html',
  styleUrl: './treatments-list.scss'
})
export class TreatmentsList implements OnInit {
  private service = inject(TreatmentService);
  private currencyService = inject(CurrencyService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  treatments = signal<TreatmentListItem[]>([]);
  totalRecords = signal(0);
  currencies = signal<{ label: string; value: string }[]>([]);

  filter: TreatmentFilter = { page: 1, pageSize: 20, search: '', isActive: undefined };

  statusOptions = [
    { label: 'الكل', value: null },
    { label: 'نشط', value: true },
    { label: 'معطّل', value: false }
  ];

  createDialog = signal(false);
  saving = signal(false);
  form = this.emptyForm();

  editDialog = signal(false);
  editSaving = signal(false);
  editingId = signal<string | null>(null);
  editForm = this.emptyForm();

  ngOnInit(): void {
    this.loadCurrencies();
    this.load();
  }

  emptyForm() {
    return {
      code: '',
      nameAr: '',
      categoryAr: '',
      descriptionAr: '',
      estimatedPrice: 0,
      currencyId: null as string | null,
      estimatedDurationMinutes: 0,
      requiresTooth: false,
      requiresSurface: false,
      createsLabOrder: false,
      isActive: true,
      displayOrder: 0
    };
  }

  loadCurrencies(): void {
    this.currencyService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess && Array.isArray(res.value)) {
          this.currencies.set(
            res.value.map((c: Currency) => ({ label: `${c.nameAr} (${c.code})`, value: c.id }))
          );
        }
      }
    });
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.treatments.set(res.value.items);
        this.totalRecords.set(res.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل العلاجات.' });
      }
    });
  }

  onSearch(): void {
    this.filter.page = 1;
    this.load();
  }

  onPageChange(event: any): void {
    this.filter.page = event.page + 1;
    this.filter.pageSize = event.rows;
    this.load();
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.createDialog.set(true);
  }

  saveCreate(): void {
    if (!this.form.code.trim() || !this.form.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الرمز والاسم مطلوبان.' });
      return;
    }

    this.saving.set(true);
    const payload = {
      ...this.form,
      currencyId: this.form.currencyId || undefined
    };

    this.service.create(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء العلاج.' });
          this.createDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء العلاج.'
        });
      }
    });
  }

  openEdit(t: TreatmentListItem): void {
    this.editingId.set(t.id);
    this.editForm = {
      code: t.code,
      nameAr: t.nameAr,
      categoryAr: t.categoryAr ?? '',
      descriptionAr: '',
      estimatedPrice: t.estimatedPrice,
      currencyId: null,
      estimatedDurationMinutes: t.estimatedDurationMinutes,
      requiresTooth: t.requiresTooth,
      requiresSurface: t.requiresSurface,
      createsLabOrder: t.createsLabOrder,
      isActive: t.isActive,
      displayOrder: t.displayOrder
    };
    this.editDialog.set(true);

    this.service.getById(t.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const d = res.value;
          this.editForm = {
            code: d.code,
            nameAr: d.nameAr,
            categoryAr: d.categoryAr ?? '',
            descriptionAr: d.descriptionAr ?? '',
            estimatedPrice: d.estimatedPrice,
            currencyId: d.currencyId ?? null,
            estimatedDurationMinutes: d.estimatedDurationMinutes,
            requiresTooth: d.requiresTooth,
            requiresSurface: d.requiresSurface,
            createsLabOrder: d.createsLabOrder,
            isActive: d.isActive,
            displayOrder: d.displayOrder
          };
        }
      }
    });
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.editForm.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم مطلوب.' });
      return;
    }

    this.editSaving.set(true);
    const payload = {
      nameAr: this.editForm.nameAr,
      categoryAr: this.editForm.categoryAr || undefined,
      descriptionAr: this.editForm.descriptionAr || undefined,
      estimatedPrice: this.editForm.estimatedPrice,
      currencyId: this.editForm.currencyId || undefined,
      estimatedDurationMinutes: this.editForm.estimatedDurationMinutes,
      requiresTooth: this.editForm.requiresTooth,
      requiresSurface: this.editForm.requiresSurface,
      createsLabOrder: this.editForm.createsLabOrder,
      isActive: this.editForm.isActive,
      displayOrder: this.editForm.displayOrder
    };

    this.service.update(id, payload).subscribe({
      next: (res) => {
        this.editSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ التعديلات.' });
          this.editDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.editSaving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر حفظ التعديلات.'
        });
      }
    });
  }

  confirmDelete(t: TreatmentListItem): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف العلاج "${t.nameAr}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(t.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف العلاج.' });
              this.load();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف العلاج.'
            });
          }
        });
      }
    });
  }
}