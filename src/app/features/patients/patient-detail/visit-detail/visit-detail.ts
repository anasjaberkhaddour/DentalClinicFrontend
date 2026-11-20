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
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService, ConfirmationService } from 'primeng/api';
import { VisitService } from '../../../../core/services/visit.service';
import { PrescriptionService } from '../../../../core/services/prescription.service';
import { BrandNameService } from '../../../../core/services/brand-name.service';
import { VisitDetails, UpdateVisitRequest } from '../../../../core/models/patient.model';
import {
  PrescriptionDetails,
  SavePrescriptionItemRequest
} from '../../../../core/models/prescription.model';
import {
  MedicationFormLabels,
  MedicationFrequencyLabels,
  MedicationRouteLabels,
  MedicationFrequency,
  MedicationRoute
} from '../../../../core/constants/enums';

@Component({
  selector: 'app-visit-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, SkeletonModule, TextareaModule, DatePickerModule,
    DialogModule, TooltipModule, AutoCompleteModule, SelectModule, InputTextModule, InputNumberModule
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

  private prescriptionService = inject(PrescriptionService);
  private brandNameService = inject(BrandNameService);

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

  // ============ Prescription Builder ============
  prescription = signal<PrescriptionDetails | null>(null);
  prescriptionLoading = signal(false);
  prescriptionSaving = signal(false);
  prescriptionGeneralNotes = signal<string>('');
  prescriptionItems = signal<(SavePrescriptionItemRequest & {
    brandNameAr?: string;
    activeIngredientNameAr?: string;
  })[]>([]);
  medicationSuggestions = signal<any[]>([]);
  selectedMedication = signal<any>(null);
  medicationSearching = signal(false);

  frequencyOptions = Object.entries(MedicationFrequencyLabels)
    .filter(([k]) => !isNaN(Number(k)))
    .map(([k, v]) => ({ label: v, value: Number(k) }));

  routeOptions = Object.entries(MedicationRouteLabels)
    .filter(([k]) => !isNaN(Number(k)))
    .map(([k, v]) => ({ label: v, value: Number(k) }));

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

    this.loadPrescription();
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

  // ============ Prescription Methods ============
loadPrescription(): void {
  this.prescriptionLoading.set(true);
  this.prescriptionService.getByVisitId(this.visitId).subscribe({
    next: (res) => {
      if (res.isSuccess && res.value) {
        this.prescription.set(res.value);
        this.prescriptionGeneralNotes.set(res.value.generalNotes ?? '');
        this.prescriptionItems.set(res.value.items.map(i => ({
          id: i.id,
          brandNameId: i.brandNameId,
          brandNameAr: i.brandNameAr,
          activeIngredientNameAr: i.activeIngredientNameAr,
          dosage: i.dosage,
          frequency: i.frequency,
          duration: i.duration,
          route: i.route,
          instructions: i.instructions,
          quantity: i.quantity,
          displayOrder: i.displayOrder
        })));
      } else {
        this.prescription.set(null);
        this.prescriptionGeneralNotes.set('');
        this.prescriptionItems.set([]);
      }
      this.prescriptionLoading.set(false);
    },
    error: () => {
      this.prescription.set(null);
      this.prescriptionGeneralNotes.set('');
      this.prescriptionItems.set([]);
      this.prescriptionLoading.set(false);
    }
  });
}

searchMedications(event: any): void {
  const term = event.query?.trim();
  if (!term || term.length < 2) {
    this.medicationSuggestions.set([]);
    return;
  }
  this.medicationSearching.set(true);
  this.brandNameService.search(term).subscribe({
    next: (res) => {
      this.medicationSuggestions.set(res.isSuccess ? res.value : []);
      this.medicationSearching.set(false);
    },
    error: () => {
      this.medicationSuggestions.set([]);
      this.medicationSearching.set(false);
    }
  });
}

addMedication(): void {
  const med = this.selectedMedication();
  if (!med || !med.id) return;

  const exists = this.prescriptionItems().some(i => i.brandNameId === med.id);
  if (exists) {
    this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'هذا الدواء مُضاف بالفعل.' });
    this.selectedMedication.set(null);
    return;
  }

  // 1. إضافة الدواء للـ Cache فوراً لضمان ظهور اسمه في الواجهة
  this.prescriptionSuggestionsCache.update(cache => {
    if (!cache.find((c: any) => c.id === med.id)) {
      return [...cache, med];
    }
    return cache;
  });

  // 2. إضافة العنصر للقائمة
  const newOrder = this.prescriptionItems().length + 1;
  this.prescriptionItems.update(items => [...items, {
    brandNameId: med.id,
    brandNameAr: med.nameAr,
    activeIngredientNameAr: med.activeIngredientNameAr,
    dosage: '1 قرص',
    frequency: 1,
    route: 1,
    quantity: 1,
    displayOrder: items.length + 1
  }]);
  
  this.selectedMedication.set(null);
  }


  removeMedication(brandNameId: string): void {
    this.prescriptionItems.update(items => items.filter(i => i.brandNameId !== brandNameId));
  }

  getMedicationDisplayName(item: any): string {
    const all = this.prescriptionSuggestionsCache();
    const found = all.find((m: any) => m.id === item.brandNameId);
    
    if (found) {
      return `${found.nameAr} (${found.activeIngredientNameAr || found.name})`;
    }
    
    // حل بديل آمن بدلاً من إظهار الـ GUID
    return 'دواء جديد'; 
  }

  // cache لعرض أسماء الأدوية بعد الإضافة
  private prescriptionSuggestionsCache = signal<any[]>([]);

  savePrescription(): void {
    this.prescriptionSaving.set(true);
    const items = this.prescriptionItems().map((i, idx) => ({ ...i, displayOrder: idx + 1 }));
    const request = {
      visitId: this.visitId,
      generalNotes: this.prescriptionGeneralNotes() || undefined,
      items
    };
    this.prescriptionService.save(request).subscribe({
      next: (res) => {
        this.prescriptionSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ الوصفة الطبية.' });
          this.loadPrescription();
        }
      },
      error: (err) => {
        this.prescriptionSaving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر حفظ الوصفة.'
        });
      }
    });
  }

  getFrequencyLabel(f: number): string {
    return MedicationFrequencyLabels[f as MedicationFrequency] ?? '—';
  }
  getRouteLabel(r: number): string {
    return MedicationRouteLabels[r as MedicationRoute] ?? '—';
  }

  printPrescription(): void {
    const v = this.visit();
    if (!v) return;
  
    const age = this.calculateAge(v.patientDateOfBirth);
    const visitDate = this.formatDate(v.visitDate);
  
    // بناء محتوى الوصفة
    let prescriptionContent = '';
    if (v.organizedPrescription && v.organizedPrescription.items.length > 0) {
      prescriptionContent = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
          <thead>
            <tr style="background: rgb(37, 99, 235); color: white;">
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">#</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">اسم الدواء</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">التركيبة</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">الجرعة</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">التكرار</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">المدة</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">طريقة الاستخدام</th>
              <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">الكمية</th>
            </tr>
          </thead>
          <tbody>
          ${v.organizedPrescription.items.map((item: any, idx: number) => `
              <tr style="background: ${idx % 2 === 0 ? '#f9f9f9' : 'white'};">
                <td style="padding: 10px; border: 1px solid #ddd;">${idx + 1}</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><strong>${item.brandNameAr}</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.activeIngredientNameAr}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.dosage}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${this.getFrequencyLabel(item.frequency)}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.duration || '—'}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${this.getRouteLabel(item.route)}${item.instructions ? ' - ' + item.instructions : ''}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${v.organizedPrescription.generalNotes ? `
          <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-right: 4px solid rgb(37, 99, 235); border-radius: 4px;">
            <strong>ملاحظات:</strong> ${v.organizedPrescription.generalNotes}
          </div>
        ` : ''}
      `;
    } else if (this.hasValue(v.prescription)) {
      prescriptionContent = `<div style="white-space: pre-wrap; padding: 15px; border: 1px solid #ccc; border-radius: 4px; min-height: 80px; font-size: 15px; line-height: 2;">${v.prescription}</div>`;
    } else {
      prescriptionContent = `<div style="padding: 15px; text-align: center; color: #999;">لا توجد وصفة</div>`;
    }
  
    const html = `<!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
  <meta charset="UTF-8">
  <title>وصفة طبية - ${v.patientName}</title>
  <style>
    @page { margin: 2cm; }
    body { font-family: Arial, sans-serif; direction: rtl; line-height: 1.8; color: #000; font-size: 14px; }
    .header { text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 25px; }
    .header h1 { margin: 0; font-size: 22px; }
    .header p { margin: 4px 0; color: #555; }
    .info { margin-bottom: 20px; }
    .info-row { display: flex; padding: 8px 12px; background: #f5f5f5; margin-bottom: 6px; border-right: 4px solid rgb(37, 99, 235); }
    .info-label { font-weight: bold; min-width: 140px; }
    .section-title { font-size: 16px; font-weight: bold; margin: 25px 0 10px 0; padding: 8px 12px; background: rgb(37, 99, 235); color: white; border-radius: 4px; }
    .content { padding: 15px; border: 1px solid #ccc; border-radius: 4px; white-space: pre-wrap; min-height: 80px; font-size: 15px; line-height: 2; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #ccc; padding-top: 10px; }
  </style>
  </head>
  <body>
    <div class="header">
      <h1>وصفة طبية</h1>
      <p>${visitDate}</p>
    </div>
    <div class="info">
      <div class="info-row"><div class="info-label">اسم المريض:</div><div>${v.patientName}</div></div>
      <div class="info-row"><div class="info-label">العمر:</div><div>${age}</div></div>
      <div class="info-row"><div class="info-label">اسم الطبيب:</div><div>${v.doctorName}</div></div>
      <div class="info-row"><div class="info-label">العيادة:</div><div>${v.clinicName}</div></div>
    </div>
    ${this.hasValue(v.clinicalExamination) ? `
      <div class="section-title">الفحص السريري</div>
      <div class="content">${v.clinicalExamination}</div>
    ` : ''}
    <div class="section-title">الوصفة الطبية</div>
    ${prescriptionContent}
    ${this.hasValue(v.notes) ? `
      <div class="section-title">ملاحظات</div>
      <div class="content">${v.notes}</div>
    ` : ''}
    <div class="footer">
      <p>تم إنشاء هذه الوصفة إلكترونياً</p>
    </div>
    <script>window.onload = function() { window.print(); }</script>
  </body>
  </html>`;
  
    const w = window.open('', '_blank', 'width=800,height=600');
    if (w) {
      w.document.write(html);
      w.document.close();
    } else {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى السماح بالنوافذ المنبثقة.' });
    }
  }
  
  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }
  
  calculateAge(dateOfBirth?: string): string {
    if (!dateOfBirth) return '—';
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return `${age} سنة`;
  }
}