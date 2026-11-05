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
import { DiagnosisTypeService } from '../../../core/services/diagnosis-type.service';
import { TreatmentService } from '../../../core/services/treatment.service';
import { DiagnosisType, DiagnosisTypeFilter } from '../../../core/models/diagnosis-type.model';

@Component({
  selector: 'app-diagnosis-types-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, InputNumberModule,
    SelectModule, SkeletonModule, DialogModule, ToggleSwitchModule, TooltipModule, PaginatorModule
  ],
  templateUrl: './diagnosis-types-list.html',
  styleUrl: './diagnosis-types-list.scss'
})
export class DiagnosisTypesList implements OnInit {
  private service = inject(DiagnosisTypeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private treatmentService = inject(TreatmentService);

  // Treatments Dialog
  treatmentsDialog = signal(false);
  treatmentsSaving = signal(false);
  allTreatments = signal<{ label: string; value: string }[]>([]);
  selectedTreatmentIds = signal<string[]>([]);
  treatmentSearch = signal('');
  editingDiagnosisId = signal<string | null>(null);
  editingDiagnosisName = signal<string>('');

  filteredTreatments = computed(() => {
    const s = this.treatmentSearch().toLowerCase().trim();
    let list = this.allTreatments();
    if (s) {
      list = list.filter(t => t.label.toLowerCase().includes(s));
    }
    return list;
  });

  loading = signal(true);
  items = signal<DiagnosisType[]>([]);
  totalRecords = signal(0);

  filter: DiagnosisTypeFilter = { page: 1, pageSize: 20, search: '', isActive: undefined };

  statusOptions = [
    { label: 'الكل', value: null },
    { label: 'نشط', value: true },
    { label: 'معطّل', value: false }
  ];

  createDialog = signal(false);
  saving = signal(false);
  form = { code: '', nameAr: '', isActive: true };

  editDialog = signal(false);
  editSaving = signal(false);
  editingId = signal<string | null>(null);
  editForm = { code: '', nameAr: '', isActive: true }; // تم إعادة الرمز

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.items.set(res.value);
        this.totalRecords.set(res.value.length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل التشخيصات.' });
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
    this.form = { code: '', nameAr: '', isActive: true };
    this.createDialog.set(true);
  }

  saveCreate(): void {
    if (!this.form.code.trim() || !this.form.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الرمز والاسم مطلوبان.' });
      return;
    }

    this.saving.set(true);
    this.service.create(this.form as any).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء التشخيص.' });
          this.createDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء التشخيص.'
        });
      }
    });
  }

  openEdit(item: DiagnosisType): void {
    this.editingId.set(item.id);
    this.editForm = {
      code: item.code,
      nameAr: item.nameAr,
      isActive: item.isActive
    };
    this.editDialog.set(true);
  }

  saveEdit(): void {
    const id = this.editingId();
    if (!id) return;
    if (!this.editForm.code.trim() || !this.editForm.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الرمز والاسم مطلوبان.' });
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

  confirmDelete(item: DiagnosisType): void {
    this.confirmationService.confirm({
      message: `هل تريد حذف التشخيص "${item.nameAr}"؟`,
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(item.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف التشخيص.' });
              this.load();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف التشخيص.'
            });
          }
        });
      }
    });
  }

  // ============ Treatments Management ============

  openTreatments(item: DiagnosisType): void {
    this.editingDiagnosisId.set(item.id);
    this.editingDiagnosisName.set(item.nameAr);
    this.treatmentSearch.set('');

    this.treatmentService.getAll({ page: 1, pageSize: 500, isActive: true }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.allTreatments.set(res.value.items.map((t: any) => ({ label: t.nameAr, value: t.id })));
        }
      }
    });
  
    this.service.getTreatments(item.id).subscribe({
      next: (res) => {
        if (res.isSuccess) this.selectedTreatmentIds.set(res.value);
        this.treatmentsDialog.set(true);
      }
    });
  }

  isTreatmentSelected(id: string): boolean {
    return this.selectedTreatmentIds().includes(id);
  }

  toggleTreatment(id: string): void {
    const current = this.selectedTreatmentIds();
    if (current.includes(id)) {
      this.selectedTreatmentIds.set(current.filter(x => x !== id));
    } else {
      this.selectedTreatmentIds.set([...current, id]);
    }
  }

  clearTreatments(): void {
    this.selectedTreatmentIds.set([]);
  }
  
  saveTreatments(): void {
    const id = this.editingDiagnosisId();
    if (!id) return;
  
    this.treatmentsSaving.set(true);
    this.service.assignTreatments(id, this.selectedTreatmentIds()).subscribe({
      next: (res) => {
        this.treatmentsSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث العلاجات المرتبطة.' });
          this.treatmentsDialog.set(false);
        }
      },
      error: () => {
        this.treatmentsSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحديث العلاجات.' });
      }
    });
  }
}