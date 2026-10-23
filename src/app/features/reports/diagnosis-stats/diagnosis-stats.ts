import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ReportService } from '../../../core/services/report.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-diagnosis-stats',
  standalone: true,
  imports: [CommonModule, ButtonModule, SkeletonModule, BaseChartDirective],
  templateUrl: './diagnosis-stats.html',
  styleUrl: './diagnosis-stats.scss'
})
export class DiagnosisStatsComponent implements OnInit {
  private reportService = inject(ReportService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loadingStats = signal(true);
  reportDate = signal<Date>(new Date());

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { rtl: true, textDirection: 'rtl' }
    },
    scales: {
      x: { ticks: { color: '#475569', font: { family: 'Cairo' } } },
      y: { ticks: { color: '#475569', precision: 0 }, beginAtZero: true }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: '#0ea5e9',
      hoverBackgroundColor: '#0284c7',
      borderRadius: 6
    }]
  };

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.loadingStats.set(true);
    this.reportDate.set(new Date());
    this.reportService.getDiagnosisStats().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.barChartData = {
            labels: res.value.map(x => x.name),
            datasets: [{
              data: res.value.map(x => x.count),
              backgroundColor: '#0ea5e9',
              hoverBackgroundColor: '#0284c7',
              borderRadius: 6
            }]
          };
        }
        this.loadingStats.set(false);
      },
      error: () => {
        this.loadingStats.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الإحصائيات.' });
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

    pdf.save(`إحصائيات-التشخيصات.pdf`);
  }

  goBack(): void {
    this.router.navigate(['/reports/administrative']);
  }
}