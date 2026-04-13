// import React, { useState } from "react";
// import { NavLink } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   UserCircleIcon,
//   ArchiveBoxIcon,
//   BuildingOffice2Icon,
//   ClipboardDocumentListIcon,
//   ChevronDownIcon,
//   HomeIcon,
//   XMarkIcon,
//   UserGroupIcon,
//   ShieldCheckIcon,
//   BuildingLibraryIcon,
// } from "@heroicons/react/24/outline";
// import logo from "../../assets/lmc-logo.png";
// import { cookie } from "../../utils/cookie";
// const AppSidebar = ({ isOpen, setIsOpen }) => {
//   const [menus, setMenus] = useState({
//     patient: false,
//     opd: false,
//     prescription: false,
//     inventory: false,
//     staff: false,
//     Rolemanagement: false,
//     Tenants: false,
//     OHC: false,
//     Staff: false,
//   });
//   const role = cookie.get("role") || "USER";
//   const toggleSubMenu = (menu) =>
//     setMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));

//   const navItem = ({ isActive }) =>
//     `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
//       isActive
//         ? "bg-emerald-600 text-white shadow-lg font-semibold"
//         : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
//     }`;

//   const subNavItem = ({ isActive }) =>
//     `block py-2 px-4 text-sm transition-colors rounded-lg ${
//       isActive
//         ? "text-emerald-700 font-bold bg-emerald-50"
//         : "text-gray-500 hover:text-emerald-600 hover:bg-gray-50"
//     }`;

//   return (
//     <motion.aside
//       initial={false}
//       animate={{
//         width: isOpen ? 260 : 0,
//         x: isOpen ? 0 : -260,
//       }}
//       transition={{ duration: 0.4, ease: "circOut" }}
//       className="fixed lg:relative z-50 h-screen bg-white border-r border-sky-100 shadow-2xl lg:shadow-none flex flex-col overflow-hidden"
//     >
//       <div className="p-5 flex items-center justify-between border-b border-sky-50 min-w-[260px]">
//         <div className="flex items-center gap-3">
//           <img src={logo} className="w-8" alt="logo" />
//           <span className="text-emerald-700 font-bold text-lg whitespace-nowrap">
//             LMC Portal
//           </span>
//         </div>
//         <button
//           onClick={() => setIsOpen(false)}
//           className="p-1 hover:bg-red-50 rounded-lg text-red-400 lg:hidden"
//         >
//           <XMarkIcon className="w-6" />
//         </button>
//       </div>

//       <nav className="flex-1 overflow-y-auto p-4 space-y-2 min-w-[260px] custom-scrollbar">
//         <NavLink
//           to="/dashboard"
//           className={navItem}
//           onClick={() => setIsOpen(false)}
//         >
//           <HomeIcon className="w-5" /> Dashboard
//         </NavLink>

//         <div className="space-y-1">
//           <button
//             onClick={() => toggleSubMenu("patient")}
//             className="flex justify-between items-center w-full px-4 py-2.5 text-gray-600 rounded-xl hover:bg-emerald-50 transition-colors"
//           >
//             <span className="flex items-center gap-3">
//               <UserCircleIcon className="w-5" /> Patient
//             </span>
//             <ChevronDownIcon
//               className={`w-4 transition-transform ${menus.patient ? "rotate-180" : ""}`}
//             />
//           </button>
//           <AnimatePresence>
//             {menus.patient && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="ml-9 space-y-1 overflow-hidden"
//               >
//                 <NavLink
//                   to="/patient-registration"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Patient Registration
//                 </NavLink>
//                 <NavLink
//                   to="/patient-list"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Patient List
//                 </NavLink>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         <div className="space-y-1">
//           <button
//             onClick={() => toggleSubMenu("opd")}
//             className="flex justify-between items-center w-full px-4 py-2.5 text-gray-600 rounded-xl hover:bg-emerald-50"
//           >
//             <span className="flex items-center gap-3">
//               <BuildingOffice2Icon className="w-5" /> OPD
//             </span>
//             <ChevronDownIcon
//               className={`w-4 transition-transform ${menus.opd ? "rotate-180" : ""}`}
//             />
//           </button>
//           <AnimatePresence>
//             {menus.opd && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="ml-9 space-y-1 overflow-hidden"
//               >
//                 <NavLink
//                   to="/opd-form"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   OPD Form
//                 </NavLink>
//                 <NavLink
//                   to="/opd-list"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   OPD Billing List
//                 </NavLink>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         <div className="space-y-1">
//           <button
//             onClick={() => toggleSubMenu("prescription")}
//             className="flex justify-between items-center w-full px-4 py-2.5 text-gray-600 rounded-xl hover:bg-emerald-50"
//           >
//             <span className="flex items-center gap-3">
//               <ClipboardDocumentListIcon className="w-5" /> Prescription
//             </span>
//             <ChevronDownIcon
//               className={`w-4 transition-transform ${menus.prescription ? "rotate-180" : ""}`}
//             />
//           </button>
//           <AnimatePresence>
//             {menus.prescription && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="ml-9 space-y-1 overflow-hidden"
//               >
//                 <NavLink
//                   to="/prescription-form"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Prescription Form
//                 </NavLink>
//                 <NavLink
//                   to="/prescription-list"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Prescription List
//                 </NavLink>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         <div className="space-y-1">
//           <button
//             onClick={() => toggleSubMenu("inventory")}
//             className="flex justify-between items-center w-full px-4 py-2.5 text-gray-600 rounded-xl hover:bg-emerald-50"
//           >
//             <span className="flex items-center gap-3">
//               <ArchiveBoxIcon className="w-5" /> Inventory
//             </span>
//             <ChevronDownIcon
//               className={`w-4 transition-transform ${menus.inventory ? "rotate-180" : ""}`}
//             />
//           </button>
//           <AnimatePresence>
//             {menus.inventory && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="ml-9 space-y-1 overflow-hidden text-xs"
//               >
//                 <NavLink
//                   to="/purchased-entry"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Purchased Entry
//                 </NavLink>
//                 <NavLink
//                   to="/billing"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Billing
//                 </NavLink>
//                 <NavLink
//                   to="/expiry-items"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Expiry Items
//                 </NavLink>
//                 <NavLink
//                   to="/camp-billing"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Camp Billing
//                 </NavLink>
//                 <NavLink
//                   to="/sales-record"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Sales Record
//                 </NavLink>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         {role === "admin" && (
//           <div className="space-y-1">
//             <button
//               onClick={() => toggleSubMenu("staff")}
//               className="flex justify-between items-center w-full px-4 py-2.5 text-gray-600 rounded-xl hover:bg-emerald-50"
//             >
//               <span className="flex items-center gap-3">
//                 <UserGroupIcon className="w-5" /> Staff
//               </span>
//               <ChevronDownIcon
//                 className={`w-4 transition-transform ${menus.staff ? "rotate-180" : ""}`}
//               />
//             </button>
//             <AnimatePresence>
//               {menus.staff && (
//                 <motion.div
//                   initial={{ height: 0, opacity: 0 }}
//                   animate={{ height: "auto", opacity: 1 }}
//                   exit={{ height: 0, opacity: 0 }}
//                   className="ml-9 space-y-1 overflow-hidden text-xs"
//                 >
//                   <NavLink
//                     to="/staff-form"
//                     className={subNavItem}
//                     onClick={() => setIsOpen(false)}
//                   >
//                     Staff Form
//                   </NavLink>
//                   <NavLink
//                     to="/staff-list"
//                     className={subNavItem}
//                     onClick={() => setIsOpen(false)}
//                   >
//                     Staff List
//                   </NavLink>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
//         )}
//         <div className="space-y-1">
//           <button
//             onClick={() => toggleSubMenu("Rolemanagement")}
//             className="flex justify-between items-center w-full px-4 py-2.5 text-gray-600 rounded-xl hover:bg-emerald-50"
//           >
//             <span className="flex items-center gap-3">
//               <ShieldCheckIcon className="w-5" /> Role management
//             </span>
//             <ChevronDownIcon
//               className={`w-4 transition-transform ${menus.Rolemanagement ? "rotate-180" : ""}`}
//             />
//           </button>
//           <AnimatePresence>
//             {menus.Rolemanagement && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="ml-9 space-y-1 overflow-hidden"
//               >
//                 <NavLink
//                   to="/roles"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Role
//                 </NavLink>
//                 <NavLink
//                   to="/roles-list"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Role List
//                 </NavLink>

//                 <NavLink
//                   to="/permissions"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Permission
//                 </NavLink>
//                 <NavLink
//                   to="/PermissionList"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Permission List
//                 </NavLink>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//         <div className="space-y-1">
//           <button
//             onClick={() => toggleSubMenu("Tenants")}
//             className="flex justify-between items-center w-full px-4 py-2.5 text-gray-600 rounded-xl hover:bg-emerald-50"
//           >
//             <span className="flex items-center gap-3">
//               <BuildingLibraryIcon className="w-5" /> Tenants
//             </span>
//             <ChevronDownIcon
//               className={`w-4 transition-transform ${menus.Tenants ? "rotate-180" : ""}`}
//             />
//           </button>
//           <AnimatePresence>
//             {menus.Tenants && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="ml-9 space-y-1 overflow-hidden"
//               >
//                 <NavLink
//                   to="/tenants"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Tenants
//                 </NavLink>
//                 <NavLink
//                   to="/tenant-list"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Tenant List
//                 </NavLink>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>

//         <div className="space-y-1">
//           <button
//             onClick={() => toggleSubMenu("Staff")}
//             className="flex justify-between items-center w-full px-4 py-2.5 text-gray-600 rounded-xl hover:bg-emerald-50"
//           >
//             <span className="flex items-center gap-3">
//               <BuildingLibraryIcon className="w-5" /> Staff
//             </span>
//             <ChevronDownIcon
//               className={`w-4 transition-transform ${menus.Staff ? "rotate-180" : ""}`}
//             />
//           </button>
//           <AnimatePresence>
//             {menus.Staff && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="ml-9 space-y-1 overflow-hidden"
//               >
//                 <NavLink
//                   to="/staff-form"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Staff
//                 </NavLink>
//                 <NavLink
//                   to="/staff-list"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Staff List
//                 </NavLink>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//         <div className="space-y-1">
//           <button
//             onClick={() => toggleSubMenu("OHC")}
//             className="flex justify-between items-center w-full px-4 py-2.5 text-gray-600 rounded-xl hover:bg-emerald-50"
//           >
//             <span className="flex items-center gap-3">
//               <BuildingLibraryIcon className="w-5" /> OHC
//             </span>
//             <ChevronDownIcon
//               className={`w-4 transition-transform ${menus.OHC ? "rotate-180" : ""}`}
//             />
//           </button>
//           <AnimatePresence>
//             {menus.OHC && (
//               <motion.div
//                 initial={{ height: 0, opacity: 0 }}
//                 animate={{ height: "auto", opacity: 1 }}
//                 exit={{ height: 0, opacity: 0 }}
//                 className="ml-9 space-y-1 overflow-hidden"
//               >
//                 <NavLink
//                   to="/PatientRegistrationOhc"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Patient Registration Ohc
//                 </NavLink>
//                 <NavLink
//                   to="/appointmentvisit"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Apointment Visit
//                 </NavLink>
//                 <NavLink
//                   to="/medicalhistory"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Medical History
//                 </NavLink>
//                 <NavLink
//                   to="/ClinicalExamination"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Clinical Examination
//                 </NavLink>
//                 <NavLink
//                   to="/LaboratoryInvestigation"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   Laboratory Investigation
//                 </NavLink>

//                 <NavLink
//                   to="/RadiologyScreen"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   RadiologyScreen
//                 </NavLink>
//                 <NavLink
//                   to="/DoctorAssessment"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   DoctorAssessment
//                 </NavLink>

//                 <NavLink
//                   to="/FitnessCertificate"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   FitnessCertificate
//                 </NavLink>
//                 <NavLink
//                   to="/ohcdashboard"
//                   className={subNavItem}
//                   onClick={() => setIsOpen(false)}
//                 >
//                   ohcdashboard
//                 </NavLink>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </nav>
//     </motion.aside>
//   );
// };

// export default AppSidebar;

// src/components/Updates/AppSidebar.jsx
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
        <NavLink
          to="/dashboard"
          className={navItem}
          onClick={() => setIsOpen(false)}
        >
          <HomeIcon className="w-5" /> Dashboard
        </NavLink>

        {/* ── Patient ─────────────────────────────────────── */}
        {can("read:patient") && (
          <MenuGroup menuKey="patient" icon={UserCircleIcon} label="Patient">
            {can("create:patient") && (
              <NavLink
                to="/patient-registration"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Patient Registration
              </NavLink>
            )}
            <NavLink
              to="/patient-list"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Patient List
            </NavLink>
          </MenuGroup>
        )}

        {/* ── OPD ─────────────────────────────────────────── */}
        {can("read:opd") && (
          <MenuGroup menuKey="opd" icon={BuildingOffice2Icon} label="OPD">
            {can("create:opd") && (
              <NavLink
                to="/opd-form"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                OPD Form
              </NavLink>
            )}
            <NavLink
              to="/opd-list"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              OPD List
            </NavLink>
          </MenuGroup>
        )}

        {/* ── Prescription ─────────────────────────────────── */}
        {can("read:prescription") && (
          <MenuGroup
            menuKey="prescription"
            icon={ClipboardDocumentListIcon}
            label="Prescription"
          >
            {can("create:prescription") && (
              <NavLink
                to="/prescription-form"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Prescription Form
              </NavLink>
            )}
            <NavLink
              to="/prescription-list"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Prescription List
            </NavLink>
          </MenuGroup>
        )}

        {/* ── Inventory / Pharmacy ──────────────────────────── */}
        {can("read:pharmacy") && (
          <MenuGroup
            menuKey="inventory"
            icon={ArchiveBoxIcon}
            label="Inventory"
          >
            {can("create:pharmacy") && (
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
            <NavLink
              to="/expiry-items"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Expiry Items
            </NavLink>
            {can("create:billing") && (
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
        {can("read:user") && (
          <MenuGroup menuKey="staff" icon={UserGroupIcon} label="Staff">
            <NavLink
              to="/staff-form"
              className={subNavItem}
              onClick={() => setIsOpen(false)}
            >
              Staff
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
            {can("read:permission") && (
              <NavLink
                to="/permissions"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Permissions
              </NavLink>
            )}
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
        {can("read:clinical") && (
          <MenuGroup menuKey="ohc" icon={BuildingLibraryIcon} label="OHC">
            {can("create:ohc_patient_registration") && (
              <NavLink
                to="/PatientRegistrationOhc"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Patient Registration
              </NavLink>
            )}
            {can("create:ohc_patient_registration") && (
              <NavLink
                to="/appointmentvisit"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Appointment Visit
              </NavLink>
            )}
            {can("create:ohc_patient_registration") && (
              <NavLink
                to="/medicalhistory"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Medical History
              </NavLink>
            )}
            {can("create:ohc_patient_registration") && (
              <NavLink
                to="/ClinicalExamination"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Clinical Examination
              </NavLink>
            )}
            {can("create:ohc_patient_registration") && (
              <NavLink
                to="/LaboratoryInvestigation"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Lab Investigation
              </NavLink>
            )}
            {can("create:ohc_patient_registration") && (
              <NavLink
                to="/RadiologyScreen"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Radiology
              </NavLink>
            )}
            {can("create:ohc_patient_registration") && (
              <NavLink
                to="/DoctorAssessment"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Doctor Assessment
              </NavLink>
            )}
            {can("create:ohc_patient_registration") && (
              <NavLink
                to="/FitnessCertificate"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                Fitness Certificate
              </NavLink>
            )}
            {can("create:ohc_patient_registration") && (
              <NavLink
                to="/ohcdashboard"
                className={subNavItem}
                onClick={() => setIsOpen(false)}
              >
                OHC Dashboard
              </NavLink>
            )}
          </MenuGroup>
        )}
      </nav>
    </motion.aside>
  );
};

export default AppSidebar;
