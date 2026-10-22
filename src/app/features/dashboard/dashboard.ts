import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AppointmentService } from '../../core/services/appointment.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { PatientService } from '../../core/services/patient.service';
import { InventoryItemService } from '../../core/services/inventory-item.service';
import { ClinicContextService } from '../../core/services/clinic-context.service';
import { PermissionCheckService } from '../../core/services/permission-check.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, SkeletonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private appointmentService = inject(AppointmentService);
  private invoiceService = inject(InvoiceService);
  private patientService = inject(PatientService);
  private inventoryItemService = inject(InventoryItemService);
  private permissionCheck = inject(PermissionCheckService);
  private messageService = inject(MessageService);

  clinicContext = inject(ClinicContextService);

  loading = signal(true);

  todayAppointments = signal(0);
  totalPatients = signal(0);
  todayInvoices = signal(0);
  todayRevenue = signal(0);

  lowStockCount = signal(0);
  expiringBatchesCount = signal(0);
  unpaidInvoicesCount = signal(0);
  unpaidInvoicesTotal = signal(0);

  recentPatients = signal<any[]>([]);
  recentAppointments = signal<any[]>([]);

  canSeePatients = this.permissionCheck.has('patients.view');
  canSeeAppointments = this.permissionCheck.has('appointments.view');
  canSeeInvoices = this.permissionCheck.has('invoices.view');
  canSeeInventory = this.permissionCheck.has('inventory.view');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const clinicId = this.clinicContext.clinicId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const calls: any = {
      todayAppointments: this.canSeeAppointments
        ? this.appointmentService.getAll({
            clinicId, page: 1, pageSize: 100,
            dateFrom: today.toISOString(),
            dateTo: tomorrow.toISOString()
          }).pipe(catchError(() => of(null)))
        : of(null),

      todayInvoices: this.canSeeInvoices
        ? this.invoiceService.getAll({
            clinicId, page: 1, pageSize: 100,
            dateFrom: today.toISOString(),
            dateTo: tomorrow.toISOString()
          }).pipe(catchError(() => of(null)))
        : of(null),

      recentPatients: this.canSeePatients
        ? this.patientService.getAll({ page: 1, pageSize: 5 }).pipe(catchError(() => of(null)))
        : of(null),

      lowStock: this.canSeeInventory
        ? this.inventoryItemService.getAll({ clinicId, page: 1, pageSize: 1, lowStockOnly: true } as any).pipe(catchError(() => of(null)))
        : of(null),

      expiring: this.canSeeInventory
        ? this.inventoryItemService.getAll({ clinicId, page: 1, pageSize: 1, expiryFilter: 3 } as any).pipe(catchError(() => of(null)))
        : of(null),

      unpaidInvoices: this.canSeeInvoices
        ? this.invoiceService.getAll({
            clinicId, page: 1, pageSize: 100,
            statuses: [2, 3, 5]
          }).pipe(catchError(() => of(null)))
        : of(null)
    };

    forkJoin(calls).subscribe({
      next: (res: any) => {
        if (res.todayAppointments?.isSuccess) {
          this.todayAppointments.set(res.todayAppointments.value.totalCount);
          const items = res.todayAppointments.value.items ?? [];
          const now = new Date();
          const future = items
            .filter((a: any) => new Date(a.scheduledAt) >= now)
            .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
            .slice(0, 5);
          this.recentAppointments.set(future);
        }

        if (res.todayInvoices?.isSuccess) {
          const items = res.todayInvoices.value.items ?? [];
          this.todayInvoices.set(res.todayInvoices.value.totalCount);
          this.todayRevenue.set(items.reduce((s: number, i: any) => s + (i.paidAmount ?? 0), 0));
        }

        if (res.recentPatients?.isSuccess) {
          this.recentPatients.set(res.recentPatients.value.items ?? []);
          this.totalPatients.set(res.recentPatients.value.totalCount);
        }

        if (res.lowStock?.isSuccess) {
          this.lowStockCount.set(res.lowStock.value.totalCount);
        }

        if (res.expiring?.isSuccess) {
          this.expiringBatchesCount.set(res.expiring.value.totalCount);
        }

        if (res.unpaidInvoices?.isSuccess) {
          const items = res.unpaidInvoices.value.items ?? [];
          this.unpaidInvoicesCount.set(items.length);
          this.unpaidInvoicesTotal.set(items.reduce((s: number, i: any) => s + (i.remainingAmount ?? 0), 0));
        }

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل لوحة التحكم.' });
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء النور';
  }
}