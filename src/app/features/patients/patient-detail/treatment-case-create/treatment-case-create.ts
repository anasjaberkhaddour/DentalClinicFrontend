import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TreatmentCaseService } from '../../../../core/services/treatment-case.service';
import { ToothChartService } from '../../../../core/services/tooth-chart.service';
import { ClinicService } from '../../../../core/services/clinic.service';

@Component({
  selector: 'app-treatment-case-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, TextareaModule, MultiSelectModule, SelectModule
  ],
  templateUrl: './treatment-case-create.html',
  styleUrl: './treatment-case-create.scss'
})
export class TreatmentCaseCreate implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private treatmentCaseService = inject(TreatmentCaseService);
  private toothChartService = inject(ToothChartService);
  private clinicService = inject(ClinicService);
  private messageService = inject(MessageService);

  patientId!: string;
  saving = signal(false);

  diagnosisOptions = signal<{ label: string; value: string }[]>([]);
  toothOptions = signal<{ label: string; value: string }[]>([]);
  clinics = signal<{ label: string; value: string }[]>([]);

  form = {
    clinicId: '',
    title: '',
    chiefComplaint: '',
    clinicalFindings: '',
    treatmentPlanSummary: '',
    notes: '',
    diagnosisTypeIds: [] as string[],
    patientToothIds: [] as string[]
  };

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.loadDiagnoses();
    this.loadTeeth();
    this.loadClinics();
  }

  loadDiagnoses(): void {
    this.treatmentCaseService.getDiagnosisTypes().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.diagnosisOptions.set(
            res.value.map(d => ({ label: d.nameAr, value: d.id }))
          );
        }
      }
    });
  }

  loadTeeth(): void {
    this.toothChartService.getChart(this.patientId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.toothOptions.set(
            res.value.teeth.map((t: any) => ({
              label: `سن ${t.toothNumber}`,
              value: t.id
            }))
          );
        }
      }
    });
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
    if (this.form.diagnosisTypeIds.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر تشخيصاً واحداً على الأقل.' });
      return;
    }

    this.saving.set(true);
    this.treatmentCaseService.create({
      patientId: this.patientId,
      ...this.form
    }).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الحالة العلاجية.' });
          this.router.navigate(['/patients', this.patientId, 'treatment-cases', res.value]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء الحالة.'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'treatment-cases' } });
  }
}