import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { PatientService } from '../../../core/services/patient.service';
import { ClinicService } from '../../../core/services/clinic.service';
import {
  ContactType,
  ContactTypeOptions,
  GenderOptions,
  BloodTypeOptions
} from '../../../core/constants/enums';

@Component({
  selector: 'app-patient-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, TextareaModule,
    SelectModule, DatePickerModule, ToggleSwitchModule
  ],
  templateUrl: './patient-create.html',
  styleUrl: './patient-create.scss'
})
export class PatientCreate implements OnInit {
  private patientService = inject(PatientService);
  private clinicService = inject(ClinicService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  saving = signal(false);
  clinics = signal<{ label: string; value: string }[]>([]);

  // Expose enums to template
  ContactTypeOptions = ContactTypeOptions;
  GenderOptions = GenderOptions;
  BloodTypeOptions = BloodTypeOptions;

  form = {
    firstName: '',
    fatherName: '',
    motherName: '',
    lastName: '',
    nationalId: '',
    dateOfBirth: null as string | null,
    gender: null as number | null,
    address: '',
    city: '',
    country: '',
    notes: '',
    bloodType: null as number | null,
    isEmergency: false,
    registrationClinicId: '',
    contacts: [] as {
      type: number;
      value: string;
      label: string;
      isPrimary: boolean;
      isEmergency: boolean;
    }[]
  };

  ngOnInit(): void {
    this.loadClinics();
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.clinics.set(res.value.map((c: any) => ({ label: c.name, value: c.id })));
          if (this.clinics().length === 1) this.form.registrationClinicId = this.clinics()[0].value;
        }
      }
    });
  }

  addContact(): void {
    this.form.contacts.push({
      type: ContactType.Mobile,
      value: '',
      label: '',
      isPrimary: this.form.contacts.length === 0,
      isEmergency: false
    });
  }

  removeContact(index: number): void {
    this.form.contacts.splice(index, 1);
  }

  setPrimaryContact(index: number): void {
    this.form.contacts.forEach((c, i) => c.isPrimary = i === index);
  }

  save(): void {
    if (!this.form.firstName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم الأول مطلوب.' });
      return;
    }
    if (!this.form.lastName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الكنية مطلوبة.' });
      return;
    }
    if (!this.form.registrationClinicId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العيادة.' });
      return;
    }

    this.saving.set(true);

    const cleanContacts = this.form.contacts.filter(c => c.value.trim().length > 0);

    const payload = {
      ...this.form,
      dateOfBirth: this.form.dateOfBirth || null,
      gender: this.form.gender ?? null,
      bloodType: this.form.bloodType ?? null,
      contacts: cleanContacts
    };

    this.patientService.create(payload as any).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إضافة المريض.' });
          this.router.navigate(['/patients', res.value]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إضافة المريض.'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/patients']);
  }
}