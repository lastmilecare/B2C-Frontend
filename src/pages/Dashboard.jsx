"use client";
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, Navigate } from "react-router-dom";
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
  useGetPatientsTrendQuery,
  useGetOpdBillingCountQuery,
  useGetAmbulanceServicesQuery,
} from "../redux/apiSlice";
import { Tabs, TabsList, TabsTrigger } from "../components/ui-chart/tabs";
import { cookie } from "../utils/cookie";
import { useSelector } from "react-redux";
import { getDashboardData } from "../lib/ohc-data";
import { ChartLegend, ChartCard } from "../components/chart-ui";
import {
  barChartOptions,
  doughnutChartOptions,
  gradientBarColors,
  lineChartOptions,
  OHC_THEME,
} from "../lib/chart-config";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Bar as RechartsBar,
  Line as RechartsLine,
} from "recharts";
import { getOpdDashboardData } from "../utils/dashboard/opdTransformer";
import { getPatientDashboardData } from "../utils/dashboard/patientTransformer";

import {
  getPrescriptionDashboardData,
  getChiefComplaintsData,
} from "../utils/dashboard/prescriptionTransformer";
import { getCareFlowDashboardData } from "../utils/dashboard/careFlowTransformer";
import { Bar, Doughnut, Line } from "react-chartjs-2";

const AppDashboard = () => {
  const [period, setPeriod] = useState("month");
  const [center, setCenter] = useState("All");
  const navigate = useNavigate();

  const { permissions } = useSelector((state) => state.auth);

  const can = (permission) => {
    if (!permission) return true;

    return permissions?.includes(permission) ?? false;
  };

  const getDisabledClass = (permission) =>
    can(permission) ? "" : "opacity-50 cursor-not-allowed pointer-events-none";

  const { data: patientData } = useGetPatientsQuery({
    page: 1,
    limit: 3000,
  });

  const { data: opdData } = useGetOpdBillingQuery({
    page: 1,
    limit: 3000,
  });

  const { data: prescriptionData } = useGetPrescriptionsListQuery({
    page: 1,
    limit: 3000,
  });

  const { data: lowStockData, isLoading: stockLoading } =
    useGetLowStockItemsQuery();
  const { data: patientTrendData } = useGetPatientsTrendQuery();

  const patients = patientData?.data || [];
  const opd = opdData?.data || [];
  const prescriptions = prescriptionData?.data || [];

  const today = new Date().toDateString();

  const todayPatients = patients.filter(
    (p) => new Date(p.createdAt).toDateString() === today,
  ).length;

  const todayOpdCount = new Set(
    opd
      .filter((o) => new Date(o.AddedDate).toDateString() === today)
      .map((o) => o.uhid)
      .filter(Boolean),
  ).size;

  const todayPrescriptionCount = new Set(
    prescriptions
      .filter((o) => new Date(o.addedDate).toDateString() === today)
      .map((o) => o.picasoId)
      .filter(Boolean),
  ).size;

  /* =========================================================
     USER / TENANT
  ========================================================= */

  const recentPatients = patients.slice(0, 10);

  const username = cookie.get("name") || "User";
  const role = cookie.get("role") || "N/A";

  const tenantId = cookie.get("tenantId") || "N/A";

  const tenantName =
    tenantId == 1
      ? "Honda"
      : tenantId == 2
        ? "AMP"
        : tenantId == 3
          ? "M3M"
          : "";
  const showGraph =
    role === "LMC_ADMIN" || role === "CENTER_ADMIN" || role === "STAFF";
  /* =========================================================
     LOW STOCK PAGINATION
  ========================================================= */

  const lowStockItems = lowStockData?.data || [];

  const [page, setPage] = useState(1);

  const itemsPerPage = 5;

  const startIndex = (page - 1) * itemsPerPage;

  const paginatedItems = lowStockItems.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  /* =========================================================
     MODULES
  ========================================================= */

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

  const {
    data: opdBillingCountData,
    isLoading: opdBillingCountLoading,
    isFetching: opdBillingCountFetching,
  } = useGetOpdBillingCountQuery();

  const { data: ambulanceData, isLoading: ambulanceLoading } =
    useGetAmbulanceServicesQuery({ page: 1, limit: 10000 });
  const patientDashboard = useMemo(
    () => getPatientDashboardData(patientData, period),
    [patientData, period],
  );

  const opdDashboard = useMemo(
    () => getOpdDashboardData(opdBillingCountData, period),
    [opdBillingCountData, period],
  );
  const prescriptionDashboard = useMemo(
    () => getPrescriptionDashboardData(prescriptionData, period),
    [prescriptionData, period],
  );
  const careFlow = useMemo(
    () =>
      getCareFlowDashboardData({
        patientData,
        opdData: opdBillingCountData,
        prescriptionData,
        period,
      }),
    [patientData, opdBillingCountData, prescriptionData, period],
  );
  const chiefComplaints = useMemo(
    () => getChiefComplaintsData(prescriptionData),
    [prescriptionData],
  );
  const data = useMemo(
    () =>
      getDashboardData(
        period,
        center,
        patientDashboard,
        opdDashboard,
        prescriptionDashboard,
        chiefComplaints,
      ),
    [
      period,
      center,
      patientDashboard,
      opdDashboard,
      prescriptionDashboard,
      chiefComplaints,
    ],
  );
  const opdChart = {
    labels: careFlow.labels,
    datasets: [
      {
        label: "New patients",
        data: data.opd.newPatients,
        borderColor: OHC_THEME.emerald,
        backgroundColor: OHC_THEME.emeraldFill,
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: OHC_THEME.emerald,
        pointBorderColor: "#fff",
        pointBorderWidth: 1.5,
        borderWidth: 2.5,
      },
      {
        label: "Follow-up",
        data: data.opd.followUp,
        borderColor: OHC_THEME.teal,
        backgroundColor: OHC_THEME.tealFill,
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: OHC_THEME.teal,
        pointBorderColor: "#fff",
        pointBorderWidth: 1.5,
        borderWidth: 2.5,
        borderDash: [6, 4],
      },
    ],
  };

  const workersChart = {
    labels: careFlow.labels,
    datasets: [
      {
        label: "Workers visited",
        data: data.workersVisited,
        backgroundColor: gradientBarColors(data.workersVisited),
        borderColor: OHC_THEME.emerald,
        borderWidth: 0.5,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const careFlowChart = {
    labels: careFlow.labels,
    datasets: [
      {
        label: "Registration",
        data: careFlow.registrations,
        backgroundColor: OHC_THEME.emerald + "cc",
        borderColor: OHC_THEME.emerald,
        borderWidth: 0.5,
        borderRadius: 4,
      },
      {
        label: "OPD visit",
        data: careFlow.opdVisits,
        backgroundColor: OHC_THEME.teal + "cc",
        borderColor: OHC_THEME.teal,
        borderWidth: 0.5,
        borderRadius: 4,
      },
      {
        label: "Prescription",
        data: careFlow.prescriptions,
        backgroundColor: OHC_THEME.sky + "cc",
        borderColor: OHC_THEME.sky,
        borderWidth: 0.5,
        borderRadius: 4,
      },
    ],
  };

  const careFlowOptions = {
    ...barChartOptions(false, "cases"),
    plugins: {
      ...barChartOptions(false, "cases").plugins,
      legend: { display: false },
      tooltip: {
        ...barChartOptions(false, "cases").plugins?.tooltip,
        mode: "index",
      },
    },
    scales: {
      x: {
        ...barChartOptions().scales?.x,
        stacked: false,
        grid: { display: false },
      },
      y: {
        ...barChartOptions().scales?.y,
        stacked: false,
      },
    },
  };

  const prescriptionChart = {
    labels: prescriptionDashboard?.trend?.labels ?? [],
    datasets: [
      {
        label: "Prescriptions",
        data: prescriptionDashboard?.trend?.counts ?? [],
        borderColor: OHC_THEME.indigo,
        backgroundColor: "rgba(79,70,229,0.12)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        borderWidth: 2.5,
      },
    ],
  };

  const complaintColors = [
    OHC_THEME.emerald, // Fever
    OHC_THEME.teal, // Cough
    OHC_THEME.sky, // Headache
    OHC_THEME.indigo, // Fatigue
    OHC_THEME.amber, // Vomiting
    OHC_THEME.rose, // Nausea
    OHC_THEME.slate, // Abdominal Pain
    OHC_THEME.emerald, // Back Pain
    OHC_THEME.teal, // Chest Pain
    OHC_THEME.sky, // Injury
    OHC_THEME.indigo, // Diarrhea
    OHC_THEME.slate, // Other
  ];

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
            Welcome back, {username} ({`${role} of ${tenantName}`}) 👋
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
        {modules.map((m) => (
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
              {m.items.map((item) => (
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
          <p className="text-sm">Today's New Registered Patients</p>

          <h2 className="text-3xl font-bold">
            {can("read:patient_list") ? todayPatients : "--"}
          </h2>
        </motion.div>

        {/* Today's OPD */}

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
          <p className="text-sm">Today's total Unique OPD</p>

          <h2 className="text-3xl font-bold">
            {can("read:opd_list") ? todayOpdCount : "--"}
          </h2>
        </motion.div>

        {/* Low Stock */}

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

        {/* Today's Prescription */}

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
          <p className="text-sm">Today's total Unique Prescription</p>

          <h2 className="text-3xl font-bold">
            {can("read:prescription_list") ? todayPrescriptionCount : "--"}
          </h2>
        </motion.div>
      </div>
      {showGraph && (
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="bg-emerald-700/60 text-white">
              <TabsTrigger
                value="day"
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-700"
              >
                Day
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-700"
              >
                Month
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="data-[state=active]:bg-white data-[state=active]:text-emerald-700"
              >
                Year
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Patient Trend */}
        {showGraph && (
          <div className="bg-white/70 backdrop-blur-lg shadow rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-semibold text-gray-800 text-lg">
                  Patient Registration Trend
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  New patients registered by financial category
                </p>
              </div>

              <div className="text-sm text-gray-500">
                Last 7 Days (above mentioned filters not applied on this)
              </div>
            </div>

            <div className="w-full h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={patientTrendData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />

                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />

                  <RechartsTooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) {
                        return null;
                      }

                      const data = payload[0]?.payload;

                      return (
                        <div className="bg-white border border-gray-200 shadow-lg rounded-lg p-3 text-sm">
                          <p className="font-semibold text-gray-800 mb-2">
                            {label}
                          </p>

                          {/* Category */}
                          <div className="space-y-1">
                            <p>
                              <span className="text-emerald-600 font-medium">
                                APL:
                              </span>{" "}
                              {data?.APL ?? 0}
                            </p>

                            <p>
                              <span className="text-amber-500 font-medium">
                                BPL:
                              </span>{" "}
                              {data?.BPL ?? 0}
                            </p>

                            <p>
                              <span className="text-blue-600 font-medium">
                                Total:
                              </span>{" "}
                              {data?.Total ?? 0}
                            </p>
                          </div>

                          {/* Gender */}
                          <div className="border-t border-gray-200 mt-2 pt-2">
                            <p className="font-medium text-gray-700 mb-1">
                              Gender
                            </p>

                            <p>Male: {data?.Male ?? 0}</p>

                            <p>Female: {data?.Female ?? 0}</p>

                            <p>Other: {data?.Other ?? 0}</p>
                          </div>
                        </div>
                      );
                    }}
                  />

                  <RechartsLegend />

                  {/* APL */}
                  <RechartsBar
                    dataKey="APL"
                    name="APL Patients"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />

                  {/* BPL */}
                  <RechartsBar
                    dataKey="BPL"
                    name="BPL Patients"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />

                  {/* TOTAL */}
                  <RechartsLine
                    type="monotone"
                    dataKey="Total"
                    name="Total Patients"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {showGraph && (
          <ChartCard
            title="Patients Visited"
            subtitle="Footfall volume — vertical bars for precise count comparison"
          >
            <div className="h-[220px]">
              <Bar
                data={workersChart}
                options={barChartOptions(false, "workers")}
              />
            </div>
            <ChartLegend
              items={[{ color: OHC_THEME.emeraldMd, label: "Workers visited" }]}
            />
          </ChartCard>
        )}
        {showGraph && (
          <ChartCard
            title="Care Flow Pipeline"
            subtitle="Registration → OPD → Prescription per period bucket (ideal for client EOD/ EOM review)"
          >
            <div className="h-[260px]">
              <Bar data={careFlowChart} options={careFlowOptions} />
            </div>
            <ChartLegend
              items={[
                { color: OHC_THEME.emerald, label: "Worker registration" },
                { color: OHC_THEME.teal, label: "OPD visit" },
                { color: OHC_THEME.sky, label: "Prescription issued" },
              ]}
            />
          </ChartCard>
        )}
        {showGraph && (
          <ChartCard
            title="OPD Data Analysis"
            subtitle="New vs follow-up patients — line chart for trend clarity"
          >
            <div className="h-[220px]">
              <Line data={opdChart} options={lineChartOptions("Patients")} />
            </div>
            <ChartLegend
              items={[
                { color: OHC_THEME.emerald, label: "New patients" },
                { color: OHC_THEME.teal, label: "Follow-up" },
              ]}
            />
          </ChartCard>
        )}
        {showGraph && (
          <ChartCard
            title="Prescriptions Trend"
            subtitle="Issued after doctor assessment in OPD flow"
          >
            <div className="h-[220px]">
              <Line
                data={prescriptionChart}
                options={lineChartOptions("Prescriptions")}
              />
            </div>
            <ChartLegend
              items={[
                { color: OHC_THEME.indigo, label: "Prescriptions issued" },
              ]}
            />
          </ChartCard>
        )}
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

        {/* =====================================================
            LOW STOCK MEDICINES
        ====================================================== */}

        {/* <div
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
        </div> */}
      </div>
    </motion.div>
  );
};

export default AppDashboard;
