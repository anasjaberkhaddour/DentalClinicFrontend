import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { PatientService } from '../../../core/services/patient.service';
import { ReportService } from '../../../core/services/report.service';
import { TreatmentPlanReport } from '../../../core/models/report.model';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-treatment-plan-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, SkeletonModule],
  templateUrl: './treatment-plan-report.html',
  styleUrl: './treatment-plan-report.scss'
})
export class TreatmentPlanReportComponent implements OnInit {
  private patientService = inject(PatientService);
  private reportService = inject(ReportService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  patients = signal<{ label: string; value: string }[]>([]);
  cases = signal<{ label: string; value: string }[]>([]);
  selectedPatientId = signal<string | null>(null);
  selectedCaseId = signal<string | null>(null);

  loadingPatients = signal(true);
  loadingReport = signal(false);
  report = signal<TreatmentPlanReport | null>(null);

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loadingPatients.set(true);
    this.patientService.getAll({ page: 1, pageSize: 500 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.patients.set(res.value.items.map((p: any) => ({
            label: `${p.firstName} ${p.lastName}`,
            value: p.id
          })));
        }
        this.loadingPatients.set(false);
      },
      error: () => this.loadingPatients.set(false)
    });
  }

  onPatientChange(): void {
    const id = this.selectedPatientId();
    this.selectedCaseId.set(null);
    this.report.set(null);
    this.cases.set([]);
    if (!id) return;

    this.reportService.getPatientCases(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.cases.set(res.value.map((c: any) => ({
            label: `${c.caseNumber} - ${c.title || ''}`,
            value: c.id
          })));
        }
      }
    });
  }

  loadReport(): void {
    const caseId = this.selectedCaseId();
    if (!caseId) return;

    this.loadingReport.set(true);
    this.reportService.getTreatmentPlan(caseId).subscribe({
      next: (res) => {
        this.loadingReport.set(false);
        if (res.isSuccess) {
          this.report.set(res.value);
        }
      },
      error: (err) => {
        this.loadingReport.set(false);
        this.messageService.add({
          severity: 'error', summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر تحميل التقرير.'
        });
      }
    });
  }

  async exportPdf(): Promise<void> {
    const element = document.querySelector('.pdf-container') as HTMLElement;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
    heightLeft -= (pageHeight - margin * 2);

    while (heightLeft > 0) {
      position = -(imgHeight - heightLeft) + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);
    }

    const patientName = this.report()?.patientFullName || 'مريض';
    pdf.save(`تقرير-${patientName}.pdf`);
  }

  goBack(): void {
    this.router.navigate(['/reports']);
  }
}