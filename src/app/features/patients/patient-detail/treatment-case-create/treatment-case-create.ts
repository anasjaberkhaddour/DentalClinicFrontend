import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TreatmentCaseService } from '../../../../core/services/treatment-case.service';
import { ClinicService } from '../../../../core/services/clinic.service';

@Component({
  selector: 'app-treatment-case-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, SelectModule],
  templateUrl: './treatment-case-create.html',
  styleUrl: './treatment-case-create.scss'
})
export class TreatmentCaseCreate implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private treatmentCaseService = inject(TreatmentCaseService);
  private clinicService = inject(ClinicService);
  private messageService = inject(MessageService);

  patientId!: string;
  saving = signal(false);
  clinics = signal<{ label: string; value: string }[]>([]);

  form = {
    clinicId: '',
    title: '',
    clinicalFindings: '',
    chiefComplaint: '',
    treatmentPlanSummary: '',
    notes: ''
  };

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }
    this.loadClinics();
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.clinics.set(res.value.map((c: any) => ({ label: c.name, value: c.id })));
          if (this.clinics().length === 1) this.form.clinicId = this.clinics()[0].value;
        }
      }
    });
  }

  save(): void {
    if (!this.form.clinicId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العيادة.' });
      return;
    }
    if (!this.form.title.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'عنوان الحالة مطلوب.' });
      return;
    }

    this.saving.set(true);
    
    // نرسل المصفوفات فارغة لأننا سنضيفها في صفحة التفاصيل
    const payload = {
      patientId: this.patientId,
      ...this.form,
      diagnosisTypeIds: [],
      patientToothIds: []
    };

    this.treatmentCaseService.create(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الحالة. يمكنك الآن إضافة التشخيصات والأسنان.' });
          // ننتقل لصفحة التفاصيل مباشرة
          this.router.navigate(['/patients', this.patientId, 'treatment-cases', res.value]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err?.error?.error?.message ?? 'تعذّر إنشاء الحالة.' });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'treatment-cases' } });
  }
}