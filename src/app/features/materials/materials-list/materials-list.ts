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
import { MaterialService } from '../../../core/services/material.service';
import { MaterialListItem, MaterialFilter } from '../../../core/models/material.model';

@Component({
  selector: 'app-materials-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule,
    SelectModule, SkeletonModule, DialogModule, ToggleSwitchModule, TooltipModule, PaginatorModule
  ],
  templateUrl: './materials-list.html',
  styleUrl: './materials-list.scss'
})
export class MaterialsList implements OnInit {
  private service = inject(MaterialService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  categoryOptions = [
    { label: 'ترميمي', value: 'Restorative' },
    { label: 'تعويضي', value: 'Prosthetic' },
    { label: 'لبّي', value: 'Endodontic' },
    { label: 'جراحي', value: 'Surgical' },
    { label: 'وقائي', value: 'Preventive' },
    { label: 'تقويمي', value: 'Orthodontic' },
    { label: 'أخرى', value: 'Other' }
  ];

  loading = signal(true);
  materials = signal<MaterialListItem[]>([]);
  totalRecords = signal(0);

  filter: MaterialFilter = { page: 1, pageSize: 20, search: '', isActive: undefined, category: 'Restorative' };

  statusOptions = [
    { label: 'الكل', value: null },
    { label: 'نشط', value: true },
    { label: 'معطّل', value: false }
  ];

  createDialog = signal(false);
  saving = signal(false);
  form = { code: '', nameAr: '', category: 'Restorative', isActive: true, displayOrder: 0 };

  editDialog = signal(false);
  editSaving = signal(false);
  editingId = signal<string | null>(null);
  editForm = { nameAr: '', category: 'Restorative', isActive: true, displayOrder: 0 };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.materials.set(res.value.items);
        this.totalRecords.set(res.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل المواد.' });
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
    this.form = { code: '', nameAr: '', category: this.filter.category || 'Restorative', isActive: true, displayOrder: 0 };
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
      code: this.form.code,
      nameAr: this.form.nameAr,
      category: this.form.category,
      categoryAr: this.categoryOptions.find(o => o.value === this.form.category)?.label,
      isActive: this.form.isActive,
      displayOrder: this.form.displayOrder
    };

    this.service.create(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء المادة.' });
          this.createDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء المادة.'
        });
      }
    });
  }

  openEdit(m: MaterialListItem): void {
    this.editingId.set(m.id);
    this.editForm = {
      nameAr: m.nameAr,
      category: m.category ?? 'Restorative',
      isActive: m.isActive,
      displayOrder: m.displayOrder
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
      nameAr: this.editForm.nameAr,
      category: this.editForm.category,
      categoryAr: this.categoryOptions.find(o => o.value === this.editForm.category)?.label,
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

  confirmDelete(m: MaterialListItem): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف المادة "${m.nameAr}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(m.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف المادة.' });
              this.load();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف المادة.'
            });
          }
        });
      }
    });
  }
}