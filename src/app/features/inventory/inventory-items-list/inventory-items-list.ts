import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryItemService } from '../../../core/services/inventory-item.service';
import { InventoryCategoryService } from '../../../core/services/inventory-category.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ClinicContextService } from '../../../core/services/clinic-context.service';
import { InventoryItem, InventoryItemFilter } from '../../../core/models/inventory-item.model';
import { InventoryUnitOptions, InventoryUnitLabels, InventoryUnit } from '../../../core/constants/enums';
import { ExpiryFilterOptions } from '../../../core/constants/enums';

@Component({
  selector: 'app-inventory-items-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule,
    SelectModule, DatePickerModule, SkeletonModule, DialogModule,
    ToggleSwitchModule, TooltipModule, PaginatorModule
  ],
  templateUrl: './inventory-items-list.html',
  styleUrl: './inventory-items-list.scss'
})
export class InventoryItemsList implements OnInit {
  private service = inject(InventoryItemService);
  private categoryService = inject(InventoryCategoryService);
  private currencyService = inject(CurrencyService);
  private clinicContext = inject(ClinicContextService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  items = signal<InventoryItem[]>([]);
  totalRecords = signal(0);

  unitOptions = InventoryUnitOptions;

  categories = signal<{ label: string; value: string }[]>([]);
  currencies = signal<{ label: string; value: string }[]>([]);

  statusOptions = [
    { label: 'الكل', value: null },
    { label: 'نشط', value: true },
    { label: 'معطّل', value: false }
  ];

  filter: InventoryItemFilter = {
    page: 1,
    pageSize: 20,
    search: '',
    categoryId: undefined,
    isActive: undefined,
    lowStockOnly: false,
    expiryFilter: undefined
  };

  createDialog = signal(false);
  saving = signal(false);
  form = this.emptyForm();

  editDialog = signal(false);
  editSaving = signal(false);
  editingId = signal<string | null>(null);
  editForm = this.emptyForm();

  expiryFilterOptions = ExpiryFilterOptions;

  ngOnInit(): void {
    this.loadLookups();
    this.load();
  }

  emptyForm() {
    return {
      code: '',
      nameAr: '',
      categoryId: null as string | null,
      unit: InventoryUnit.Piece as number,
      minimumStock: 0,
      unitCost: null as number | null,
      currencyId: null as string | null,
      barcode: '',
      manufacturer: '',
      expiryDate: null as Date | null,
      isActive: true
    };
  }

  loadLookups(): void {
    this.categoryService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.categories.set(res.value.items.map((c: any) => ({ label: c.nameAr, value: c.id })));
        }
      }
    });
    this.currencyService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess && Array.isArray(res.value)) {
          this.currencies.set(res.value.map((c: any) => ({ label: `${c.nameAr} (${c.code})`, value: c.id })));
        }
      }
    });
  }

  load(): void {
    this.loading.set(true);
    const filterWithClinic = {
      ...this.filter,
      clinicId: this.clinicContext.clinicId
    };
    this.service.getAll(filterWithClinic as any).subscribe({
      next: (res) => {
        this.items.set(res.value.items);
        this.totalRecords.set(res.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الأصناف.' });
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

  toggleLowStock(): void {
    this.filter.lowStockOnly = !this.filter.lowStockOnly;
    this.filter.page = 1;
    this.load();
  }
  
  getExpiryStatus(date?: string): 'expired' | 'critical' | 'warning' | 'soon' | 'ok' | 'none' {
    if (!date) return 'none';
    const today = new Date();
    const expiry = new Date(date);
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'expired';
    if (diffDays <= 7) return 'critical';
    if (diffDays <= 30) return 'warning';
    if (diffDays <= 60) return 'soon';
    return 'ok';
  }
  
  getExpiryLabel(date?: string): string {
    if (!date) return '—';
    const today = new Date();
    const expiry = new Date(date);
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `منتهية (${Math.abs(diffDays)} يوم)`;
    if (diffDays === 0) return 'تنتهي اليوم';
    if (diffDays === 1) return 'تنتهي غداً';
    if (diffDays <= 7) return `${diffDays} أيام`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} أسابيع`;
    return new Date(date).toLocaleDateString('ar-EG');
  }

  openCreate(): void {
    this.form = this.emptyForm();
    this.createDialog.set(true);
  }

  saveCreate(): void {
    if (!this.form.code.trim() || !this.form.nameAr.trim() ) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الرمز والاسم والوحدة مطلوبة.' });
      return;
    }

    this.saving.set(true);
    const payload = {
      code: this.form.code,
      nameAr: this.form.nameAr,
      clinicId: this.clinicContext.clinicId,
      categoryId: this.form.categoryId || undefined,
      unit: this.form.unit,
      minimumStock: this.form.minimumStock,
      unitCost: this.form.unitCost ?? undefined,
      currencyId: this.form.currencyId || undefined,
      barcode: this.form.barcode || undefined,
      manufacturer: this.form.manufacturer || undefined,
      expiryDate: this.form.expiryDate ? this.form.expiryDate.toISOString() : undefined,
      isActive: this.form.isActive
    };

    this.service.create(payload as any).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الصنف.' });
          this.createDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء الصنف.'
        });
      }
    });
  }

  openEdit(i: InventoryItem): void {
    this.editingId.set(i.id);
    this.editForm = {
      code: i.code,
      nameAr: i.nameAr,
      categoryId: i.categoryId ?? null,
      unit: i.unit,
      minimumStock: i.minimumStock,
      unitCost: i.unitCost ?? null,
      currencyId: i.currencyId ?? null,
      barcode: i.barcode ?? '',
      manufacturer: i.manufacturer ?? '',
      expiryDate: i.expiryDate ? new Date(i.expiryDate) : null,
      isActive: i.isActive
    };
    this.editDialog.set(true);
  }
  
  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.editForm.nameAr.trim() || !this.editForm.unit) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم والوحدة مطلوبان.' });
      return;
    }

    this.editSaving.set(true);
    const payload = {
      nameAr: this.editForm.nameAr,
      categoryId: this.editForm.categoryId || undefined,
      unit: this.editForm.unit,
      minimumStock: this.editForm.minimumStock,
      unitCost: this.editForm.unitCost ?? undefined,
      currencyId: this.editForm.currencyId || undefined,
      barcode: this.editForm.barcode || undefined,
      manufacturer: this.editForm.manufacturer || undefined,
      expiryDate: this.editForm.expiryDate ? this.editForm.expiryDate.toISOString() : undefined,
      isActive: this.editForm.isActive
    };

    this.service.update(id, payload as any).subscribe({
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

  confirmDelete(i: InventoryItem): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف الصنف "${i.nameAr}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(i.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الصنف.' });
              this.load();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف الصنف.'
            });
          }
        });
      }
    });
  }

  getUnitLabel(unit: number): string {
    return InventoryUnitLabels[unit] ?? '—';
  }
}