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
import { SkeletonModule } from 'primeng/skeleton';
@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, InputTextModule, InputNumberModule, TextareaModule, SelectModule, DatePickerModule, SkeletonModule
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
  invoiceId: string | null = null;
  isEditMode = false;

  saving = signal(false);
  loadingInvoice = signal(false);

  clinics = signal<{ label: string; value: string }[]>([]);
  currencies = signal<{ label: string; value: string }[]>([]);

  items = signal<(CreateInvoiceItemRequest & { treatmentId?: string })[]>([]);

  invoiceDate: Date = new Date();

  form = signal<CreateInvoiceRequest>({
    patientId: '',
    clinicId: '',
    currencyId: '',
    invoiceDate: '',
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
    this.invoiceId = this.route.snapshot.paramMap.get('invoiceId');
    this.isEditMode = !!this.invoiceId;

    if (!this.patientId) {
      this.router.navigate(['/patients']);
      return;
    }

    this.form.update(f => ({ ...f, patientId: this.patientId }));

    this.loadClinics();
    this.loadCurrencies();

    if (this.isEditMode && this.invoiceId) {
      this.loadInvoiceForEdit(this.invoiceId);
    } else {
      this.loadUnbilledTreatments();
    }
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.clinics.set(response.value.map((c: any) => ({ label: c.name, value: c.id })));
          if (!this.isEditMode && this.clinics().length === 1) {
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
          if (!this.isEditMode) {
            const base = response.value.find((c: any) => c.isBase);
            if (base) this.form.update(f => ({ ...f, currencyId: base.id }));
          }
        }
      }
    });
  }

  loadInvoiceForEdit(id: string): void {
    this.loadingInvoice.set(true);
    this.invoiceService.getById(id).subscribe({
      next: (response) => {
        if (!response.isSuccess || !response.value) {
          this.loadingInvoice.set(false);
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الفاتورة.' });
          this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'invoices' } });
          return;
        }

        const inv = response.value;

        this.invoiceDate = inv.invoiceDate ? new Date(inv.invoiceDate) : new Date();

        this.form.set({
          patientId: inv.patientId,
          clinicId: inv.clinicId,
          currencyId: inv.currencyId,
          invoiceDate: inv.invoiceDate,
          dueDate: inv.dueDate,
          discountPercent: inv.discountPercent ?? 0,
          discountAmount: inv.discountAmount ?? 0,
          notes: inv.notes ?? '',
          visitIds: inv.visitIds ?? [],
          items: []
        });

        const mapped = (inv.items ?? []).map((it: any, idx: number) => ({
          treatmentId: it.treatmentId,
          description: it.descriptionAr || it.description,
          descriptionAr: it.descriptionAr,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          patientToothId: it.patientToothId,
          notes: it.notes,
          displayOrder: it.displayOrder ?? idx + 1
        }));

        this.items.set(mapped);
        this.loadingInvoice.set(false);
      },
      error: () => {
        this.loadingInvoice.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الفاتورة.' });
        this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'invoices' } });
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

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedDate = `${this.invoiceDate.getFullYear()}-${pad(this.invoiceDate.getMonth() + 1)}-${pad(this.invoiceDate.getDate())}`;

    this.saving.set(true);

    if (this.isEditMode && this.invoiceId) {
      const payload = {
        dueDate: f.dueDate,
        discountPercent: f.discountPercent,
        discountAmount: f.discountAmount,
        notes: f.notes,
        visitIds: f.visitIds ?? [],
        items: cleanItems
      };

      this.invoiceService.update(this.invoiceId, payload).subscribe({
        next: (response) => {
          this.saving.set(false);
          if (response.isSuccess) {
            this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ التعديلات.' });
            this.router.navigate(['/patients', this.patientId, 'invoices', this.invoiceId]);
          }
        },
        error: (err) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: err?.error?.error?.message ?? 'تعذّر حفظ التعديلات.'
          });
        }
      });
    } else {
      const payload: CreateInvoiceRequest = { ...f, invoiceDate: formattedDate, items: cleanItems };

      this.invoiceService.create(payload).subscribe({
        next: (response) => {
          this.saving.set(false);
          if (response.isSuccess && response.value) {
            this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ الفاتورة كمسودة.' });
            this.router.navigate(['/patients', this.patientId, 'invoices', response.value]);
          }
        },
        error: () => {
          this.saving.set(false);
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر إنشاء الفاتورة.' });
        }
      });
    }
  }

  cancel(): void {
    if (this.isEditMode && this.invoiceId) {
      this.router.navigate(['/patients', this.patientId, 'invoices', this.invoiceId]);
    } else {
      this.router.navigate(['/patients', this.patientId], { queryParams: { tab: 'invoices' } });
    }
  }
}