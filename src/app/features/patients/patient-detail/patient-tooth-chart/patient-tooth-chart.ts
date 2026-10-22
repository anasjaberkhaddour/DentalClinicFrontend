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
import { ToothIcon } from '../../../../shared/components/tooth-icon/tooth-icon';
import {
  ToothChart, PatientTooth, ToothHistory, ProcedureType, MaterialDto,
  FDI_UPPER_RIGHT, FDI_UPPER_LEFT, FDI_LOWER_RIGHT, FDI_LOWER_LEFT,
  getToothStatusName, getMobilityName
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
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  loading = signal(true);
  chart = signal<ToothChart | null>(null);
  selectedTooth = signal<PatientTooth | null>(null);
  toothHistory = signal<ToothHistory[]>([]);
  historyLoading = signal(false);
  procedureTypes = signal<ProcedureType[]>([]);
  materials = signal<MaterialDto[]>([]);
  activeCases = signal<{ label: string; value: string }[]>([]);

  materialOptions = computed(() =>
    this.materials().map(m => ({ label: m.nameAr, value: m.name }))
  );

  upperRight = FDI_UPPER_RIGHT;
  upperLeft = FDI_UPPER_LEFT;
  lowerRight = FDI_LOWER_RIGHT;
  lowerLeft = FDI_LOWER_LEFT;

  // Edit status
  statusDialog = signal(false);
  statusSaving = signal(false);
  statusForm = { status: 1, mobility: 0, notes: '' };

  // Add procedure
  procedureDialog = signal(false);
  procedureSaving = signal(false);
  procedureForm: {
    procedureTypeId: string;
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
    procedureTypeId: '',
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

  statusOptions = [
    { label: 'سليم', value: 1 },
    { label: 'مفقود', value: 2 },
    { label: 'مخلوع', value: 3 },
    { label: 'مدفون', value: 4 },
    { label: 'غير بازغ', value: 5 },
    { label: 'تاج', value: 6 },
    { label: 'جسر', value: 7 },
    { label: 'زرع', value: 8 },
    { label: 'لبني', value: 9 },
  ];

  mobilityOptions = [
    { label: 'ثابت', value: 0 },
    { label: 'حركة 1', value: 1 },
    { label: 'حركة 2', value: 2 },
    { label: 'حركة 3', value: 3 },
  ];

  procedureTypeOptions = computed(() =>
    this.procedureTypes().map(p => ({ label: p.nameAr, value: p.id }))
  );

  selectedProcedureType = computed(() =>
    this.procedureTypes().find(p => p.id === this.procedureForm.procedureTypeId)
  );

  teethMap = computed(() => {
    const map = new Map<number, PatientTooth>();
    this.chart()?.teeth.forEach(t => map.set(t.toothNumber, t));
    return map;
  });

  ngOnInit(): void {
    this.loadChart();
    this.loadProcedureTypes();
    this.loadMaterials();
    this.loadActiveCases();
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

  loadProcedureTypes(): void {
    this.toothChartService.getProcedureTypes().subscribe({
      next: (res) => {
        if (res.isSuccess) this.procedureTypes.set(res.value);
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

  // ============ Edit status ============

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

  // ============ Add procedure ============

  openProcedureDialog(): void {
    this.procedureForm = {
      procedureTypeId: '',
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

    if (!this.procedureForm.procedureTypeId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر نوع الإجراء.' });
      return;
    }

    const pt = this.selectedProcedureType();
    if (pt?.requiresSurface) {
      const hasSurface = this.procedureForm.isMesial || this.procedureForm.isDistal
        || this.procedureForm.isBuccal || this.procedureForm.isLingual || this.procedureForm.isOcclusal;
      if (!hasSurface) {
        this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر سطحاً واحداً على الأقل.' });
        return;
      }
    }

    this.procedureSaving.set(true);

    const payload = {
      patientToothId: tooth.id,
      procedureTypeId: this.procedureForm.procedureTypeId,
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

  // ============ Delete procedure ============

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

  // ============ Lab order ============

  createLabOrder(): void {
    const tooth = this.selectedTooth();
    if (!tooth) return;
    this.router.navigate(
      ['/patients', this.patientId, 'lab-orders', 'create'],
      { queryParams: { toothId: tooth.id } }
    );
  }

  // ============ Helpers ============

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