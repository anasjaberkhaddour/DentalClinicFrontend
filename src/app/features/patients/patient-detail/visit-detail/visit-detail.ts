import { Component, OnInit, inject, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { VisitService } from '../../../../core/services/visit.service';
import { VisitDetails, UpdateVisitRequest } from '../../../../core/models/patient.model';

@Component({
  selector: 'app-visit-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, SkeletonModule, TextareaModule, DatePickerModule,
    DialogModule, TooltipModule
  ],
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
  saving = signal(false);

  patientId!: string;
  visitId!: string;

  dateTimeDialog = signal(false);
  editDate: Date | null = null;
  editTime: Date | null = null;

  editFieldSaving = signal(false);
  editingField = signal<'clinicalExamination' | 'proceduresPerformed' | 'prescription' | 'notes' | null>(null);
  inlineEditValue = signal<string>('');

  private toLocalIsoString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const offH = pad(Math.floor(absOffset / 60));
    const offM = pad(absOffset % 60);
    
    return `${y}-${m}-${d}T${h}:${min}:${s}${sign}${offH}:${offM}`;
  }

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

  openDateTimeEdit(): void {
    const v = this.visit();
    if (!v) return;
    const d = new Date(v.visitDate);
    this.editDate = new Date(d);
    this.editTime = new Date(d);
    this.dateTimeDialog.set(true);
  }

  saveDateTime(): void {
    if (!this.editDate || !this.editTime) return;

    const combined = new Date(this.editDate);
    combined.setHours(this.editTime.getHours(), this.editTime.getMinutes(), 0, 0);

    this.saving.set(true);
    const payload: UpdateVisitRequest = {
      visitDate: this.toLocalIsoString(combined),
      clinicalExamination: this.visit()?.clinicalExamination ?? '',
      proceduresPerformed: this.visit()?.proceduresPerformed ?? '',
      prescription: this.visit()?.prescription ?? '',
      notes: this.visit()?.notes ?? '',
      patientToothIds: []
    };

    this.visitService.update(this.visitId, payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.dateTimeDialog.set(false);
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث التاريخ والوقت.' });
          this.loadVisit();
        }
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر التحديث.' });
      }
    });
  }

  startEdit(field: 'clinicalExamination' | 'proceduresPerformed' | 'prescription' | 'notes'): void {
    const v = this.visit();
    if (!v) return;
    this.editingField.set(field);
    this.inlineEditValue.set(v[field] ?? '');
  }

  cancelEdit(): void {
    this.editingField.set(null);
    this.inlineEditValue.set('');
  }

  saveInlineEdit(): void {
    const field = this.editingField();
    if (!field) return;
    const v = this.visit();
    if (!v) return;

    this.editFieldSaving.set(true);
    const payload: UpdateVisitRequest = {
      visitDate: v.visitDate,
      clinicalExamination: v.clinicalExamination ?? '',
      proceduresPerformed: v.proceduresPerformed ?? '',
      prescription: v.prescription ?? '',
      notes: v.notes ?? '',
      patientToothIds: [],
      [field]: this.inlineEditValue()
    } as any;

    this.visitService.update(this.visitId, payload).subscribe({
      next: (res) => {
        this.editFieldSaving.set(false);
        if (res.isSuccess) {
          this.visit.update(val => val ? { ...val, [field]: this.inlineEditValue() } : val);
          this.editingField.set(null);
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم الحفظ.' });
        }
      },
      error: () => {
        this.editFieldSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر الحفظ.' });
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