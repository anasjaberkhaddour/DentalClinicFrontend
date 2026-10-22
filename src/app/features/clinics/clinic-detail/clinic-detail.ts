import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ClinicService } from '../../../core/services/clinic.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-clinic-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, SkeletonModule, DialogModule, InputTextModule,
    ToggleSwitchModule, MultiSelectModule
  ],
  templateUrl: './clinic-detail.html',
  styleUrl: './clinic-detail.scss'
})
export class ClinicDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clinicService = inject(ClinicService);
  private userService = inject(UserService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  clinic = signal<any | null>(null);
  clinicId!: string;

  editDialog = signal(false);
  editSaving = signal(false);
  editForm = {
    name: '',
    code: '',
    address: '',
    city: '',
    country: '',
    isActive: true
  };

  usersDialog = signal(false);
  usersSaving = signal(false);
  userOptions = signal<{ label: string; value: string }[]>([]);
  selectedUserIds = signal<string[]>([]);

  ngOnInit(): void {
    this.clinicId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.clinicId) {
      this.router.navigate(['/clinics']);
      return;
    }
    this.loadClinic();
  }

  loadClinic(): void {
    this.loading.set(true);
    this.clinicService.getById(this.clinicId).subscribe({
      next: (res) => {
        if (res.isSuccess) this.clinic.set(res.value);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل العيادة.' });
        this.router.navigate(['/clinics']);
      }
    });
  }

  openEdit(): void {
    const c = this.clinic();
    if (!c) return;
    this.editForm = {
      name: c.name ?? '',
      code: c.code ?? '',
      address: c.address ?? '',
      city: c.city ?? '',
      country: c.country ?? '',
      isActive: c.isActive
    };
    this.editDialog.set(true);
  }

  saveEdit(): void {
    if (!this.editForm.name.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اسم العيادة مطلوب.' });
      return;
    }

    this.editSaving.set(true);
    this.clinicService.update(this.clinicId, this.editForm).subscribe({
      next: (res) => {
        this.editSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ التعديلات.' });
          this.editDialog.set(false);
          this.loadClinic();
        }
      },
      error: (err) => {
        this.editSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر حفظ التعديلات.'
        });
      }
    });
  }

  openUsersDialog(): void {
    const c = this.clinic();
    if (!c) return;

    this.userService.getAll({ page: 1, pageSize: 200 }).subscribe({
      next: (res) => {
        this.userOptions.set(
          res.value.items.map((u: any) => ({
            label: `${u.firstName} ${u.lastName} (${u.userName})`,
            value: u.id
          }))
        );
      }
    });

    this.selectedUserIds.set([...(c.assignedUserIds ?? [])]);
    this.usersDialog.set(true);
  }

  saveUsers(): void {
    this.usersSaving.set(true);
    this.clinicService.assignUsers(this.clinicId, this.selectedUserIds()).subscribe({
      next: (res) => {
        this.usersSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث المستخدمين.' });
          this.usersDialog.set(false);
          this.loadClinic();
        }
      },
      error: (err) => {
        this.usersSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر تحديث المستخدمين.'
        });
      }
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه العيادة؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.clinicService.delete(this.clinicId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف العيادة.' });
              this.router.navigate(['/clinics']);
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف العيادة.'
            });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/clinics']);
  }
}