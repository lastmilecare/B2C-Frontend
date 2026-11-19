import {
  DashboardCard,
  BarChartPanel,
  TrendLineChart,
  PieChartPanel,
  DataTableSimple,
  CHART_PALETTE,
} from "../utils/client-dashboard";

function series(names) {
  return names.map((name, index) => ({
    key: name,
    name,
    color: CHART_PALETTE[index % CHART_PALETTE.length],
  }));
}

export function MhcuOverviewPanel({ view, KpiRow }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardCard title="Visits trend">
          <TrendLineChart
            data={view.visitTrend}
            series={[
              { key: "visits", name: "Visits", color: "#2563eb" },
              { key: "newPatients", name: "New patients", color: "#059669" },
            ]}
            yLabel="Count"
            xLabel="Month"
            height={320}
          />
        </DashboardCard>
        <DashboardCard title="Top villages by visits">
          <BarChartPanel
            data={view.topVillages.map((row) => ({ label: row.name, value: row.visits }))}
            layout="vertical"
            categoryWidth={140}
            xLabel="Visits"
            height={Math.max(280, view.topVillages.length * 32)}
            dataKeys={[{ key: "value", name: "Visits", color: "#7c3aed" }]}
          />
        </DashboardCard>
      </div>
    </div>
  );
}

export function MhcuRiskPanel({ view, KpiRow }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardCard title="Patients by risk zone">
          <PieChartPanel data={view.byZone} height={320} />
        </DashboardCard>
        <DashboardCard title="Risk zone by vital test">
          <BarChartPanel
            data={view.byTest}
            xKey="test"
            dataKeys={series(view.zoneKeys)}
            stacked
            layout="horizontal"
            xLabel="Test"
            yLabel="Patients"
            height={340}
          />
        </DashboardCard>
      </div>
    </div>
  );
}

export function MhcuVillageScorecardPanel({ view }) {
  return (
    <DashboardCard title="Village scorecard" noPadding>
      <DataTableSimple
        columns={[
          { name: "Village", selector: (row) => row.village, sortable: true, grow: 2 },
          { name: "OPD", selector: (row) => row.opd, sortable: true, right: true },
          { name: "Home visits", selector: (row) => row.homeVisits, sortable: true, right: true },
          { name: "Referrals", selector: (row) => row.referrals, sortable: true, right: true },
          { name: "Awareness", selector: (row) => row.awareness, sortable: true, right: true },
          { name: "Avg feedback", selector: (row) => row.feedbackScore, sortable: true, right: true },
        ]}
        data={view.rows}
      />
    </DashboardCard>
  );
}

export function MhcuMedicinesPanel({ view, KpiRow }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <DashboardCard title="Medicine consumption trend">
        <TrendLineChart data={view.trend} yLabel="Dispensings" xLabel="Month" height={320} />
      </DashboardCard>
      <DashboardCard title="Top medicines dispensed">
        <BarChartPanel
          data={view.topMedicines}
          layout="vertical"
          categoryWidth={160}
          xLabel="Quantity"
          height={Math.max(260, view.topMedicines.length * 40)}
          dataKeys={[{ key: "value", name: "Quantity", color: "#0891b2" }]}
        />
      </DashboardCard>
    </div>
  );
}

export function MhcuInventoryPanel({ view, KpiRow }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <DashboardCard title="Stock summary" noPadding>
        <DataTableSimple
          columns={[
            { name: "Medicine", selector: (row) => row.medicine, sortable: true, grow: 2 },
            { name: "Batch", selector: (row) => row.batch, sortable: true },
            { name: "Closing qty", selector: (row) => row.closing, sortable: true, right: true },
            { name: "Expiry", selector: (row) => row.expiry, sortable: true },
            { name: "Status", selector: (row) => row.status, sortable: true },
          ]}
          data={view.rows}
        />
      </DashboardCard>
    </div>
  );
}

export function MhcuHomeCarePanel({ view, KpiRow }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <DashboardCard title="Home visits by month">
        <TrendLineChart data={view.trend} yLabel="Visits" xLabel="Month" height={300} />
      </DashboardCard>
      <DashboardCard title="Home visits by village">
        <BarChartPanel
          data={view.byVillage.map((row) => ({ label: row.name, value: row.value }))}
          layout="vertical"
          categoryWidth={140}
          xLabel="Visits"
          height={Math.max(300, view.byVillage.length * 28)}
          dataKeys={[{ key: "value", name: "Visits", color: "#db2777" }]}
        />
      </DashboardCard>
    </div>
  );
}

export function MhcuTablePanel({ view, KpiRow, title }) {
  const columns = Object.keys(view.rows[0] || {}).map((key) => ({
    name: key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
    selector: (row) => row[key],
    sortable: true,
    grow: key === "reason" || key === "referredTo" ? 2 : 1,
  }));
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <DashboardCard title={title} noPadding>
        <DataTableSimple columns={columns} data={view.rows} />
      </DashboardCard>
    </div>
  );
}

export function MhcuSchemesPanel({ view, KpiRow }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardCard title="Beneficiaries by scheme">
          <PieChartPanel data={view.slices} height={320} />
        </DashboardCard>
        <DashboardCard title="Linkage status by scheme">
          <BarChartPanel
            data={view.statusBars}
            dataKeys={[
              { key: "awareness", name: "Awareness", color: "#94a3b8" },
              { key: "registered", name: "Registered", color: "#2563eb" },
              { key: "cardReceived", name: "Card received", color: "#059669" },
            ]}
            stacked
            layout="horizontal"
            xLabel="Scheme"
            yLabel="Patients"
            height={280}
          />
        </DashboardCard>
      </div>
    </div>
  );
}

export function MhcuAwarenessPanel({ view, KpiRow }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <DashboardCard title="Awareness sessions" noPadding>
        <DataTableSimple
          columns={[
            { name: "Date", selector: (row) => row.date, sortable: true },
            { name: "Village", selector: (row) => row.village, sortable: true },
            { name: "Topic", selector: (row) => row.topic, sortable: true, grow: 2 },
            { name: "Male", selector: (row) => row.participantsMale, sortable: true, right: true },
            { name: "Female", selector: (row) => row.participantsFemale, sortable: true, right: true },
          ]}
          data={view.rows}
        />
      </DashboardCard>
    </div>
  );
}

export function MhcuConcernPanel({ view, KpiRow }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <DashboardCard title="Concern case register" noPadding>
        <DataTableSimple
          columns={[
            { name: "Patient ID", selector: (row) => row.patientId, sortable: true },
            { name: "Village", selector: (row) => row.village, sortable: true },
            { name: "Tier", selector: (row) => row.tier, sortable: true },
            { name: "Key vitals", selector: (row) => row.snapshot, sortable: true, grow: 2 },
            { name: "Last visit", selector: (row) => row.lastVisit, sortable: true },
            { name: "Follow-up", selector: (row) => row.followUp, sortable: true },
          ]}
          data={view.rows}
        />
      </DashboardCard>
    </div>
  );
}