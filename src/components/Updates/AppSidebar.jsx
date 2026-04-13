
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import {
  UserCircleIcon,
  ArchiveBoxIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  HomeIcon,
  XMarkIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BuildingLibraryIcon,
  KeyIcon,
  HeartIcon
} from "@heroicons/react/24/outline";
import logo from "../../assets/lmc-logo.png";

const AppSidebar = ({ isOpen, setIsOpen }) => {
  const { permissions } = useSelector((state) => state.auth);

  const can = (permission) => {
    if (!permission) return true;
    return permissions?.includes(permission) ?? false;
  };

  const [menus, setMenus] = useState({
    patient: false,
    opd: false,
    prescription: false,
    inventory: false,
    staff: false,
    roles: false,
    tenants: false,
    ohc: false,
  });

  const toggleSubMenu = (menu) =>
    setMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));

  const navItem = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
      isActive
        ? "bg-emerald-600 text-white shadow-lg font-semibold"
        : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
    }`;

  const subNavItem = ({ isActive }) =>
    `block py-2 px-4 text-sm transition-colors rounded-lg ${
      isActive
        ? "text-emerald-700 font-bold bg-emerald-50"
        : "text-gray-500 hover:text-emerald-600 hover:bg-gray-50"
    }`;

  // ── Reusable collapsible group ───────────────────────────────────────────
  const MenuGroup = ({ menuKey, icon: Icon, label, children }) => (
    <div className="space-y-1">
      <button
        onClick={() => toggleSubMenu(menuKey)}
        className="flex justify-between items-center w-full px-4 py-2.5 text-gray-600 rounded-xl hover:bg-emerald-50 transition-colors"
      >
        <span className="flex items-center gap-3 text-sm">
          <Icon className="w-5" /> {label}
        </span>
        <ChevronDownIcon
          className={`w-4 transition-transform ${menus[menuKey] ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {menus[menuKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-9 space-y-1 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 260 : 0, x: isOpen ? 0 : -260 }}
      transition={{ duration: 0.4, ease: "circOut" }}
      className="fixed lg:relative z-50 h-screen bg-white border-r border-sky-100 shadow-2xl lg:shadow-none flex flex-col overflow-hidden"
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className="p-5 flex items-center justify-between border-b border-sky-50 min-w-[260px]">
        <div className="flex items-center gap-3">
          <img src={logo} className="w-8" alt="logo" />
          <span className="text-emerald-700 font-bold text-lg whitespace-nowrap">
            LMC Portal
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-red-50 rounded-lg text-red-400 lg:hidden"
        >
          <XMarkIcon className="w-6" />
        </button>
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 min-w-[260px] custom-scrollbar">
        {/* Dashboard — everyone */}
        {can("read:dashboard") && (
          <NavLink
            to="/dashboard"
            className={navItem}
            onClick={() => setIsOpen(false)}
          >
            <HomeIcon className="w-5" /> Dashboard
          </NavLink>
        )}
        {/* ── Patient ─────────────────────────────────────── */}
        {can("read:patient_registration") && (
          <MenuGroup menuKey="patient" icon={UserCircleIcon} label="Patient">
            {can("create:patient_registration") && (
              <NavLink
                to="/patient-registration"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Patient Registration
              </NavLink>
            )}
            {can("read:patient_list") && (
              <NavLink
                to="/patient-list"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Patient List
              </NavLink>
            )}
          </MenuGroup>
        )}

        {/* ── OPD ─────────────────────────────────────────── */}
        {can("read:opd_form") && (
          <MenuGroup menuKey="opd" icon={BuildingOffice2Icon} label="OPD">
            {can("create:opd_form") && (
              <NavLink
                to="/opd-form"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                OPD Form
              </NavLink>
            )}

            {can("read:opd_list") && (
              <NavLink
                to="/opd-list"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                OPD List
              </NavLink>
            )}
          </MenuGroup>
        )}

        {/* ── Prescription ─────────────────────────────────── */}
        {can("read:prescription_form") && (
          <MenuGroup
            menuKey="prescription"
            icon={ClipboardDocumentListIcon}
            label="Prescription"
          >
            {can("create:prescription_form") && (
              <NavLink
                to="/prescription-form"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Prescription Form
              </NavLink>
            )}
            {can("read:prescription_list") && (
              <NavLink
                to="/prescription-list"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Prescription List
              </NavLink>
            )}
          </MenuGroup>
        )}

        {/* ── Inventory / Pharmacy ──────────────────────────── */}
        {can("read:sales_record") && (
          <MenuGroup
            menuKey="inventory"
            icon={ArchiveBoxIcon}
            label="Inventory"
          >
            {can("create:purchased_entry") && (
              <NavLink
                to="/purchased-entry"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Purchase Entry
              </NavLink>
            )}
            {can("create:billing") && (
              <NavLink
                to="/billing"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Billing
              </NavLink>
            )}
            {can("read:expiry_items") && (
              <NavLink
                to="/expiry-items"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Expiry Items
              </NavLink>
            )}
            {can("create:camp_billing") && (
              <NavLink
                to="/camp-billing"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Camp Billing
              </NavLink>
            )}

            <NavLink
              to="/sales-record"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Sales Record
            </NavLink>
          </MenuGroup>
        )}

        {/* ── Staff ────────────────────────────────────────── */}
        {can("read:staff") && (
          <MenuGroup menuKey="staff" icon={UserGroupIcon} label="Staff">
            <NavLink
              to="/staff-form"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Staff
            </NavLink>

            <NavLink
              to="/staff-list"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Staff List
            </NavLink>
            <NavLink
              to="/attendance"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Attendance
            </NavLink>
          </MenuGroup>
        )}

        {/* ── Role Management — LMC Admin only ─────────────── */}
        {can("read:role") && (
          <MenuGroup
            menuKey="roles"
            icon={ShieldCheckIcon}
            label="Role Management"
          >
            <NavLink
              to="/roles"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Roles
            </NavLink>
            {can("read:roles-list") && (
              <NavLink
                to="/role-list"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Role List
              </NavLink>
            )}
            {/* {can("read:permission") && ( */}
            <NavLink
              to="/permissions"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Permissions
            </NavLink>
            {/* )} */}
          </MenuGroup>
        )}

        {/* ── Tenants — LMC Admin only ──────────────────────── */}
        {can("read:tenant") && (
          <MenuGroup
            menuKey="tenants"
            icon={BuildingLibraryIcon}
            label="Tenants"
          >
            <NavLink
              to="/tenant-list"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Tenant List
            </NavLink>
            {can("create:tenant") && (
              <NavLink
                to="/tenants"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Add Tenant
              </NavLink>
            )}
          </MenuGroup>
        )}

        {/* ── OHC ─────────────────────────────────────────── */}
        {can("read:ohc_dashboard") && (
          <MenuGroup menuKey="ohc" icon={HeartIcon} label="OHC">
            {can("read:ohc_dashboard") && (
              <NavLink
                to="/ohc-dashboard"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                OHC Dashboard
              </NavLink>
            )}
            {can("create:ohc_patient_registration") && (
              <NavLink
                to="/PatientRegistrationOhc"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Patient Registration
              </NavLink>
            )}
            {can("create:appointment_visit") && (
              <NavLink
                to="/appointment-visit"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Appointment Visit
              </NavLink>
            )}
            {can("create:medical_history") && (
              <NavLink
                to="/medicalhistory"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Medical History
              </NavLink>
            )}
            {can("create:clinical_examination") && (
              <NavLink
                to="/ClinicalExamination"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Clinical Examination
              </NavLink>
            )}
            {can("create:laboratory_investigation") && (
              <NavLink
                to="/LaboratoryInvestigation"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Lab Investigation
              </NavLink>
            )}
            {can("create:radiology") && (
              <NavLink
                to="/RadiologyScreen"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Radiology
              </NavLink>
            )}
            {can("create:doctor_assessment") && (
              <NavLink
                to="/DoctorAssessment"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Doctor Assessment
              </NavLink>
            )}
            {can("create:fitness_certificate") && (
              <NavLink
                to="/FitnessCertificate"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Fitness Certificate
              </NavLink>
            )}
          </MenuGroup>
        )}
      </nav>
    </motion.aside>
  );
};

export default AppSidebar;
