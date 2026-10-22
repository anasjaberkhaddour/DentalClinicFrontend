import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PatientService } from '../../../core/services/patient.service';
import { ContactService } from '../../../core/services/contact.service';
import {
  ContactType,
  ContactTypeOptions,
  GenderOptions,
  BloodTypeOptions,
  ContactOwnerType
} from '../../../core/constants/enums';
import { ContactDto } from '../../../core/models/patient.model';

@Component({
  selector: 'app-patient-edit',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, TextareaModule,
    SelectModule, DatePickerModule, ToggleSwitchModule, SkeletonModule
  ],
  templateUrl: './patient-edit.html',
  styleUrl: './patient-edit.scss'
})
export class PatientEdit implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patientService = inject(PatientService);
  private contactService = inject(ContactService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  saving = signal(false);
  patientId!: string;
  personId!: string;

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
    isEmergency: false
  };

  contacts = signal<ContactDto[]>([]);

  newContact = {
    type: ContactType.Mobile,
    value: '',
    label: '',
    isPrimary: false,
    isEmergency: false
  };

  showAddContact = signal(false);

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }
    this.loadPatient();
  }

  loadPatient(): void {
    this.loading.set(true);
    this.patientService.getById(this.patientId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const p = res.value;
          this.personId = p.personId;

          this.form = {
            firstName: p.firstName,
            fatherName: p.fatherName ?? '',
            motherName: p.motherName ?? '',
            lastName: p.lastName,
            nationalId: p.nationalId ?? '',
            dateOfBirth: p.dateOfBirth ?? null,
            gender: p.gender ?? null,
            address: p.address ?? '',
            city: p.city ?? '',
            country: p.country ?? '',
            notes: p.notes ?? '',
            bloodType: p.bloodType ?? null,
            isEmergency: p.isEmergency
          };

          this.contacts.set(p.contacts ?? []);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل البيانات.' });
        this.router.navigate(['/patients']);
      }
    });
  }

  save(): void {
    if (!this.form.firstName.trim() || !this.form.lastName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم الأول والكنية مطلوبان.' });
      return;
    }

    this.saving.set(true);

    const payload = {
      ...this.form,
      dateOfBirth: this.form.dateOfBirth || null,
      gender: this.form.gender ?? null,
      bloodType: this.form.bloodType ?? null
    };

    this.patientService.update(this.patientId, payload as any).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ التعديلات.' });
          this.router.navigate(['/patients', this.patientId]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر حفظ التعديلات.'
        });
      }
    });
  }

  // ============ Contacts ============

  addContact(): void {
    if (!this.newContact.value.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'أدخل قيمة جهة الاتصال.' });
      return;
    }

    this.contactService.create({
      ownerType: ContactOwnerType.Person,
      ownerId: this.personId,
      type: this.newContact.type,
      value: this.newContact.value.trim(),
      label: this.newContact.label || undefined,
      isPrimary: this.newContact.isPrimary,
      isEmergency: this.newContact.isEmergency
    }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تمت إضافة جهة الاتصال.' });
          this.showAddContact.set(false);
          this.newContact = {
            type: ContactType.Mobile,
            value: '',
            label: '',
            isPrimary: false,
            isEmergency: false
          };
          this.loadPatient();
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إضافة جهة الاتصال.'
        });
      }
    });
  }

  setPrimary(contact: ContactDto): void {
    this.contactService.setPrimary(contact.id).subscribe({
      next: (res) => {
        if (res.isSuccess) this.loadPatient();
      }
    });
  }

  confirmDeleteContact(contact: ContactDto): void {
    this.confirmationService.confirm({
      message: 'هل تريد حذف جهة الاتصال هذه؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.contactService.delete(contact.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف جهة الاتصال.' });
              this.loadPatient();
            }
          }
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/patients', this.patientId]);
  }

  getContactTypeName(type: number): string {
    const found = ContactTypeOptions.find(o => o.value === type);
    return found?.label ?? '—';
  }
}