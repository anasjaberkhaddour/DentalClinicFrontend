import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService, ConfirmationService } from 'primeng/api';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';
import { GenderOptions } from '../../../core/constants/enums';
import { TooltipModule } from 'primeng/tooltip';
import { ClinicService } from '../../../core/services/clinic.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, SkeletonModule, DialogModule, InputTextModule,
    TextareaModule, SelectModule, MultiSelectModule, DatePickerModule,
    PasswordModule, ToggleSwitchModule, TooltipModule
  ],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss'
})
export class UserDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private clinicService = inject(ClinicService);

  loading = signal(true);
  user = signal<any | null>(null);
  userId!: string;

  uploading = signal(false);

  GenderOptions = GenderOptions;

  clinicsDialog = signal(false);
  clinicsSaving = signal(false);
  allClinics = signal<{ label: string; value: string }[]>([]);
  selectedClinics = signal<string[]>([]);

  // Edit dialog
  editDialog = signal(false);
  editSaving = signal(false);
  editForm = {
    firstName: '',
    fatherName: '',
    motherName: '',
    lastName: '',
    nationalId: '',
    dateOfBirth: null as string | null,
    gender: null as number | null,
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    notes: '',
    isActive: true
  };

  // Roles dialog
  rolesDialog = signal(false);
  rolesSaving = signal(false);
  allRoles = signal<{ label: string; value: string }[]>([]);
  selectedRoles = signal<string[]>([]);

  // Permissions dialog
  permissionsDialog = signal(false);
  permissionsSaving = signal(false);
  allPermissions = signal<{ label: string; value: string }[]>([]);
  selectedPermissions = signal<string[]>([]);

  // Reset password dialog
  resetPasswordDialog = signal(false);
  resetPasswordSaving = signal(false);
  resetPasswordForm = {
    newPassword: ''
  };

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.userId) {
      this.router.navigate(['/users']);
      return;
    }

    this.loadUser();
  }

  loadUser(): void {
    this.loading.set(true);
    this.userService.getById(this.userId).subscribe({
      next: (res) => {
        if (res.isSuccess) this.user.set(res.value);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل المستخدم.' });
        this.router.navigate(['/users']);
      }
    });
  }

  // ============ Edit ============

  openEdit(): void {
    const u = this.user();
    if (!u) return;

    this.editForm = {
      firstName: u.firstName ?? '',
      fatherName: u.fatherName ?? '',
      motherName: u.motherName ?? '',
      lastName: u.lastName ?? '',
      nationalId: u.nationalId ?? '',
      dateOfBirth: u.dateOfBirth ?? null,
      gender: u.gender ?? null,
      address: u.address ?? '',
      city: u.city ?? '',
      country: u.country ?? '',
      notes: u.notes ?? '',
      isActive: u.isActive,
      email: u.email ?? '',
      phone: u.phone ?? ''
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
      ...this.editForm,
      email: this.editForm.email?.trim() || null,
      phone: this.editForm.phone?.trim() || null,
      dateOfBirth: this.editForm.dateOfBirth || null,
      gender: this.editForm.gender ?? null
    };

    this.userService.update(this.userId, payload).subscribe({
      next: (res) => {
        this.editSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ التعديلات.' });
          this.editDialog.set(false);
          this.loadUser();
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

  // ============ Roles ============

  openRolesDialog(): void {
    const u = this.user();
    if (!u) return;

    this.roleService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.allRoles.set(res.value.map((r: any) => ({ label: r.name, value: r.name })));
        }
      }
    });

    this.selectedRoles.set([...u.roles]);
    this.rolesDialog.set(true);
  }

  saveRoles(): void {
    this.rolesSaving.set(true);
    this.userService.updateRoles(this.userId, this.selectedRoles()).subscribe({
      next: (res) => {
        this.rolesSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث الأدوار.' });
          this.rolesDialog.set(false);
          this.loadUser();
        }
      },
      error: (err) => {
        this.rolesSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر تحديث الأدوار.'
        });
      }
    });
  }

  // ============ Permissions ============

  openPermissionsDialog(): void {
    const u = this.user();
    if (!u) return;

    this.permissionService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.allPermissions.set(
            res.value.map((p: any) => ({ label: `${p.nameAr} (${p.code})`, value: p.code }))
          );
        }
      }
    });

    this.selectedPermissions.set([...(u.directPermissions ?? [])]);
    this.permissionsDialog.set(true);
  }

  savePermissions(): void {
    this.permissionsSaving.set(true);
    this.userService.updatePermissions(this.userId, this.selectedPermissions()).subscribe({
      next: (res) => {
        this.permissionsSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث الصلاحيات المباشرة.' });
          this.permissionsDialog.set(false);
          this.loadUser();
        }
      },
      error: (err) => {
        this.permissionsSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر تحديث الصلاحيات.'
        });
      }
    });
  }

  // ============ Lock / Unlock ============

  toggleLock(): void {
    const u = this.user();
    if (!u) return;

    const action = u.isLocked ? 'فتح' : 'قفل';
    this.confirmationService.confirm({
      message: `هل تريد ${action} هذا المستخدم؟`,
      header: `تأكيد ${action} المستخدم`,
      icon: u.isLocked ? 'pi pi-unlock' : 'pi pi-lock',
      acceptLabel: 'نعم',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: u.isLocked ? 'p-button-primary' : 'p-button-danger',
      accept: () => {
        const request = u.isLocked
          ? this.userService.unlock(this.userId)
          : this.userService.lock(this.userId);

        request.subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: `تم ${action} المستخدم.` });
              this.loadUser();
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: `تعذّر ${action} المستخدم.` });
          }
        });
      }
    });
  }

  // ============ Reset Password ============

  openResetPassword(): void {
    this.resetPasswordForm = { newPassword: '' };
    this.resetPasswordDialog.set(true);
  }

  saveResetPassword(): void {
    if (this.resetPasswordForm.newPassword.length < 10) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'كلمة المرور يجب أن تكون 10 أحرف على الأقل.' });
      return;
    }

    this.resetPasswordSaving.set(true);
    this.userService.resetPassword(this.userId, this.resetPasswordForm.newPassword).subscribe({
      next: (res) => {
        this.resetPasswordSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إعادة تعيين كلمة المرور.' });
          this.resetPasswordDialog.set(false);
        }
      },
      error: (err) => {
        this.resetPasswordSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إعادة تعيين كلمة المرور.'
        });
      }
    });
  }

  // ============ Delete ============

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا المستخدم؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.delete(this.userId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف المستخدم.' });
              this.router.navigate(['/users']);
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف المستخدم.'
            });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/users']);
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
    this.userService.updatePhoto(this.userId, file).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم رفع الصورة.' });
          this.loadUser();
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
        this.userService.deletePhoto(this.userId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الصورة.' });
              this.loadUser();
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف الصورة.'
            });
          }
        });
      }
    });
  }

  openClinicsDialog(): void {
    this.clinicService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess && Array.isArray(res.value)) {
          this.allClinics.set(res.value.map((c: any) => ({ label: c.name, value: c.id })));
        }
      }
    });
  
    this.userService.getClinics(this.userId).subscribe({
      next: (res) => {
        if (res.isSuccess) this.selectedClinics.set(res.value);
        this.clinicsDialog.set(true);
      }
    });
  }
  
  saveClinics(): void {
    this.clinicsSaving.set(true);
    this.userService.assignClinics(this.userId, this.selectedClinics()).subscribe({
      next: (res) => {
        this.clinicsSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث العيادات المسندة.' });
          this.clinicsDialog.set(false);
          this.loadUser();
        }
      },
      error: (err) => {
        this.clinicsSaving.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر تحديث العيادات.'
        });
      }
    });
  }
}