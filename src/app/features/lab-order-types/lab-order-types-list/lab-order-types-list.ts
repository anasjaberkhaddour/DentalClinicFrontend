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
import { LabOrderTypeService } from '../../../core/services/lab-order-type.service';
import { LabOrderTypeListItem, LabOrderTypeFilter } from '../../../core/models/lab-order-type.model';

@Component({
  selector: 'app-lab-order-types-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule,
    SelectModule, SkeletonModule, DialogModule, ToggleSwitchModule, TooltipModule, PaginatorModule
  ],
  templateUrl: './lab-order-types-list.html',
  styleUrl: './lab-order-types-list.scss'
})
export class LabOrderTypesList implements OnInit {
  private service = inject(LabOrderTypeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  items = signal<LabOrderTypeListItem[]>([]);
  totalRecords = signal(0);

  filter: LabOrderTypeFilter = { page: 1, pageSize: 20, search: '', isActive: undefined };

  statusOptions = [
    { label: 'الكل', value: null },
    { label: 'نشط', value: true },
    { label: 'معطّل', value: false }
  ];

  createDialog = signal(false);
  saving = signal(false);
  form = { code: '', nameAr: '', isActive: true, displayOrder: 0 };

  editDialog = signal(false);
  editSaving = signal(false);
  editingId = signal<string | null>(null);
  editForm = { nameAr: '', isActive: true, displayOrder: 0 };

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
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الأنواع.' });
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
    this.form = { code: '', nameAr: '', isActive: true, displayOrder: 0 };
    this.createDialog.set(true);
  }

  saveCreate(): void {
    if (!this.form.code.trim() || !this.form.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الرمز والاسم مطلوبان.' });
      return;
    }

    this.saving.set(true);
    this.service.create(this.form).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء النوع.' });
          this.createDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء النوع.'
        });
      }
    });
  }

  openEdit(t: LabOrderTypeListItem): void {
    this.editingId.set(t.id);
    this.editForm = {
      nameAr: t.nameAr,
      isActive: t.isActive,
      displayOrder: t.displayOrder
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

    this.editSaving.set(true);
    this.service.update(id, this.editForm).subscribe({
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

  confirmDelete(t: LabOrderTypeListItem): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف النوع "${t.nameAr}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(t.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف النوع.' });
              this.load();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف النوع.'
            });
          }
        });
      }
    });
  }
}