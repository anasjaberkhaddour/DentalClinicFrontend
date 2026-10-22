import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { SupplierService } from '../../../core/services/supplier.service';
import { ContactType, ContactTypeOptions } from '../../../core/constants/enums';

@Component({
  selector: 'app-supplier-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, TextareaModule,
    SelectModule, ToggleSwitchModule
  ],
  templateUrl: './supplier-create.html',
  styleUrl: './supplier-create.scss'
})
export class SupplierCreate {
  private service = inject(SupplierService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  saving = signal(false);
  ContactTypeOptions = ContactTypeOptions;

  form = {
    code: '',
    nameAr: '',
    address: '',
    city: '',
    country: '',
    contactPerson: '',
    taxNumber: '',
    notes: '',
    isActive: true,
    contacts: [] as { type: number; value: string; label: string; isPrimary: boolean }[]
  };

  addContact(): void {
    this.form.contacts.push({
      type: ContactType.Mobile,
      value: '',
      label: '',
      isPrimary: this.form.contacts.length === 0
    });
  }

  removeContact(index: number): void {
    this.form.contacts.splice(index, 1);
  }

  setPrimary(index: number): void {
    this.form.contacts.forEach((c, i) => c.isPrimary = i === index);
  }

  save(): void {
    if (!this.form.nameAr.trim() || !this.form.code.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم والرمز مطلوبان.' });
      return;
    }

    this.saving.set(true);

    const cleanContacts = this.form.contacts.filter(c => c.value.trim().length > 0);
    const payload = { ...this.form, contacts: cleanContacts };

    this.service.create(payload as any).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء المورد.' });
          this.router.navigate(['/suppliers', res.value]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء المورد.'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/suppliers']);
  }
}