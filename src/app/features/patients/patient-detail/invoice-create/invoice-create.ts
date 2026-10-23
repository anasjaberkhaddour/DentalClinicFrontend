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
import { MessageService } from 'primeng/api';
import { InvoiceService, CreateInvoiceRequest, CreateInvoiceItemRequest } from '../../../../core/services/invoice.service';
import { ClinicService } from '../../../../core/services/clinic.service';
import { CurrencyService } from '../../../../core/services/currency.service';
import { TreatmentService } from '../../../../core/services/treatment.service';
import { TreatmentListItem } from '../../../../core/models/treatment.model';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, InputNumberModule, TextareaModule, SelectModule, DatePickerModule
  ],
  templateUrl: './invoice-create.html',
  styleUrl: './invoice-create.scss'
})
export class InvoiceCreate implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private clinicService = inject(ClinicService);
  private currencyService = inject(CurrencyService);
  private treatmentService = inject(TreatmentService);
  private messageService = inject(MessageService);

  patientId!: string;
  saving = signal(false);

  clinics = signal<{ label: string; value: string }[]>([]);
  currencies = signal<{ label: string; value: string }[]>([]);
  treatments = signal<TreatmentListItem[]>([]);

  items = signal<(CreateInvoiceItemRequest & { treatmentId?: string })[]>([]);

  form: CreateInvoiceRequest = {
    patientId: '',
    clinicId: '',
    currencyId: '',
    invoiceDate: new Date().toISOString(),
    discountPercent: 0,
    discountAmount: 0,
    visitIds: [],
    items: [],
  };

  subTotal = computed(() =>
    this.items().reduce((s, i) => s + (i.quantity * i.unitPrice), 0)
  );

  discountValue = computed(() => {
    const sub = this.subTotal();
    if (this.form.discountPercent > 0) {
      return Math.round((sub * this.form.discountPercent / 100) * 10000) / 10000;
    }
    return this.form.discountAmount ?? 0;
  });

  total = computed(() => Math.max(0, this.subTotal() - this.discountValue()));

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.form.patientId = this.patientId;

    this.addItem();
    this.loadClinics();
    this.loadCurrencies();
    this.loadTreatments();
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.clinics.set(response.value.map((c: any) => ({ label: c.name, value: c.id })));
          if (this.clinics().length === 1) this.form.clinicId = this.clinics()[0].value;
        }
      }
    });
  }

  loadCurrencies(): void {
    this.currencyService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.currencies.set(response.value.map((c: any) => ({
            label: `${c.code} - ${c.nameAr}`,
            value: c.id
          })));
          const base = response.value.find((c: any) => c.isBase);
          if (base) this.form.currencyId = base.id;
        }
      }
    });
  }

  loadTreatments(): void {
    this.treatmentService.getAll({ page: 1, pageSize: 200, isActive: true }).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.treatments.set(response.value.items);
        }
      }
    });
  }

  onTreatmentSelect(index: number, treatmentId: string): void {
    const treatment = this.treatments().find(t => t.id === treatmentId);
    if (treatment) {
      this.items.update(list => {
        const newList = [...list];
        newList[index] = {
          ...newList[index],
          treatmentId: treatment.id,
          description: treatment.nameAr,
          unitPrice: treatment.estimatedPrice
        };
        return newList;
      });
    }
  }

  addItem(): void {
    this.items.update(list => [
      ...list,
      {
        treatmentId: undefined,
        description: '',
        quantity: 1,
        unitPrice: 0,
        displayOrder: list.length + 1
      }
    ]);
  }

  removeItem(index: number): void {
    this.items.update(list => list.filter((_, i) => i !== index));
  }

  save(): void {
    if (!this.form.clinicId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العيادة.' });
      return;
    }
    if (!this.form.currencyId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العملة.' });
      return;
    }

    const cleanItems = this.items().filter(i => i.description.trim().length > 0 && i.unitPrice >= 0);

    if (cleanItems.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'أضف بنداً واحداً على الأقل.' });
      return;
    }

    this.form.items = cleanItems;
    this.saving.set(true);

    this.invoiceService.create(this.form).subscribe({
      next: (response) => {
        this.saving.set(false);
        if (response.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الفاتورة.' });
          this.router.navigate(['/patients', this.patientId]);
        }
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر إنشاء الفاتورة.' });
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/patients', this.patientId]);
  }
}