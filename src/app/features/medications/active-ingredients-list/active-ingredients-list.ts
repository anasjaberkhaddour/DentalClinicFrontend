import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
import { ActiveIngredientService } from '../../../core/services/active-ingredient.service';
import { BrandNameService } from '../../../core/services/brand-name.service';
import { ActiveIngredientListItem, ActiveIngredientFilter } from '../../../core/models/medication.model';

@Component({
  selector: 'app-active-ingredients-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule,
    SelectModule, SkeletonModule, DialogModule, ToggleSwitchModule, TooltipModule, PaginatorModule
  ],
  templateUrl: './active-ingredients-list.html',
  styleUrl: './active-ingredients-list.scss'
})
export class ActiveIngredientsList implements OnInit {
  private service = inject(ActiveIngredientService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private brandNameService = inject(BrandNameService);

  // Brand Names Dialog
  brandsDialog = signal(false);
  brandsSaving = signal(false);
  allBrandNames = signal<{ label: string; value: string }[]>([]);
  selectedBrandIds = signal<string[]>([]);
  brandSearch = signal('');
  editingIngredientId = signal<string | null>(null);
  editingIngredientName = signal<string>('');

  filteredBrands = computed(() => {
    const s = this.brandSearch().toLowerCase().trim();
    let list = this.allBrandNames();
    if (s) {
      list = list.filter(t => t.label.toLowerCase().includes(s));
    }
    return list;
  });

  loading = signal(true);
  items = signal<ActiveIngredientListItem[]>([]);
  totalRecords = signal(0);

  filter: ActiveIngredientFilter = { page: 1, pageSize: 20, search: '', isActive: undefined };

  statusOptions = [
    { label: 'الكل', value: null },
    { label: 'نشط', value: true },
    { label: 'معطّل', value: false }
  ];

  createDialog = signal(false);
  saving = signal(false);
  form = { code: '', name: '', nameAr: '', category: '', categoryAr: '', description: '', commonDosage: '', isActive: true, displayOrder: 0 };

  editDialog = signal(false);
  editSaving = signal(false);
  editingId = signal<string | null>(null);
  editForm = { ...this.form };

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
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل التركيبات الدوائية.' });
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
    this.form = { code: '', name: '', nameAr: '', category: '', categoryAr: '', description: '', commonDosage: '', isActive: true, displayOrder: 0 };
    this.createDialog.set(true);
  }

  saveCreate(): void {
    if (!this.form.code.trim() || !this.form.nameAr.trim() || !this.form.name.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الرمز والاسم والاسم العربي مطلوبة.' });
      return;
    }

    this.saving.set(true);
    this.service.create(this.form as any).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء التركيبة.' });
          this.createDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء التركيبة.'
        });
      }
    });
  }

  openEdit(item: ActiveIngredientListItem): void {
    this.editingId.set(item.id);
    this.editForm = {
      code: item.code,
      name: item.name,
      nameAr: item.nameAr,
      category: item.category ?? '',
      categoryAr: item.categoryAr ?? '',
      description: '',
      commonDosage: '',
      isActive: item.isActive,
      displayOrder: item.displayOrder
    };
    this.editDialog.set(true);

    this.service.getById(item.id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const d = res.value;
          this.editForm = {
            code: d.code,
            name: d.name,
            nameAr: d.nameAr,
            category: d.category ?? '',
            categoryAr: d.categoryAr ?? '',
            description: d.description ?? '',
            commonDosage: d.commonDosage ?? '',
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
    if (!this.editForm.name.trim() || !this.editForm.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم والاسم العربي مطلوبان.' });
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

  confirmDelete(item: ActiveIngredientListItem): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف التركيبة "${item.nameAr}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف التركيبة.' });
              this.load();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف التركيبة.'
            });
          }
        });
      }
    });
  }

  // ============ Brand Names Management ============

  openBrandNames(item: ActiveIngredientListItem): void {
    this.editingIngredientId.set(item.id);
    this.editingIngredientName.set(item.nameAr);
    this.brandSearch.set('');

    this.brandNameService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.allBrandNames.set(res.value.items.map((b: any) => ({ label: b.nameAr, value: b.id })));
        }
      }
    });

    this.service.getBrandNames(item.id).subscribe({
      next: (res) => {
        console.log('Brand IDs:', res);
        console.log('All brands:', this.allBrandNames());
        if (res.isSuccess) this.selectedBrandIds.set(res.value);
        this.brandsDialog.set(true);
      }
    });
  }

  isBrandSelected(id: string): boolean {
    return this.selectedBrandIds().some(x => x.toLowerCase() === id.toLowerCase());
  }
  
  toggleBrand(id: string): void {
    const current = this.selectedBrandIds();
    const exists = current.some(x => x.toLowerCase() === id.toLowerCase());
    if (exists) {
      this.selectedBrandIds.set(current.filter(x => x.toLowerCase() !== id.toLowerCase()));
    } else {
      this.selectedBrandIds.set([...current, id]);
    }
  }

  clearBrands(): void {
    this.selectedBrandIds.set([]);
  }

  saveBrands(): void {
    const id = this.editingIngredientId();
    if (!id) return;

    this.brandsSaving.set(true);
    this.service.assignBrandNames(id, this.selectedBrandIds()).subscribe({
      next: (res) => {
        this.brandsSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث الأسماء التجارية المرتبطة.' });
          this.brandsDialog.set(false);
          this.load();
        }
      },
      error: () => {
        this.brandsSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحديث الأسماء التجارية.' });
      }
    });
  }
}