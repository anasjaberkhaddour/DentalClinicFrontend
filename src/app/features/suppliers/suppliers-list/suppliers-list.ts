import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { SupplierService } from '../../../core/services/supplier.service';
import { SupplierListItem } from '../../../core/models/supplier.model';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, SkeletonModule],
  templateUrl: './suppliers-list.html',
  styleUrl: './suppliers-list.scss'
})
export class SuppliersList implements OnInit {
  private service = inject(SupplierService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loading = signal(true);
  suppliers = signal<SupplierListItem[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        this.suppliers.set(res.value.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الموردين.' });
      }
    });
  }

  open(id: string): void {
    this.router.navigate(['/suppliers', id]);
  }

  create(): void {
    this.router.navigate(['/suppliers/create']);
  }
}