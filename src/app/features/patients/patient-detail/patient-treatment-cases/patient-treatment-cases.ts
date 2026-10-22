import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { TreatmentCaseService } from '../../../../core/services/treatment-case.service';
import { TreatmentCaseListItem } from '../../../../core/models/treatment-case.model';
import { TreatmentCaseStatusLabels } from '../../../../core/constants/enums';

type FilterMode = 'all' | 'active' | 'completed' | 'cancelled' | 'on-hold';

@Component({
  selector: 'app-patient-treatment-cases',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, SkeletonModule],
  templateUrl: './patient-treatment-cases.html',
  styleUrl: './patient-treatment-cases.scss'
})
export class PatientTreatmentCases implements OnInit {
  @Input() patientId!: string;

  private treatmentCaseService = inject(TreatmentCaseService);
  private messageService = inject(MessageService);

  loading = signal(true);
  cases = signal<TreatmentCaseListItem[]>([]);
  filter = signal<FilterMode>('all');

  filteredCases = computed(() => {
    const f = this.filter();
    const all = this.cases();

    switch (f) {
      case 'active': return all.filter(c => c.status === 1);
      case 'completed': return all.filter(c => c.status === 2);
      case 'cancelled': return all.filter(c => c.status === 3);
      case 'on-hold': return all.filter(c => c.status === 4);
      default: return all;
    }
  });

  counts = computed(() => ({
    all: this.cases().length,
    active: this.cases().filter(c => c.status === 1).length,
    completed: this.cases().filter(c => c.status === 2).length,
    cancelled: this.cases().filter(c => c.status === 3).length,
    onHold: this.cases().filter(c => c.status === 4).length,
  }));

  ngOnInit(): void {
    this.loadCases();
  }

  loadCases(): void {
    this.loading.set(true);
    this.treatmentCaseService.getAll({ patientId: this.patientId, page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        this.cases.set(res.value.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الحالات العلاجية.' });
      }
    });
  }

  setFilter(f: FilterMode): void {
    this.filter.set(f);
  }

  getStatusName(status: number): string {
    return TreatmentCaseStatusLabels[status] ?? '—';
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1: return 'bg-emerald-100 text-emerald-700';
      case 2: return 'bg-blue-100 text-blue-700';
      case 3: return 'bg-red-100 text-red-700';
      case 4: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  }

  getStatusGradient(status: number): string {
    switch (status) {
      case 1: return 'from-emerald-400 to-emerald-600';
      case 2: return 'from-blue-400 to-blue-600';
      case 3: return 'from-red-400 to-red-600';
      case 4: return 'from-amber-400 to-amber-600';
      default: return 'from-slate-400 to-slate-600';
    }
  }
}