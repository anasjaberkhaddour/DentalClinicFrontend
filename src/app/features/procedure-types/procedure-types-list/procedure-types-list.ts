import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProcedureTypeService } from '../../../core/services/procedure-type.service';
import { ProcedureTypeListItem, ProcedureTypeFilter } from '../../../core/models/procedure-type.model';

@Component({
  selector: 'app-procedure-types-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule,
    SelectModule, SkeletonModule, DialogModule, ToggleSwitchModule, TooltipModule, PaginatorModule
  ],
  templateUrl: './procedure-types-list.html',
  styleUrl: './procedure-types-list.scss'
})
export class ProcedureTypesList implements OnInit {
  private service = inject(ProcedureTypeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  categoryOptions = [
    { label: 'تشخيصي', value: 'Diagnostic' },
    { label: 'وقائي', value: 'Preventive' },
    { label: 'ترميمي', value: 'Restorative' },
    { label: 'لبّي', value: 'Endodontic' },
    { label: 'جراحي', value: 'Surgical' },
    { label: 'تعويضي', value: 'Prosthetic' },
    { label: 'تقويم', value: 'Orthodontic' },
    { label: 'متابعة', value: 'Follow-up' },
    { label: 'أخرى', value: 'Other' }
  ];

  loading = signal(true);
  items = signal<ProcedureTypeListItem[]>([]);
  totalRecords = signal(0);

  filter: ProcedureTypeFilter = { page: 1, pageSize: 20, search: '', isActive: undefined, };//category: 'Diagnostic' };

  statusOptions = [
    { label: 'الكل', value: null },
    { label: 'نشط', value: true },
    { label: 'معطّل', value: false }
  ];

  createDialog = signal(false);
  saving = signal(false);
  form = {
    code: '', nameAr: '', category: 'Diagnostic',
    requiresSurface: false, requiresTooth: true, createsLabOrder: false,
    isActive: true, displayOrder: 0
  };

  editDialog = signal(false);
  editSaving = signal(false);
  editingId = signal<string | null>(null);
  editForm = {
    nameAr: '', category: 'Diagnostic',
    requiresSurface: false, requiresTooth: true, createsLabOrder: false,
    isActive: true, displayOrder: 0
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.items.set(res.value.items);
        this.totalRecords.set(res.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الإجراءات.' });
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
    this.form = {
      code: '', nameAr: '', category: this.filter.category || 'Diagnostic',
      requiresSurface: false, requiresTooth: true, createsLabOrder: false,
      isActive: true, displayOrder: 0
    };
    this.createDialog.set(true);
  }

  saveCreate(): void {
    if (!this.form.code.trim() || !this.form.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الرمز والاسم مطلوبان.' });
      return;
    }
    if (!this.form.category) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر الفئة.' });
      return;
    }

    this.saving.set(true);
    const payload = {
      ...this.form,
      categoryAr: this.categoryOptions.find(o => o.value === this.form.category)?.label
    };

    this.service.create(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الإجراء.' });
          this.createDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء الإجراء.'
        });
      }
    });
  }

  openEdit(p: ProcedureTypeListItem): void {
    this.editingId.set(p.id);
    this.editForm = {
      nameAr: p.nameAr,
      category: p.category ?? 'Diagnostic',
      requiresSurface: p.requiresSurface,
      requiresTooth: p.requiresTooth,
      createsLabOrder: p.createsLabOrder,
      isActive: p.isActive,
      displayOrder: p.displayOrder
    };
    this.editDialog.set(true);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.editForm.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم مطلوب.' });
      return;
    }
    if (!this.editForm.category) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر الفئة.' });
      return;
    }

    this.editSaving.set(true);
    const payload = {
      ...this.editForm,
      categoryAr: this.categoryOptions.find(o => o.value === this.editForm.category)?.label
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

  confirmDelete(p: ProcedureTypeListItem): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف الإجراء "${p.nameAr}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(p.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الإجراء.' });
              this.load();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف الإجراء.'
            });
          }
        });
      }
    });
  }
}