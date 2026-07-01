import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cookie } from "../utils/cookie";
import { useGetPatientsQuery } from "../redux/apiSlice";
import "chart.js/auto"; // registers ALL controllers — fixes "not a registered controller"
import { Chart } from "chart.js";

// ─── Hospital theme palette ────────────────────────────────────────────────
const T = {
  emerald:     "#059669",
  emeraldMd:   "#10b981",
  emeraldLt:   "#6ee7b7",
  teal:        "#0d9488",
  tealLt:      "#5eead4",
  sky:         "#0ea5e9",
  indigo:      "#4f46e5",
  amber:       "#d97706",
  rose:        "#e11d48",
  slatemd:     "#64748b",
  emeraldFill: "rgba(5,150,105,0.12)",
  tealFill:    "rgba(13,148,136,0.10)",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

// ─── Static Data ──────────────────────────────────────────────────────────
const OPD_DATA = {
  All:  { new: [42,55,68,75,88,96], fu: [30,38,50,60,72,84] },
  XYZ:  { new: [18,24,32,38,44,52], fu: [12,16,22,28,34,40] },
  TTT:  { new: [10,14,18,22,26,28], fu: [8,10,14,18,22,26]  },
  IIIS: { new: [8,12,14,20,24,28],  fu: [6,9,11,16,18,22]   },
  VAX:  { new: [6,9,12,15,18,22],   fu: [4,6,8,12,14,18]    },
};

const WORKERS_DATA = {
  All:  [120,145,168,182,205,224],
  XYZ:  [45,55,64,70,82,90],
  TTT:  [28,34,40,44,50,54],
  IIIS: [22,28,34,38,44,48],
  VAX:  [18,22,28,32,36,40],
};

const TESTS_DATA = {
  All:  { labels:["CBC","X-Ray","ECG","MRI","LFT","RFT"], data:[340,280,210,160,130,95] },
  XYZ:  { labels:["CBC","X-Ray","ECG","MRI","LFT","RFT"], data:[140,110,82,60,50,36]   },
  TTT:  { labels:["ECG","CBC","X-Ray","MRI","LFT","RFT"], data:[95,80,70,45,35,28]     },
  IIIS: { labels:["CBC","LFT","X-Ray","ECG","RFT","MRI"], data:[88,62,60,55,40,32]     },
  VAX:  { labels:["X-Ray","CBC","ECG","LFT","MRI","RFT"], data:[72,60,52,38,28,20]     },
};

const COMPLAINTS_DATA = {
  All:  { labels:["Fever","Back pain","Cough","Fatigue","Headache","Injury","Other"], data:[22,18,15,14,12,10,9] },
  XYZ:  { labels:["Back pain","Fever","Cough","Fatigue","Headache","Injury","Other"], data:[20,18,14,13,12,9,8]  },
  TTT:  { labels:["Fever","Cough","Back pain","Headache","Fatigue","Injury","Other"], data:[24,20,16,12,11,9,8]  },
  IIIS: { labels:["Fatigue","Fever","Headache","Back pain","Cough","Injury","Other"], data:[22,19,15,14,12,9,9]  },
  VAX:  { labels:["Injury","Back pain","Fever","Fatigue","Cough","Headache","Other"], data:[26,20,16,14,12,8,4]  },
};

const COMPLAINT_COLORS = [T.emerald,T.teal,T.sky,T.indigo,T.amber,T.rose,T.slatemd];
const TEST_COLORS      = [T.emerald,T.teal,T.sky,T.indigo,T.amber,T.rose];

// ─── Legend ───────────────────────────────────────────────────────────────
const ChartLegend = ({ items }) => (
  <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:8 }}>
    {items.map(({ color, label }) => (
      <span key={label} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#64748b" }}>
        <span style={{ background:color, width:10, height:10, borderRadius:2, display:"inline-block", flexShrink:0 }} />
        {label}
      </span>
    ))}
  </div>
);

// ─── Safe chart hook — fixes "canvas already in use" ──────────────────────
// Stores the Chart instance in a ref so cleanup always destroys the right one.
function useChart(canvasRef, buildConfig, deps) {
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy any previous instance on this canvas before creating a new one
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");
    chartInstanceRef.current = new Chart(ctx, buildConfig());

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── Chart 1: OPD — stacked area line ─────────────────────────────────────
const OpdChart = ({ center }) => {
  const ref = useRef(null);
  useChart(ref, () => {
    const d = OPD_DATA[center];
    return {
      type: "line",
      data: {
        labels: MONTHS,
        datasets: [
          {
            label: "New patients",
            data: d.new,
            borderColor: T.emerald,
            backgroundColor: T.emeraldFill,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: T.emerald,
            pointBorderColor: "#fff",
            pointBorderWidth: 1.5,
            borderWidth: 2,
          },
          {
            label: "Follow-up",
            data: d.fu,
            borderColor: T.teal,
            backgroundColor: T.tealFill,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: T.teal,
            pointBorderColor: "#fff",
            pointBorderWidth: 1.5,
            borderWidth: 2,
            borderDash: [5, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
        },
        scales: {
          x: { ticks:{color:"#94a3b8",font:{size:11}}, grid:{color:"#e2e8f0"}, border:{display:false} },
          y: { ticks:{color:"#94a3b8",font:{size:11}}, grid:{color:"#e2e8f0"}, border:{display:false}, beginAtZero:true },
        },
      },
    };
  }, [center]);

  return (
    <div>
      <div style={{ position:"relative", height:200 }}>
        <canvas ref={ref} role="img" aria-label="OPD new vs follow-up patient trend" />
      </div>
      <ChartLegend items={[{ color:T.emerald, label:"New patients" }, { color:T.teal, label:"Follow-up" }]} />
    </div>
  );
};

// ─── Chart 2: Workers Visited — gradient bars ──────────────────────────────
const WorkersChart = ({ center }) => {
  const ref = useRef(null);
  useChart(ref, () => {
    const vals = WORKERS_DATA[center];
    const max  = Math.max(...vals);
    const bgColors = vals.map((v) => {
      const ratio = v / max;
      const r = Math.round(110 - (110 - 5)   * ratio);
      const g = Math.round(231 - (231 - 150)  * ratio);
      const b = Math.round(183 - (183 - 105)  * ratio);
      return `rgba(${r},${g},${b},0.88)`;
    });
    return {
      type: "bar",
      data: {
        labels: MONTHS,
        datasets: [{
          label: "Workers visited",
          data: vals,
          backgroundColor: bgColors,
          borderColor: T.emerald,
          borderWidth: 0.5,
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y} workers` } },
        },
        scales: {
          x: { ticks:{color:"#94a3b8",font:{size:11}}, grid:{display:false}, border:{display:false} },
          y: { ticks:{color:"#94a3b8",font:{size:11}}, grid:{color:"#e2e8f0"}, border:{display:false}, beginAtZero:true },
        },
      },
    };
  }, [center]);

  return (
    <div>
      <div style={{ position:"relative", height:200 }}>
        <canvas ref={ref} role="img" aria-label="Monthly worker visit count" />
      </div>
      <ChartLegend items={[{ color:T.emeraldMd, label:"Workers visited" }]} />
    </div>
  );
};

// ─── Chart 3: Tests — horizontal bar ──────────────────────────────────────
const TestsChart = ({ center }) => {
  const ref = useRef(null);
  useChart(ref, () => {
    const d = TESTS_DATA[center];
    return {
      type: "bar",
      data: {
        labels: d.labels,
        datasets: [{
          label: "Tests conducted",
          data: d.data,
          backgroundColor: TEST_COLORS.map((c) => c + "cc"),
          borderColor: TEST_COLORS,
          borderWidth: 0.5,
          borderRadius: 4,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.x} tests` } },
        },
        scales: {
          x: { ticks:{color:"#94a3b8",font:{size:11}}, grid:{color:"#e2e8f0"}, border:{display:false}, beginAtZero:true },
          y: { ticks:{color:"#334155",font:{size:11}}, grid:{display:false}, border:{display:false} },
        },
      },
    };
  }, [center]);

  const d = TESTS_DATA[center];
  return (
    <div>
      <div style={{ position:"relative", height:220 }}>
        <canvas ref={ref} role="img" aria-label="Most frequently conducted tests" />
      </div>
      <ChartLegend items={d.labels.map((lbl, i) => ({ color:TEST_COLORS[i], label:lbl }))} />
    </div>
  );
};

// ─── Chart 4: Chief Complaints — donut ────────────────────────────────────
const ComplaintsChart = ({ center }) => {
  const ref = useRef(null);
  const d   = COMPLAINTS_DATA[center];
  useChart(ref, () => ({
    type: "doughnut",
    data: {
      labels: d.labels,
      datasets: [{
        data: d.data,
        backgroundColor: COMPLAINT_COLORS.map((c) => c + "dd"),
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } },
      },
    },
  }), [center]);

  return (
    <div style={{ display:"flex", gap:16, alignItems:"center" }}>
      <div style={{ position:"relative", height:200, width:200, flexShrink:0 }}>
        <canvas ref={ref} role="img" aria-label="Chief complaints donut chart" />
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {d.labels.map((lbl, i) => (
          <span key={lbl} style={{ display:"flex", alignItems:"center", gap:8, fontSize:11, color:"#475569" }}>
            <span style={{ background:COMPLAINT_COLORS[i], width:10, height:10, borderRadius:2, display:"inline-block", flexShrink:0 }} />
            {lbl}
            <span style={{ color:"#94a3b8", marginLeft:"auto", paddingLeft:12 }}>{d.data[i]}%</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────
const Dashboard = () => {
  const username = cookie?.get?.("username") || "Admin";
  const role     = cookie?.get?.("role")     || "N/A";

  const centerType = "PARENT"; // cookie?.get?.("centerType") || "PARENT"
  const userCenter = "XYZ";   // cookie?.get?.("centerName") || "XYZ"

  const { data: patientData } = useGetPatientsQuery({ page: 1, limit: 100 });
  const patients      = patientData?.data || [];
  const today         = new Date().toDateString();
  const todayPatients = patients.filter(
    (p) => new Date(p.createdAt).toDateString() === today
  ).length;

  const [selectedCenter, setSelectedCenter] = useState("All");
  const activeCenter = centerType === "PARENT" ? selectedCenter : userCenter;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-emerald-600 text-white p-6 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold">Welcome back, {username} ({role}) 👋</h2>
          <p className="text-sm opacity-80">Healthcare Dashboard</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
        {[
          { label: "Today's Worker Registrations",  value: todayPatients },
          { label: "OPD Health Checkup",             value: todayPatients },
          { label: "Today's Worker Health Checkup",  value: todayPatients },
          { label: "Today's Doctor Assessment",      value: todayPatients },
        ].map(({ label, value }, i) => (
          <motion.div
            key={i}
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ scale: 1.03 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-6 shadow-sm"
          >
            <p className="text-sm">{label}</p>
            <h2 className="text-3xl font-bold mt-1">{value}</h2>
          </motion.div>
        ))}
      </div>

      {/* Center Filter */}
      {centerType === "PARENT" && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500 font-medium">Filter by center:</label>
          <select
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="border border-emerald-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700"
          >
            <option value="All">All Centers</option>
            <option value="XYZ">XYZ Center</option>
            <option value="TTT">TTT Center</option>
            <option value="IIIS">IIIS Center</option>
            <option value="VAX">VAX Center</option>
          </select>
        </div>
      )}

      {/* 4 Charts */}
      <div className="grid grid-cols-2 gap-6">

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.10}}
          className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5">
          <h3 className="text-base font-semibold text-slate-700">OPD Data Analysis</h3>
          <p className="text-xs text-slate-400 mb-3">New vs follow-up patients — last 6 months</p>
          <OpdChart center={activeCenter} />
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.18}}
          className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5">
          <h3 className="text-base font-semibold text-slate-700">Workers Visited</h3>
          <p className="text-xs text-slate-400 mb-3">Monthly footfall — last 6 months</p>
          <WorkersChart center={activeCenter} />
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.26}}
          className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5">
          <h3 className="text-base font-semibold text-slate-700">Most Conducted Tests</h3>
          <p className="text-xs text-slate-400 mb-3">Lab & radiology — last 6 months</p>
          <TestsChart center={activeCenter} />
        </motion.div>

        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.34}}
          className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5">
          <h3 className="text-base font-semibold text-slate-700">Chief Complaints</h3>
          <p className="text-xs text-slate-400 mb-3">Most common presenting complaints — last 6 months</p>
          <ComplaintsChart center={activeCenter} />
        </motion.div>

      </div>
    </div>
  );
};

export default Dashboard;
