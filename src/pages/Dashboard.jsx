import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  ClipboardDocumentIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import {
  useGetPatientsQuery,
  useGetOpdBillingQuery,
  useGetPrescriptionsListQuery,
  useGetLowStockItemsQuery,
} from "../redux/apiSlice";
import { cookie } from "../utils/cookie";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
const AppDashboard = () => {
  const navigate = useNavigate();
  const { permissions } = useSelector((state) => state.auth);

  const can = (permission) => {
    if (!permission) return true;
    return permissions?.includes(permission) ?? false;
  };
  const getDisabledClass = (permission) =>
  can(permission)
    ? ""
    : "opacity-50 cursor-not-allowed pointer-events-none";
  const { data: patientData } = useGetPatientsQuery({ page: 1, limit: 100 });
  const { data: opdData } = useGetOpdBillingQuery({ page: 1, limit: 100 });
  const { data: prescriptionData } = useGetPrescriptionsListQuery({
    page: 1,
    limit: 100,
  });
  const { data: lowStockData, isLoading: stockLoading } =
    useGetLowStockItemsQuery();

  const patients = patientData?.data || [];
  const opd = opdData?.data || [];
  const prescriptions = prescriptionData?.data || [];

  const today = new Date().toDateString();

  const todayPatients = patients.filter(
    (p) => new Date(p.createdAt).toDateString() === today,
  ).length;

  const todayOpd = opd.filter(
    (o) => new Date(o.AddedDate).toDateString() === today,
  ).length;

  const todayPrescription = prescriptions.filter(
    (p) => new Date(p.addedDate).toDateString() === today,
  ).length;

  const recentPatients = patients.slice(0, 5);
  const username = cookie.get("name") || "User";
  const role = cookie.get("role") || "N/A";
  const lowStockItems = lowStockData?.data || [];
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const startIndex = (page - 1) * itemsPerPage;

  const paginatedItems = lowStockItems.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  /* ---------------- MODULES ---------------- */

 
  const modules = [
  {
    title: "Patients",
    permission: "read:patient_registration",
    icon: <UserIcon className="w-6" />,
    items: [
      {
        name: "Patient Registration",
        path: "/patient-registration",
        permission: "create:patient_registration",
      },
      {
        name: "Patient List",
        path: "/patient-list",
        permission: "read:patient_list",
      },
    ],
  },

  {
    title: "OPD",
    permission: "read:opd_form",
    icon: <ClipboardDocumentIcon className="w-6" />,
    items: [
      {
        name: "OPD Billing",
        path: "/opd-form",
        permission: "create:opd_form",
      },
      {
        name: "OPD List",
        path: "/opd-list",
        permission: "read:opd_list",
      },
    ],
  },

  {
    title: "Prescription",
    permission: "read:prescription_form",
    icon: <DocumentTextIcon className="w-6" />,
    items: [
      {
        name: "Prescription Form",
        path: "/prescription-form",
        permission: "create:prescription_form",
      },
      {
        name: "Prescription List",
        path: "/prescription-list",
        permission: "read:prescription_list",
      },
    ],
  },

  {
    title: "Inventory",
    permission: "read:sales_record",
    icon: <ArchiveBoxIcon className="w-6" />,
    items: [
      {
        name: "Purchase Entry",
        path: "/purchased-entry",
        permission: "create:purchased_entry",
      },
      {
        name: "Medicine Billing",
        path: "/billing",
        permission: "create:billing",
      },
      {
        name: "Expiry Items",
        path: "/expiry-items",
        permission: "read:expiry_items",
      },
      {
        name: "Camp Billing",
        path: "/camp-billing",
        permission: "create:camp_billing",
      },
      {
        name: "Sales Record",
        path: "/sales-record",
        permission: "read:sales_record",
      },
    ],
  },

  {
    title: "Staff",
    permission: "read:staff_form",
    icon: <UserGroupIcon className="w-6" />,
    items: [
      {
        name: "Staff",
        path: "/staff-form",
        permission: "read:staff_form",
      },
      {
        name: "Staff List",
        path: "/staff-list",
        permission: "read:staff_form",
      },
    ],
  },
];
  if (!can("read:dashboard")) {
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-350 to-emerald-600 text-white rounded-2xl p-8 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome back, {username} ({role}) 👋
          </h2>

          <p className="opacity-90">LMC Healthcare Management System</p>
        </div>

        <div className="text-right">
          <button
  disabled={!can("read:attendance")}
  onClick={() => navigate("/attendance")}
  className={`px-5 py-2 rounded-lg font-semibold
    ${
      can("read:attendance")
        ? "bg-white text-emerald-700"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }
  `}
>
  Attendance
</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6 overflow-visible">
        {modules
  
  .map((m) => (
          <motion.div
            whileHover={{ y: -6 }}
            key={m.title}
            className={`group relative bg-white/70 backdrop-blur-lg border border-white/30 shadow-lg rounded-2xl p-6 transition hover:z-50
  ${getDisabledClass(m.permission)}
`}
          >
            <div className="flex items-center gap-3">
              <div className="text-emerald-600">{m.icon}</div>

              <h3 className="font-semibold text-gray-700">{m.title}</h3>
            </div>

            <div className="absolute left-0 top-16 hidden group-hover:block bg-white shadow-xl rounded-xl mt-2 w-56 p-4 z-[999]">
              {m.items
  .map((item) => (
               <div
  key={item.name}
  onClick={() => {
    if (can(item.permission)) {
      navigate(item.path);
    }
  }}
  className={`text-sm py-2
    ${
      can(item.permission)
        ? "hover:text-emerald-600 cursor-pointer"
        : "text-gray-400 cursor-not-allowed"
    }
  `}
>
                  {item.name}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-6">
        <motion.div
  whileHover={can("read:patient_list") ? { scale: 1.03 } : {}}
  className={`rounded-xl p-6 shadow-sm
    ${
      can("read:patient_list")
        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
        : "bg-gray-100 border border-gray-300 text-gray-400"
    }
  `}
>
  <p className="text-sm">Today's Patients</p>

  <h2 className="text-3xl font-bold">
    {can("read:patient_list") ? todayPatients : "--"}
  </h2>
</motion.div>
<motion.div
  whileHover={can("read:opd_list") ? { scale: 1.03 } : {}}
  className={`rounded-xl p-6 shadow-sm
    ${
      can("read:opd_list")
        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
        : "bg-gray-100 border border-gray-300 text-gray-400"
    }
  `}
>
  <p className="text-sm">Today's OPD</p>

  <h2 className="text-3xl font-bold">
    {can("read:opd_list") ? todayOpd : "--"}
  </h2>
</motion.div>
<motion.div
  whileHover={can("read:sales_record") ? { scale: 1.03 } : {}}
  className={`rounded-xl p-6 shadow-sm
    ${
      can("read:sales_record")
        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
        : "bg-gray-100 border border-gray-300 text-gray-400"
    }
  `}
>
  <p className="text-sm">Low Stock</p>

  <h2 className="text-3xl font-bold">
  {can("read:sales_record")
    ? stockLoading
      ? "..."
      : lowStockItems.length
    : "--"}
</h2>
</motion.div>
<motion.div
  whileHover={can("read:prescription_list") ? { scale: 1.03 } : {}}
  className={`rounded-xl p-6 shadow-sm
    ${
      can("read:prescription_list")
        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
        : "bg-gray-100 border border-gray-300 text-gray-400"
    }
  `}
>
  <p className="text-sm">Today's Prescription</p>

  <h2 className="text-3xl font-bold">
    {can("read:prescription_list") ? todayPrescription : "--"}
  </h2>
</motion.div>

       
        {/* {can("read:sales_record") && (
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-6 shadow-sm"
        >
          <p className="text-sm">Low Stock</p>

          <h2 className="text-3xl font-bold">
            {stockLoading ? "..." : lowStockItems.length}
          </h2>
        </motion.div>
        )}
        {can("read:prescription_list") && (
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-6 shadow-sm"
        >
          <p className="text-sm">Today Prescription</p>

          <h2 className="text-3xl font-bold">{todayPrescription}</h2>
        </motion.div>
        )} */} 
      </div>

      {/* <div className="grid grid-cols-4 gap-6">

                <button
                    onClick={() => navigate("/patient-registration-copy")}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-xl shadow-sm transition"
                >
                    Register Patient
                </button>

                <button
                    onClick={() => navigate("/opd-form")}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-sm transition"
                >
                    Create OPD
                </button>

                <button
                    onClick={() => navigate("/purchased-entry")}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl shadow-sm transition"
                >
                    Add Medicine
                </button>

                <button
                    onClick={() => navigate("/medicines-billing")}
                    className="bg-gray-700 hover:bg-gray-800 text-white p-4 rounded-xl shadow-sm transition"
                >
                    Billing
                </button>
                <button
                    onClick={() => navigate("/attendance")}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-xl"
                >
                    Attendance
                </button>

            </div> */}

   <div className="grid grid-cols-2 gap-6">

  {/* Recent Patients */}
  <div
    className={`bg-white/70 backdrop-blur-lg shadow rounded-2xl p-6 ${
      !can("read:patient_list") ? "opacity-50" : ""
    }`}
  >
    <h3 className="font-semibold mb-4">Recent Patients</h3>

    {can("read:patient_list") ? (
      <div className="space-y-2 text-sm">
        {recentPatients.map((p) => (
          <div key={p.id} className="flex justify-between">
            <span>{p.name}</span>
            <span className="text-gray-400">
              {new Date(p.createdAt).toLocaleDateString("en-GB")}
            </span>
          </div>
        ))}
      </div>
    ) : (
      <div className="flex items-center justify-center h-40 text-gray-500 font-medium">
        Access Denied
      </div>
    )}
  </div>

  {/* Low Stock Medicines */}
  <div
    className={`bg-white/70 backdrop-blur-lg shadow rounded-2xl p-6 ${
      !can("read:sales_record") ? "opacity-50" : ""
    }`}
  >
    <h3 className="font-semibold mb-4">Low Stock Medicines</h3>

    {can("read:sales_record") ? (
      <>
        <div className="space-y-2 text-sm">
          {stockLoading ? (
            <p>Loading...</p>
          ) : lowStockItems.length === 0 ? (
            <p>No low stock items</p>
          ) : (
            paginatedItems.map((item) => (
              <div key={item.ID} className="flex justify-between">
                <span>{item.ItemName}</span>
                <span className="text-red-500 font-semibold">
                  {item.BalQty} left
                </span>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-between mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <button
            disabled={startIndex + itemsPerPage >= lowStockItems.length}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-emerald-500 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </>
    ) : (
      <div className="flex items-center justify-center h-40 text-gray-500 font-medium">
        Access Denied
      </div>
    )}
  </div>

</div>
          
    </motion.div>
  );
};

export default AppDashboard;
