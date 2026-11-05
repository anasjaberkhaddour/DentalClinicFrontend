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
import { PatientService } from '../../../../core/services/patient.service';

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
  private patientService = inject(PatientService);
  private messageService = inject(MessageService);

  patientId!: string;
  saving = signal(false);

  clinics = signal<{ label: string; value: string }[]>([]);
  currencies = signal<{ label: string; value: string }[]>([]);

  items = signal<(CreateInvoiceItemRequest & { treatmentId?: string })[]>([]);

  form = signal<CreateInvoiceRequest>({
    patientId: '',
    clinicId: '',
    currencyId: '',
    invoiceDate: new Date().toISOString(),
    discountPercent: 0,
    discountAmount: 0,
    visitIds: [],
    items: [],
    notes: '',
  });

  subTotal = computed(() =>
    this.items().reduce((s, i) => s + ((i.quantity ?? 0) * (i.unitPrice ?? 0)), 0)
  );

  discountValue = computed(() => {
    const sub = this.subTotal();
    const f = this.form();
    const percentDiscount = f.discountPercent > 0 ? (sub * f.discountPercent / 100) : 0;
    const fixedDiscount = f.discountAmount ?? 0;
    const combined = percentDiscount + fixedDiscount;
    return Math.min(Math.round(combined * 10000) / 10000, sub);
  });

  total = computed(() => Math.max(0, this.subTotal() - this.discountValue()));

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.form.update(f => ({ ...f, patientId: this.patientId }));

    this.loadClinics();
    this.loadCurrencies();
    this.loadUnbilledTreatments();
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.clinics.set(response.value.map((c: any) => ({ label: c.name, value: c.id })));
          if (this.clinics().length === 1) {
            this.form.update(f => ({ ...f, clinicId: this.clinics()[0].value }));
          }
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
          if (base) this.form.update(f => ({ ...f, currencyId: base.id }));
        }
      }
    });
  }

  loadUnbilledTreatments(): void {
    this.patientService.getUnbilledTreatments(this.patientId).subscribe({
      next: (res: any) => {
        if (res.isSuccess) {
          const treatments = res.value ?? [];
          const mapped = treatments.map((t: any, idx: number) => ({
            treatmentId: t.treatmentId,
            description: `${t.treatmentNameAr} (سن ${t.toothNumber}) ${t.caseTitle ? '- ' + t.caseTitle : ''}`,
            quantity: 1,
            unitPrice: t.price,
            displayOrder: idx + 1,
            notes: `HistoryId:${t.historyId}`
          }));

          if (mapped.length > 0) {
            this.items.set(mapped);
          } else {
            this.addItem();
          }
        } else {
          this.addItem();
        }
      },
      error: () => {
        this.addItem();
      }
    });
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

  updateItem(index: number, patch: Partial<CreateInvoiceItemRequest>): void {
    this.items.update(list => {
      const newList = [...list];
      newList[index] = { ...newList[index], ...patch };
      return newList;
    });
  }

  updateForm(patch: Partial<CreateInvoiceRequest>): void {
    this.form.update(f => ({ ...f, ...patch }));
  }

  onPercentChange(value: number | null): void {
    this.form.update(f => ({
      ...f,
      discountPercent: value ?? 0,
      discountAmount: (value ?? 0) > 0 ? 0 : f.discountAmount
    }));
  }

  onFixedChange(value: number | null): void {
    this.form.update(f => ({
      ...f,
      discountAmount: value ?? 0,
      discountPercent: (value ?? 0) > 0 ? 0 : f.discountPercent
    }));
  }

  save(): void {
    const f = this.form();
    if (!f.clinicId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العيادة.' });
      return;
    }
    if (!f.currencyId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العملة.' });
      return;
    }

    const cleanItems = this.items().filter(i => i.description.trim().length > 0 && i.unitPrice >= 0);

    if (cleanItems.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'أضف بنداً واحداً على الأقل.' });
      return;
    }

    const payload: CreateInvoiceRequest = { ...f, items: cleanItems };
    this.saving.set(true);

    this.invoiceService.create(payload).subscribe({
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