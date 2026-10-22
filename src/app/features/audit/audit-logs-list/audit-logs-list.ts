import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService } from 'primeng/api';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { AuditLog, AuditLogFilter } from '../../../core/models/audit-log.model';

@Component({
  selector: 'app-audit-logs-list',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, InputTextModule, SelectModule,
    DatePickerModule, SkeletonModule, DialogModule, TooltipModule, PaginatorModule
  ],
  templateUrl: './audit-logs-list.html',
  styleUrl: './audit-logs-list.scss'
})
export class AuditLogsList implements OnInit {
  private service = inject(AuditLogService);
  private messageService = inject(MessageService);

  loading = signal(true);
  logs = signal<AuditLog[]>([]);
  totalRecords = signal(0);

  actionOptions = signal<{ label: string; value: string }[]>([]);
  entityOptions = signal<{ label: string; value: string }[]>([]);

  successOptions = [
    { label: 'الكل', value: null },
    { label: 'ناجحة', value: true },
    { label: 'فاشلة', value: false }
  ];

  filter: AuditLogFilter = {
    page: 1,
    pageSize: 20,
    search: '',
    action: undefined,
    entityName: undefined,
    success: undefined,
    fromDate: undefined,
    toDate: undefined
  };

  detailDialog = signal(false);
  selectedLog = signal<AuditLog | null>(null);

  ngOnInit(): void {
    this.loadOptions();
    this.load();
  }

  loadOptions(): void {
    this.service.getActions().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.actionOptions.set(res.value.map(a => ({ label: a, value: a })));
        }
      }
    });
    this.service.getEntities().subscribe({
      next: (res) => {
        if (res.isSuccess) {
          this.entityOptions.set(res.value.map(e => ({ label: e, value: e })));
        }
      }
    });
  }

  load(): void {
    this.loading.set(true);
    this.service.getAll(this.filter).subscribe({
      next: (res) => {
        this.logs.set(res.value.items);
        this.totalRecords.set(res.value.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'تعذّر تحميل السجل.' });
      }
    });
  }

  onSearch(): void {
    this.filter.page = 1;
    this.load();
  }

  onPageChange(event: any): void {
    this.filter.page = event.page + 1;
    this.filter.pageSize = event.rows;
    this.load();
  }

  resetFilters(): void {
    this.filter = {
      page: 1,
      pageSize: 20,
      search: '',
      action: undefined,
      entityName: undefined,
      success: undefined,
      fromDate: undefined,
      toDate: undefined
    };
    this.load();
  }

  viewDetails(log: AuditLog): void {
    this.selectedLog.set(log);
    this.detailDialog.set(true);
  }

  formatJson(value?: string): string {
    if (!value) return '—';
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  getActionSeverity(action: string): string {
    switch (action) {
      case 'Create': return 'success';
      case 'Update': return 'info';
      case 'Delete': return 'danger';
      case 'Login': return 'success';
      case 'LoginFailed': return 'danger';
      case 'Logout': return 'secondary';
      default: return 'secondary';
    }
  }
}