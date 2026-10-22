import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProfileService } from '../../../core/services/profile.service';
import { Profile } from '../../../core/models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule,
    DialogModule, SkeletonModule, TooltipModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class ProfileComponent implements OnInit {
  private service = inject(ProfileService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  profile = signal<Profile | null>(null);

  editDialog = signal(false);
  editSaving = signal(false);
  editForm = {
    firstName: '',
    fatherName: '',
    motherName: '',
    lastName: '',
    address: '',
    city: '',
    country: ''
  };

  passwordDialog = signal(false);
  passwordSaving = signal(false);
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  uploading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.get().subscribe({
      next: (res) => {
        if (res.isSuccess) this.profile.set(res.value);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل البيانات.' });
      }
    });
  }

  openEdit(): void {
    const p = this.profile();
    if (!p) return;
    this.editForm = {
      firstName: p.firstName ?? '',
      fatherName: p.fatherName ?? '',
      motherName: p.motherName ?? '',
      lastName: p.lastName ?? '',
      address: p.address ?? '',
      city: p.city ?? '',
      country: p.country ?? ''
    };
    this.editDialog.set(true);
  }

  saveEdit(): void {
    if (!this.editForm.firstName.trim() || !this.editForm.lastName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم الأول والكنية مطلوبان.' });
      return;
    }

    this.editSaving.set(true);
    const payload = {
      firstName: this.editForm.firstName.trim(),
      fatherName: this.editForm.fatherName || undefined,
      motherName: this.editForm.motherName || undefined,
      lastName: this.editForm.lastName.trim(),
      address: this.editForm.address || undefined,
      city: this.editForm.city || undefined,
      country: this.editForm.country || undefined
    };

    this.service.update(payload as any).subscribe({
      next: (res) => {
        this.editSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ التعديلات.' });
          this.editDialog.set(false);
          this.load();
        }
      },
      error: (err) => {
        this.editSaving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر حفظ التعديلات.'
        });
      }
    });
  }

  openPassword(): void {
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.passwordDialog.set(true);
  }

  savePassword(): void {
    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'املأ جميع الحقول.' });
      return;
    }
    if (this.passwordForm.newPassword.length < 10) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'كلمة المرور يجب أن تكون 10 أحرف على الأقل.' });
      return;
    }
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'كلمتا المرور غير متطابقتين.' });
      return;
    }

    this.passwordSaving.set(true);
    this.service.changePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: (res) => {
        this.passwordSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تغيير كلمة المرور.' });
          this.passwordDialog.set(false);
        }
      },
      error: (err) => {
        this.passwordSaving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر تغيير كلمة المرور.'
        });
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الحد الأقصى 5 ميغابايت.' });
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الصيغة غير مدعومة.' });
      return;
    }

    this.uploading.set(true);
    this.service.updatePhoto(file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم رفع الصورة.' });
          this.load();
        }
      },
      error: (err) => {
        this.uploading.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر رفع الصورة.'
        });
      }
    });
    event.target.value = '';
  }

  confirmDeletePhoto(): void {
    this.confirmationService.confirm({
      message: 'هل تريد حذف الصورة الشخصية؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.deletePhoto().subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الصورة.' });
              this.load();
            }
          }
        });
      }
    });
  }

  getInitials(): string {
    const p = this.profile();
    if (!p) return '';
    return ((p.firstName?.charAt(0) ?? '') + (p.lastName?.charAt(0) ?? '')).toUpperCase();
  }
}