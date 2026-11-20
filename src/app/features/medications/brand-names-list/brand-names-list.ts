import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BrandNameService } from '../../../core/services/brand-name.service';
import { ActiveIngredientService } from '../../../core/services/active-ingredient.service';
import { BrandNameListItem, BrandNameFilter } from '../../../core/models/medication.model';
import { MedicationForm, MedicationFormLabels } from '../../../core/constants/enums';

@Component({
  selector: 'app-brand-names-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    SelectModule, SkeletonModule, DialogModule, ToggleSwitchModule, TooltipModule, PaginatorModule
  ],
  templateUrl: './brand-names-list.html',
  styleUrl: './brand-names-list.scss'
})
export class BrandNamesList implements OnInit {
  private service = inject(BrandNameService);
  private ingredientService = inject(ActiveIngredientService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  items = signal<BrandNameListItem[]>([]);
  totalRecords = signal(0);
  ingredients = signal<{ label: string; value: string }[]>([]);
  formOptions = signal<{ label: string; value: number }[]>([]);

  filter: BrandNameFilter = { page: 1, pageSize: 20, search: '', activeIngredientId: undefined, isActive: undefined };

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
    this.loadIngredients();
    this.loadFormOptions();
    this.load();
  }

  emptyForm() {
    return {
      activeIngredientId: null as string | null,
      code: '',
      name: '',
      nameAr: '',
      manufacturer: '',
      country: '',
      form: MedicationForm.Tablet,
      strength: '',
      isActive: true
    };
  }

  loadIngredients(): void {
    this.ingredientService.getAll({ page: 1, pageSize: 1000, isActive: true }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.ingredients.set(
            res.value.items.map((i: any) => ({ label: `${i.nameAr} (${i.code})`, value: i.id }))
          );
        }
      }
    });
  }

  loadFormOptions(): void {
    this.formOptions.set(
      Object.entries(MedicationFormLabels)
        .filter(([k]) => !isNaN(Number(k)))
        .map(([k, v]) => ({ label: v, value: Number(k) }))
    );
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
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الأسماء التجارية.' });
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
    if (!this.form.activeIngredientId || !this.form.code.trim() || !this.form.name.trim() || !this.form.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'التركيبة والرمز والاسم والاسم العربي مطلوبة.' });
      return;
    }

    this.saving.set(true);
    this.service.create(this.form as any).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الاسم التجاري.' });
          this.createDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء الاسم التجاري.'
        });
      }
    });
  }

  openEdit(item: BrandNameListItem): void {
    this.editingId.set(item.id);
    this.editForm = {
      activeIngredientId: item.activeIngredientId,
      code: item.code,
      name: item.name,
      nameAr: item.nameAr,
      manufacturer: item.manufacturer ?? '',
      country: '',
      form: item.form,
      strength: item.strength ?? '',
      isActive: item.isActive
    };
    this.editDialog.set(true);

    this.service.getById(item.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const d = res.value;
          this.editForm = {
            activeIngredientId: d.activeIngredientId,
            code: d.code,
            name: d.name,
            nameAr: d.nameAr,
            manufacturer: d.manufacturer ?? '',
            country: d.country ?? '',
            form: d.form,
            strength: d.strength ?? '',
            isActive: d.isActive
          };
        }
      }
    });
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.editForm.activeIngredientId || !this.editForm.name.trim() || !this.editForm.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'التركيبة والاسم والاسم العربي مطلوبة.' });
      return;
    }

    this.editSaving.set(true);
    this.service.update(id, this.editForm as any).subscribe({
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

  confirmDelete(item: BrandNameListItem): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف الاسم التجاري "${item.nameAr}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الاسم التجاري.' });
              this.load();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف الاسم التجاري.'
            });
          }
        });
      }
    });
  }
}