import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { DentalLabService } from '../../../core/services/dental-lab.service';

@Component({
  selector: 'app-dental-labs-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, SkeletonModule],
  templateUrl: './dental-labs-list.html',
  styleUrl: './dental-labs-list.scss'
})
export class DentalLabsList implements OnInit {
  private service = inject(DentalLabService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loading = signal(true);
  labs = signal<any[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        this.labs.set(res.value.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل المخابر.' });
      }
    });
  }

  open(id: string): void {
    this.router.navigate(['/dental-labs', id]);
  }

  create(): void {
    this.router.navigate(['/dental-labs/create']);
  }
}