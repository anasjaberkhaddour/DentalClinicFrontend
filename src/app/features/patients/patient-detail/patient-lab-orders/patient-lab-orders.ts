import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { LabOrderService, LabOrderListItem } from '../../../../core/services/lab-order.service';

type FilterMode = 'all' | 'active' | 'done' | 'cancelled';

@Component({
  selector: 'app-patient-lab-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, SkeletonModule],
  templateUrl: './patient-lab-orders.html',
  styleUrl: './patient-lab-orders.scss'
})
export class PatientLabOrders implements OnInit {
  @Input() patientId!: string;

  private labOrderService = inject(LabOrderService);
  private messageService = inject(MessageService);

  loading = signal(true);
  orders = signal<LabOrderListItem[]>([]);
  filter = signal<FilterMode>('all');

  filteredOrders = computed(() => {
    const f = this.filter();
    const all = this.orders();

    switch (f) {
      case 'active':
        return all.filter(o => [1, 2, 3, 7].includes(o.status));
      case 'done':
        return all.filter(o => [4, 5].includes(o.status));
      case 'cancelled':
        return all.filter(o => o.status === 6);
      default:
        return all;
    }
  });

  counts = computed(() => ({
    all: this.orders().length,
    active: this.orders().filter(o => [1, 2, 3, 7].includes(o.status)).length,
    done: this.orders().filter(o => [4, 5].includes(o.status)).length,
    cancelled: this.orders().filter(o => o.status === 6).length,
  }));

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.labOrderService.getByPatient(this.patientId).subscribe({
      next: (response) => {
        this.orders.set(response.value.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الطلبات.' });
      }
    });
  }

  setFilter(f: FilterMode): void {
    this.filter.set(f);
  }

  getStatusName(status: number): string {
    const map: Record<number, string> = {
      1: 'مسودة', 2: 'مُرسل', 3: 'قيد التنفيذ', 4: 'مُستلم',
      5: 'مُركَّب', 6: 'ملغى', 7: 'إعادة تصنيع'
    };
    return map[status] ?? '—';
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1: return 'bg-slate-100 text-slate-700';
      case 2: return 'bg-blue-100 text-blue-700';
      case 3: return 'bg-amber-100 text-amber-700';
      case 4: return 'bg-emerald-100 text-emerald-700';
      case 5: return 'bg-purple-100 text-purple-700';
      case 6: return 'bg-red-100 text-red-700';
      case 7: return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  getStatusBorderColor(status: number): string {
    switch (status) {
      case 1: return 'from-slate-400 to-slate-600';
      case 2: return 'from-blue-400 to-blue-600';
      case 3: return 'from-amber-400 to-amber-600';
      case 4: return 'from-emerald-400 to-emerald-600';
      case 5: return 'from-purple-400 to-purple-600';
      case 6: return 'from-red-400 to-red-600';
      case 7: return 'from-orange-400 to-orange-600';
      default: return 'from-slate-400 to-slate-600';
    }
  }
}