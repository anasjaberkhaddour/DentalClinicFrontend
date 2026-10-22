import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-role-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, MultiSelectModule],
  templateUrl: './role-create.html',
  styleUrl: './role-create.scss'
})
export class RoleCreate implements OnInit {
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  saving = signal(false);
  permissionOptions = signal<{ label: string; value: string }[]>([]);

  form = {
    name: '',
    description: '',
    permissionCodes: [] as string[]
  };

  ngOnInit(): void {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.permissionService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.permissionOptions.set(
            res.value.map((p: any) => ({
              label: `${p.nameAr} (${p.code})`,
              value: p.code
            }))
          );
        }
      }
    });
  }

  save(): void {
    if (!this.form.name.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اسم الدور مطلوب.' });
      return;
    }

    this.saving.set(true);
    this.roleService.create(this.form).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الدور.' });
          this.router.navigate(['/roles', res.value]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء الدور.'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/roles']);
  }
}