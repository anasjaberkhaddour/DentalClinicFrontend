import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { VisitService, CreateVisitRequest } from '../../../../core/services/visit.service';
import { ClinicService } from '../../../../core/services/clinic.service';
import { TokenStorageService } from '../../../../core/services/token-storage.service';

@Component({
  selector: 'app-visit-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, SelectModule, DatePickerModule],
  templateUrl: './visit-create.html',
  styleUrl: './visit-create.scss'
})
export class VisitCreate implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private visitService = inject(VisitService);
  private clinicService = inject(ClinicService);
  private tokenStorage = inject(TokenStorageService);
  private messageService = inject(MessageService);

  patientId!: string;
  caseId: string | null = null;
  saving = signal(false);
  clinics = signal<{ label: string; value: string }[]>([]);

  form: CreateVisitRequest = {
    patientId: '',
    treatmentCaseId: undefined as string | undefined,
    clinicId: '',
    doctorId: '',
    visitDate: new Date().toISOString(),
    patientToothIds: [],
  };

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
    }

    const user = this.tokenStorage.getUser();
    if (user) {
      this.form.doctorId = this.getUserIdFromToken();
    }

    this.loadClinics();
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

          if (this.clinics().length === 1) {
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

  save(): void {
    if (!this.form.clinicId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'يرجى اختيار العيادة.' });
      return;
    }

    this.saving.set(true);
    this.visitService.create(this.form).subscribe({
      next: (response) => {
        this.saving.set(false);
        if (response.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الجلسة بنجاح.' });

          // If from a treatment case, return to the case detail
          if (this.caseId) {
            this.router.navigate(['/patients', this.patientId, 'treatment-cases', this.caseId]);
          } else {
            this.router.navigate(['/patients', this.patientId, 'visits', response.value]);
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

  cancel(): void {
    if (this.caseId) {
      this.router.navigate(['/patients', this.patientId, 'treatment-cases', this.caseId]);
    } else {
      this.router.navigate(['/patients', this.patientId]);
    }
  }
}