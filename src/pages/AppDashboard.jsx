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

const Dashboard = () => {
  const navigate = useNavigate();
  const username = cookie?.get?.("username") || "Admin";

  const today = new Date().toISOString().split("T")[0];



  const tenants = ["All", "Tenant A", "Tenant B"];
  const centers = ["All", "Gurgaon", "Noida"];
  const years = ["2026", "2025"];

 

  const initialFilters = {
    tenant: "All",
    center: "All",
    from: "",
    to: "",
    year: "2026",
    type: "Monthly",
  };

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

 

  const rawData = useMemo(() => [
    { date: "2026-01-01", tenant: "Tenant A", center: "Gurgaon", tested: 40, pending: 200 },
    { date: "2026-02-01", tenant: "Tenant A", center: "Noida", tested: 110, pending: 300 },
    { date: "2026-03-01", tenant: "Tenant B", center: "Gurgaon", tested: 150, pending: 400 },
    { date: "2026-04-01", tenant: "Tenant A", center: "Noida", tested: 380, pending: 3000 },
    { date: "2026-04-05", tenant: "Tenant B", center: "Noida", tested: 120, pending: 500 },
  ], []);

  

  const filteredData = useMemo(() => {
    let data = [...rawData];

    if (appliedFilters.tenant !== "All") {
      data = data.filter(d => d.tenant === appliedFilters.tenant);
    }

    if (appliedFilters.center !== "All") {
      data = data.filter(d => d.center === appliedFilters.center);
    }

    if (appliedFilters.year) {
      data = data.filter(d => d.date.startsWith(appliedFilters.year));
    }

    if (appliedFilters.from) {
      data = data.filter(d => new Date(d.date) >= new Date(appliedFilters.from));
    }

    if (appliedFilters.to) {
      data = data.filter(d => new Date(d.date) <= new Date(appliedFilters.to));
    }

    return data;
  }, [appliedFilters, rawData]);


  const chartData = useMemo(() => {
    const grouped = {};

    filteredData.forEach(d => {
      const key =
        appliedFilters.type === "Yearly"
          ? d.date.substring(0, 4)
          : new Date(d.date).toLocaleString("default", { month: "short" });

      if (!grouped[key]) {
        grouped[key] = { label: key, tested: 0, pending: 0 };
      }

      grouped[key].tested += d.tested;
      grouped[key].pending += d.pending;
    });

    return Object.values(grouped);
  }, [filteredData, appliedFilters.type]);

  

  const stats = useMemo(() => {
    const total = filteredData.reduce((a, c) => a + c.tested + c.pending, 0);
    const tested = filteredData.reduce((a, c) => a + c.tested, 0);
    const pending = filteredData.reduce((a, c) => a + c.pending, 0);

    const todayTested =
      filteredData.filter(d => d.date === today)
        .reduce((a, c) => a + c.tested, 0);

    const coverage =
      total > 0 ? ((tested / total) * 100).toFixed(1) + "%" : "0%";

    return { total, tested, pending, todayTested, coverage };
  }, [filteredData, today]);


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleApply = () => setAppliedFilters(filters);

  const handleReset = () => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };


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

      
      <div className="bg-emerald-50 border rounded-xl p-4">

        <div className="grid grid-cols-4 gap-4 mb-3">
          <Select label="Tenant" name="tenant" value={filters.tenant} onChange={handleChange} options={tenants} />
          <Select label="Center" name="center" value={filters.center} onChange={handleChange} options={centers} />
          <Input label="From Date" type="date" name="from" max={today} value={filters.from} onChange={handleChange} />
          <Input label="To Date" type="date" name="to" max={today} value={filters.to} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-4 gap-4 items-end">
          <Select label="Year" name="year" value={filters.year} onChange={handleChange} options={years} />
          <Select label="View Type" name="type" value={filters.type} onChange={handleChange} options={["Monthly", "Yearly"]} />

          <div className="col-span-2 flex justify-end gap-2">
            <button onClick={handleReset} className="px-4 py-2 border rounded-lg">
              Reset
            </button>
            <button onClick={handleApply} className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
              Apply
            </button>
          </div>
        </div>

      </div>

  
      <div className="grid grid-cols-5 gap-4">
        <Card title="Total" value={stats.total} />
        <Card title="Tested" value={stats.tested} color="text-green-600" />
        <Card title="Pending" value={stats.pending} color="text-red-500" />
        <Card title="Coverage" value={stats.coverage} />
        <Card title="Today" value={stats.todayTested} />
      </div>

      
      {chartData.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          No data found for selected filters
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">

          <ChartCard title="Testing Trend">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line dataKey="tested" stroke="#059669" />
            </LineChart>
          </ChartCard>

          <ChartCard title="Tested vs Pending">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tested" fill="#059669" />
              <Bar dataKey="pending" fill="#ef4444" />
            </BarChart>
          </ChartCard>

        </div>
      )}

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

const Card = ({ title, value, color }) => (
  <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-lg shadow text-center">
    <p className="text-xs text-gray-500">{title}</p>
    <h2 className={`text-lg font-bold ${color || ""}`}>{value}</h2>
  </motion.div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white p-4 rounded-xl shadow">
    <h3 className="text-sm font-semibold mb-2">{title}</h3>
    <ResponsiveContainer width="100%" height={200}>
      {children}
    </ResponsiveContainer>
  </div>
);

export default Dashboard;