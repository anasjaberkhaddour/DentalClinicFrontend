import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService, ConfirmationService } from 'primeng/api';
import { VisitService } from '../../../../core/services/visit.service';
import { VisitDetails, UpdateVisitRequest } from '../../../../core/models/patient.model';

@Component({
  selector: 'app-visit-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, SkeletonModule, TextareaModule, DatePickerModule],
  templateUrl: './visit-detail.html',
  styleUrl: './visit-detail.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VisitDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private visitService = inject(VisitService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  visit = signal<VisitDetails | null>(null);
  editing = signal(false);
  saving = signal(false);

  patientId!: string;
  visitId!: string;

  // Form as Date for datepicker
  form = {
    visitDate: null as Date | null,
    clinicalExamination: '',
    proceduresPerformed: '',
    prescription: '',
    notes: ''
  };

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    this.visitId = this.route.snapshot.paramMap.get('visitId') ?? '';

    if (!this.patientId || !this.visitId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.loadVisit();
  }

  loadVisit(): void {
    this.loading.set(true);
    this.visitService.getById(this.visitId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.visit.set(response.value);
          this.form = {
            visitDate: new Date(response.value.visitDate),
            clinicalExamination: response.value.clinicalExamination ?? '',
            proceduresPerformed: response.value.proceduresPerformed ?? '',
            prescription: response.value.prescription ?? '',
            notes: response.value.notes ?? ''
          };
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الجلسة.' });
        this.router.navigate(['/patients', this.patientId]);
      }
    });
  }

  startEdit(): void {
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
    this.loadVisit();
  }

  save(): void {
    this.saving.set(true);
    const payload: UpdateVisitRequest = {
      visitDate: this.form.visitDate ? this.form.visitDate.toISOString() : undefined,
      clinicalExamination: this.form.clinicalExamination,
      proceduresPerformed: this.form.proceduresPerformed,
      prescription: this.form.prescription,
      notes: this.form.notes,
      patientToothIds: []
    };

    this.visitService.update(this.visitId, payload).subscribe({
      next: (response) => {
        this.saving.set(false);
        if (response.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ الجلسة.' });
          this.editing.set(false);
          this.loadVisit();
        }
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر حفظ الجلسة.' });
      }
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه الجلسة؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteVisit()
    });
  }

  deleteVisit(): void {
    this.visitService.delete(this.visitId).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الجلسة.' });
          this.goBack();
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر حذف الجلسة.' });
      }
    });
  }

  goBack(): void {
    const v = this.visit();
    if (v?.treatmentCaseId) {
      this.router.navigate(['/patients', this.patientId, 'treatment-cases', v.treatmentCaseId]);
    } else {
      this.router.navigate(['/patients', this.patientId]);
    }
  }

  hasValue(value?: string): boolean {
    return !!value && value.trim().length > 0;
  }
}