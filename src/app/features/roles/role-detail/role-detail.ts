import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, SkeletonModule, DialogModule, InputTextModule,
    TextareaModule, MultiSelectModule
  ],
  templateUrl: './role-detail.html',
  styleUrl: './role-detail.scss'
})
export class RoleDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  role = signal<any | null>(null);
  roleId!: string;

  // Edit dialog
  editDialog = signal(false);
  editSaving = signal(false);
  editForm = {
    name: '',
    description: ''
  };

  // Permissions dialog
  permissionsDialog = signal(false);
  permissionsSaving = signal(false);
  permissionOptions = signal<{ label: string; value: string }[]>([]);
  selectedPermissions = signal<string[]>([]);

  ngOnInit(): void {
    this.roleId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.roleId) {
      this.router.navigate(['/roles']);
      return;
    }
    this.loadRole();
  }

  loadRole(): void {
    this.loading.set(true);
    this.roleService.getById(this.roleId).subscribe({
      next: (res) => {
        if (res.isSuccess) this.role.set(res.value);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الدور.' });
        this.router.navigate(['/roles']);
      }
    });
  }

  openEdit(): void {
    const r = this.role();
    if (!r) return;
    this.editForm = {
      name: r.name ?? '',
      description: r.description ?? ''
    };
    this.editDialog.set(true);
  }

  saveEdit(): void {
    if (!this.editForm.name.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اسم الدور مطلوب.' });
      return;
    }

    this.editSaving.set(true);
    this.roleService.update(this.roleId, this.editForm).subscribe({
      next: (res) => {
        this.editSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ التعديلات.' });
          this.editDialog.set(false);
          this.loadRole();
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

  openPermissionsDialog(): void {
    const r = this.role();
    if (!r) return;

    this.permissionService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.permissionOptions.set(
            res.value.map((p: any) => ({ label: `${p.nameAr} (${p.code})`, value: p.code }))
          );
        }
      }
    });

    this.selectedPermissions.set([...(r.permissionCodes ?? [])]);
    this.permissionsDialog.set(true);
  }

  savePermissions(): void {
    this.permissionsSaving.set(true);
    this.roleService.assignPermissions(this.roleId, this.selectedPermissions()).subscribe({
      next: (res) => {
        this.permissionsSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث الصلاحيات.' });
          this.permissionsDialog.set(false);
          this.loadRole();
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

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا الدور؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.roleService.delete(this.roleId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الدور.' });
              this.router.navigate(['/roles']);
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف الدور.'
            });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}