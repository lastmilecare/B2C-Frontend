// src/config/routes.config.js
import AppDashboard from "../pages/Dashboard";
import OHCDashboard from "../pages/AppDashboard";
import PatientListCopy from "../pages/PatientList";
import PatientRegistrationCopy from "../pages/PatientForm";
import OpdFormCopy from "../pages/OpdForm";
import PrescriptionFormCopy from "../pages/PrescriptionForm";
import PurchasedEntryCopy from "../pages/PurchasedEntry";
import BillingCopy from "../pages/Billing";
import CampBillingCopy from "../pages/CampBilling";
import OpdBillingListCopy from "../pages/OpdBillingList";
import PrescriptionListCopy from "../pages/PrescriptionList";
import ExpiryItemsCopy from "../pages/ExpiryItems";
import SalesRecordCopy from "../pages/salesrecord";
import AttendancePage from "../pages/AttendancePage";
import StaffForm from "../pages/StaffForm";
import StaffList from "../pages/StaffList";
import Permission from "../pages/Permission";
import Roles from "../pages/Roles";
import TenantForm from "../pages/TenantForm";
import TenantList from "../pages/TenantList";
// import PatientRegistrationOhc from "../pages/PatientFormOhc";
// import AppointmentVisit from "../pages/AppointmentVisit";
// import MedicalHistory from "../pages/MedicalHistory";
// import ClinicalExamination from "../pages/ClinicalExamination";
// import LaboratoryInvestigation from "../pages/LaboratoryInvestigation";
// import RadiologyScreen from "../pages/RadiologyScreen";
// import DoctorAssessment from "../pages/DoctorAssessment";
// import FitnessCertificate from "../pages/FitnessCertificate";
import RoleList from "../pages/RoleList";
import PermissionList from "../pages/Permission_list";
// import Resources from "../pages/Resources";
import Appointment from "../pages/Appointment";
import MedicalHistoryPage from "../pages/MedicalHistoryPage";
import ClinicalExaminationPage from "../pages/ClinicalExaminationPage";
import LaboratoryInvestigationPage from "../pages/LaboratoryInvestigationPage";
import RadiologyPage from "../pages/RadiologyPage";
import DoctorAssessmentPage from "../pages/DoctorAssessmentPage";
import FitnessCertificatePage from "../pages/FitnessCertificatePage";
import PatientPage from "../pages/PatientPage";

import VitalsPage from "../pages/VitalsPage";
import ResourcePage from "../pages/ResourcePage";
import ItemMaster from "../pages/ItemMaster";
export const ROUTES = [
  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
	path: "/",
    component: AppDashboard,
    permission: null,           
    showInSidebar: false,  },
  {
    path: "/dashboard",
    component: AppDashboard,
    permission: null,
    label: "Dashboard",
    icon: "HomeIcon",
    group: "Dashboard",
    showInSidebar: true,
  },
  {
    path: "/ohc-dashboard",
    component: OHCDashboard,
    permission: "read:ohc_dashboard",
    label: "OHC Dashboard",
    icon: "HomeIcon",
    group: "Dashboard",
    showInSidebar: true,
  },

  // ── Administration (LMC Admin only) ───────────────────────────────────────
  {
    path: "/tenant-list",
    component: TenantList,
    permission: "read:tenant",
    label: "Tenants",
    icon: "BuildingOfficeIcon",
    group: "Administration",
    showInSidebar: true,
  },
  {
    path: "/tenants",
    component: TenantForm,
    permission: "create:tenant",
    showInSidebar: false,
  },
  {
    path: "/roles",
    component: Roles,
    permission: "create:role",
    label: "Roles",
    icon: "ShieldCheckIcon",
    group: "Administration",
    showInSidebar: true,
  },
  {
    path: "/roles-list",
    component: RoleList,
    permission: "read:role",
    label: "Roles",
    icon: "ShieldCheckIcon",
    group: "Administration",
    showInSidebar: true,
  },
  {
    path: "/permissions",
    component: Permission,
    permission: "create:permission",
    label: "Permissions",
    icon: "KeyIcon",
    group: "Administration",
    showInSidebar: true,
  },
  {
    path: "/permission-list",
    component: PermissionList,
    permission: "read:permission",
    label: "Permission List",
    icon: "KeyIcon",
    group: "Administration",
    showInSidebar: true,
  },
  

  // ── Staff ─────────────────────────────────────────────────────────────────
  {
    path: "/staff-form",
    component: StaffForm,
    permission: "create:staff_form",
    label: "Staff",
    icon: "UsersIcon",
    group: "Staff",
    showInSidebar: true,
  },
  {
    path: "/staff-list",
    component: StaffList,
    permission: "read:staff_list",
    showInSidebar: false,
  },
  {
    path: "/attendance",
    component: AttendancePage,
    permission: "read:attendance",
    label: "Attendance",
    icon: "CalendarDaysIcon",
    group: "Staff",
    showInSidebar: true,
  },

  // ── Patient ───────────────────────────────────────────────────────────────
  {
    path: "/patient-list",
    component: PatientListCopy,
    permission: "read:patient_registration",
    label: "Patients",
    icon: "ClipboardDocumentListIcon",
    group: "Patient",
    showInSidebar: true,
  },
  {
    path: "/patient-registration",
    component: PatientRegistrationCopy,
    permission: "create:patient_registration",
    showInSidebar: false,
  },
  {
    path: "/patient-registration/:id",
    component: PatientRegistrationCopy,
    permission: "create:patient_registration",
    showInSidebar: false,
  },
  {
    path: "/PatientRegistrationOhc",
    component: PatientPage,
    permission: "create:patient_registration",
    label: "OHC Registration",
    icon: "UserPlusIcon",
    group: "Patient",
    showInSidebar: true,
  },
   {
    path: "/PatientRegistrationOhc/:id",
    component: PatientPage,
    permission: "create:patient_registration",
    showInSidebar: false,
  },

  // ── OPD ───────────────────────────────────────────────────────────────────
  {
    path: "/opd-list",
    component: OpdBillingListCopy,
    permission: "read:opd_list",
    label: "OPD List",
    icon: "ClipboardDocumentListIcon",
    group: "OPD",
    showInSidebar: true,
  },
  {
    path: "/opd-form",
    component: OpdFormCopy,
    permission: "create:opd_form",
    showInSidebar: false,
  },
  {
    path: "/opd-form/:ID",
    component: OpdFormCopy,
    permission: "create:opd_form",
    showInSidebar: false,
  },

  // ── Prescription ──────────────────────────────────────────────────────────
  {
    path: "/prescription-list",
    component: PrescriptionListCopy,
    permission: "read:prescription_list",
    label: "Prescriptions",
    icon: "DocumentTextIcon",
    group: "Prescription",
    showInSidebar: true,
  },
  {
    path: "/prescription-form",
    component: PrescriptionFormCopy,
    permission: "create:prescription_form",
    showInSidebar: false,
  },
  {
    path: "/prescription-form/:id",
    component: PrescriptionFormCopy,
    permission: "create:prescription_form",
    showInSidebar: false,
  },

  // ── Billing ───────────────────────────────────────────────────────────────
  {
    path: "/billing",
    component: BillingCopy,
    permission: "create:billing",
    label: "Billing",
    icon: "CreditCardIcon",
    group: "Billing",
    showInSidebar: true,
  },
  {
    path: "/billing/:id",
    component: BillingCopy,
    permission: "create:billing",
    showInSidebar: false,
  },
  {
    path: "/camp-billing",
    component: CampBillingCopy,
    permission: "create:camp_billing",
    label: "Camp Billing",
    icon: "BuildingStorefrontIcon",
    group: "Billing",
    showInSidebar: true,
  },

  // ── Pharmacy ──────────────────────────────────────────────────────────────
  {
    path: "/purchased-entry",
    component: PurchasedEntryCopy,
    permission: "create:sales_record",
    label: "Purchase Entry",
    icon: "ShoppingCartIcon",
    group: "Pharmacy",
    showInSidebar: true,
  },
  {
    path: "/purchased-entry/:id",
    component: PurchasedEntryCopy,
    permission: "create:sales_record",
    showInSidebar: false,
  },
  {
    path: "/sales-record",
    component: SalesRecordCopy,
    permission: "read:sales_record",
    label: "Sales Record",
    icon: "ChartBarIcon",
    group: "Pharmacy",
    showInSidebar: true,
  },
  {
    path: "/expiry-items",
    component: ExpiryItemsCopy,
    permission: "read:sales_record",
    label: "Expiry Items",
    icon: "ExclamationTriangleIcon",
    group: "Pharmacy",
    showInSidebar: true,
  },

  // ── Clinical (OHC) ────────────────────────────────────────────────────────
  {
    path: "/appointment",
    component: Appointment,
    permission: "read:appointment_visit",
    label: "Appointment",
    icon: "CalendarIcon",
    group: "Clinical",
    showInSidebar: true,
  },
  {
  path: "/appointment/:id",
  component: Appointment,
  permission: "update:appointment_visit",
  showInSidebar: false,
},
  
  {
    path: "/medical-history",
    component: MedicalHistoryPage,
    permission: "read:medical_history",
    label: "Medical History",
    icon: "BookOpenIcon",
    group: "Clinical",
    showInSidebar: true,
  },
  {
  path: "/medical-history/:id",
  component: MedicalHistoryPage,
  permission: "update:medical_history",
  showInSidebar: false,
},
  
  {
    path: "/clinical-examination",
    component: ClinicalExaminationPage,
    permission: "read:clinical_examination",
    label: "Clinical Examination",
    icon: "BeakerIcon",
    group: "Clinical",
    showInSidebar: true,
  },
  {
  path: "/clinical-examination/:id",
  component: ClinicalExaminationPage,
  permission: "update:clinical_examination",
  showInSidebar: false,
},
  {
    path: "/laboratory-investigation",
    component: LaboratoryInvestigationPage,
    permission: "read:laboratory_investigation",
    label: "Lab Investigation",
    icon: "MagnifyingGlassIcon",
    group: "Clinical",
    showInSidebar: true,
  },
  {
  path: "/laboratory-investigation/:id",
  component: LaboratoryInvestigationPage,
  permission: "update:laboratory_investigation",
  showInSidebar: false,
},
  
  {
    path: "/radiology-screen",
    component: RadiologyPage,
    permission: "read:radiology",
    label: "Radiology",
    icon: "PhotoIcon",
    group: "Clinical",
    showInSidebar: true,
  },
   {
  path: "/radiology-screen/:id",
  component: RadiologyPage,
  permission: "update:radiology",
  showInSidebar: false,
},
   
  {
    path: "/doctor-assessment",
    component: DoctorAssessmentPage,
    permission: "read:doctor_assessment",
    label: "Doctor Assessment",
    icon: "UserIcon",
    group: "Clinical",
    showInSidebar: true,
  },
   {
  path: "/doctor-assessment/:id",
  component: DoctorAssessmentPage,
  permission: "update:doctor_assessment",
  showInSidebar: false,
},
 
  {
    path: "/fitness-certificate",
    component: FitnessCertificatePage,
    permission: "read:fitness_certificate",
    label: "Fitness Certificate",
    icon: "DocumentCheckIcon",
    group: "Clinical",
    showInSidebar: true,
  },
  {
    path: "/resource",
    component: ResourcePage,
    permission: null,
    label: "Resources",
    icon: "ShieldCheckIcon",
    group: "Administration",
    showInSidebar: true,
  },
   {
    path: "/vitals",
    component: VitalsPage,
    permission: null,
    label: "Vitals",
    icon: "ShieldCheckIcon",
    group: "Administration",
    showInSidebar: true,
  },
   {
  path: "/vitals/:id",
  component: VitalsPage,
  permission: null,
  showInSidebar: false,
},
{
    path: "/items-master",
    component: ItemMaster,
    permission: null,
    label: "ItemMaster",
    icon: "ShieldCheckIcon",
    group: "Administration",
    showInSidebar: false,
  }

 
];
