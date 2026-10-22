import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, SelectModule,
    PaginatorModule, SkeletonModule, TooltipModule
  ],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss'
})
export class UsersList implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loading = signal(true);
  users = signal<any[]>([]);
  totalRecords = signal(0);
  roles = signal<{ label: string; value: string | null }[]>([]);

  filter: any = {
    page: 1,
    pageSize: 20,
    search: '',
    role: null,
    isActive: null
  };

  activeOptions = [
    { label: 'الكل', value: null },
    { label: 'نشط', value: true },
    { label: 'معطّل', value: false },
  ];

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.roleService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const options = [{ label: 'كل الأدوار', value: null }];
          res.value.forEach((r: any) => options.push({ label: r.name, value: r.name }));
          this.roles.set(options);
        }
      }
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAll(this.filter).subscribe({
      next: (res) => {
        this.users.set(res.value.items);
        this.totalRecords.set(res.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل المستخدمين.' });
      }
    });
  }

  onSearch(): void {
    this.filter.page = 1;
    this.loadUsers();
  }

  onPageChange(event: any): void {
    this.filter.page = event.page + 1;
    this.filter.pageSize = event.rows;
    this.loadUsers();
  }

  openUser(id: string): void {
    this.router.navigate(['/users', id]);
  }

  createUser(): void {
    this.router.navigate(['/users/create']);
  }

  getInitials(first: string, last: string): string {
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  }
}