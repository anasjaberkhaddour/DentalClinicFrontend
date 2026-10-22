import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { GenderOptions, BloodTypeOptions } from '../../../core/constants/enums';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, TextareaModule,
    SelectModule, DatePickerModule, PasswordModule, MultiSelectModule, ToggleSwitchModule
  ],
  templateUrl: './user-create.html',
  styleUrl: './user-create.scss'
})
export class UserCreate implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  saving = signal(false);
  roles = signal<{ label: string; value: string }[]>([]);

  GenderOptions = GenderOptions;
  BloodTypeOptions = BloodTypeOptions;

  form = {
    userName: '',
    password: '',
    isActive: true,
    firstName: '',
    fatherName: '',
    motherName: '',
    lastName: '',
    nationalId: '',
    dateOfBirth: null as string | null,
    gender: null as number | null,
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    notes: '',
    roles: [] as string[]
  };

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.roles.set(res.value.map((r: any) => ({ label: r.name, value: r.name })));
        }
      }
    });
  }

  save(): void {
    if (!this.form.userName.trim() || !this.form.password) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اسم المستخدم وكلمة المرور مطلوبان.' });
      return;
    }
    if (!this.form.firstName.trim() || !this.form.lastName.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم الأول والكنية مطلوبان.' });
      return;
    }

    this.saving.set(true);
    const payload = {
      ...this.form,
      email: this.form.email?.trim() || null,
      phone: this.form.phone?.trim() || null,
      dateOfBirth: this.form.dateOfBirth || null,
      gender: this.form.gender ?? null
    };

    this.userService.create(payload as any).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء المستخدم.' });
          this.router.navigate(['/users', res.value]);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء المستخدم.'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}