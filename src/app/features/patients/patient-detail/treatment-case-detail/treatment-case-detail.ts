import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TreatmentCaseService } from '../../../../core/services/treatment-case.service';
import { TreatmentCaseDetails, DiagnosisType } from '../../../../core/models/treatment-case.model';
import { TreatmentCaseStatusLabels, TreatmentCaseStatusOptions } from '../../../../core/constants/enums';

@Component({
  selector: 'app-treatment-case-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, SkeletonModule, DialogModule, InputTextModule,
    TextareaModule, MultiSelectModule
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

  loading = signal(true);
  tc = signal<TreatmentCaseDetails | null>(null);

  patientId!: string;
  caseId!: string;

  // Edit
  editDialog = signal(false);
  editSaving = signal(false);
  diagnosisOptions = signal<{ label: string; value: string }[]>([]);
  toothOptions = signal<{ label: string; value: string }[]>([]);
  editForm = {
    title: '',
    chiefComplaint: '',
    clinicalFindings: '',
    treatmentPlanSummary: '',
    notes: '',
    diagnosisTypeIds: [] as string[],
    patientToothIds: [] as string[]
  };

  // Status
  statusDialog = signal(false);
  statusSaving = signal(false);
  statusForm = {
    status: 1,
    cancellationReason: ''
  };

  TreatmentCaseStatusOptions = TreatmentCaseStatusOptions;

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    this.caseId = this.route.snapshot.paramMap.get('caseId') ?? '';

    if (!this.patientId || !this.caseId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.loadCase();
  }

  loadCase(): void {
    this.loading.set(true);
    this.treatmentCaseService.getById(this.caseId).subscribe({
      next: (res) => {
        if (res.isSuccess) this.tc.set(res.value);
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
      chiefComplaint: c.chiefComplaint ?? '',
      clinicalFindings: c.clinicalFindings ?? '',
      treatmentPlanSummary: c.treatmentPlanSummary ?? '',
      notes: c.notes ?? '',
      diagnosisTypeIds: c.diagnoses.map(d => d.diagnosisTypeId),
      patientToothIds: c.teeth.map(t => t.patientToothId)
    };

    this.loadDiagnoses();
    this.loadTeeth();
    this.editDialog.set(true);
  }

  loadDiagnoses(): void {
    this.treatmentCaseService.getDiagnosisTypes().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.diagnosisOptions.set(res.value.map((d: DiagnosisType) => ({ label: d.nameAr, value: d.id })));
        }
      }
    });
  }

  loadTeeth(): void {
    this.treatmentCaseService.getPatientTeeth(this.patientId).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          const teeth = res.value.teeth ?? res.value;
          this.toothOptions.set(
            teeth.map((t: any) => ({ label: `سن ${t.toothNumber}`, value: t.id }))
          );
        }
      }
    });
  }

  saveEdit(): void {
    if (this.editForm.diagnosisTypeIds.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر تشخيصاً واحداً على الأقل.' });
      return;
    }

    this.editSaving.set(true);
    this.treatmentCaseService.update(this.caseId, this.editForm).subscribe({
      next: (res) => {
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
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر حفظ التعديلات.'
        });
      }
    });
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
      next: (res) => {
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
          severity: 'error',
          summary: 'خطأ',
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
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الحالة.' });
              this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'treatment-cases' } });
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
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