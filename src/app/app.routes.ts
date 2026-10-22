import { Routes } from '@angular/router';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { clinicContextGuard } from './core/guards/clinic-context.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  {
    path: 'auth',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },

  {
    path: 'select-clinic',
    loadComponent: () => import('./features/clinics/select-clinic/select-clinic').then(m => m.SelectClinic),
    canActivate: [authGuard]
  },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard, clinicContextGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard) },

      { path: 'patients', loadComponent: () => import('./features/patients/patients-list/patients-list').then(m => m.PatientsList) },
      { path: 'patients/create', loadComponent: () => import('./features/patients/patient-create/patient-create').then(m => m.PatientCreate) },
      { path: 'patients/:id/edit', loadComponent: () => import('./features/patients/patient-edit/patient-edit').then(m => m.PatientEdit) },
      { path: 'patients/:id/treatment-cases/create', loadComponent: () => import('./features/patients/patient-detail/treatment-case-create/treatment-case-create').then(m => m.TreatmentCaseCreate) },
      { path: 'patients/:id/treatment-cases/:caseId', loadComponent: () => import('./features/patients/patient-detail/treatment-case-detail/treatment-case-detail').then(m => m.TreatmentCaseDetail) },
      { path: 'patients/:id/visits/create', loadComponent: () => import('./features/patients/patient-detail/visit-create/visit-create').then(m => m.VisitCreate) },
      { path: 'patients/:id/visits/:visitId', loadComponent: () => import('./features/patients/patient-detail/visit-detail/visit-detail').then(m => m.VisitDetail) },
      { path: 'patients/:id/invoices/create', loadComponent: () => import('./features/patients/patient-detail/invoice-create/invoice-create').then(m => m.InvoiceCreate) },
      { path: 'patients/:id/invoices/:invoiceId', loadComponent: () => import('./features/patients/patient-detail/invoice-detail/invoice-detail').then(m => m.InvoiceDetail) },
      { path: 'patients/:id/appointments/create', loadComponent: () => import('./features/patients/patient-detail/appointment-create/appointment-create').then(m => m.AppointmentCreate) },
      { path: 'patients/:id/appointments/:appointmentId', loadComponent: () => import('./features/patients/patient-detail/appointment-detail/appointment-detail').then(m => m.AppointmentDetail) },
      { path: 'patients/:id/lab-orders/create', loadComponent: () => import('./features/patients/patient-detail/lab-order-create/lab-order-create').then(m => m.LabOrderCreate) },
      { path: 'patients/:id/lab-orders/:labOrderId', loadComponent: () => import('./features/patients/patient-detail/lab-order-detail/lab-order-detail').then(m => m.LabOrderDetail) },
      { path: 'patients/:id', loadComponent: () => import('./features/patients/patient-detail/patient-detail').then(m => m.PatientDetail) },

      { path: 'appointments', loadComponent: () => import('./features/appointments/appointments-calendar/appointments-calendar').then(m => m.AppointmentsCalendar) },
      { path: 'invoices', loadComponent: () => import('./features/invoices/invoices-list/invoices-list').then(m => m.InvoicesList) },
      { path: 'lab-orders', loadComponent: () => import('./features/lab-orders/lab-orders-list/lab-orders-list').then(m => m.LabOrdersList) },

      { path: 'expenses', loadComponent: () => import('./features/expenses/expenses-list/expenses-list').then(m => m.ExpensesList) },
      
      { path: 'inventory', loadComponent: () => import('./features/inventory/inventory-items-list/inventory-items-list').then(m => m.InventoryItemsList) },
      { path: 'inventory/transactions', loadComponent: () => import('./features/inventory/inventory-transactions-list/inventory-transactions-list').then(m => m.InventoryTransactionsList) },
      
      { path: 'users/create', loadComponent: () => import('./features/users/user-create/user-create').then(m => m.UserCreate) },
      { path: 'users/:id', loadComponent: () => import('./features/users/user-detail/user-detail').then(m => m.UserDetail) },
      { path: 'users', loadComponent: () => import('./features/users/users-list/users-list').then(m => m.UsersList) },

      { path: 'roles/create', loadComponent: () => import('./features/roles/role-create/role-create').then(m => m.RoleCreate) },
      { path: 'roles/:id', loadComponent: () => import('./features/roles/role-detail/role-detail').then(m => m.RoleDetail) },
      { path: 'roles', loadComponent: () => import('./features/roles/roles-list/roles-list').then(m => m.RolesList) },

      { path: 'clinics/create', loadComponent: () => import('./features/clinics/clinic-create/clinic-create').then(m => m.ClinicCreate) },
      { path: 'clinics/:id', loadComponent: () => import('./features/clinics/clinic-detail/clinic-detail').then(m => m.ClinicDetail) },
      { path: 'clinics', loadComponent: () => import('./features/clinics/clinics-list/clinics-list').then(m => m.ClinicsList) },
      
      {
        path: 'dental-labs/create',
        loadComponent: () => import('./features/dental-labs/dental-lab-create/dental-lab-create').then(m => m.DentalLabCreate)
      },
      {
        path: 'dental-labs/:id',
        loadComponent: () => import('./features/dental-labs/dental-lab-detail/dental-lab-detail').then(m => m.DentalLabDetail)
      },
      {
        path: 'dental-labs',
        loadComponent: () => import('./features/dental-labs/dental-labs-list/dental-labs-list').then(m => m.DentalLabsList)
      },
      
      { path: 'suppliers', loadComponent: () => import('./features/suppliers/suppliers-list/suppliers-list').then(m => m.SuppliersList) },
      { path: 'suppliers/create', loadComponent: () => import('./features/suppliers/supplier-create/supplier-create').then(m => m.SupplierCreate) },
      { path: 'suppliers/:id', loadComponent: () => import('./features/suppliers/supplier-detail/supplier-detail').then(m => m.SupplierDetail) },
      
      { path: 'expense-categories', loadComponent: () => import('./features/expense-categories/expense-categories-list/expense-categories-list').then(m => m.ExpenseCategoriesList) },

      { path: 'treatments', loadComponent: () => import('./features/treatments/treatments-list/treatments-list').then(m => m.TreatmentsList) },

      { path: 'materials', loadComponent: () => import('./features/materials/materials-list/materials-list').then(m => m.MaterialsList) },

      { path: 'procedure-types', loadComponent: () => import('./features/procedure-types/procedure-types-list/procedure-types-list').then(m => m.ProcedureTypesList) },
      
      { path: 'lab-order-types', loadComponent: () => import('./features/lab-order-types/lab-order-types-list/lab-order-types-list').then(m => m.LabOrderTypesList) },

      { path: 'currencies', loadComponent: () => import('./features/currencies/currencies-list/currencies-list').then(m => m.CurrenciesList) },
      { path: 'inventory/categories', loadComponent: () => import('./features/inventory/inventory-categories-list/inventory-categories-list').then(m => m.InventoryCategoriesList) },
      { path: 'audit', loadComponent: () => import('./features/audit/audit-logs-list/audit-logs-list').then(m => m.AuditLogsList) },

      { path: 'profile', loadComponent: () => import('./features/profile/profile/profile').then(m => m.ProfileComponent) },

      { path: 'reports/administrative', loadComponent: () => import('./features/reports/reports-list/reports-list').then(m => m.ReportsList), data: { type: 'administrative' } },
      { path: 'reports/financial', loadComponent: () => import('./features/reports/reports-list/reports-list').then(m => m.ReportsList), data: { type: 'financial' } },
      { path: 'reports/treatment-plan', loadComponent: () => import('./features/reports/treatment-plan-report/treatment-plan-report').then(m => m.TreatmentPlanReportComponent) },
      { path: 'reports/financial-follow-up', loadComponent: () => import('./features/reports/financial-follow-up/financial-follow-up').then(m => m.FinancialFollowUpComponent) },
    ]
  },

  { path: '**', redirectTo: '/dashboard' }
];