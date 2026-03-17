import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import {
  UserCircleIcon,
  ArchiveBoxIcon,
  BuildingOffice2Icon,
  ClipboardDocumentListIcon,
  ChevronDownIcon,
  ArrowLeftStartOnRectangleIcon,
  Bars3Icon,
  HomeIcon
} from "@heroicons/react/24/outline";

import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import logo from "../../assets/lmc-logo.png";

const CopySidebar = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(true);

  const [patientMenu, setPatientMenu] = useState(false);
  const [opdMenu, setOpdMenu] = useState(false);
  const [prescriptionMenu, setPrescriptionMenu] = useState(false);
  const [inventoryMenu, setInventoryMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItem = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all
    ${isActive
      ? "bg-white text-sky-700 shadow font-semibold"
      : "text-gray-600 hover:bg-white hover:text-sky-700"
    }`;

  return (
    <motion.div
      animate={{ width: open ? 260 : 80 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-sky-50 border-r border-sky-100 shadow-sm flex flex-col"
    >

      

      <div className="flex items-center justify-between p-4">

        <div className="flex items-center gap-3">
          <img src={logo} className="w-10" />

          {open && (
            <span className="font-bold text-sky-700 text-lg">
              LMC Portal
            </span>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg hover:bg-white"
        >
          <Bars3Icon className="w-6 text-sky-700" />
        </button>

      </div>

      

      <nav className="space-y-2 px-3 mt-6">

        

        <NavLink to="/dashboard-copy" className={navItem}>
          <HomeIcon className="w-5" />
          {open && "Dashboard"}
        </NavLink>


        

        <div>

          <button
            onClick={() => setPatientMenu(!patientMenu)}
            className="flex justify-between items-center w-full px-4 py-2 text-gray-700 rounded-xl hover:bg-white"
          >

            <span className="flex items-center gap-3">
              <UserCircleIcon className="w-5" />
              {open && "Patient"}
            </span>

            {open && (
              <ChevronDownIcon
                className={`w-4 transition ${patientMenu ? "rotate-180" : ""}`}
              />
            )}

          </button>

          {patientMenu && open && (

            <div className="ml-8 space-y-1">

              <NavLink to="/patient-registration-copy" className={navItem}>
                Patient Registration
              </NavLink>

              <NavLink to="/patient-list-copy" className={navItem}>
                Patient List
              </NavLink>

            </div>

          )}

        </div>


        

        <div>

          <button
            onClick={() => setOpdMenu(!opdMenu)}
            className="flex justify-between items-center w-full px-4 py-2 text-gray-700 rounded-xl hover:bg-white"
          >

            <span className="flex items-center gap-3">
              <BuildingOffice2Icon className="w-5" />
              {open && "OPD"}
            </span>

            {open && (
              <ChevronDownIcon
                className={`w-4 transition ${opdMenu ? "rotate-180" : ""}`}
              />
            )}

          </button>

          {opdMenu && open && (

            <div className="ml-8 space-y-1">

              <NavLink to="/opd-form-copy" className={navItem}>
                OPD Form
              </NavLink>

              <NavLink to="/opd-list-copy" className={navItem}>
                OPD Billing List
              </NavLink>

            </div>

          )}

        </div>


       

        <div>

          <button
            onClick={() => setPrescriptionMenu(!prescriptionMenu)}
            className="flex justify-between items-center w-full px-4 py-2 text-gray-700 rounded-xl hover:bg-white"
          >

            <span className="flex items-center gap-3">
              <ClipboardDocumentListIcon className="w-5" />
              {open && "Prescription"}
            </span>

            {open && (
              <ChevronDownIcon
                className={`w-4 transition ${prescriptionMenu ? "rotate-180" : ""}`}
              />
            )}

          </button>

          {prescriptionMenu && open && (

            <div className="ml-8 space-y-1">

              <NavLink to="/prescription-form-copy" className={navItem}>
                Prescription Form
              </NavLink>

              <NavLink to="/prescription-list-copy" className={navItem}>
                Prescription List
              </NavLink>

            </div>

          )}

        </div>


        

        <div>

          <button
            onClick={() => setInventoryMenu(!inventoryMenu)}
            className="flex justify-between items-center w-full px-4 py-2 text-gray-700 rounded-xl hover:bg-white"
          >

            <span className="flex items-center gap-3">
              <ArchiveBoxIcon className="w-5" />
              {open && "Inventory"}
            </span>

            {open && (
              <ChevronDownIcon
                className={`w-4 transition ${inventoryMenu ? "rotate-180" : ""}`}
              />
            )}

          </button>

          {inventoryMenu && open && (

            <div className="ml-8 space-y-1">

              <NavLink to="/purchased-entry-copy" className={navItem}>
                Purchased Entry
              </NavLink>

              <NavLink to="/billing-copy" className={navItem}>
                Billing
              </NavLink>

              

              <NavLink to="/expiry-items-copy" className={navItem}>
                Expiry Items
              </NavLink>

              <NavLink to="/camp-billing-copy" className={navItem}>
                Camp Billing
              </NavLink>
              <NavLink to="/sales-record-copy" className={navItem}>
                Sales Record
              </NavLink>

            </div>

          )}

        </div>

      </nav>

      

      <div className="mt-auto border-t border-sky-100 p-3">

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-600 rounded-xl hover:bg-red-100 hover:text-red-600"
        >
          <ArrowLeftStartOnRectangleIcon className="w-5" />
          {open && "Logout"}
        </button>

      </div>

    </motion.div>
  );
};

export default CopySidebar;