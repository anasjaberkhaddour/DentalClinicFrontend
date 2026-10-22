import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';
import { PatientService } from '../../../../core/services/patient.service';
import { MedicalHistory, UpdateMedicalHistoryRequest } from '../../../../core/models/patient.model';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TextareaModule, ToggleSwitchModule],
  templateUrl: './patient-history.html',
  styleUrl: './patient-history.scss'
})
export class PatientHistory implements OnInit {
  @Input() patientId!: string;
  @Input() history?: MedicalHistory;
  @Output() saved = new EventEmitter<void>();

  private patientService = inject(PatientService);
  private messageService = inject(MessageService);

  editing = signal(false);
  saving = signal(false);

  form: UpdateMedicalHistoryRequest = this.getEmptyForm();

  ngOnInit(): void {
    if (this.history) {
      this.form = {
        chronicDiseases: this.history.chronicDiseases,
        pastMedicalHistory: this.history.pastMedicalHistory,
        pastSurgicalHistory: this.history.pastSurgicalHistory,
        currentMedications: this.history.currentMedications,
        drugAllergies: this.history.drugAllergies,
        materialAllergies: this.history.materialAllergies,
        foodAllergies: this.history.foodAllergies,
        isPregnant: this.history.isPregnant,
        isBreastfeeding: this.history.isBreastfeeding,
        smokes: this.history.smokes,
        consumesAlcohol: this.history.consumesAlcohol,
        otherHabits: this.history.otherHabits,
        criticalAlerts: this.history.criticalAlerts,
        additionalNotes: this.history.additionalNotes,
      };
    }
  }

  getEmptyForm(): UpdateMedicalHistoryRequest {
    return {
      isPregnant: false,
      isBreastfeeding: false,
      smokes: false,
      consumesAlcohol: false,
    };
  }

  startEdit(): void {
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
    this.ngOnInit();
  }

  save(): void {
    this.saving.set(true);
    this.patientService.updateMedicalHistory(this.patientId, this.form).subscribe({
      next: (response) => {
        this.saving.set(false);
        if (response.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم حفظ القصة المرضية.' });
          this.editing.set(false);
          this.saved.emit();
        }
      },
      error: () => {
        this.saving.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر حفظ القصة المرضية.' });
      }
    });
  }

  hasValue(value?: string): boolean {
    return !!value && value.trim().length > 0;
  }
}