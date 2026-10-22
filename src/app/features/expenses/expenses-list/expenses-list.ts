import { Component, OnInit, inject, signal } from '@angular/core';
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
import { ExpenseService } from '../../../core/services/expense.service';
import { ExpenseCategoryService } from '../../../core/services/expense-category.service';
import { CurrencyService } from '../../../core/services/currency.service';
import { SupplierService } from '../../../core/services/supplier.service';
import { ClinicContextService } from '../../../core/services/clinic-context.service';
import { Expense, ExpenseFilter } from '../../../core/models/expense.model';
import { PaymentMethodOptions } from '../../../core/constants/enums';

@Component({
  selector: 'app-expenses-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule,
    TextareaModule, SelectModule, DatePickerModule, SkeletonModule, DialogModule,
    TooltipModule, PaginatorModule
  ],
  templateUrl: './expenses-list.html',
  styleUrl: './expenses-list.scss'
})
export class ExpensesList implements OnInit {
  private service = inject(ExpenseService);
  private categoryService = inject(ExpenseCategoryService);
  private currencyService = inject(CurrencyService);
  private supplierService = inject(SupplierService);
  private clinicContext = inject(ClinicContextService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  expenses = signal<Expense[]>([]);
  totalRecords = signal(0);
  totalAmount = signal(0);

  categories = signal<{ label: string; value: string }[]>([]);
  currencies = signal<{ label: string; value: string }[]>([]);
  suppliers = signal<{ label: string; value: string }[]>([]);

  paymentMethodOptions = PaymentMethodOptions;

  filter: ExpenseFilter = {
    page: 1,
    pageSize: 20,
    search: '',
    categoryId: undefined,
    supplierId: undefined,
    paymentMethod: undefined,
    fromDate: undefined,
    toDate: undefined
  };

  createDialog = signal(false);
  saving = signal(false);
  form = this.emptyForm();

  editDialog = signal(false);
  editSaving = signal(false);
  editingId = signal<string | null>(null);
  editForm = this.emptyForm();

  ngOnInit(): void {
    this.loadLookups();
    this.load();
  }

  emptyForm() {
    return {
      categoryId: '',
      amount: 0,
      currencyId: '',
      expenseDate: new Date(),
      description: '',
      reference: '',
      paymentMethod: null as number | null,
      supplierId: null as string | null
    };
  }

  loadLookups(): void {
    this.categoryService.getAll({ page: 1, pageSize: 200 }).subscribe({
      next: (res) => {
        if (res.isSuccess && res.value.items) {
          this.categories.set(res.value.items.map((c: any) => ({ label: c.nameAr, value: c.id })));
        }
      }
    });
    this.currencyService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess && Array.isArray(res.value)) {
          this.currencies.set(res.value.map((c: any) => ({ label: `${c.nameAr} (${c.code})`, value: c.id })));
          const base = res.value.find((c: any) => c.isBase);
          if (base) this.form.currencyId = base.id;
        }
      }
    });
    this.supplierService.getAll({ page: 1, pageSize: 200 }).subscribe({
      next: (res) => {
        if (res.isSuccess && res.value.items) {
          this.suppliers.set(res.value.items.map((s: any) => ({ label: s.nameAr, value: s.id })));
        }
      }
    });
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.expenses.set(res.value.items);
        this.totalRecords.set(res.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل المصروفات.' });
      }
    });

    this.service.getTotal(this.filter).subscribe({
      next: (res) => {
        if (res.isSuccess) this.totalAmount.set(res.value);
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

  resetFilters(): void {
    this.filter = {
      page: 1,
      pageSize: 20,
      search: '',
      categoryId: undefined,
      supplierId: undefined,
      paymentMethod: undefined,
      fromDate: undefined,
      toDate: undefined
    };
    this.load();
  }

  openCreate(): void {
    this.form = this.emptyForm();
    const defaultCurrency = this.currencies().length === 1 ? this.currencies()[0].value : '';
    this.form.currencyId = defaultCurrency;
    this.createDialog.set(true);
  }

  saveCreate(): void {
    if (!this.form.categoryId || !this.form.currencyId || this.form.amount <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الفئة والعملة والمبلغ مطلوبة.' });
      return;
    }

    this.saving.set(true);
    const payload = {
      clinicId: this.clinicContext.clinicId,
      categoryId: this.form.categoryId,
      amount: this.form.amount,
      currencyId: this.form.currencyId,
      expenseDate: this.form.expenseDate,
      description: this.form.description || undefined,
      reference: this.form.reference || undefined,
      paymentMethod: this.form.paymentMethod || undefined,
      supplierId: this.form.supplierId || undefined
    };

    this.service.create(payload as any).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء المصروف.' });
          this.createDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء المصروف.'
        });
      }
    });
  }

  openEdit(e: Expense): void {
    this.editingId.set(e.id);
    this.editForm = {
      categoryId: e.categoryId,
      amount: e.amount,
      currencyId: e.currencyId,
      expenseDate: new Date(e.expenseDate),
      description: e.description ?? '',
      reference: e.reference ?? '',
      paymentMethod: e.paymentMethod ?? null,
      supplierId: e.supplierId ?? null
    };
    this.editDialog.set(true);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.editForm.categoryId || !this.editForm.currencyId || this.editForm.amount <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الفئة والعملة والمبلغ مطلوبة.' });
      return;
    }

    this.editSaving.set(true);
    const payload = {
      categoryId: this.editForm.categoryId,
      amount: this.editForm.amount,
      currencyId: this.editForm.currencyId,
      expenseDate: this.editForm.expenseDate,
      description: this.editForm.description || undefined,
      reference: this.editForm.reference || undefined,
      paymentMethod: this.editForm.paymentMethod || undefined,
      supplierId: this.editForm.supplierId || undefined
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

  confirmDelete(e: Expense): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف المصروف بمبلغ ${e.amount} ${e.currencySymbol}؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(e.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف المصروف.' });
              this.load();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف المصروف.'
            });
          }
        });
      }
    });
  }

  getPaymentMethodLabel(method?: number): string {
    if (!method) return '—';
    return PaymentMethodOptions.find(o => o.value === method)?.label ?? '—';
  }
}