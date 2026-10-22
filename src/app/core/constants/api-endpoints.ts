export const API_ENDPOINTS = {
    auth: {
      login: '/api/v1/Auth/login',
      refresh: '/api/v1/Auth/refresh',
      logout: '/api/v1/Auth/logout',
    },
    profile: {
      get: '/api/v1/Profile',
      update: '/api/v1/Profile',
      changePassword: '/api/v1/Profile/change-password',
      updatePhoto: '/api/v1/Profile/photo',
      deletePhoto: '/api/v1/Profile/photo',
    },
    users: {
      base: '/api/v1/Users',
      byId: (id: string) => `/api/v1/Users/${id}`,
      roles: (id: string) => `/api/v1/Users/${id}/roles`,
      permissions: (id: string) => `/api/v1/Users/${id}/permissions`,
      changePassword: (id: string) => `/api/v1/Users/${id}/change-password`,
      resetPassword: (id: string) => `/api/v1/Users/${id}/reset-password`,
      lock: (id: string) => `/api/v1/Users/${id}/lock`,
      unlock: (id: string) => `/api/v1/Users/${id}/unlock`,
      photo: (id: string) => `/api/v1/Users/${id}/photo`,
      clinics: (id: string) => `/api/v1/Users/${id}/clinics`,
    },
    patients: {
      base: '/api/v1/Patients',
      byId: (id: string) => `/api/v1/Patients/${id}`,
      medicalHistory: (id: string) => `/api/v1/Patients/${id}/medical-history`,
      guardians: (id: string) => `/api/v1/Patients/${id}/guardians`,
      guardian: (patientId: string, guardianId: string) => `/api/v1/Patients/${patientId}/guardians/${guardianId}`,
      photo: (id: string) => `/api/v1/Patients/${id}/photo`,
    },
    clinics: {
      base: '/api/v1/Clinics',
      byId: (id: string) => `/api/v1/Clinics/${id}`,
      users: (id: string) => `/api/v1/Clinics/${id}/users`,
    },
    contacts: {
      base: '/api/v1/Contacts',
      byOwner: '/api/v1/Contacts/by-owner',
      byId: (id: string) => `/api/v1/Contacts/${id}`,
      setPrimary: (id: string) => `/api/v1/Contacts/${id}/set-primary`,
    },
    toothChart: {
      chart: (patientId: string) => `/api/v1/ToothChart/patient/${patientId}`,
      tooth: (id: string) => `/api/v1/ToothChart/tooth/${id}`,
      toothHistory: (id: string) => `/api/v1/ToothChart/tooth/${id}/history`,
      patientHistory: (patientId: string) => `/api/v1/ToothChart/patient/${patientId}/history`,
      history: '/api/v1/ToothChart/history',
      bulkHistory: '/api/v1/ToothChart/history/bulk',
      deleteHistory: (id: string) => `/api/v1/ToothChart/history/${id}`,
    },
    procedureTypes: {
      base: '/api/v1/ProcedureTypes',
      byId: (id: string) => `/api/v1/ProcedureTypes/${id}`,
    },
    visits: {
      base: '/api/v1/Visits',
      byId: (id: string) => `/api/v1/Visits/${id}`,
      teeth: (id: string) => `/api/v1/Visits/${id}/teeth`,
      tooth: (visitId: string, toothId: string) => `/api/v1/Visits/${visitId}/teeth/${toothId}`,
    },
    appointments: {
      base: '/api/v1/Appointments',
      byId: (id: string) => `/api/v1/Appointments/${id}`,
      status: (id: string) => `/api/v1/Appointments/${id}/status`,
    },
    reminders: {
      base: '/api/v1/Reminders',
      byId: (id: string) => `/api/v1/Reminders/${id}`,
      markSent: (id: string) => `/api/v1/Reminders/${id}/mark-sent`,
      cancel: (id: string) => `/api/v1/Reminders/${id}/cancel`,
    },
    treatments: {
      base: '/api/v1/Treatments',
      byId: (id: string) => `/api/v1/Treatments/${id}`,
    },
    radiology: {
      base: '/api/v1/Radiology',
      byId: (id: string) => `/api/v1/Radiology/${id}`,
      upload: '/api/v1/Radiology/upload',
      types: '/api/v1/Radiology/types',
    },
    currencies: {
      base: '/api/v1/Currencies',
      byId: (id: string) => `/api/v1/Currencies/${id}`,
    },
    exchangeRates: {
      base: '/api/v1/ExchangeRates',
      byId: (id: string) => `/api/v1/ExchangeRates/${id}`,
      current: '/api/v1/ExchangeRates/current',
    },
    inventoryItems: {
      base: '/api/v1/InventoryItems',
      byId: (id: string) => `/api/v1/InventoryItems/${id}`,
    },
    inventoryTransactions: {
      base: '/api/v1/InventoryTransactions',
      byId: (id: string) => `/api/v1/InventoryTransactions/${id}`,
    },
    suppliers: {
      base: '/api/v1/Suppliers',
      byId: (id: string) => `/api/v1/Suppliers/${id}`,
    },
    expenseCategories: {
      base: '/api/v1/ExpenseCategories',
      byId: (id: string) => `/api/v1/ExpenseCategories/${id}`,
    },
    expenses: {
      base: '/api/v1/Expenses',
      byId: (id: string) => `/api/v1/Expenses/${id}`,
    },
    invoices: {
      base: '/api/v1/Invoices',
      byId: (id: string) => `/api/v1/Invoices/${id}`,
      issue: (id: string) => `/api/v1/Invoices/${id}/issue`,
      cancel: (id: string) => `/api/v1/Invoices/${id}/cancel`,
    },
    payments: {
      byInvoice: (invoiceId: string) => `/api/v1/Payments/invoice/${invoiceId}`,
      byId: (id: string) => `/api/v1/Payments/${id}`,
      create: (invoiceId: string) => `/api/v1/Payments/invoice/${invoiceId}`,
    },
    dentalLabs: {
      base: '/api/v1/DentalLabs',
      byId: (id: string) => `/api/v1/DentalLabs/${id}`,
    },
    labOrderTypes: {
      base: '/api/v1/LabOrderTypes',
      byId: (id: string) => `/api/v1/LabOrderTypes/${id}`,
    },
    labOrders: {
      base: '/api/v1/LabOrders',
      byId: (id: string) => `/api/v1/LabOrders/${id}`,
      status: (id: string) => `/api/v1/LabOrders/${id}/status`,
      payments: (id: string) => `/api/v1/LabOrders/${id}/payments`,
      deletePayment: (id: string) => `/api/v1/LabOrders/payments/${id}`,
    },
    permissions: {
      base: '/api/v1/Permissions',
    },
    roles: {
      base: '/api/v1/Roles',
      byId: (id: string) => `/api/v1/Roles/${id}`,
      permissions: (id: string) => `/api/v1/Roles/${id}/permissions`,
    },
    materials: {
      base: '/api/v1/Materials',
      byId: (id: string) => `/api/v1/Materials/${id}`,
    },

    treatmentCases: {
      base: '/api/v1/TreatmentCases',
      byId: (id: string) => `/api/v1/TreatmentCases/${id}`,
      status: (id: string) => `/api/v1/TreatmentCases/${id}/status`,
    },
    diagnosisTypes: {
      base: '/api/v1/DiagnosisTypes',
      byId: (id: string) => `/api/v1/DiagnosisTypes/${id}`,
    },

  };