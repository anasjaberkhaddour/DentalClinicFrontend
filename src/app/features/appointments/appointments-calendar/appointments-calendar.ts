import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarModule } from '@fullcalendar/angular';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ClinicService } from '../../../core/services/clinic.service';
import { PatientService } from '../../../core/services/patient.service';
import { AppointmentListItem } from '../../../core/models/patient.model';

@Component({
  selector: 'app-appointments-calendar',
  standalone: true,
  imports: [
    CommonModule, FormsModule, FullCalendarModule,
    ButtonModule, SelectModule, DialogModule, InputTextModule, InputNumberModule
  ],
  templateUrl: './appointments-calendar.html',
  styleUrl: './appointments-calendar.scss'
})
export class AppointmentsCalendar implements OnInit {
  private appointmentService = inject(AppointmentService);
  private clinicService = inject(ClinicService);
  private patientService = inject(PatientService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  loading = signal(true);
  clinics = signal<{ label: string; value: string | null }[]>([]);
  selectedClinic = signal<string | null>(null);

  dayAddDialog = signal(false);
  dayAddDate = signal<Date | null>(null);
  dayAddSaving = signal(false);

  patientSearch = signal('');
  patientResults = signal<any[]>([]);
  patientSearching = signal(false);
  selectedPatient = signal<any | null>(null);

  apptForm = {
    time: '09:00',
    durationMinutes: 30,
    clinicId: '',
    reason: '',
    notes: ''
  };

  clinicOptionsForForm = computed(() =>
    this.clinics().filter(c => c.value !== null)
  );

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    locale: 'ar',
    direction: 'rtl',
    firstDay: 6,
    height: 'auto',
    events: [],
    eventClick: (info) => this.onEventClick(info),
    eventTimeFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
    dayMaxEvents: 3,
    eventDisplay: 'block',
    buttonText: {
      today: 'اليوم',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم'
    },
    dayCellDidMount: (info) => this.onDayCellMount(info)
  };

  ngOnInit(): void {
    this.loadClinics();
    this.loadAppointments();
  }

  loadClinics(): void {
    this.clinicService.getAll().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const options: { label: string; value: string | null }[] =
            [{ label: 'كل العيادات', value: null }];
          res.value.forEach((c: any) => options.push({ label: c.name, value: c.id }));
          this.clinics.set(options);
        }
      }
    });
  }

  onClinicChange(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading.set(true);
    const params: any = { page: 1, pageSize: 500 };
    if (this.selectedClinic()) params.clinicId = this.selectedClinic();

    this.appointmentService.getAll(params).subscribe({
      next: (res) => {
        if (res.isSuccess) {
          const events = this.mapToEvents(res.value.items);
          this.calendarOptions = {
            ...this.calendarOptions,
            events: events
          };
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل المواعيد.' });
      }
    });
  }

  mapToEvents(appointments: AppointmentListItem[]): EventInput[] {
    return appointments.map(a => ({
      id: a.id,
      title: a.patientName,
      start: a.scheduledAt,
      end: new Date(new Date(a.scheduledAt).getTime() + a.durationMinutes * 60000).toISOString(),
      backgroundColor: this.getStatusColor(a.status),
      borderColor: this.getStatusColor(a.status),
      textColor: '#ffffff',
      extendedProps: {
        patientId: a.patientId,
        status: a.status,
        reason: a.reason,
        clinicName: a.clinicName,
        doctorName: a.doctorName
      }
    }));
  }

  getStatusColor(status: number): string {
    switch (status) {
      case 1: return '#64748b';
      case 2: return '#10b981';
      case 3: return '#f59e0b';
      case 4: return '#3b82f6';
      case 5: return '#ef4444';
      case 6: return '#ef4444';
      case 7: return '#8b5cf6';
      default: return '#64748b';
    }
  }

  onEventClick(info: any): void {
    const patientId = info.event.extendedProps.patientId;
    const appointmentId = info.event.id;
    this.router.navigate(['/patients', patientId, 'appointments', appointmentId]);
  }

  onDayCellMount(info: any): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cellDate = new Date(info.date);
    cellDate.setHours(0, 0, 0, 0);
  
    if (cellDate < today) return;
  
    const cell = info.el as HTMLElement;
    cell.classList.add('fc-day-with-add');
  
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'day-add-btn';
    addBtn.innerHTML = '<i class="pi pi-plus"></i>';
    addBtn.title = 'إضافة موعد';
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onDayAdd(info.date);
    });
  
    cell.appendChild(addBtn);
  }

  onDayAdd(date: Date): void {
    this.dayAddDate.set(date);
    this.selectedPatient.set(null);
    this.patientSearch.set('');
    this.patientResults.set([]);

    const defaultClinic = this.selectedClinic()
      ?? this.clinicOptionsForForm()[0]?.value
      ?? '';

    this.apptForm = {
      time: '09:00',
      durationMinutes: 30,
      clinicId: defaultClinic,
      reason: '',
      notes: ''
    };
    this.dayAddDialog.set(true);
  }

  searchPatients(): void {
    const q = this.patientSearch().trim();
    if (q.length < 2) {
      this.patientResults.set([]);
      return;
    }

    this.patientSearching.set(true);
    this.patientService.getAll({ search: q, page: 1, pageSize: 10 }).subscribe({
      next: (res) => {
        this.patientResults.set(res.value.items);
        this.patientSearching.set(false);
      },
      error: () => this.patientSearching.set(false)
    });
  }

  selectPatient(p: any): void {
    this.selectedPatient.set(p);
    this.patientResults.set([]);
    this.patientSearch.set(`${p.firstName} ${p.lastName}`);
  }

  saveDayAppointment(): void {
    const date = this.dayAddDate();
    const patient = this.selectedPatient();

    if (!date || !patient) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر المريض.' });
      return;
    }
    if (!this.apptForm.clinicId) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'اختر العيادة.' });
      return;
    }

    const [hours, minutes] = this.apptForm.time.split(':').map(Number);
    const scheduledAt = new Date(date);
    scheduledAt.setHours(hours, minutes, 0, 0);

    const userId = this.getCurrentUserId();
    if (!userId) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحديد المستخدم.' });
      return;
    }

    this.dayAddSaving.set(true);
    this.appointmentService.create({
      patientId: patient.id,
      clinicId: this.apptForm.clinicId,
      doctorId: userId,
      scheduledAt: scheduledAt.toISOString(),
      durationMinutes: this.apptForm.durationMinutes,
      reason: this.apptForm.reason,
      notes: this.apptForm.notes
    }).subscribe({
      next: (res) => {
        this.dayAddSaving.set(false);
        if (res.isSuccess) {
          this.messageService.add({ severity: 'success', summary: 'تم', detail: 'تم إنشاء الموعد.' });
          this.dayAddDialog.set(false);
          this.loadAppointments();
        }
      },
      error: (err) => {
        this.dayAddSaving.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: err?.error?.error?.message ?? 'تعذّر إنشاء الموعد.'
        });
      }
    });
  }

  getCurrentUserId(): string {
    const token = localStorage.getItem('dc_access_token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? '';
    } catch {
      return '';
    }
  }
}