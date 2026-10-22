import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { MessageService, ConfirmationService } from 'primeng/api';
import { RadiologyService, RadiologyListItem, RadiologyTypeDto } from '../../../../core/services/radiology.service';
import { ClinicService } from '../../../../core/services/clinic.service';

@Component({
  selector: 'app-patient-radiology',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, SkeletonModule, DialogModule, SelectModule, InputTextModule, TextareaModule
  ],
  templateUrl: './patient-radiology.html',
  styleUrl: './patient-radiology.scss'
})
export class PatientRadiology implements OnInit {
  @Input() patientId!: string;

  private radiologyService = inject(RadiologyService);
  private clinicService = inject(ClinicService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  loading = signal(true);
  images = signal<RadiologyListItem[]>([]);
  types = signal<{ label: string; value: string }[]>([]);
  clinics = signal<{ label: string; value: string }[]>([]);

  uploadDialog = signal(false);
  uploading = signal(false);

  previewDialog = signal(false);
  previewImage = signal<RadiologyListItem | null>(null);

  uploadForm = {
    clinicId: '',
    radiologyTypeId: '',
    file: null as File | null
  };

  ngOnInit(): void {
    this.loadImages();
    this.loadTypes();
    this.loadClinics();
  }

  loadImages(): void {
    this.loading.set(true);
    this.radiologyService.getByPatient(this.patientId).subscribe({
      next: (response) => {
        this.images.set(response.value.items);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل الأشعة.' });
      }
    });
  }

  loadTypes(): void {
    this.radiologyService.getTypes().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.types.set(response.value.map(t => ({ label: t.nameAr, value: t.id })));
        }
      }
    });
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.clinics.set(response.value.map((c: any) => ({ label: c.name, value: c.id })));
          if (this.clinics().length === 1) this.uploadForm.clinicId = this.clinics()[0].value;
        }
      }
    });
  }

  openUpload(): void {
    this.uploadForm = {
      clinicId: this.clinics().length === 1 ? this.clinics()[0].value : '',
      radiologyTypeId: '',
      file: null
    };
    this.uploadDialog.set(true);
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.uploadForm.file = file;
    }
  }

  upload(): void {
    if (!this.uploadForm.file) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر صورة.' });
      return;
    }
    if (!this.uploadForm.clinicId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العيادة.' });
      return;
    }
    if (!this.uploadForm.radiologyTypeId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر نوع الأشعة.' });
      return;
    }

    this.uploading.set(true);
    const fd = new FormData();
    fd.append('patientId', this.patientId);
    fd.append('clinicId', this.uploadForm.clinicId);
    fd.append('radiologyTypeId', this.uploadForm.radiologyTypeId);
    fd.append('file', this.uploadForm.file);

    this.radiologyService.upload(fd).subscribe({
      next: (res) => {
        this.uploading.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم رفع الصورة.' });
          this.uploadDialog.set(false);
          this.loadImages();
        }
      },
      error: (err) => {
        this.uploading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر رفع الصورة.'
        });
      }
    });
  }

  openPreview(img: RadiologyListItem): void {
    this.radiologyService.getById(img.id).subscribe({
      next: (response) => {
        if (response.isSuccess) {
          this.previewImage.set(response.value);
          this.previewDialog.set(true);
        }
      }
    });
  }

  confirmDelete(img: RadiologyListItem): void {
    this.confirmationService.confirm({
      message: 'هل أنت متأكد من حذف هذه الصورة؟',
      header: 'تأكيد الحذف',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، احذف',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteImage(img.id)
    });
  }

  deleteImage(id: string): void {
    this.radiologyService.delete(id).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حذف الصورة.' });
          if (this.previewImage()?.id === id) {
            this.previewDialog.set(false);
            this.previewImage.set(null);
          }
          this.loadImages();
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر حذف الصورة.' });
      }
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}