// ============================================================
// Enums — must match Backend 100%
// ============================================================

// ============ Contact ============

export enum ContactOwnerType {
    Person = 1,
    Clinic = 2,
    DentalLab = 3,
    Supplier = 4
  }
  
  export enum ContactType {
    Mobile = 1,
    Landline = 2,
    WhatsApp = 3,
    Email = 4,
    Fax = 5,
    Website = 6,
    Facebook = 7,
    Instagram = 8,
    Telegram = 9,
    Other = 99
  }
  
  export const ContactOwnerTypeLabels: Record<number, string> = {
    [ContactOwnerType.Person]: 'شخص',
    [ContactOwnerType.Clinic]: 'عيادة',
    [ContactOwnerType.DentalLab]: 'مخبر',
    [ContactOwnerType.Supplier]: 'مورّد'
  };
  
  export const ContactTypeLabels: Record<number, string> = {
    [ContactType.Mobile]: 'موبايل',
    [ContactType.Landline]: 'هاتف أرضي',
    [ContactType.WhatsApp]: 'واتساب',
    [ContactType.Email]: 'بريد إلكتروني',
    [ContactType.Fax]: 'فاكس',
    [ContactType.Website]: 'موقع إلكتروني',
    [ContactType.Facebook]: 'فيسبوك',
    [ContactType.Instagram]: 'إنستغرام',
    [ContactType.Telegram]: 'تلغرام',
    [ContactType.Other]: 'أخرى'
  };
  
  export const ContactTypeOptions = Object.entries(ContactTypeLabels)
    .filter(([k]) => !isNaN(Number(k)))
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  export const ContactOwnerTypeOptions = Object.entries(ContactOwnerTypeLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  // ============ Person ============
  
  export enum Gender {
    Male = 1,
    Female = 2
  }
  
  export const GenderLabels: Record<number, string> = {
    [Gender.Male]: 'ذكر',
    [Gender.Female]: 'أنثى'
  };
  
  export const GenderOptions = Object.entries(GenderLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  export enum BloodType {
    A_Positive = 1,
    A_Negative = 2,
    B_Positive = 3,
    B_Negative = 4,
    AB_Positive = 5,
    AB_Negative = 6,
    O_Positive = 7,
    O_Negative = 8,
    Unknown = 99
  }
  
  export const BloodTypeLabels: Record<number, string> = {
    [BloodType.A_Positive]: 'A+',
    [BloodType.A_Negative]: 'A-',
    [BloodType.B_Positive]: 'B+',
    [BloodType.B_Negative]: 'B-',
    [BloodType.AB_Positive]: 'AB+',
    [BloodType.AB_Negative]: 'AB-',
    [BloodType.O_Positive]: 'O+',
    [BloodType.O_Negative]: 'O-',
    [BloodType.Unknown]: 'غير معروف'
  };
  
  export const BloodTypeOptions = Object.entries(BloodTypeLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  export enum GuardianRelationship {
    Father = 1,
    Mother = 2,
    Son = 3,
    Daughter = 4,
    Spouse = 5,
    Brother = 6,
    Sister = 7,
    Grandfather = 8,
    Grandmother = 9,
    Uncle = 10,
    Aunt = 11,
    LegalGuardian = 12,
    Caregiver = 13,
    Other = 99
  }
  
  export const GuardianRelationshipLabels: Record<number, string> = {
    [GuardianRelationship.Father]: 'الأب',
    [GuardianRelationship.Mother]: 'الأم',
    [GuardianRelationship.Son]: 'الابن',
    [GuardianRelationship.Daughter]: 'الابنة',
    [GuardianRelationship.Spouse]: 'الزوج/الزوجة',
    [GuardianRelationship.Brother]: 'الأخ',
    [GuardianRelationship.Sister]: 'الأخت',
    [GuardianRelationship.Grandfather]: 'الجد',
    [GuardianRelationship.Grandmother]: 'الجدة',
    [GuardianRelationship.Uncle]: 'العم/الخال',
    [GuardianRelationship.Aunt]: 'العمة/الخالة',
    [GuardianRelationship.LegalGuardian]: 'ولي أمر قانوني',
    [GuardianRelationship.Caregiver]: 'مرافق',
    [GuardianRelationship.Other]: 'أخرى'
  };
  
  export const GuardianRelationshipOptions = Object.entries(GuardianRelationshipLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  // ============ Tooth ============
  
  export enum ToothStatus {
    Present = 1,
    Missing = 2,
    Extracted = 3,
    Impacted = 4,
    Unerupted = 5,
    Crown = 6,
    Bridge = 7,
    Implant = 8,
    Primary = 9
  }
  
  export const ToothStatusLabels: Record<number, string> = {
    [ToothStatus.Present]: 'سليم',
    [ToothStatus.Missing]: 'مفقود',
    [ToothStatus.Extracted]: 'مخلوع',
    [ToothStatus.Impacted]: 'مدفون',
    [ToothStatus.Unerupted]: 'غير بازغ',
    [ToothStatus.Crown]: 'تاج',
    [ToothStatus.Bridge]: 'جسر',
    [ToothStatus.Implant]: 'زرع',
    [ToothStatus.Primary]: 'لبني'
  };
  
  export const ToothStatusOptions = Object.entries(ToothStatusLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  export enum ToothMobility {
    None = 0,
    Grade1 = 1,
    Grade2 = 2,
    Grade3 = 3
  }
  
  export const ToothMobilityLabels: Record<number, string> = {
    [ToothMobility.None]: 'ثابت',
    [ToothMobility.Grade1]: 'حركة 1',
    [ToothMobility.Grade2]: 'حركة 2',
    [ToothMobility.Grade3]: 'حركة 3'
  };
  
  export const ToothMobilityOptions = Object.entries(ToothMobilityLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  export enum ProcedureContext {
    ClinicalVisit = 1,
    QuickProcedure = 2,
    Emergency = 3,
    FollowUp = 4
  }
  
  export const ProcedureContextLabels: Record<number, string> = {
    [ProcedureContext.ClinicalVisit]: 'زيارة سريرية',
    [ProcedureContext.QuickProcedure]: 'إجراء سريع',
    [ProcedureContext.Emergency]: 'طارئ',
    [ProcedureContext.FollowUp]: 'متابعة'
  };
  
  export const ProcedureContextOptions = Object.entries(ProcedureContextLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  // ============ Appointment ============
  
  export enum AppointmentStatus {
    Scheduled = 1,
    Confirmed = 2,
    InProgress = 3,
    Completed = 4,
    Cancelled = 5,
    NoShow = 6,
    Rescheduled = 7
  }
  
  export const AppointmentStatusLabels: Record<number, string> = {
    [AppointmentStatus.Scheduled]: 'مجدول',
    [AppointmentStatus.Confirmed]: 'مؤكد',
    [AppointmentStatus.InProgress]: 'قيد التنفيذ',
    [AppointmentStatus.Completed]: 'مكتمل',
    [AppointmentStatus.Cancelled]: 'ملغى',
    [AppointmentStatus.NoShow]: 'لم يحضر',
    [AppointmentStatus.Rescheduled]: 'أُعيدت جدولته'
  };
  
  export const AppointmentStatusOptions = Object.entries(AppointmentStatusLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  // ============ Reminder ============
  
  export enum ReminderType {
    AppointmentReminder = 1,
    FollowUp = 2,
    Recall = 3,
    PostOp = 4,
    PaymentDue = 5,
    Other = 99
  }
  
  export const ReminderTypeLabels: Record<number, string> = {
    [ReminderType.AppointmentReminder]: 'تذكير موعد',
    [ReminderType.FollowUp]: 'متابعة',
    [ReminderType.Recall]: 'استدعاء دوري',
    [ReminderType.PostOp]: 'بعد العملية',
    [ReminderType.PaymentDue]: 'دفعة مستحقة',
    [ReminderType.Other]: 'أخرى'
  };
  
  export const ReminderTypeOptions = Object.entries(ReminderTypeLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  export enum ReminderChannel {
    InApp = 1,
    Email = 2,
    Sms = 3,
    WhatsApp = 4
  }
  
  export const ReminderChannelLabels: Record<number, string> = {
    [ReminderChannel.InApp]: 'داخل التطبيق',
    [ReminderChannel.Email]: 'بريد إلكتروني',
    [ReminderChannel.Sms]: 'رسالة SMS',
    [ReminderChannel.WhatsApp]: 'واتساب'
  };
  
  export const ReminderChannelOptions = Object.entries(ReminderChannelLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  export enum ReminderStatus {
    Pending = 1,
    Sent = 2,
    Failed = 3,
    Cancelled = 4
  }
  
  export const ReminderStatusLabels: Record<number, string> = {
    [ReminderStatus.Pending]: 'قيد الانتظار',
    [ReminderStatus.Sent]: 'أُرسل',
    [ReminderStatus.Failed]: 'فشل',
    [ReminderStatus.Cancelled]: 'ملغى'
  };
  
  
  // ============ Invoice ============
  
  export enum InvoiceStatus {
    Draft = 1,
    Issued = 2,
    PartiallyPaid = 3,
    Paid = 4,
    Overdue = 5,
    Cancelled = 6
  }
  
  export const InvoiceStatusLabels: Record<number, string> = {
    [InvoiceStatus.Draft]: 'مسودة',
    [InvoiceStatus.Issued]: 'صادرة',
    [InvoiceStatus.PartiallyPaid]: 'مدفوعة جزئياً',
    [InvoiceStatus.Paid]: 'مدفوعة',
    [InvoiceStatus.Overdue]: 'متأخرة',
    [InvoiceStatus.Cancelled]: 'ملغاة'
  };
  
  export const InvoiceStatusOptions = Object.entries(InvoiceStatusLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  // ============ Payment ============
  
  export enum PaymentMethod {
    Cash = 1,
    Card = 2,
    BankTransfer = 3,
    Check = 4,
    Other = 99
  }
  
  export const PaymentMethodLabels: Record<number, string> = {
    [PaymentMethod.Cash]: 'نقدي',
    [PaymentMethod.Card]: 'بطاقة',
    [PaymentMethod.BankTransfer]: 'تحويل بنكي',
    [PaymentMethod.Check]: 'شيك',
    [PaymentMethod.Other]: 'أخرى'
  };
  
  export const PaymentMethodOptions = Object.entries(PaymentMethodLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  // ============ Lab Order ============
  
  export enum LabOrderStatus {
    Draft = 1,
    Sent = 2,
    InProgress = 3,
    Received = 4,
    Fitted = 5,
    Cancelled = 6,
    Remake = 7
  }
  
  export const LabOrderStatusLabels: Record<number, string> = {
    [LabOrderStatus.Draft]: 'مسودة',
    [LabOrderStatus.Sent]: 'مُرسل',
    [LabOrderStatus.InProgress]: 'قيد التنفيذ',
    [LabOrderStatus.Received]: 'مُستلم',
    [LabOrderStatus.Fitted]: 'مُركَّب',
    [LabOrderStatus.Cancelled]: 'ملغى',
    [LabOrderStatus.Remake]: 'إعادة تصنيع'
  };
  
  export const LabOrderStatusOptions = Object.entries(LabOrderStatusLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  export enum LabPaymentMethod {
    Cash = 1,
    Card = 2,
    BankTransfer = 3,
    Check = 4,
    Other = 99
  }
  
  export const LabPaymentMethodLabels: Record<number, string> = {
    [LabPaymentMethod.Cash]: 'نقدي',
    [LabPaymentMethod.Card]: 'بطاقة',
    [LabPaymentMethod.BankTransfer]: 'تحويل بنكي',
    [LabPaymentMethod.Check]: 'شيك',
    [LabPaymentMethod.Other]: 'أخرى'
  };
  
  export const LabPaymentMethodOptions = Object.entries(LabPaymentMethodLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));
  
  
  // ============ Inventory ============
  
  export enum InventoryTransactionType {
    Purchase = 1,
    Usage = 2,
    Adjustment = 3,
    Damage = 4,
    Return = 5,
    Transfer = 6,
    InitialStock = 7
  }
  
  export const InventoryTransactionTypeLabels: Record<number, string> = {
    [InventoryTransactionType.Purchase]: 'شراء',
    [InventoryTransactionType.Usage]: 'استهلاك',
    [InventoryTransactionType.Adjustment]: 'تسوية جرد',
    [InventoryTransactionType.Damage]: 'تالف',
    [InventoryTransactionType.Return]: 'إرجاع',
    [InventoryTransactionType.Transfer]: 'تحويل',
    [InventoryTransactionType.InitialStock]: 'رصيد افتتاحي'
  };
  
  export const InventoryTransactionTypeOptions = Object.entries(InventoryTransactionTypeLabels)
    .map(([k, v]) => ({ label: v, value: Number(k) }));

    export enum TreatmentCaseStatus {
      Active = 1,
      Completed = 2,
      Cancelled = 3,
      OnHold = 4
    }
    
    export const TreatmentCaseStatusLabels: Record<number, string> = {
      [TreatmentCaseStatus.Active]: 'نشطة',
      [TreatmentCaseStatus.Completed]: 'مكتملة',
      [TreatmentCaseStatus.Cancelled]: 'ملغاة',
      [TreatmentCaseStatus.OnHold]: 'معلّقة'
    };
    
    export const TreatmentCaseStatusOptions = Object.entries(TreatmentCaseStatusLabels)
      .map(([k, v]) => ({ label: v, value: Number(k) }));

      // ============ Inventory Unit ============

export enum InventoryUnit {
  Piece = 1,
  Box = 2,
  Pack = 3,
  Bottle = 4,
  Tube = 5,
  Ampoule = 6,
  Vial = 7,
  Syringe = 8,
  Milliliter = 9,
  Liter = 10,
  Gram = 11,
  Kilogram = 12,
  Roll = 13,
  Pair = 14,
  Set = 15,
  Other = 99
}

export const InventoryUnitLabels: Record<number, string> = {
  [InventoryUnit.Piece]: 'قطعة',
  [InventoryUnit.Box]: 'علبة',
  [InventoryUnit.Pack]: 'عبوة',
  [InventoryUnit.Bottle]: 'قنينة',
  [InventoryUnit.Tube]: 'أنبوب',
  [InventoryUnit.Ampoule]: 'أمبولة',
  [InventoryUnit.Vial]: 'فيال',
  [InventoryUnit.Syringe]: 'محقنة',
  [InventoryUnit.Milliliter]: 'مليلتر',
  [InventoryUnit.Liter]: 'لتر',
  [InventoryUnit.Gram]: 'غرام',
  [InventoryUnit.Kilogram]: 'كيلوغرام',
  [InventoryUnit.Roll]: 'لفة',
  [InventoryUnit.Pair]: 'زوج',
  [InventoryUnit.Set]: 'طقم',
  [InventoryUnit.Other]: 'أخرى'
};

export const InventoryUnitOptions = Object.entries(InventoryUnitLabels)
  .map(([k, v]) => ({ label: v, value: Number(k) }));


  // ============ Expiry Filter ============

  export enum ExpiryFilter {
    All = 0,
    HasExpiry = 1,
    Expired = 2,
    Within30 = 3,
    Within60 = 4,
    Within90 = 5,
    Within10 = 6,
    Within1 = 7
  }

export const ExpiryFilterOptions = [
  { label: '90 يوم', value: ExpiryFilter.Within90 },
  { label: '60 يوم', value: ExpiryFilter.Within60 },
  { label: '30 يوم', value: ExpiryFilter.Within30 },
  { label: '10 أيام', value: ExpiryFilter.Within10 },
  { label: 'يوم', value: ExpiryFilter.Within1 },
  { label: 'منتهية', value: ExpiryFilter.Expired }
];