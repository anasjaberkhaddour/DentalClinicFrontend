import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { RoleService } from '../../../core/services/role.service';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SkeletonModule],
  templateUrl: './roles-list.html',
  styleUrl: './roles-list.scss'
})
export class RolesList implements OnInit {
  private roleService = inject(RoleService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loading = signal(true);
  roles = signal<any[]>([]);

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.roleService.getAll().subscribe({
      next: (res) => {
        this.roles.set(res.value);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الأدوار.' });
      }
    });
  }

  openRole(id: string): void {
    this.router.navigate(['/roles', id]);
  }

  createRole(): void {
    this.router.navigate(['/roles/create']);
  }
}