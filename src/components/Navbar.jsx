import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  UserCircleIcon,
  ArchiveBoxIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openPatient, setOpenPatient] = useState(false);
  const [openOpd, setOpenOpd] = useState(false);
  const [openPrescription, setOpenPrescription] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  const navItemClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ${
      isActive
        ? "bg-sky-100 text-sky-700 font-semibold"
        : "text-gray-700 hover:bg-sky-50 hover:text-sky-700"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-sky-700">🏥 LMC Portal</h1>
          </div>

          {/* Hamburger (for mobile) */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-md hover:bg-sky-100"
            >
              <Bars3Icon className="w-6 h-6 text-sky-700" />
            </button>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex sm:items-center sm:gap-4">
            {/* Patient Menu */}
            <div className="relative">
              <button
                onClick={() => setOpenPatient(!openPatient)}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-700 font-medium"
              >
                <UserCircleIcon className="w-5 h-5 text-sky-600" />
                Patient
                <ChevronDownIcon className={`w-4 h-4 transition ${openPatient ? "rotate-180" : ""}`} />
              </button>
              {openPatient && (
                <div className="absolute top-full mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <NavLink to="/patient-registration" className={navItemClass}>
                    Patient Registration
                  </NavLink>
                  <NavLink to="/patient-list" className={navItemClass}>
                    Patient List
                  </NavLink>
                </div>
              )}
            </div>

            {/* OPD Menu */}
            <div className="relative">
              <button
                onClick={() => setOpenOpd(!openOpd)}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-700 font-medium"
              >
                <BuildingOffice2Icon className="w-5 h-5 text-sky-600" />
                OPD
                <ChevronDownIcon className={`w-4 h-4 transition ${openOpd ? "rotate-180" : ""}`} />
              </button>
              {openOpd && (
                <div className="absolute top-full mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <NavLink to="/opd-form" className={navItemClass}>
                    OPD Form
                  </NavLink>
                  <NavLink to="/opd-billing" className={navItemClass}>
                    OPD Billing
                  </NavLink>
                </div>
              )}
            </div>

            {/* Prescription Menu */}
            <div className="relative">
              <button
                onClick={() => setOpenPrescription(!openPrescription)}
                className="flex items-center gap-1 px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-700 font-medium"
              >
                <ClipboardDocumentListIcon className="w-5 h-5 text-sky-600" />
                Prescription
                <ChevronDownIcon className={`w-4 h-4 transition ${openPrescription ? "rotate-180" : ""}`} />
              </button>
              {openPrescription && (
                <div className="absolute top-full mt-1 w-44 bg-white border border-gray-200 rounded shadow-lg z-50">
                  <NavLink to="/prescription-form" className={navItemClass}>
                    Prescription Form
                  </NavLink>
                  <NavLink to="/prescription-list" className={navItemClass}>
                    Prescription List
                  </NavLink>
                </div>
              )}
            </div>
            {/* Inventory Menu - New Added */}
            <div>
          <button
            onClick={() => setOpenInventory(!openInventory)}
            className="flex justify-between items-center w-full px-2 py-2 font-medium text-gray-800 hover:bg-sky-100 rounded-md"
          >
            <span className="flex items-center gap-2">
              <ArchiveBoxIcon className="w-5 h-5 text-sky-600" />
              {isOpen && "Inventory"}
            </span>
            {isOpen && <ChevronDownIcon className={`w-4 h-4 transform transition ${openInventory ? "rotate-180" : ""}`} />}
          </button>
          {openInventory && isOpen && (
            <div className="ml-6 mt-1 space-y-1">
              <NavLink to="/inventory-overview" className={navItemClass}>Inventory List</NavLink>
              <NavLink to="/add-inventory" className={navItemClass}>Add Item</NavLink>
            </div>
          )}
        </div>
            {/* Signup / Logout */}
            <NavLink to="/login" className={navItemClass}>
              <UserPlusIcon className="w-5 h-5 text-sky-600" /> Login
            </NavLink>
            <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-red-100 hover:text-red-600">
              <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden px-2 pt-2 pb-4 space-y-1 bg-white border-t border-gray-200">
          {/* Patient */}
          <div>
            <button
              onClick={() => setOpenPatient(!openPatient)}
              className="flex justify-between items-center w-full px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-700"
            >
              <span className="flex items-center gap-2">
                <UserCircleIcon className="w-5 h-5 text-sky-600" /> Patient
              </span>
              <ChevronDownIcon className={`w-4 h-4 transition ${openPatient ? "rotate-180" : ""}`} />
            </button>
            {openPatient && (
              <div className="pl-8 mt-1 space-y-1">
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
              className="flex justify-between items-center w-full px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-700"
            >
              <span className="flex items-center gap-2">
                <BuildingOffice2Icon className="w-5 h-5 text-sky-600" /> OPD
              </span>
              <ChevronDownIcon className={`w-4 h-4 transition ${openOpd ? "rotate-180" : ""}`} />
            </button>
            {openOpd && (
              <div className="pl-8 mt-1 space-y-1">
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
              className="flex justify-between items-center w-full px-3 py-2 rounded-md text-gray-700 hover:bg-sky-50 hover:text-sky-700"
            >
              <span className="flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-5 h-5 text-sky-600" /> Prescription
              </span>
              <ChevronDownIcon className={`w-4 h-4 transition ${openPrescription ? "rotate-180" : ""}`} />
            </button>
            {openPrescription && (
              <div className="pl-8 mt-1 space-y-1">
                <NavLink to="/prescription-form" className={navItemClass}>
                  Prescription Form
                </NavLink>
                <NavLink to="/prescription-list" className={navItemClass}>
                  Prescription List
                </NavLink>
              </div>
            )}
          </div>

          {/* Signup / Logout */}
          <NavLink to="/login" className={navItemClass}>
            <UserPlusIcon className="w-5 h-5 text-sky-600" /> <Login></Login>
          </NavLink>
          <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-red-100 hover:text-red-600">
            <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
