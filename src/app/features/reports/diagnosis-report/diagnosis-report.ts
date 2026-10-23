import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ReportService } from '../../../core/services/report.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-diagnosis-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, SelectModule, SkeletonModule],
  templateUrl: './diagnosis-report.html',
  styleUrl: './diagnosis-report.scss'
})
export class DiagnosisReportComponent implements OnInit {
  private reportService = inject(ReportService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  diagnoses = signal<{ label: string; value: string }[]>([]);
  selectedDiagnosisId = signal<string | null>(null);

  loadingList = signal(true);
  loadingReport = signal(false);
  loadingStats = signal(true);
  
  reportData = signal<any[]>([]);
  selectedDiagnosisName = signal<string>('');
  reportDate = signal<Date>(new Date());
  

  ngOnInit(): void {
    this.loadDiagnoses();
  }

  loadDiagnoses(): void {
    this.loadingList.set(true);
    this.reportService.getDiagnosisList().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.diagnoses.set(res.value.map((d: any) => ({ label: d.nameAr, value: d.id })));
        }
        this.loadingList.set(false);
      },
      error: () => this.loadingList.set(false)
    });
  }

  onDiagnosisChange(): void {
    if (!this.selectedDiagnosisId()) return;
    const selected = this.diagnoses().find(d => d.value === this.selectedDiagnosisId());
    if (selected) this.selectedDiagnosisName.set(selected.label);
    this.loadReport();
  }

  loadReport(): void {
    const id = this.selectedDiagnosisId();
    if (!id) return;

    this.loadingReport.set(true);
    this.reportDate.set(new Date());
    this.reportService.getDiagnosisReport(id).subscribe({
      next: (res) => {
        this.loadingReport.set(false);
        if (res.isSuccess) this.reportData.set(res.value);
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
      scale: 2, useCORS: true, backgroundColor: '#ffffff',
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

    pdf.save(`تقرير-التشخيص-${this.selectedDiagnosisName() || 'عام'}.pdf`);
  }

  goBack(): void {
    this.router.navigate(['/reports/administrative']);
  }

  getStatusName(status: number): string {
    const map: Record<number, string> = {
      1: 'نشطة', 2: 'مكتملة', 3: 'ملغاة', 4: 'معلّقة'
    };
    return map[status] ?? '—';
  }
}