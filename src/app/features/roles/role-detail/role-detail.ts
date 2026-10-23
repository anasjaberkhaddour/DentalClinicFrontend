import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';

interface PermissionGroup {
  groupAr: string;
  group: string;
  permissions: { code: string; nameAr: string }[];
}

@Component({
  selector: 'app-role-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    ButtonModule, SkeletonModule, DialogModule, InputTextModule,
    TextareaModule, ToggleSwitchModule, TooltipModule
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
  editForm = { name: '', description: '' };

  // Permissions dialog
  permissionsDialog = signal(false);
  permissionsSaving = signal(false);
  
  allPermissions = signal<any[]>([]);
  selectedPermissions = signal<string[]>([]);

  // تجميع الصلاحيات حسب الـ Group
  groupedPermissions = computed<PermissionGroup[]>(() => {
    const perms = this.allPermissions();
    const groupsMap = new Map<string, PermissionGroup>();

    perms.forEach(p => {
      const gName = p.group || 'Other';
      const gNameAr = p.groupAr || 'أخرى';
      
      if (!groupsMap.has(gName)) {
        groupsMap.set(gName, { group: gName, groupAr: gNameAr, permissions: [] });
      }
      groupsMap.get(gName)!.permissions.push({ code: p.code, nameAr: p.nameAr });
    });

    return Array.from(groupsMap.values());
  });

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

  // ============ Edit Role ============

  openEdit(): void {
    const r = this.role();
    if (!r) return;
    this.editForm = { name: r.name ?? '', description: r.description ?? '' };
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
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err?.error?.error?.message ?? 'تعذّر حفظ التعديلات.' });
      }
    });
  }

  // ============ Manage Permissions ============

  openPermissionsDialog(): void {
    const r = this.role();
    if (!r) return;

    this.permissionService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.allPermissions.set(res.value);
        }
      }
    });

    this.selectedPermissions.set([...(r.permissionCodes ?? [])]);
    this.permissionsDialog.set(true);
  }

  // دالة لمعرفة هل الصلاحية محددة
  hasPermission(code: string): boolean {
    return this.selectedPermissions().includes(code);
  }

  // دالة للتبديل بين تحديد/إلغاء تحديد صلاحية
  togglePermission(code: string, isChecked: boolean): void {
    this.selectedPermissions.update(current => {
      if (isChecked) {
        return [...current, code];
      } else {
        return current.filter(c => c !== code);
      }
    });
  }

  // تحديد أو إلغاء تحديد كل صلاحيات مجموعة معينة
  toggleGroup(group: PermissionGroup, isChecked: boolean): void {
    const codes = group.permissions.map(p => p.code);
    this.selectedPermissions.update(current => {
      if (isChecked) {
        const newSet = new Set([...current, ...codes]);
        return Array.from(newSet);
      } else {
        return current.filter(c => !codes.includes(c));
      }
    });
  }

  // التحقق مما إذا كانت كل صلاحيات المجموعة محددة
  isGroupFullySelected(group: PermissionGroup): boolean {
    return group.permissions.every(p => this.hasPermission(p.code));
  }

  // التحقق مما إذا كانت بعض صلاحيات المجموعة محددة (لتغيير شكل المفتاح)
  isGroupPartiallySelected(group: PermissionGroup): boolean {
    const selectedCount = group.permissions.filter(p => this.hasPermission(p.code)).length;
    return selectedCount > 0 && selectedCount < group.permissions.length;
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
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err?.error?.error?.message ?? 'تعذّر تحديث الصلاحيات.' });
      }
    });
  }

  // ============ Delete Role ============

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
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err?.error?.error?.message ?? 'تعذّر حذف الدور.' });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/roles']);
  }
}