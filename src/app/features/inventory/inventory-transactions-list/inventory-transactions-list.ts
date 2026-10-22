import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService, ConfirmationService } from 'primeng/api';
import { InventoryTransactionService } from '../../../core/services/inventory-transaction.service';
import { InventoryItemService } from '../../../core/services/inventory-item.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { ClinicContextService } from '../../../core/services/clinic-context.service';
import { InventoryTransaction, InventoryTransactionFilter, InventoryBatchOption } from '../../../core/models/inventory-transaction.model';
import { InventoryItem } from '../../../core/models/inventory-item.model';
import {
  InventoryTransactionType,
  InventoryTransactionTypeLabels,
  InventoryTransactionTypeOptions
} from '../../../core/constants/enums';
import { ExpiryFilterOptions } from '../../../core/constants/enums';

@Component({
  selector: 'app-inventory-transactions-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule,
    TextareaModule, SelectModule, DatePickerModule, SkeletonModule, DialogModule,
    TooltipModule, PaginatorModule
  ],
  templateUrl: './inventory-transactions-list.html',
  styleUrl: './inventory-transactions-list.scss'
})
export class InventoryTransactionsList implements OnInit {
  private service = inject(InventoryTransactionService);
  private itemService = inject(InventoryItemService);
  private supplierService = inject(SupplierService);
  private currencyService = inject(CurrencyService);
  private clinicContext = inject(ClinicContextService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  items = signal<InventoryTransaction[]>([]);
  totalRecords = signal(0);

  inventoryItems = signal<{ label: string; value: string; unit: number; currentStock: number }[]>([]);
  suppliers = signal<{ label: string; value: string }[]>([]);
  currencies = signal<{ label: string; value: string }[]>([]);
  batches = signal<InventoryBatchOption[]>([]);
  loadingBatches = signal(false);

  typeOptions = InventoryTransactionTypeOptions;

  expiryFilterOptions = ExpiryFilterOptions;

  filter: InventoryTransactionFilter = {
    page: 1,
    pageSize: 20,
    search: '',
    type: undefined,
    inventoryItemId: undefined,
    supplierId: undefined,
    fromDate: undefined,
    toDate: undefined,
    expiryFilter: undefined as number | undefined,
    onlyWithRemaining: undefined as boolean | undefined
  };

  createDialog = signal(false);
  saving = signal(false);
  form = this.emptyForm();

  isIncoming = computed(() => {
    const t = this.form.type;
    return t === InventoryTransactionType.Purchase ||
           t === InventoryTransactionType.InitialStock ||
           t === InventoryTransactionType.Return;
  });

  isOutgoing = computed(() => {
    const t = this.form.type;
    return t === InventoryTransactionType.Usage ||
           t === InventoryTransactionType.Damage;
  });

  isAdjustment = computed(() => this.form.type === InventoryTransactionType.Adjustment);

  ngOnInit(): void {
    this.loadLookups();
    this.load();
  }

  emptyForm() {
    return {
      inventoryItemId: '',
      type: InventoryTransactionType.Purchase as number,
      quantity: 0,
      unitCost: null as number | null,
      currencyId: null as string | null,
      supplierId: null as string | null,
      reference: '',
      notes: '',
      transactionDate: new Date(),
      expiryDate: null as Date | null,
      sourceTransactionId: null as string | null
    };
  }

  loadLookups(): void {
    this.itemService.getAll({ page: 1, pageSize: 500, clinicId: this.clinicContext.clinicId || undefined } as any).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.inventoryItems.set(res.value.items.map((i: InventoryItem) => ({
            label: `${i.nameAr} (${i.code})`,
            value: i.id,
            unit: i.unit,
            currentStock: i.currentStock
          })));
        }
      }
    });
    this.supplierService.getAll({ page: 1, pageSize: 200 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.suppliers.set(res.value.items.map((s: any) => ({ label: s.nameAr, value: s.id })));
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
    const f = { ...this.filter, clinicId: this.clinicContext.clinicId || undefined };
    this.service.getAll(f).subscribe({
      next: (res) => {
        this.items.set(res.value.items);
        this.totalRecords.set(res.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الحركات.' });
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
    this.batches.set([]);
    this.createDialog.set(true);
  }

  onTypeChange(): void {
    this.form.sourceTransactionId = null;
    this.form.expiryDate = null;
    this.batches.set([]);
    if (this.isOutgoing()) {
      this.loadBatches();
    }
  }

  onItemChange(): void {
    this.form.sourceTransactionId = null;
    this.batches.set([]);
    if (this.isOutgoing()) {
      this.loadBatches();
    }
  }

  loadBatches(): void {
    if (!this.form.inventoryItemId || !this.clinicContext.clinicId) return;
    this.loadingBatches.set(true);
    this.service.getAll({
      inventoryItemId: this.form.inventoryItemId,
      clinicId: this.clinicContext.clinicId,
      page: 1,
      pageSize: 200
    }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const list: InventoryBatchOption[] = res.value.items
            .filter((t: any) => t.batchRemaining && t.batchRemaining > 0)
            .map((t: any) => ({
              id: t.id,
              label: `${t.quantity} - متبقي ${t.batchRemaining}${t.expiryDate ? ' - صلاحية ' + new Date(t.expiryDate).toLocaleDateString('ar-EG') : ''}`,
              remaining: t.batchRemaining,
              expiryDate: t.expiryDate
            }))
            .sort((a, b) => {
              if (!a.expiryDate) return 1;
              if (!b.expiryDate) return -1;
              return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
            });
          this.batches.set(list);
        }
        this.loadingBatches.set(false);
      },
      error: () => this.loadingBatches.set(false)
    });
  }

  saveCreate(): void {
    if (!this.form.inventoryItemId || this.form.quantity <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر الصنف وأدخل كمية صحيحة.' });
      return;
    }

    if (this.form.type === InventoryTransactionType.Adjustment && !this.form.notes.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'التسوية تتطلب ملاحظة توضح السبب.' });
      return;
    }

    this.saving.set(true);
    const payload = {
      inventoryItemId: this.form.inventoryItemId,
      clinicId: this.clinicContext.clinicId,
      type: this.form.type,
      quantity: this.form.quantity,
      unitCost: this.form.unitCost ?? undefined,
      currencyId: this.form.currencyId || undefined,
      supplierId: this.form.supplierId || undefined,
      reference: this.form.reference || undefined,
      notes: this.form.notes || undefined,
      transactionDate: this.form.transactionDate,
      expiryDate: this.isIncoming() && this.form.expiryDate ? this.form.expiryDate.toISOString() : undefined,
      sourceTransactionId: this.form.sourceTransactionId || undefined
    };

    this.service.create(payload as any).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الحركة.' });
          this.createDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء الحركة.'
        });
      }
    });
  }

  confirmDelete(t: InventoryTransaction): void {
    this.confirmationService.confirm({
      message: 'هل تريد حذف هذه الحركة؟ سيتم تعديل رصيد الصنف.',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(t.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الحركة.' });
              this.load();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف الحركة.'
            });
          }
        });
      }
    });
  }

  getTypeLabel(type: number): string {
    return InventoryTransactionTypeLabels[type] ?? '—';
  }

  getTypeSeverity(type: number): string {
    switch (type) {
      case InventoryTransactionType.Purchase: return 'success';
      case InventoryTransactionType.InitialStock: return 'info';
      case InventoryTransactionType.Return: return 'info';
      case InventoryTransactionType.Usage: return 'warn';
      case InventoryTransactionType.Damage: return 'danger';
      case InventoryTransactionType.Adjustment: return 'secondary';
      case InventoryTransactionType.Transfer: return 'secondary';
      default: return 'secondary';
    }
  }

  isIncomingType(type: number): boolean {
    return type === InventoryTransactionType.Purchase ||
           type === InventoryTransactionType.InitialStock ||
           type === InventoryTransactionType.Return;
  }

  toggleOnlyRemaining(): void {
    this.filter.onlyWithRemaining = this.filter.onlyWithRemaining ? undefined : true;
    this.filter.page = 1;
    this.load();
  }
}