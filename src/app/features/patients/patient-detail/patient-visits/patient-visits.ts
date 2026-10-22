import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { VisitService } from '../../../../core/services/visit.service';
import { VisitListItem } from '../../../../core/models/patient.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patient-visits',
  standalone: true,
  imports: [CommonModule, ButtonModule, SkeletonModule, RouterLink],
  templateUrl: './patient-visits.html',
  styleUrl: './patient-visits.scss'
})
export class PatientVisits implements OnInit {
  @Input() patientId!: string;

  private visitService = inject(VisitService);
  private messageService = inject(MessageService);

  loading = signal(true);
  visits = signal<VisitListItem[]>([]);

  ngOnInit(): void {
    this.loadVisits();
  }

  loadVisits(): void {
    this.loading.set(true);
    this.visitService.getByPatient(this.patientId).subscribe({
      next: (response) => {
        this.visits.set(response.value.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'تعذّر تحميل الزيارات.'
        });
      }
    });
  }
}