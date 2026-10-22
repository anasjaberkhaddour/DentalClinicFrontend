import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { ClinicService } from '../../../core/services/clinic.service';

@Component({
  selector: 'app-clinic-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToggleSwitchModule],
  templateUrl: './clinic-create.html',
  styleUrl: './clinic-create.scss'
})
export class ClinicCreate {
  private clinicService = inject(ClinicService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  saving = signal(false);

  form = {
    name: '',
    code: '',
    address: '',
    city: '',
    country: '',
    isActive: true
  };

  save(): void {
    if (!this.form.name.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اسم العيادة مطلوب.' });
      return;
    }

    this.saving.set(true);
    this.clinicService.create(this.form).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء العيادة.' });
          this.router.navigate(['/clinics', res.value]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء العيادة.'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/clinics']);
  }
}