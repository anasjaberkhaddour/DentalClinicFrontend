import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { MessageService } from 'primeng/api';
import { LabOrderService } from '../../../../core/services/lab-order.service';
import { LabService } from '../../../../core/services/lab.service';
import { ClinicService } from '../../../../core/services/clinic.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { ToothChartService } from '../../../../core/services/tooth-chart.service';
import { MaterialDto } from '../../../../core/models/tooth-chart.model';
import { ShadePicker } from '../../../../shared/components/shade-picker/shade-picker';

@Component({
  selector: 'app-lab-order-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, InputNumberModule, TextareaModule,
    SelectModule, DatePickerModule, MultiSelectModule, ShadePicker
  ],
  templateUrl: './lab-order-create.html',
  styleUrl: './lab-order-create.scss'
})
export class LabOrderCreate implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private labOrderService = inject(LabOrderService);
  private labService = inject(LabService);
  private clinicService = inject(ClinicService);
  private currencyService = inject(CurrencyService);
  private toothChartService = inject(ToothChartService);
  private messageService = inject(MessageService);

  patientId!: string;
  saving = signal(false);

  clinics = signal<{ label: string; value: string }[]>([]);
  currencies = signal<{ label: string; value: string }[]>([]);
  labs = signal<{ label: string; value: string }[]>([]);
  types = signal<{ label: string; value: string }[]>([]);
  teeth = signal<{ label: string; value: string }[]>([]);
  materials = signal<MaterialDto[]>([]);

  materialOptions = computed(() =>
    this.materials().map(m => ({ label: m.nameAr, value: m.name }))
  );

  form = {
    patientId: '',
    clinicId: '',
    dentalLabId: '',
    labOrderTypeId: '',
    currencyId: '',
    estimatedCost: null as number | null,
    expectedDeliveryDate: null as string | null,
    shade: '',
    material: '',
    instructions: '',
    notes: '',
    patientToothIds: [] as string[]
  };

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.form.patientId = this.patientId;

    const toothId = this.route.snapshot.queryParamMap.get('toothId');
    if (toothId) {
      this.form.patientToothIds = [toothId];
    }

    this.loadClinics();
    this.loadCurrencies();
    this.loadLabs();
    this.loadTypes();
    this.loadTeeth();
    this.loadMaterials();
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.clinics.set(res.value.map((c: any) => ({ label: c.name, value: c.id })));
          if (this.clinics().length === 1) this.form.clinicId = this.clinics()[0].value;
        }
      }
    });
  }

  loadCurrencies(): void {
    this.currencyService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.currencies.set(res.value.map((c: any) => ({ label: `${c.code} - ${c.nameAr}`, value: c.id })));
          const base = res.value.find((c: any) => c.isBase);
          if (base) this.form.currencyId = base.id;
        }
      }
    });
  }

  loadLabs(): void {
    this.labService.getAllLabs().subscribe({
      next: (res: any) => {
        const items = res.value?.items ?? res.value ?? [];
        this.labs.set(items.map((l: any) => ({ label: l.nameAr, value: l.id })));
      }
    });
  }

  loadTypes(): void {
    this.labService.getAllTypes().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.types.set(res.value.map((t: any) => ({ label: t.nameAr, value: t.id })));
        }
      }
    });
  }

  loadTeeth(): void {
    this.toothChartService.getChart(this.patientId).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.teeth.set(
            res.value.teeth.map((t: any) => ({
              label: `سن ${t.toothNumber}`,
              value: t.id
            }))
          );
        }
      }
    });
  }

  loadMaterials(): void {
    this.toothChartService.getMaterials('Prosthetic').subscribe({
      next: (res) => {
        if (res.isSuccess) this.materials.set(res.value);
      }
    });
  }

  save(): void {
    if (!this.form.clinicId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العيادة.' });
      return;
    }
    if (!this.form.dentalLabId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر المخبر.' });
      return;
    }
    if (!this.form.labOrderTypeId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر نوع العمل.' });
      return;
    }
    if (!this.form.currencyId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العملة.' });
      return;
    }

    this.saving.set(true);

    const payload = {
      patientId: this.form.patientId,
      clinicId: this.form.clinicId,
      dentalLabId: this.form.dentalLabId,
      labOrderTypeId: this.form.labOrderTypeId,
      currencyId: this.form.currencyId,
      estimatedCost: this.form.estimatedCost,
      expectedDeliveryDate: this.form.expectedDeliveryDate,
      shade: this.form.shade || null,
      material: this.form.material || null,
      instructions: this.form.instructions || null,
      notes: this.form.notes || null,
      patientToothIds: this.form.patientToothIds
    };

    this.labOrderService.create(payload).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.isSuccess && res.value) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الطلب.' });
          this.router.navigate(['/patients', this.patientId, 'lab-orders', res.value]);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: res.error?.message ?? 'تعذّر إنشاء الطلب.'
          });
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء الطلب.'
        });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/patients', this.patientId]);
  }

  toothShades = [
    { code: 'A1', color: '#EAE0CC' },
    { code: 'A2', color: '#DFCDAC' },
    { code: 'A3', color: '#D7BC96' },
    { code: 'A3.5', color: '#C9A87D' },
    { code: 'A4', color: '#B5946F' },
    { code: 'B1', color: '#F1EAD8' },
    { code: 'B2', color: '#E8DBC0' },
    { code: 'B3', color: '#DBC69E' },
    { code: 'B4', color: '#C9B089' },
    { code: 'C1', color: '#E0D3BC' },
    { code: 'C2', color: '#CBB89A' },
    { code: 'C3', color: '#B59F7A' },
    { code: 'C4', color: '#9A8464' },
    { code: 'D2', color: '#DDCFB8' },
    { code: 'D3', color: '#C7B599' },
    { code: 'D4', color: '#AE9575' },
  ];
  
  shadeOptions = this.toothShades.map(s => ({ label: s.code, value: s.code }));
}