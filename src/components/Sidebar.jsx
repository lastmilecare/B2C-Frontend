import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  UserCircleIcon,
  BuildingOffice2Icon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

const Sidebar = () => {
   const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = () => {
      dispatch(logout());
      navigate("/login");
    };
  const [isOpen, setIsOpen] = useState(true);
  const [openPatient, setOpenPatient] = useState(false);
  const [openOpd, setOpenOpd] = useState(false);
  const [openPrescription, setOpenPrescription] = useState(false);

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 text-sm rounded-md transition ${isActive
      ? "bg-sky-100 text-sky-700 font-semibold"
      : "text-gray-700 hover:bg-sky-50 hover:text-sky-700"
    }`;

  return (
    <div className={`h-screen flex flex-col border-r border-gray-200 shadow-md bg-white transition-all duration-300 ${isOpen ? "w-56" : "w-16"}`}>
      {/* Header / Brand */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        {isOpen && <h1 className="text-2xl font-bold text-sky-700">🏥 LMC Portal</h1>}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded hover:bg-sky-100"
        >
          <Bars3Icon className="w-6 h-6 text-sky-700" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Patient */}
        <div>
          <button
            onClick={() => setOpenPatient(!openPatient)}
            className="flex justify-between items-center w-full px-2 py-2 font-medium text-gray-800 hover:bg-sky-100 rounded-md"
          >
            <span className="flex items-center gap-2">
              <UserCircleIcon className="w-5 h-5 text-sky-600" />
              {isOpen && "Patient"}
            </span>
            {isOpen && <ChevronDownIcon className={`w-4 h-4 transform transition ${openPatient ? "rotate-180" : ""}`} />}
          </button>
          {openPatient && isOpen && (
            <div className="ml-6 mt-1 space-y-1">
              <NavLink to="/patient-registration" className={navItemClass}>
                Patient Registration
              </NavLink>
              <NavLink to="/patient-list" className={navItemClass}>
                Patient List
              </NavLink>
            </div>
          )}
        </div>

        {/* OPD */}
        <div>
          <button
            onClick={() => setOpenOpd(!openOpd)}
            className="flex justify-between items-center w-full px-2 py-2 font-medium text-gray-800 hover:bg-sky-100 rounded-md"
          >
            <span className="flex items-center gap-2">
              <BuildingOffice2Icon className="w-5 h-5 text-sky-600" />
              {isOpen && "OPD"}
            </span>
            {isOpen && <ChevronDownIcon className={`w-4 h-4 transform transition ${openOpd ? "rotate-180" : ""}`} />}
          </button>
          {openOpd && isOpen && (
            <div className="ml-6 mt-1 space-y-1">
              <NavLink to="/opd-form" className={navItemClass}>
                OPD Form
              </NavLink>
              <NavLink to="/opd-billing" className={navItemClass}>
                OPD Billing
              </NavLink>
            </div>
          )}
        </div>

        {/* Prescription */}
        <div>
          <button
            onClick={() => setOpenPrescription(!openPrescription)}
            className="flex justify-between items-center w-full px-2 py-2 font-medium text-gray-800 hover:bg-sky-100 rounded-md"
          >
            <span className="flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5 text-sky-600" />
              {isOpen && "Prescription"}
            </span>
            {isOpen && <ChevronDownIcon className={`w-4 h-4 transform transition ${openPrescription ? "rotate-180" : ""}`} />}
          </button>
          {openPrescription && isOpen && (
            <div className="ml-6 mt-1 space-y-1">
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

      {/* Footer */}
      <div className="border-t border-gray-100 p-2">
        <NavLink to="/login" className={navItemClass}>
          <UserPlusIcon className="w-5 h-5 text-sky-600" />
          {isOpen && "Login"}
        </NavLink>
        <button 
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-red-100 hover:text-red-600 transition">
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          {isOpen && "Logout"}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
