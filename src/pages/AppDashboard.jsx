"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Ambulance,
  ClipboardList,
  FileCheck2,
  Pill,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Badge } from "../components/ui-chart/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui-chart/select";
import { Tabs, TabsList, TabsTrigger } from "../components/ui-chart/tabs";
import { ChartLegend, ChartCard } from "../components/chart-ui";
import {
  barChartOptions,
  doughnutChartOptions,
  gradientBarColors,
  lineChartOptions,
  OHC_THEME,
} from "../lib/chart-config";
import { formatDelta, getDashboardData } from "../lib/ohc-data";
import { CENTER_OPTIONS } from "../lib/ohc-theme";
import { useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import "../components/chart-registry";
import {
  useGetPatientsQuery,
  useGetOpdBillingCountQuery,
  useGetPrescriptionsListQuery,
  useGetAmbulanceServicesQuery,
} from "../redux/apiSlice";
import { getOpdDashboardData } from "../utils/dashboard/opdTransformer";
import { getPatientDashboardData } from "../utils/dashboard/patientTransformer";
import { cookie } from "../utils/cookie";
const KPI_ICONS = {
  users: Users,
  clipboard: ClipboardList,
  stethoscope: Stethoscope,
  pill: Pill,
  file: FileCheck2,
  ambulance: Ambulance,
  activity: Activity,
};
import {
  getPrescriptionDashboardData,
  getChiefComplaintsData,
} from "../utils/dashboard/prescriptionTransformer";
import { getAmbulanceDashboardData } from "../utils/dashboard/ambulanceTransformer";
import { getCareFlowDashboardData } from "../utils/dashboard/careFlowTransformer";
function KpiCard({ metric, index }) {
  const Icon = KPI_ICONS[metric.icon];
  const delta = formatDelta(metric.value, metric.previous);
  const isUp = metric.value >= metric.previous;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-snug text-emerald-800/80">
          {metric.label}
        </p>
        <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums text-emerald-900">
        {metric.value.toLocaleString()}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <Badge
          variant="outline"
          className={
            isUp
              ? "border-emerald-300 bg-emerald-100 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }
        >
          {isUp ? (
            <TrendingUp className="mr-1 h-3 w-3" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3" />
          )}
          {delta}
        </Badge>
        <span className="text-xs text-slate-400">vs previous period</span>
      </div>
    </motion.div>
  );
}

export const Dashboard = () => {
  const [period, setPeriod] = useState("month");
  const [center, setCenter] = useState("All");

  const { permissions } = useSelector((state) => state.auth);

  const can = (permission) => {
    if (!permission) return true;

    return permissions?.includes(permission) ?? false;
  };
  const {
    data: patientData,
    isLoading: patientsLoading,
    isFetching: patientsFetching,
  } = useGetPatientsQuery({
    page: 1,
    limit: 10000,
  });
  const {
    data: opdBillingCountData,
    isLoading: opdBillingCountLoading,
    isFetching: opdBillingCountFetching,
  } = useGetOpdBillingCountQuery();
  const {
    data: prescriptionData,
    isLoading: prescriptionLoading,
    isFetching: prescriptionFetching,
  } = useGetPrescriptionsListQuery({
    page: 1,
    limit: 10000,
  });
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

  const ambulanceDashboard = useMemo(
    () => getAmbulanceDashboardData(ambulanceData, period),
    [ambulanceData, period],
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
        ambulanceDashboard,
        chiefComplaints,
      ),
    [
      period,
      center,
      patientDashboard,
      opdDashboard,
      prescriptionDashboard,
      ambulanceDashboard,
      chiefComplaints,
    ],
  );

  const username = cookie.get("name") || "User";
  const role = cookie.get("role") || "N/A";

  const tenantId = cookie.get("tenantId") || "N/A";
  const tenantName = tenantId == 1 ? "Honda" : "M3M";
  const opdChart = {
    labels: data.labels,
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
    labels: data.labels,
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
    labels: data.labels,
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

  const fitnessChart = {
    labels: data.labels,
    datasets: [
      {
        label: "Fitness certificates",
        data: data.fitnessCertificates,
        backgroundColor: OHC_THEME.amber + "cc",
        borderColor: OHC_THEME.amber,
        borderWidth: 0.5,
        borderRadius: 6,
      },
    ],
  };

  const ambulanceChart = {
    labels: ambulanceDashboard?.trend?.labels ?? [],
    datasets: [
      {
        label: "Ambulance dispatches",
        data: ambulanceDashboard?.trend?.counts ?? [],
        backgroundColor: OHC_THEME.rose + "cc",
        borderColor: OHC_THEME.rose,
        borderWidth: 0.5,
        borderRadius: 6,
      },
    ],
  };

  const testsChart = {
    labels: data.tests.labels,
    datasets: [
      {
        label: "Tests conducted",
        data: data.tests.data,
        backgroundColor: [
          OHC_THEME.emerald,
          OHC_THEME.teal,
          OHC_THEME.sky,
          OHC_THEME.indigo,
          OHC_THEME.amber,
          OHC_THEME.rose,
        ].map((c) => c + "cc"),
        borderColor: [
          OHC_THEME.emerald,
          OHC_THEME.teal,
          OHC_THEME.sky,
          OHC_THEME.indigo,
          OHC_THEME.amber,
          OHC_THEME.rose,
        ],
        borderWidth: 0.5,
        borderRadius: 4,
      },
    ],
  };

  const complaintsChart = {
    labels: chiefComplaints.labels,
    datasets: [
      {
        data: chiefComplaints.values,
        backgroundColor: [
          OHC_THEME.emerald,
          OHC_THEME.teal,
          OHC_THEME.sky,
          OHC_THEME.indigo,
          OHC_THEME.amber,
          OHC_THEME.rose,
          OHC_THEME.slate,
        ].map((c) => c + "dd"),
        borderColor: "#fff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-xl bg-emerald-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">
            Operations Dashboard Welcome back, {username} (
            {`${role} of ${tenantName}`})
          </h1>
          <p className="mt-1 text-sm text-emerald-100">
            Worker Registration → OPD → Prescription · Fitness · Ambulance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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

          {/* center Drop down for future purpose
          <Select value={center} onValueChange={setCenter}>
            <SelectTrigger className="w-[180px] border-emerald-400/40 bg-white/10 text-white [&>span]:text-white">
              <SelectValue placeholder="Center" />
            </SelectTrigger>
            <SelectContent>
              {CENTER_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            */}
        </div>
      </div>

      <p className="text-sm text-slate-500">{data.periodLabel}</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.kpis.map((kpi, i) => (
          <KpiCard key={kpi.label} metric={kpi} index={i} />
        ))}
      </div>

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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

        <ChartCard
          title="Workers Visited"
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
            items={[{ color: OHC_THEME.indigo, label: "Prescriptions issued" }]}
          />
        </ChartCard>
        {/* Labs chart commented for future use */}
        {/* <ChartCard
          title="Most Conducted Tests"
          subtitle="Lab & radiology — horizontal bars for readable test names"
        >
          <div className="h-[240px]">
            <Bar data={testsChart} options={barChartOptions(true, "tests")} />
          </div>
          <ChartLegend
            items={data.tests.labels.map((lbl, i) => ({
              color: [
                OHC_THEME.emerald,
                OHC_THEME.teal,
                OHC_THEME.sky,
                OHC_THEME.indigo,
                OHC_THEME.amber,
                OHC_THEME.rose,
              ][i],
              label: lbl,
            }))}
          />
        </ChartCard> */}

        <ChartCard
          title="Fitness Certificates"
          subtitle="Occupational fitness clearance issued per period"
        >
          <div className="h-[220px]">
            <Bar
              data={fitnessChart}
              options={barChartOptions(false, "certificates")}
            />
          </div>
          <ChartLegend
            items={[{ color: OHC_THEME.amber, label: "Fitness certificates" }]}
          />
        </ChartCard>

        <ChartCard
          title="Ambulance Service"
          subtitle="Emergency dispatches — track volume by day/month/year"
        >
          <div className="h-[220px]">
            <Bar
              data={ambulanceChart}
              options={barChartOptions(false, "dispatches")}
            />
          </div>
          <ChartLegend
            items={[{ color: OHC_THEME.rose, label: "Ambulance dispatches" }]}
          />
        </ChartCard>

        <ChartCard
          title="Chief Complaints"
          subtitle="Most common presenting complaints — donut for proportion at a glance"
          className="lg:col-span-2"
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="h-[220px] w-[220px] shrink-0">
              <Doughnut
                data={complaintsChart}
                options={doughnutChartOptions()}
              />
            </div>
            <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {data.complaints.labels.map((lbl, i) => (
                <div
                  key={lbl}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2 text-slate-600">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{
                        background: [
                          OHC_THEME.emerald,
                          OHC_THEME.teal,
                          OHC_THEME.sky,
                          OHC_THEME.indigo,
                          OHC_THEME.amber,
                          OHC_THEME.rose,
                          OHC_THEME.slate,
                        ][i],
                      }}
                    />
                    {lbl}
                  </span>
                  <span className="font-semibold tabular-nums text-slate-700">
                    {data.complaints.data[i]}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
      {/* 
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h3 className="text-base font-semibold text-slate-800">
          Recommended dashboard layout for OHC
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Executive KPI strip",
              desc: "Top cards with today / this month / this year totals and % change vs previous period.",
            },
            {
              title: "Care flow grouped bars",
              desc: "Registration → OPD → Prescription side-by-side — best for spotting drop-off in your core flow.",
            },
            {
              title: "Trend lines (OPD, Rx)",
              desc: "Line charts for new vs follow-up and prescriptions — easy day/month/year comparison.",
            },
            {
              title: "Volume bars (workers, fitness, ambulance)",
              desc: "Vertical bars with integer ticks — precise counts for client EOD/EOM reports.",
            },
            {
              title: "Distribution (tests, complaints)",
              desc: "Horizontal bars for test names; donut + table for complaint mix percentages.",
            },
            {
              title: "Filters",
              desc: "Day | Month | Year toggle plus center filter for parent vs single-site views.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-white bg-white p-4 shadow-sm"
            >
              <p className="font-medium text-emerald-800">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
