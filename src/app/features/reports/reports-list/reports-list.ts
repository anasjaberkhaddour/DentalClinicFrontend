import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports-list.html',
  styleUrl: './reports-list.scss'
})
export class ReportsList implements OnInit {
  private route = inject(ActivatedRoute);

  type: 'administrative' | 'financial' = 'administrative';

  administrativeReports = [
    { title: 'بطاقة تشخيص وخطة علاج', description: 'تقرير تشخيصي مفصل لأحد الحالات العلاجية', icon: 'pi-file-edit', route: '/reports/treatment-plan' }
  ];

  financialReports = [
    { title: 'صفحة المتابعة المالية', description: 'كشف مالي شامل للإجراءات والدفعات والمبالغ المتبقية', icon: 'pi-wallet', route: '/reports/financial-follow-up' }
  ];

  ngOnInit(): void {
    this.type = (this.route.snapshot.data['type'] as any) ?? 'administrative';
  }

  get reports() {
    return this.type === 'financial' ? this.financialReports : this.administrativeReports;
  }

  get pageTitle() {
    return this.type === 'financial' ? 'التقارير المالية' : 'التقارير الإدارية';
  }

  get pageSubtitle() {
    return this.type === 'financial' ? 'تقارير المتابعة المالية للمرضى' : 'تقارير التشخيص والحالات العلاجية';
  }
}