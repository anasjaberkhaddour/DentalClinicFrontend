import { Component, Input, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToothChartService } from '../../../../core/services/tooth-chart.service';
import { TreatmentCaseService } from '../../../../core/services/treatment-case.service';
import { TreatmentService } from '../../../../core/services/treatment.service';
import { ToothIcon } from '../../../../shared/components/tooth-icon/tooth-icon';
import {
  ToothChart, PatientTooth, ToothHistory, MaterialDto,
  FDI_UPPER_RIGHT, FDI_UPPER_LEFT, FDI_LOWER_RIGHT, FDI_LOWER_LEFT,
  getToothStatusName, getMobilityName,
  getToothStatusColor, getToothStatusBorderColor
} from '../../../../core/models/tooth-chart.model';

@Component({
  selector: 'app-patient-tooth-chart',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, SkeletonModule, DialogModule, SelectModule,
    InputTextModule, TextareaModule, InputNumberModule, CheckboxModule,
    TooltipModule, ToothIcon
  ],
  templateUrl: './patient-tooth-chart.html',
  styleUrl: './patient-tooth-chart.scss'
})
export class PatientToothChart implements OnInit {
  @Input() patientId!: string;

  private toothChartService = inject(ToothChartService);
  private treatmentCaseService = inject(TreatmentCaseService);
  private treatmentService = inject(TreatmentService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  loading = signal(true);
  chart = signal<ToothChart | null>(null);
  selectedTooth = signal<PatientTooth | null>(null);
  toothHistory = signal<ToothHistory[]>([]);
  historyLoading = signal(false);
  materials = signal<MaterialDto[]>([]);
  activeCases = signal<{ label: string; value: string }[]>([]);
  treatments = signal<any[]>([]);

  // نوع الأسنان المعروضة
  toothType = signal<'permanent' | 'primary'>('permanent');

  // ترتيب عرض الأسنان: الأيمن على اليسار والعكس (FDI)
  // دائم
  displayUpperRightPermanent = [18, 17, 16, 15, 14, 13, 12, 11];
  displayUpperLeftPermanent  = [21, 22, 23, 24, 25, 26, 27, 28];
  displayLowerRightPermanent = [48, 47, 46, 45, 44, 43, 42, 41];
  displayLowerLeftPermanent  = [31, 32, 33, 34, 35, 36, 37, 38];

  // لبني
  displayUpperRightPrimary = [55, 54, 53, 52, 51];
  displayUpperLeftPrimary  = [61, 62, 63, 64, 65];
  displayLowerRightPrimary = [85, 84, 83, 82, 81];
  displayLowerLeftPrimary  = [71, 72, 73, 74, 75];

  materialOptions = computed(() =>
    this.materials().map(m => ({ label: m.nameAr, value: m.name }))
  );

  treatmentOptions = computed(() =>
    this.treatments().map(t => ({ label: t.nameAr, value: t.id }))
  );

  statusDialog = signal(false);
  statusSaving = signal(false);
  statusForm = { status: 1, mobility: 0, notes: '' };

  procedureDialog = signal(false);
  procedureSaving = signal(false);
  procedureForm: {
    treatmentId: string;
    treatmentCaseId?: string;
    isMesial: boolean;
    isDistal: boolean;
    isBuccal: boolean;
    isLingual: boolean;
    isOcclusal: boolean;
    mobility: number;
    material: string;
    notes: string;
  } = {
    treatmentId: '',
    treatmentCaseId: undefined,
    isMesial: false,
    isDistal: false,
    isBuccal: false,
    isLingual: false,
    isOcclusal: false,
    mobility: 0,
    material: '',
    notes: ''
  };

   // حالات الأسنان الدائمة
   permanentStatusOptions = [
    { label: 'سليم', value: 1, color: getToothStatusColor(1), borderColor: getToothStatusBorderColor(1) },
    { label: 'بحاجة علاج', value: 10, color: getToothStatusColor(10), borderColor: getToothStatusBorderColor(10) },
    { label: 'ترميم مع جذور حية', value: 11, color: getToothStatusColor(11), borderColor: getToothStatusBorderColor(11) },
    { label: 'معالج الجذور مع تاج', value: 12, color: getToothStatusColor(12), borderColor: getToothStatusBorderColor(12) },
    { label: 'معالج الجذور بدون تاج', value: 13, color: getToothStatusColor(13), borderColor: getToothStatusBorderColor(13) },
    { label: 'دمية', value: 14, color: getToothStatusColor(14), borderColor: getToothStatusBorderColor(14) },
    { label: 'غير موجود', value: 2, color: getToothStatusColor(2), borderColor: getToothStatusBorderColor(2) },
    { label: 'منطمر', value: 4, color: getToothStatusColor(4), borderColor: getToothStatusBorderColor(4) },
    { label: 'زرعة', value: 8, color: getToothStatusColor(8), borderColor: getToothStatusBorderColor(8) },
  ];

  // حالات الأسنان اللبنية
  primaryStatusOptions = [
    { label: 'سليم', value: 1, color: getToothStatusColor(1), borderColor: getToothStatusBorderColor(1) },
    { label: 'بحاجة علاج', value: 10, color: getToothStatusColor(10), borderColor: getToothStatusBorderColor(10) },
    { label: 'معالج بدون تاج', value: 16, color: getToothStatusColor(16), borderColor: getToothStatusBorderColor(16) },
    { label: 'معالج مع تاج', value: 17, color: getToothStatusColor(17), borderColor: getToothStatusBorderColor(17) },
    { label: 'غير بازغ', value: 15, color: getToothStatusColor(15), borderColor: getToothStatusBorderColor(15) },
    { label: 'غير موجود', value: 2, color: getToothStatusColor(2), borderColor: getToothStatusBorderColor(2) },
  ];

  // القائمة المختارة حسب نوع السن الحالي
  currentStatusOptions = computed(() => {
    return this.toothType() === 'permanent' 
      ? this.permanentStatusOptions 
      : this.primaryStatusOptions;
  });

  mobilityOptions = [
    { label: 'ثابت', value: 0 },
    { label: 'حركة 1', value: 1 },
    { label: 'حركة 2', value: 2 },
    { label: 'حركة 3', value: 3 },
  ];

  teethMap = computed(() => {
    const map = new Map<number, PatientTooth>();
    this.chart()?.teeth.forEach(t => map.set(t.toothNumber, t));
    return map;
  });

  ngOnInit(): void {
    this.loadChart();
    this.loadMaterials();
    this.loadActiveCases();
    this.loadTreatments();
  }

  setToothType(type: 'permanent' | 'primary'): void {
    this.toothType.set(type);
    // إغلاق الدرج عند التبديل لتجنب عرض سن غير موجود
    this.closeDrawer();
  }

  allTreatments = signal<any[]>([]);

  loadTreatments(): void {
    this.treatmentService.getAll({ page: 1, pageSize: 200, isActive: true }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.allTreatments.set(res.value.items);
          this.treatments.set(res.value.items);
        }
      }
    });
  }

  onCaseChange(): void {
    const caseId = this.procedureForm.treatmentCaseId;
    this.procedureForm.treatmentId = '';

    if (!caseId) {
      this.treatments.set(this.allTreatments());
    } else {
      this.treatmentCaseService.getAvailableTreatments(caseId).subscribe({
        next: (res) => {
          if (res.isSuccess) {
            this.treatments.set(res.value);
          }
        }
      });
    }
  }

  loadMaterials(): void {
    this.toothChartService.getMaterials('Restorative').subscribe({
      next: (res) => {
        if (res.isSuccess) this.materials.set(res.value);
      }
    });
  }

  loadActiveCases(): void {
    this.treatmentCaseService.getAll({ patientId: this.patientId, status: 1, page: 1, pageSize: 100 }).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.activeCases.set(
            res.value.items.map((tc: any) => ({
              label: tc.title || tc.chiefComplaint || tc.caseNumber,
              value: tc.id
            }))
          );
        }
      }
    });
  }

  loadChart(): void {
    this.loading.set(true);
    this.toothChartService.getChart(this.patientId).subscribe({
      next: (res) => {
        if (res.isSuccess) this.chart.set(res.value);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل المخطط.' });
      }
    });
  }

  getTooth(num: number): PatientTooth | undefined {
    return this.teethMap().get(num);
  }

  selectTooth(tooth: PatientTooth | undefined): void {
    if (!tooth) return;
    this.selectedTooth.set(tooth);
    this.loadToothHistory(tooth.id);
  }

  loadToothHistory(patientToothId: string): void {
    this.historyLoading.set(true);
    this.toothChartService.getToothHistory(patientToothId).subscribe({
      next: (res) => {
        if (res.isSuccess) this.toothHistory.set(res.value);
        this.historyLoading.set(false);
      },
      error: () => this.historyLoading.set(false)
    });
  }

  closeDrawer(): void {
    this.selectedTooth.set(null);
    this.toothHistory.set([]);
  }

  openStatusDialog(): void {
    const tooth = this.selectedTooth();
    if (!tooth) return;
    this.statusForm = {
      status: tooth.status,
      mobility: tooth.mobility,
      notes: tooth.notes ?? ''
    };
    this.statusDialog.set(true);
  }

  saveStatus(): void {
    const tooth = this.selectedTooth();
    if (!tooth) return;

    this.statusSaving.set(true);
    this.toothChartService.updateToothStatus(tooth.id, this.statusForm).subscribe({
      next: (res) => {
        this.statusSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم تحديث حالة السن.' });
          this.statusDialog.set(false);
          this.reloadTooth(tooth.id);
        }
      },
      error: () => {
        this.statusSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحديث الحالة.' });
      }
    });
  }

  openProcedureDialog(): void {
    this.procedureForm = {
      treatmentId: '',
      treatmentCaseId: undefined,
      isMesial: false,
      isDistal: false,
      isBuccal: false,
      isLingual: false,
      isOcclusal: false,
      mobility: this.selectedTooth()?.mobility ?? 0,
      material: '',
      notes: ''
    };
    this.procedureDialog.set(true);
  }

  saveProcedure(): void {
    const tooth = this.selectedTooth();
    if (!tooth) return;

    if (!this.procedureForm.treatmentId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العلاج.' });
      return;
    }

    this.procedureSaving.set(true);

    const payload = {
      patientToothId: tooth.id,
      treatmentId: this.procedureForm.treatmentId,
      treatmentCaseId: this.procedureForm.treatmentCaseId || undefined,
      isMesial: this.procedureForm.isMesial,
      isDistal: this.procedureForm.isDistal,
      isBuccal: this.procedureForm.isBuccal,
      isLingual: this.procedureForm.isLingual,
      isOcclusal: this.procedureForm.isOcclusal,
      mobility: this.procedureForm.mobility,
      material: this.procedureForm.material || undefined,
      notes: this.procedureForm.notes || undefined
    };

    this.toothChartService.createToothHistory(payload).subscribe({
      next: (res) => {
        this.procedureSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إضافة الإجراء.' });
          this.procedureDialog.set(false);
          this.reloadTooth(tooth.id);
        }
      },
      error: (err) => {
        this.procedureSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إضافة الإجراء.'
        });
      }
    });
  }

  confirmDeleteHistory(h: ToothHistory): void {
    this.confirmationService.confirm({
      message: 'هل تريد حذف هذا الإجراء من التاريخ؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.toothChartService.deleteToothHistory(h.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الإجراء.' });
              this.reloadTooth(h.patientToothId);
            }
          }
        });
      }
    });
  }

  createLabOrder(): void {
    const tooth = this.selectedTooth();
    if (!tooth) return;
    this.router.navigate(
      ['/patients', this.patientId, 'lab-orders', 'create'],
      { queryParams: { toothId: tooth.id } }
    );
  }

  reloadTooth(patientToothId: string): void {
    this.toothChartService.getTooth(patientToothId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.selectedTooth.set(res.value);
          this.loadToothHistory(patientToothId);
          this.loadChart();
        }
      }
    });
  }

  getToothStatusName = getToothStatusName;
  getMobilityName = getMobilityName;

  getSurfaces(h: ToothHistory): string[] {
    const s: string[] = [];
    if (h.isMesial) s.push('M');
    if (h.isDistal) s.push('D');
    if (h.isBuccal) s.push('B');
    if (h.isLingual) s.push('L');
    if (h.isOcclusal) s.push('O');
    return s;
  }
}