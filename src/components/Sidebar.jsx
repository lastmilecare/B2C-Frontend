import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  UserCircleIcon,
  BuildingOffice2Icon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const [openPatient, setOpenPatient] = useState(false);
  const [openOpd, setOpenOpd] = useState(false);
  const [openPrescription, setOpenPrescription] = useState(false);

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 text-sm rounded-md transition ${
      isActive
        ? "bg-sky-100 text-sky-700 font-semibold"
        : "text-gray-700 hover:bg-sky-50 hover:text-sky-700"
    }`;

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-md h-screen sticky top-0 flex flex-col">
      {/* Brand */}
      <div className="px-5 py-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-sky-700">🏥 LMC Portal</h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Patient Section */}
        <div>
          <button
            onClick={() => setOpenPatient(!openPatient)}
            className="flex justify-between items-center w-full px-4 py-2 font-medium text-gray-800 hover:bg-sky-100 rounded-md"
          >
            <span className="flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-sky-600" />
              Patient
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 transform transition ${
                openPatient ? "rotate-180" : ""
              }`}
            />
          </button>

          {openPatient && (
            <div className="ml-8 mt-2 space-y-1">
              <NavLink to="/patient-registration" className={navItemClass}>
                Patient Registration
              </NavLink>
              <NavLink to="/patient-list" className={navItemClass}>
                Patient List
              </NavLink>
            </div>
          )}
        </div>

        {/* OPD Section */}
        <div>
          <button
            onClick={() => setOpenOpd(!openOpd)}
            className="flex justify-between items-center w-full px-4 py-2 font-medium text-gray-800 hover:bg-sky-100 rounded-md"
          >
            <span className="flex items-center gap-2">
              <BuildingOffice2Icon className="w-5 h-5 text-sky-600" />
              OPD
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 transform transition ${
                openOpd ? "rotate-180" : ""
              }`}
            />
          </button>

          {openOpd && (
            <div className="ml-8 mt-2 space-y-1">
              <NavLink to="/opd-form" className={navItemClass}>
                OPD Form
              </NavLink>
              <NavLink to="/opd-billing" className={navItemClass}>
                OPD Billing
              </NavLink>
            </div>
          )}
        </div>

        {/* Prescription Section */}
        <div>
          <button
            onClick={() => setOpenPrescription(!openPrescription)}
            className="flex justify-between items-center w-full px-4 py-2 font-medium text-gray-800 hover:bg-sky-100 rounded-md"
          >
            <span className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-sky-600" />
              Prescription
            </span>
            <ChevronDownIcon
              className={`w-4 h-4 transform transition ${
                openPrescription ? "rotate-180" : ""
              }`}
            />
          </button>

          {openPrescription && (
            <div className="ml-8 mt-2 space-y-1">
              <NavLink to="/prescription-form" className={navItemClass}>
                Prescription Form
              </NavLink>
              <NavLink to="/prescription-list" className={navItemClass}>
                Prescription List
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* Signup / Logout */}
      <div className="border-t border-gray-100 p-3">
        <NavLink to="/signup" className={navItemClass}>
          <UserPlusIcon className="w-5 h-5 text-sky-600" /> Signup
        </NavLink>
        <button className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-red-100 hover:text-red-600 transition">
          <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
