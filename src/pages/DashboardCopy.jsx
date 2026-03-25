import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  ClipboardDocumentIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

import {
  useGetPatientsQuery,
  useGetOpdBillingQuery,
  useGetPrescriptionsListQuery,
} from "../redux/apiSlice";
import { cookie } from "../utils/cookie";

const DashboardCopy = () => {
  const navigate = useNavigate();
  const username = cookie.get("username") || "User";
  const { data: patientData } = useGetPatientsQuery({ page: 1, limit: 100 });
  const { data: opdData } = useGetOpdBillingQuery({ page: 1, limit: 100 });
  const { data: prescriptionData } = useGetPrescriptionsListQuery({
    page: 1,
    limit: 100,
  });

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

  /* ---------------- MODULES ---------------- */

  const modules = [
    {
      title: "Patients",
      icon: <UserIcon className="w-6" />,
      items: [
        { name: "Patient Registration", path: "/patient-registration-copy" },
        { name: "Patient List", path: "/patient-list-copy" },
      ],
    },

    {
      title: "OPD",
      icon: <ClipboardDocumentIcon className="w-6" />,
      items: [
        { name: "OPD Form", path: "/opd-form-copy" },
        { name: "OPD Billing", path: "/opd-list-copy" },
      ],
    },

    {
      title: "Prescription",
      icon: <DocumentTextIcon className="w-6" />,
      items: [
        { name: "Prescription Form", path: "/prescription-form-copy" },
        { name: "Prescription List", path: "/prescription-list-copy" },
      ],
    },

    {
      title: "Inventory",
      icon: <ArchiveBoxIcon className="w-6" />,
      items: [
        { name: "Purchased Entry", path: "/purchased-entry-copy" },
        { name: "Medicine Billing", path: "/billing-copy" },
        { name: "Sales Record", path: "/sales-record-copy" },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-10"
    >
      {/* HEADER */}

      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white rounded-2xl p-8 flex justify-between items-center shadow-lg">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {username} 👋</h2>

          <p className="opacity-90">LMC Healthcare Management System</p>
        </div>

        <div className="text-right">
          <p className="text-sm opacity-80">Today</p>

          <p className="text-lg font-semibold">
            {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* MODULE CARDS */}

      <div className="grid grid-cols-4 gap-6">
        {modules.map((m) => (
          <motion.div
            whileHover={{ y: -6 }}
            key={m.title}
            className="group relative bg-white/70 backdrop-blur-lg border border-white/30 shadow-lg rounded-2xl p-6 cursor-pointer transition"
          >
            <div className="flex items-center gap-3">
              <div className="text-emerald-600">{m.icon}</div>

              <h3 className="font-semibold text-gray-700">{m.title}</h3>
            </div>

            {/* dropdown */}

            <div className="absolute left-0 top-16 hidden group-hover:block bg-white shadow-xl rounded-xl mt-2 w-56 p-4 z-[999]">
              {m.items.map((item) => (
                <div
                  key={item.name}
                  onClick={() => navigate(item.path)}
                  className="text-sm py-2 hover:text-emerald-600 cursor-pointer"
                >
                  {item.name}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* STATS */}

      <div className="grid grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-6 shadow-sm"
        >
          <p className="text-sm">Today Patients</p>

          <h2 className="text-3xl font-bold">{todayPatients}</h2>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-6 shadow-sm"
        >
          <p className="text-sm">Today's OPD</p>

          <h2 className="text-3xl font-bold">{todayOpd}</h2>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-6 shadow-sm"
        >
          <p className="text-sm">Low Stock</p>

          <h2 className="text-3xl font-bold">6</h2>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl p-6 shadow-sm"
        >
          <p className="text-sm">Today Prescription</p>

          <h2 className="text-3xl font-bold">{todayPrescription}</h2>
        </motion.div>
      </div>

      {/* QUICK ACTION */}

      <div className="grid grid-cols-4 gap-6">
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
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white/70 backdrop-blur-lg shadow rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Recent Patients</h3>

          <div className="space-y-2 text-sm">
            {recentPatients.map((p) => (
              <div key={p.id} className="flex justify-between">
                <span>{p.name}</span>

                <span className="text-gray-400">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-lg shadow rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Low Stock Medicines</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Paracetamol</span>
              <span className="text-red-500">5 left</span>
            </div>

            <div className="flex justify-between">
              <span>Vitamin D</span>
              <span className="text-red-500">3 left</span>
            </div>

            <div className="flex justify-between">
              <span>Amoxicillin</span>
              <span className="text-red-500">2 left</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardCopy;
