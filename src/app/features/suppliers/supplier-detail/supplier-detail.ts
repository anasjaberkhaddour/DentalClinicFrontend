import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SupplierService } from '../../../core/services/supplier.service';
import { ContactService } from '../../../core/services/contact.service';
import { ContactType, ContactTypeOptions, ContactOwnerType } from '../../../core/constants/enums';
import { SupplierDetails } from '../../../core/models/supplier.model';

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, SkeletonModule, DialogModule, InputTextModule,
    TextareaModule, SelectModule, ToggleSwitchModule
  ],
  templateUrl: './supplier-detail.html',
  styleUrl: './supplier-detail.scss'
})
export class SupplierDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(SupplierService);
  private contactService = inject(ContactService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  supplier = signal<SupplierDetails | null>(null);
  supplierId!: string;

  ContactTypeOptions = ContactTypeOptions;

  editDialog = signal(false);
  editSaving = signal(false);
  editForm = {
    nameAr: '',
    address: '',
    city: '',
    country: '',
    contactPerson: '',
    taxNumber: '',
    notes: '',
    isActive: true
  };

  contactDialog = signal(false);
  contactSaving = signal(false);
  contactForm = {
    type: ContactType.Mobile,
    value: '',
    label: '',
    isPrimary: false
  };

  ngOnInit(): void {
    this.supplierId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.supplierId) {
      this.router.navigate(['/suppliers']);
      return;
    }
    this.loadSupplier();
  }

  loadSupplier(): void {
    this.loading.set(true);
    this.service.getById(this.supplierId).subscribe({
      next: (res) => {
        if (res.isSuccess) this.supplier.set(res.value);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل المورد.' });
        this.router.navigate(['/suppliers']);
      }
    });
  }

  openEdit(): void {
    const s = this.supplier();
    if (!s) return;
    this.editForm = {
      nameAr: s.nameAr ?? '',
      address: s.address ?? '',
      city: s.city ?? '',
      country: s.country ?? '',
      contactPerson: s.contactPerson ?? '',
      taxNumber: s.taxNumber ?? '',
      notes: s.notes ?? '',
      isActive: s.isActive
    };
    this.editDialog.set(true);
  }

  saveEdit(): void {
    if (!this.editForm.nameAr.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم مطلوب.' });
      return;
    }

    this.editSaving.set(true);
    this.service.update(this.supplierId, this.editForm).subscribe({
      next: (res) => {
        this.editSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ التعديلات.' });
          this.editDialog.set(false);
          this.loadSupplier();
        }
      },
      error: (err) => {
        this.editSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر حفظ التعديلات.'
        });
      }
    });
  }

  openContactDialog(): void {
    this.contactForm = {
      type: ContactType.Mobile,
      value: '',
      label: '',
      isPrimary: (this.supplier()?.contacts?.length ?? 0) === 0
    };
    this.contactDialog.set(true);
  }

  saveContact(): void {
    if (!this.contactForm.value.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'أدخل قيمة جهة الاتصال.' });
      return;
    }

    this.contactSaving.set(true);
    this.contactService.create({
      ownerType: ContactOwnerType.Supplier,
      ownerId: this.supplierId,
      type: this.contactForm.type,
      value: this.contactForm.value.trim(),
      label: this.contactForm.label || undefined,
      isPrimary: this.contactForm.isPrimary,
      isEmergency: false
    }).subscribe({
      next: (res) => {
        this.contactSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تمت إضافة جهة الاتصال.' });
          this.contactDialog.set(false);
          this.loadSupplier();
        }
      },
      error: (err) => {
        this.contactSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إضافة جهة الاتصال.'
        });
      }
    });
  }

  setPrimary(contact: any): void {
    this.contactService.setPrimary(contact.id).subscribe({
      next: (res) => {
        if (res.isSuccess) this.loadSupplier();
      }
    });
  }

  confirmDeleteContact(contact: any): void {
    this.confirmationService.confirm({
      message: 'هل تريد حذف جهة الاتصال هذه؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.contactService.delete(contact.id).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف جهة الاتصال.' });
              this.loadSupplier();
            }
          }
        });
      }
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا المورد؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(this.supplierId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف المورد.' });
              this.router.navigate(['/suppliers']);
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف المورد.'
            });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/suppliers']);
  }

  getContactTypeName(type: number): string {
    const found = ContactTypeOptions.find(o => o.value === type);
    return found?.label ?? '—';
  }
}