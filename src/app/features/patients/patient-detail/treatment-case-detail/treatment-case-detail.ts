import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TreatmentCaseService } from '../../../../core/services/treatment-case.service';
import { TreatmentCaseDetails } from '../../../../core/models/treatment-case.model';
import { TreatmentCaseStatusLabels, TreatmentCaseStatusOptions } from '../../../../core/constants/enums';
import { ToothIcon } from '../../../../shared/components/tooth-icon/tooth-icon';
import { FDI_UPPER_RIGHT, FDI_UPPER_LEFT, FDI_LOWER_RIGHT, FDI_LOWER_LEFT } from '../../../../core/models/tooth-chart.model';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-treatment-case-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, SkeletonModule, DialogModule, InputTextModule,
    TextareaModule, MultiSelectModule, DatePickerModule, ToothIcon, TooltipModule 
  ],
  templateUrl: './treatment-case-detail.html',
  styleUrl: './treatment-case-detail.scss'
})
export class TreatmentCaseDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private treatmentCaseService = inject(TreatmentCaseService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  diagnosesEditDialog = signal(false);
  teethEditDialog = signal(false);

  loading = signal(true);
  tc = signal<TreatmentCaseDetails | null>(null);

  patientId!: string;
  caseId!: string;

  upperRight = FDI_UPPER_RIGHT;
  upperLeft = FDI_UPPER_LEFT;
  lowerRight = FDI_LOWER_RIGHT;
  lowerLeft = FDI_LOWER_LEFT;

  patientTeeth = signal<any[]>([]);

  editDialog = signal(false);
  editSaving = signal(false);
  editForm: { title: string; startDate: Date | string | null } = {
    title: '',
    startDate: null
  };

  editFieldSaving = signal(false);
  editingField = signal<'chiefComplaint' | 'clinicalFindings' | 'treatmentPlanSummary' | null>(null);
  inlineEditValue = signal<string>('');

  statusDialog = signal(false);
  statusSaving = signal(false);
  statusForm = { status: 1, cancellationReason: '' };
  TreatmentCaseStatusOptions = TreatmentCaseStatusOptions;

  diagnosisOptions = signal<any[]>([]);
  diagnosisSearch = signal('');
  filteredDiagnoses = computed(() => {
    const search = this.diagnosisSearch().toLowerCase().trim();
    if (!search) return [];
    const currentIds = this.tc()?.diagnoses.map(d => d.diagnosisTypeId) || [];
    return this.diagnosisOptions().filter(d => 
      d.nameAr.toLowerCase().includes(search) && !currentIds.includes(d.id)
    );
  });

  currentTeethSelection = signal<string[]>([]);

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    this.caseId = this.route.snapshot.paramMap.get('caseId') ?? '';

    if (!this.patientId || !this.caseId) {
      this.router.navigate(['/patients']);
      return;
    }
    
    this.loadDiagnoses();
    this.loadTeeth();
    this.loadCase();
  }

  loadCase(): void {
    this.loading.set(true);
    this.treatmentCaseService.getById(this.caseId).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.tc.set(res.value);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الحالة.' });
        this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'treatment-cases' } });
      }
    });
  }

  getStatusName(status: number): string {
    return TreatmentCaseStatusLabels[status] ?? '—';
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1: return 'bg-emerald-100 text-emerald-700';
      case 2: return 'bg-blue-100 text-blue-700';
      case 3: return 'bg-red-100 text-red-700';
      case 4: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  openEdit(): void {
    const c = this.tc();
    if (!c) return;

    this.editForm = {
      title: c.title ?? '',
      startDate: c.startDate ? new Date(c.startDate) : null
    };

    this.editDialog.set(true);
  }

  saveEdit(): void {
    const c = this.tc();
    if (!c) return;

    this.editSaving.set(true);
    
    // تحويل التاريخ إلى YYYY-MM-DD لتفادي مشكلة المناطق الزمنية
    let formattedDate = null;
    if (this.editForm.startDate) {
      const d = new Date(this.editForm.startDate);
      // تعويض فارق التوقيت للحصول على اليوم المحلي الصحيح
      const offset = d.getTimezoneOffset() * 60000;
      formattedDate = new Date(d.getTime() - offset).toISOString().split('T')[0];
    }

    const payload = {
      title: this.editForm.title,
      startDate: formattedDate
    };

    this.treatmentCaseService.update(this.caseId, payload as any).subscribe({
      next: (res: any) => {
        this.editSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ التعديلات.' });
          this.editDialog.set(false);
          this.loadCase();
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

  startEdit(field: 'chiefComplaint' | 'clinicalFindings' | 'treatmentPlanSummary'): void {
    const c = this.tc();
    if (!c) return;
    this.editingField.set(field);
    this.inlineEditValue.set(c[field] ?? '');
  }

  cancelEdit(): void {
    this.editingField.set(null);
    this.inlineEditValue.set('');
  }

  saveInlineEdit(): void {
    const field = this.editingField();
    if (!field) return;
    const c = this.tc();
    if (!c) return;

    this.editFieldSaving.set(true);
    
    const payload = {
      title: c.title,
      startDate: c.startDate,
      chiefComplaint: c.chiefComplaint,
      clinicalFindings: c.clinicalFindings,
      treatmentPlanSummary: c.treatmentPlanSummary,
      notes: c.notes,
      [field]: this.inlineEditValue()
    };

    this.treatmentCaseService.update(this.caseId, payload as any).subscribe({
      next: (res: any) => {
        this.editFieldSaving.set(false);
        if (res.isSuccess) {
          this.tc.update(tc => tc ? { ...tc, [field]: this.inlineEditValue() } : tc);
          this.editingField.set(null);
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم الحفظ.' });
        }
      },
      error: (err) => {
        this.editFieldSaving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر الحفظ.'
        });
      }
    });
  }

  loadDiagnoses(): void {
    this.treatmentCaseService.getDiagnosisTypes().subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          const data = res.value?.items ?? res.value ?? res;
          this.diagnosisOptions.set(Array.isArray(data) ? data : []);
        }
      }
    });
  }

  updateDiagnoses(newIds: string[]): void {
    this.treatmentCaseService.updateDiagnoses(this.caseId, newIds).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث التشخيصات.' });
          this.loadCase();
        }
      }
    });
  }
  
  removeDiagnosis(diagnosisId: string): void {
    const c = this.tc();
    if (!c) return;
    const newIds = c.diagnoses.filter(d => d.id !== diagnosisId).map(d => d.diagnosisTypeId);
    this.updateDiagnoses(newIds);
  }

  addDiagnosis(diagnosisId: string): void {
    const c = this.tc();
    if (!c) return;
    const currentIds = c.diagnoses.map(d => d.diagnosisTypeId);
    if (currentIds.includes(diagnosisId)) return;
    this.updateDiagnoses([...currentIds, diagnosisId]);
    this.diagnosisSearch.set('');
  }

  openDiagnosesEdit(): void {
    if (this.diagnosisOptions().length === 0) this.loadDiagnoses();
    this.diagnosesEditDialog.set(true);
  }

  loadTeeth(): void {
    this.treatmentCaseService.getPatientTeeth(this.patientId).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          const data = res.value?.teeth ?? res.value ?? res;
          const teeth = Array.isArray(data) ? data : [];
          this.patientTeeth.set(teeth);
        }
      }
    });
  }

  getTooth(num: number): any {
    return this.patientTeeth().find(t => t.toothNumber === num);
  }

  isToothSelected(id?: string): boolean {
    if (!id) return false;
    return this.currentTeethSelection().includes(id);
  }

  toggleToothSelection(id?: string): void {
    if (!id) return;
    const current = this.currentTeethSelection();
    if (current.includes(id)) {
      this.currentTeethSelection.set(current.filter(x => x !== id));
    } else {
      this.currentTeethSelection.set([...current, id]);
    }
  }

  updateTeeth(newIds: string[]): void {
    this.treatmentCaseService.updateTeeth(this.caseId, newIds).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث الأسنان.' });
          this.loadCase();
        }
      }
    });
  }
  
  removeTooth(patientToothId: string): void {
    const c = this.tc();
    if (!c) return;
    const newIds = c.teeth.filter(t => t.patientToothId !== patientToothId).map(t => t.patientToothId);
    this.updateTeeth(newIds);
  }

  openTeethEdit(): void {
    if (this.patientTeeth().length === 0) this.loadTeeth();
    const c = this.tc();
    this.currentTeethSelection.set(c ? c.teeth.map(t => t.patientToothId) : []);
    this.teethEditDialog.set(true);
  }

  saveTeeth(): void {
    this.updateTeeth(this.currentTeethSelection());
    this.teethEditDialog.set(false);
  }

  openStatusDialog(): void {
    const c = this.tc();
    if (!c) return;
    this.statusForm = {
      status: c.status,
      cancellationReason: c.cancellationReason ?? ''
    };
    this.statusDialog.set(true);
  }

  saveStatus(): void {
    this.statusSaving.set(true);
    this.treatmentCaseService.updateStatus(
      this.caseId,
      this.statusForm.status,
      this.statusForm.cancellationReason || undefined
    ).subscribe({
      next: (res: any) => {
        this.statusSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث الحالة.' });
          this.statusDialog.set(false);
          this.loadCase();
        }
      },
      error: (err) => {
        this.statusSaving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر تحديث الحالة.'
        });
      }
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه الحالة العلاجية؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.treatmentCaseService.delete(this.caseId).subscribe({
          next: (res: any) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الحالة.' });
              this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'treatment-cases' } });
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف الحالة.'
            });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'treatment-cases' } });
  }

  addVisit(): void {
    this.router.navigate(
      ['/patients', this.patientId, 'visits', 'create'],
      { queryParams: { caseId: this.caseId } }
    );
  }

  sortedVisitsDesc(visits: any[]): any[] {
    return [...visits].sort((a, b) =>
      new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
    );
  }
}