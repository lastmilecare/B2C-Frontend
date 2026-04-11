import PatientListCopy        from "../pages/PatientList";
import PatientRegistrationCopy from "../pages/PatientForm";
import AppDashboard           from "../pages/Dashboard";
import OpdFormCopy            from "../pages/OpdForm";
import PrescriptionFormCopy   from "../pages/PrescriptionForm";
import PurchasedEntryCopy     from "../pages/PurchasedEntry";
import BillingCopy            from "../pages/Billing";
import CampBillingCopy        from "../pages/CampBilling";
import OpdBillingListCopy     from "../pages/OpdBillingList";
import PrescriptionListCopy   from "../pages/PrescriptionList";
import ExpiryItemsCopy        from "../pages/ExpiryItems";
import SalesRecordCopy        from "../pages/salesrecord";
import AttendancePage         from "../pages/AttendancePage";
import StaffForm              from "../pages/StaffForm";
import StaffList              from "../pages/StaffList";
import Permission             from "../pages/Permission";
import Roles                  from "../pages/Roles";
import TenantForm             from "../pages/TenantForm";
import TenantList             from "../pages/TenantList";
import Dashboard              from "../pages/AppDashboard";
import PatientRegistrationOhc from "../pages/PatientFormOhc";
import AppointmentVisit       from "../pages/AppointmentVisit";
import MedicalHistory         from "../pages/MedicalHistory";
import ClinicalExamination    from "../pages/ClinicalExamination";
import LaboratoryInvestigation from "../pages/LaboratoryInvestigation";
import RadiologyScreen        from "../pages/RadiologyScreen";
import DoctorAssessment       from "../pages/DoctorAssessment";
import FitnessCertificate     from "../pages/FitnessCertificate";

export const ROUTES = [
  {
    path:       "/",
    component:  AppDashboard,
    permission: null,           // everyone
    showInSidebar: false,       // already handled separately
  },
  {
    path:       "/dashboard",
    component:  AppDashboard,
    permission: null,
    label:      "Dashboard",
    icon:       "HomeIcon",
    showInSidebar: true,
  },
  {
    path:       "/ohcdashboard",
    component:  Dashboard,
    permission: null,
    showInSidebar: false,
  },
  {
    path:       "/tenants",
    component:  TenantForm,
    permission: "create:tenant",
    label:      "Add Tenant",
    icon:       "BuildingOfficeIcon",
    showInSidebar: true,
    group:      "Administration",
  },
  {
    path:       "/tenant-list",
    component:  TenantList,
    permission: "read:tenant",
    label:      "Tenant List",
    icon:       "BuildingOffice2Icon",
    showInSidebar: true,
    group:      "Administration",
  },
  {
    path:       "/roles",
    component:  Roles,
    permission: "read:role",
    label:      "Roles",
    icon:       "ShieldCheckIcon",
    showInSidebar: true,
    group:      "Administration",
  },
  {
    path:       "/permissions",
    component:  Permission,
    permission: "read:permission",
    label:      "Permissions",
    icon:       "KeyIcon",
    showInSidebar: true,
    group:      "Administration",
  },
  {
    path:       "/staff-form",
    component:  StaffForm,
    permission: "create:user",
    label:      "Add Staff",
    icon:       "UserPlusIcon",
    showInSidebar: true,
    group:      "Staff",
  },
  {
    path:       "/staff-list",
    component:  StaffList,
    permission: "read:user",
    label:      "Staff List",
    icon:       "UsersIcon",
    showInSidebar: true,
    group:      "Staff",
  },
  {
    path:       "/attendance",
    component:  AttendancePage,
    permission: "read:user",
    label:      "Attendance",
    icon:       "CalendarDaysIcon",
    showInSidebar: true,
    group:      "Staff",
  },
  {
    path:       "/patient-registration",
    component:  PatientRegistrationCopy,
    permission: "create:patient",
    label:      "Patient Registration",
    icon:       "UserPlusIcon",
    showInSidebar: true,
    group:      "Patient",
  },
  {
    path:       "/patient-registration/:id",
    component:  PatientRegistrationCopy,
    permission: "create:patient",
    showInSidebar: false,
  },
  {
    path:       "/patient-list",
    component:  PatientListCopy,
    permission: "read:patient",
    label:      "Patient List",
    icon:       "ClipboardDocumentListIcon",
    showInSidebar: true,
    group:      "Patient",
  },
  {
    path:       "/PatientRegistrationOhc",
    component:  PatientRegistrationOhc,
    permission: "create:patient",
    label:      "OHC Registration",
    icon:       "UserPlusIcon",
    showInSidebar: true,
    group:      "Patient",
  },
  {
    path:       "/opd-form",
    component:  OpdFormCopy,
    permission: "create:opd",
    label:      "OPD Form",
    icon:       "DocumentTextIcon",
    showInSidebar: true,
    group:      "OPD",
  },
  {
    path:       "/opd-form/:ID",
    component:  OpdFormCopy,
    permission: "create:opd",
    showInSidebar: false,
  },
  {
    path:       "/opd-list",
    component:  OpdBillingListCopy,
    permission: "read:opd",
    label:      "OPD List",
    icon:       "ClipboardDocumentListIcon",
    showInSidebar: true,
    group:      "OPD",
  },
  {
    path:       "/prescription-form",
    component:  PrescriptionFormCopy,
    permission: "create:prescription",
    label:      "Prescription",
    icon:       "DocumentPlusIcon",
    showInSidebar: true,
    group:      "Prescription",
  },
  {
    path:       "/prescription-form/:id",
    component:  PrescriptionFormCopy,
    permission: "create:prescription",
    showInSidebar: false,
  },
  {
    path:       "/prescription-list",
    component:  PrescriptionListCopy,
    permission: "read:prescription",
    label:      "Prescription List",
    icon:       "ClipboardDocumentListIcon",
    showInSidebar: true,
    group:      "Prescription",
  },
  {
    path:       "/billing",
    component:  BillingCopy,
    permission: "create:billing",
    label:      "Billing",
    icon:       "CreditCardIcon",
    showInSidebar: true,
    group:      "Billing",
  },
  {
    path:       "/billing/:id",
    component:  BillingCopy,
    permission: "create:billing",
    showInSidebar: false,
  },
  {
    path:       "/camp-billing",
    component:  CampBillingCopy,
    permission: "create:billing",
    label:      "Camp Billing",
    icon:       "BuildingStorefrontIcon",
    showInSidebar: true,
    group:      "Billing",
  },
  {
    path:       "/purchased-entry",
    component:  PurchasedEntryCopy,
    permission: "create:pharmacy",
    label:      "Purchase Entry",
    icon:       "ShoppingCartIcon",
    showInSidebar: true,
    group:      "Pharmacy",
  },
  {
    path:       "/purchased-entry/:id",
    component:  PurchasedEntryCopy,
    permission: "create:pharmacy",
    showInSidebar: false,
  },
  {
    path:       "/sales-record",
    component:  SalesRecordCopy,
    permission: "read:pharmacy",
    label:      "Sales Record",
    icon:       "ChartBarIcon",
    showInSidebar: true,
    group:      "Pharmacy",
  },
  {
    path:       "/expiry-items",
    component:  ExpiryItemsCopy,
    permission: "read:pharmacy",
    label:      "Expiry Items",
    icon:       "ExclamationTriangleIcon",
    showInSidebar: true,
    group:      "Pharmacy",
  },
  {
    path:       "/appointmentvisit",
    component:  AppointmentVisit,
    permission: "read:clinical",
    label:      "Appointment Visit",
    icon:       "CalendarIcon",
    showInSidebar: true,
    group:      "Clinical",
  },
  {
    path:       "/medicalhistory",
    component:  MedicalHistory,
    permission: "read:clinical",
    label:      "Medical History",
    icon:       "BookOpenIcon",
    showInSidebar: true,
    group:      "Clinical",
  },
  {
    path:       "/ClinicalExamination",
    component:  ClinicalExamination,
    permission: "read:clinical",
    label:      "Clinical Examination",
    icon:       "BeakerIcon",
    showInSidebar: true,
    group:      "Clinical",
  },
  {
    path:       "/LaboratoryInvestigation",
    component:  LaboratoryInvestigation,
    permission: "read:clinical",
    label:      "Lab Investigation",
    icon:       "MagnifyingGlassIcon",
    showInSidebar: true,
    group:      "Clinical",
  },
  {
    path:       "/RadiologyScreen",
    component:  RadiologyScreen,
    permission: "read:clinical",
    label:      "Radiology",
    icon:       "PhotoIcon",
    showInSidebar: true,
    group:      "Clinical",
  },
  {
    path:       "/DoctorAssessment",
    component:  DoctorAssessment,
    permission: "read:clinical",
    label:      "Doctor Assessment",
    icon:       "UserIcon",
    showInSidebar: true,
    group:      "Clinical",
  },
  {
    path:       "/FitnessCertificate",
    component:  FitnessCertificate,
    permission: "read:clinical",
    label:      "Fitness Certificate",
    icon:       "DocumentCheckIcon",
    showInSidebar: true,
    group:      "Clinical",
  },
];