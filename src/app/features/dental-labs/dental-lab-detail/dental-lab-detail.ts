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
import { DentalLabService } from '../../../core/services/dental-lab.service';
import { ContactService } from '../../../core/services/contact.service';
import { ContactType, ContactTypeOptions, ContactOwnerType } from '../../../core/constants/enums';

@Component({
  selector: 'app-dental-lab-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, SkeletonModule, DialogModule, InputTextModule,
    TextareaModule, SelectModule, ToggleSwitchModule
  ],
  templateUrl: './dental-lab-detail.html',
  styleUrl: './dental-lab-detail.scss'
})
export class DentalLabDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(DentalLabService);
  private contactService = inject(ContactService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  lab = signal<any | null>(null);
  labId!: string;

  ContactTypeOptions = ContactTypeOptions;

  // Edit lab
  editDialog = signal(false);
  editSaving = signal(false);
  editForm = {
    code: '',
    name: '',
    nameAr: '',
    address: '',
    city: '',
    country: '',
    contactPerson: '',
    taxNumber: '',
    notes: '',
    isActive: true
  };

  // Add contact
  contactDialog = signal(false);
  contactSaving = signal(false);
  contactForm = {
    type: ContactType.Mobile,
    value: '',
    label: '',
    isPrimary: false
  };

  ngOnInit(): void {
    this.labId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.labId) {
      this.router.navigate(['/dental-labs']);
      return;
    }
    this.loadLab();
  }

  loadLab(): void {
    this.loading.set(true);
    this.service.getById(this.labId).subscribe({
      next: (res) => {
        if (res.isSuccess) this.lab.set(res.value);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل المخبر.' });
        this.router.navigate(['/dental-labs']);
      }
    });
  }

  openEdit(): void {
    const l = this.lab();
    if (!l) return;
    this.editForm = {
      code: l.code ?? '',
      name: l.name ?? '',
      nameAr: l.nameAr ?? '',
      address: l.address ?? '',
      city: l.city ?? '',
      country: l.country ?? '',
      contactPerson: l.contactPerson ?? '',
      taxNumber: l.taxNumber ?? '',
      notes: l.notes ?? '',
      isActive: l.isActive
    };
    this.editDialog.set(true);
  }

  saveEdit(): void {
    if (!this.editForm.nameAr.trim() || !this.editForm.code.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الاسم والرمز مطلوبان.' });
      return;
    }

    this.editSaving.set(true);
    this.service.update(this.labId, this.editForm).subscribe({
      next: (res) => {
        this.editSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ التعديلات.' });
          this.editDialog.set(false);
          this.loadLab();
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
      isPrimary: (this.lab()?.contacts?.length ?? 0) === 0
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
      ownerType: ContactOwnerType.DentalLab,
      ownerId: this.labId,
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
          this.loadLab();
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
        if (res.isSuccess) this.loadLab();
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
              this.loadLab();
            }
          }
        });
      }
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذا المخبر؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'تراجع',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.service.delete(this.labId).subscribe({
          next: (res) => {
            if (res.isSuccess) {
              this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف المخبر.' });
              this.router.navigate(['/dental-labs']);
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: err?.error?.error?.message ?? 'تعذّر حذف المخبر.'
            });
          }
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dental-labs']);
  }

  getContactTypeName(type: number): string {
    const found = ContactTypeOptions.find(o => o.value === type);
    return found?.label ?? '—';
  }
}