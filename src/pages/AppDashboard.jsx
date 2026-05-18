import React, { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cookie } from "../utils/cookie";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useGetPatientsQuery } from "../redux/apiSlice";

const Dashboard = () => {
  const navigate = useNavigate();
  const username = cookie?.get?.("username") || "Admin";
//   const centerType =
//   cookie?.get?.("centerType") || "Parent";

// const userCenter =
//   cookie?.get?.("centerName") || "XYZ";
const centerType = "PARENT";

const userCenter = "XYZ";
const { data: patientData } = useGetPatientsQuery({ page: 1, limit: 100 });
const patients = patientData?.data || [];
  const today = new Date().toISOString().split("T")[0];
 const todayPatients = patients.filter(
    (p) => new Date(p.createdAt).toDateString() === today,
  ).length;
  const centerWiseData = {

  All: [
    {
      label: "Jan",
      CBC: 40,
      ECG: 18,
      MRI: 22,
      XRay: 30,
    },

    {
      label: "Feb",
      CBC: 52,
      ECG: 25,
      MRI: 18,
      XRay: 35,
    },

    {
      label: "Mar",
      CBC: 65,
      ECG: 32,
      MRI: 25,
      XRay: 40,
    },

    {
      label: "Apr",
      CBC: 70,
      ECG: 38,
      MRI: 28,
      XRay: 45,
    },

    {
      label: "May",
      CBC: 80,
      ECG: 45,
      MRI: 35,
      XRay: 55,
    },

    {
      label: "Jun",
      CBC: 92,
      ECG: 52,
      MRI: 40,
      XRay: 60,
    },
  ],

  XYZ: [
    {
      label: "Jan",
      CBC: 15,
      ECG: 8,
      MRI: 10,
      XRay: 12,
    },

    {
      label: "Feb",
      CBC: 20,
      ECG: 10,
      MRI: 12,
      XRay: 15,
    },

    {
      label: "Mar",
      CBC: 28,
      ECG: 15,
      MRI: 14,
      XRay: 18,
    },

    {
      label: "Apr",
      CBC: 35,
      ECG: 20,
      MRI: 18,
      XRay: 22,
    },

    {
      label: "May",
      CBC: 42,
      ECG: 25,
      MRI: 22,
      XRay: 28,
    },

    {
      label: "Jun",
      CBC: 50,
      ECG: 30,
      MRI: 28,
      XRay: 35,
    },
  ],

  TTT: [
    {
      label: "Jan",
      CBC: 8,
      ECG: 15,
      MRI: 5,
      XRay: 10,
    },

    {
      label: "Feb",
      CBC: 12,
      ECG: 18,
      MRI: 7,
      XRay: 14,
    },

    {
      label: "Mar",
      CBC: 15,
      ECG: 22,
      MRI: 9,
      XRay: 18,
    },

    {
      label: "Apr",
      CBC: 20,
      ECG: 28,
      MRI: 12,
      XRay: 20,
    },

    {
      label: "May",
      CBC: 25,
      ECG: 35,
      MRI: 16,
      XRay: 24,
    },

    {
      label: "Jun",
      CBC: 30,
      ECG: 42,
      MRI: 20,
      XRay: 28,
    },
  ],
  IIIS: [
  {
    label: "Jan",
    CBC: 12,
    ECG: 8,
    MRI: 5,
    XRay: 10,
  },

  {
    label: "Feb",
    CBC: 18,
    ECG: 10,
    MRI: 7,
    XRay: 12,
  },

  {
    label: "Mar",
    CBC: 22,
    ECG: 15,
    MRI: 10,
    XRay: 18,
  },

  {
    label: "Apr",
    CBC: 28,
    ECG: 18,
    MRI: 12,
    XRay: 20,
  },

  {
    label: "May",
    CBC: 32,
    ECG: 22,
    MRI: 16,
    XRay: 24,
  },

  {
    label: "Jun",
    CBC: 38,
    ECG: 28,
    MRI: 20,
    XRay: 30,
  },
],
VAX: [
  {
    label: "Jan",
    CBC: 10,
    ECG: 5,
    MRI: 3,
    XRay: 8,
  },

  {
    label: "Feb",
    CBC: 14,
    ECG: 8,
    MRI: 5,
    XRay: 10,
  },

  {
    label: "Mar",
    CBC: 18,
    ECG: 12,
    MRI: 8,
    XRay: 14,
  },

  {
    label: "Apr",
    CBC: 24,
    ECG: 16,
    MRI: 10,
    XRay: 18,
  },

  {
    label: "May",
    CBC: 28,
    ECG: 20,
    MRI: 14,
    XRay: 22,
  },

  {
    label: "Jun",
    CBC: 35,
    ECG: 25,
    MRI: 18,
    XRay: 28,
  },
],

};
const [selectedCenter, setSelectedCenter] =
  useState("All");

const graphData =
  centerType === "PARENT"
    ? centerWiseData[selectedCenter]
    : centerWiseData[userCenter];
const chartColors = [
  "#10b981", 
  "#3b82f6", 
  "#f59e0b", 
  "#ef4444", 
  "#8b5cf6", 
  "#06b6d4", 
  "#ec4899", 
  "#84cc16", 
  "#f97316", 
  "#14b8a6", 
  "#6366f1", 
  "#e11d48", 
];


  return (
    <div className="space-y-6">

    
      <div className="bg-emerald-600 text-white p-6 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">
            Welcome back, {username} 👋
          </h2>
          <p className="text-sm">Healthcare Dashboard</p>
        </div>

        <button
          onClick={() => navigate("/attendance")}
          className="bg-white text-emerald-600 px-4 py-2 rounded-lg"
        >
          Attendance
        </button>
      </div>

  
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
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-6 shadow-sm"
              >
                <p className="text-sm">Today Appointments</p>
      
                <h2 className="text-3xl font-bold">{todayPatients}</h2>
              </motion.div>
               <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-6 shadow-sm"
              >
                <p className="text-sm">Today Patient Examination</p>
      
                <h2 className="text-3xl font-bold">{todayPatients}</h2>
              </motion.div>
               <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-6 shadow-sm"
              >
                <p className="text-sm">Today Patients</p>
      
                <h2 className="text-3xl font-bold">{todayPatients}</h2>
              </motion.div>
      </div>
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6"
>

  <div className="flex justify-between items-center mb-6">

    <div>
      <h2 className="text-xl font-bold text-slate-800">
        Most Tests In Last 6 Months
      </h2>

      <p className="text-sm text-gray-500">
        Laboratory & Radiology Monthly Trends
      </p>
      {
  centerType === "PARENT" && (

    <div className="mt-4 w-56">

      <select
        value={selectedCenter}
        onChange={(e) =>
          setSelectedCenter(e.target.value)
        }
        className="w-full border border-emerald-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >

        <option value="All">
          All Centers
        </option>

        <option value="XYZ">
          XYZ Center
        </option>

        <option value="TTT">
          TTT Center
        </option>
        <option value="IIIS">
  IIIS Center
</option>

<option value="VAX">
  VAX Center
</option>

      </select>

    </div>

  )
}
    </div>

  </div>

  <div className="h-[400px]">

    <ResponsiveContainer width="100%" height="100%">

      <BarChart data={graphData}>

        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="label" />

        <YAxis />

        <Tooltip />

        <Legend />

        {
  Object.keys(graphData[0] || {})
    .filter((key) => key !== "label")
    .map((test, index) => (

     <Bar
  key={test}
  dataKey={test}
  fill={chartColors[index % chartColors.length]}
  radius={[4, 4, 0, 0]}
/>

    ))
}

      </BarChart>

    </ResponsiveContainer>

  </div>

</motion.div>

    </div>
  );
};



const Select = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="text-xs text-gray-600">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border p-2 rounded-lg text-sm"
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  </div>
);

const Input = ({ label, ...props }) => (
  <div>
    <label className="text-xs text-gray-600">{label}</label>
    <input {...props} className="w-full border p-2 rounded-lg text-sm" />
  </div>
);
export default Dashboard;