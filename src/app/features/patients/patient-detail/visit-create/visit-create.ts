import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { VisitService, CreateVisitRequest } from '../../../../core/services/visit.service';
import { ClinicService } from '../../../../core/services/clinic.service';
import { TreatmentCaseService } from '../../../../core/services/treatment-case.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';
import { PrescriptionService } from '../../../../core/services/prescription.service';
import { BrandNameService } from '../../../../core/services/brand-name.service';
import { SavePrescriptionItemRequest } from '../../../../core/models/prescription.model';
import {
  MedicationFrequency,
  MedicationRoute,
  MedicationFrequencyLabels,
  MedicationRouteLabels
} from '../../../../core/constants/enums';
import { PatientService } from '../../../../core/services/patient.service';
@Component({
  selector: 'app-visit-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule,
    SelectModule, DatePickerModule, AutoCompleteModule, InputNumberModule
  ],
  templateUrl: './visit-create.html',
  styleUrl: './visit-create.scss'
})
export class VisitCreate implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private visitService = inject(VisitService);
  private clinicService = inject(ClinicService);
  private treatmentCaseService = inject(TreatmentCaseService);
  private tokenStorage = inject(TokenStorageService);
  private messageService = inject(MessageService);

  private patientService = inject(PatientService);
  patientName = signal<string>('');
  private prescriptionService = inject(PrescriptionService);
  private brandNameService = inject(BrandNameService);

  patientId!: string;
  caseId: string | null = null;
  saving = signal(false);
  clinics = signal<{ label: string; value: string }[]>([]);

  visitDate: Date | null = new Date();
  visitTime: Date | null = new Date(new Date().getTime() - 30 * 60000);

  form: CreateVisitRequest = {
    patientId: '',
    treatmentCaseId: undefined as string | undefined,
    clinicId: '',
    doctorId: '',
    visitDate: undefined,
    patientToothIds: [],
  };
// ============ Prescription Builder ============
  prescriptionItems = signal<(SavePrescriptionItemRequest & {
    brandNameAr?: string;
    activeIngredientNameAr?: string;
  })[]>([]);
  medicationSuggestions = signal<any[]>([]);
  selectedMedication = signal<any>(null);
  prescriptionGeneralNotes = signal<string>('');
  private prescriptionSuggestionsCache = signal<any[]>([]);

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
    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.form.patientId = this.patientId;

    const caseId = this.route.snapshot.queryParamMap.get('caseId');
    if (caseId) {
      this.caseId = caseId;
      this.form.treatmentCaseId = caseId;
      this.loadCaseClinic(caseId);
    }

    const user = this.tokenStorage.getUser();
    if (user) {
      this.form.doctorId = this.getUserIdFromToken();
    }

    this.loadClinics();

    this.patientService.getById(this.patientId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.patientName.set(`${res.value.firstName} ${res.value.lastName}`);
        }
      }
    });
  }

  loadCaseClinic(caseId: string): void {
    this.treatmentCaseService.getById(caseId).subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.value.clinicId) {
          this.form.clinicId = res.value.clinicId;
        }
      }
    });
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.clinics.set(
            response.value.map((c: any) => ({
              label: c.name,
              value: c.id
            }))
          );

          if (this.clinics().length === 1 && !this.form.clinicId) {
            this.form.clinicId = this.clinics()[0].value;
          }
        }
      }
    });
  }

  getUserIdFromToken(): string {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return '';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? '';
    } catch {
      return '';
    }
  }

  searchMedications(event: any): void {
    const term = event.query?.trim();
    if (!term || term.length < 2) {
      this.medicationSuggestions.set([]);
      return;
    }
    this.brandNameService.search(term).subscribe({
      next: (res) => {
        this.medicationSuggestions.set(res.isSuccess ? res.value : []);
      },
      error: () => {
        this.medicationSuggestions.set([]);
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
  
    // حفظ في Cache لضمان ظهور الاسم
    this.prescriptionSuggestionsCache.update(cache => {
      if (!cache.find((c: any) => c.id === med.id)) {
        return [...cache, med];
      }
      return cache;
    });
  
    const newOrder = this.prescriptionItems().length + 1;
    this.prescriptionItems.update(items => [...items, {
      brandNameId: med.id,
      brandNameAr: med.nameAr,
      activeIngredientNameAr: med.activeIngredientNameAr,
      dosage: '1 قرص',
      frequency: MedicationFrequency.OnceDaily,
      route: MedicationRoute.Oral,
      quantity: 1,
      displayOrder: newOrder
    }]);
  
    this.selectedMedication.set(null);
  }
  
  removeMedication(brandNameId: string): void {
    this.prescriptionItems.update(items => items.filter(i => i.brandNameId !== brandNameId));
  }
  
  getMedicationDisplayName(item: any): string {
    if (item.brandNameAr) {
      return `${item.brandNameAr} (${item.activeIngredientNameAr || ''})`;
    }
    const all = this.prescriptionSuggestionsCache();
    const found = all.find((m: any) => m.id === item.brandNameId);
    if (found) {
      return `${found.nameAr} (${found.activeIngredientNameAr || found.name})`;
    }
    return 'دواء جديد';
  }

  save(): void {
  if (!this.form.clinicId) {
    this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار العيادة.' });
    return;
  }
  if (!this.visitDate || !this.visitTime) {
    this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى تحديد التاريخ والوقت.' });
    return;
  }

  const combined = new Date(this.visitDate);
  combined.setHours(this.visitTime.getHours(), this.visitTime.getMinutes(), 0, 0);
  this.form.visitDate = this.toLocalIsoString(combined);

  this.saving.set(true);
  this.visitService.create(this.form).subscribe({
    next: (response) => {
      if (response.isSuccess) {
        const visitId = response.value;

        // إذا كان هناك أدوية في الوصفة، احفظها
        if (this.prescriptionItems().length > 0) {
          const prescriptionRequest = {
            visitId: visitId,
            generalNotes: this.prescriptionGeneralNotes() || undefined,
            items: this.prescriptionItems().map((item, idx) => ({
              brandNameId: item.brandNameId,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              route: item.route,
              instructions: item.instructions,
              quantity: item.quantity,
              displayOrder: idx + 1
            }))
          };

          this.prescriptionService.save(prescriptionRequest).subscribe({
            next: (prescRes) => {
              this.saving.set(false);
              if (prescRes.isSuccess) {
                this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الجلسة والوصفة بنجاح.' });
                this.navigateToAfterSave(visitId);
              } else {
                this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'تم إنشاء الجلسة لكن تعذّر حفظ الوصفة.' });
                this.navigateToAfterSave(visitId);
              }
            },
            error: () => {
              this.saving.set(false);
              this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'تم إنشاء الجلسة لكن تعذّر حفظ الوصفة.' });
              this.navigateToAfterSave(visitId);
            }
          });
        } else {
          this.saving.set(false);
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الجلسة بنجاح.' });
          this.navigateToAfterSave(visitId);
        }
      }
    },
    error: (err) => {
      this.saving.set(false);
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: err?.error?.error?.message ?? 'تعذّر إنشاء الجلسة.'
      });
    }
  });
}

private navigateToAfterSave(visitId: string): void {
  if (this.caseId) {
    this.router.navigate(['/patients', this.patientId, 'treatment-cases', this.caseId]);
  } else {
    this.router.navigate(['/patients', this.patientId, 'visits', visitId]);
  }
}

  cancel(): void {
    if (this.caseId) {
      this.router.navigate(['/patients', this.patientId, 'treatment-cases', this.caseId]);
    } else {
      this.router.navigate(['/patients', this.patientId]);
    }
  }
}