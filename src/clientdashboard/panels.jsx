import { formatCurrency, formatPercent } from "../lib/util";
import {
  KpiCard,
  KpiGrid,
  DashboardCard,
  DonutChart,
  BarChartPanel,
  TrendLineChart,
  SegmentationHeatTable,
  DataTableSimple,
  ChartEmpty,
  CHART_PALETTE,
} from "../utils/client-dashboard";

function series(names) {
  return names.map((name, index) => ({
    key: name,
    name,
    color: CHART_PALETTE[index % CHART_PALETTE.length],
  }));
}

function KpiRow({ items = [] }) {
  if (!items.length) return null;
  return (
    <KpiGrid columns={Math.min(items.length, 5)}>
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </KpiGrid>
  );
}

function RevenuePanel({ view }) {
  const revenueColumns = [
    { name: "Service category", selector: (row) => row.serviceCategory, sortable: true, grow: 2 },
    { name: "2024", selector: (row) => row.y2024, format: (row) => formatCurrency(row.y2024), sortable: true, right: true },
    { name: "2025", selector: (row) => row.y2025, format: (row) => formatCurrency(row.y2025), sortable: true, right: true },
    { name: "2026", selector: (row) => row.y2026, format: (row) => formatCurrency(row.y2026), sortable: true, right: true },
    { name: "Total", selector: (row) => row.total, format: (row) => formatCurrency(row.total), sortable: true, right: true },
  ];

  return (
    <div className="space-y-6">
      <KpiRow items={[{ label: "Total Revenue", value: view.total, format: "currency" }]} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardCard title="Revenue by Service Category">
          <DonutChart data={view.slices} valueFormat="currency" height={340} />
        </DashboardCard>
        <DashboardCard title="Revenue Trend">
          <TrendLineChart
            data={view.trend}
            currency
            yLabel="Revenue (₹)"
            xLabel="Month"
            height={340}
          />
        </DashboardCard>
      </div>
      {view.patientType && (
        <DashboardCard title="Patient Type Revenue Analysis">
          <BarChartPanel
            data={view.patientType}
            xKey="label"
            layout="horizontal"
            valueFormat="currency"
            xLabel="Channel"
            yLabel="Revenue (₹)"
            height={280}
            dataKeys={[
              { key: "APL", name: "APL", color: "#2563eb" },
              { key: "BPL", name: "BPL", color: "#d97706" },
            ]}
          />
        </DashboardCard>
      )}
      <DashboardCard title="Service category by year" noPadding>
        <DataTableSimple columns={revenueColumns} data={view.table} />
      </DashboardCard>
      {view.utilization?.length > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <DashboardCard title="Service Utilization Summary">
            <BarChartPanel
              data={view.utilization.map((row) => ({ label: row.service, value: row.patients }))}
              layout="vertical"
              categoryWidth={220}
              xLabel="Patients"
              height={Math.max(280, view.utilization.length * 36)}
              dataKeys={[{ key: "value", name: "Patients", color: "#0891b2" }]}
            />
          </DashboardCard>
          <DashboardCard title="Patients by service" noPadding>
            <DataTableSimple
              columns={[
                { name: "Service", selector: (row) => row.service, sortable: true, grow: 2 },
                { name: "Total patients", selector: (row) => row.patients, sortable: true, right: true },
              ]}
              data={view.utilization}
            />
          </DashboardCard>
        </div>
      )}
    </div>
  );
}

function CostPanel({ view }) {
  return (
    <div className="space-y-6">
      <KpiRow items={[{ label: "Total Cost", value: view.total, format: "currency" }]} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardCard title="Cost by Categories">
          <DonutChart data={view.slices} valueFormat="currency" height={360} />
        </DashboardCard>
        <DashboardCard title="Cost Trend">
          <TrendLineChart data={view.trend} currency yLabel="Cost (₹)" xLabel="Month" height={360} />
        </DashboardCard>
      </div>
      {view.salaries && (
        <DashboardCard title="Individual Salaries">
          <BarChartPanel
            data={view.salaries}
            layout="vertical"
            categoryWidth={140}
            valueFormat="currency"
            xLabel="Amount (₹)"
            height={Math.max(320, view.salaries.length * 28)}
            dataKeys={[{ key: "value", name: "Amount", color: "#dc2626" }]}
          />
        </DashboardCard>
      )}
      {view.quarterly && (
        <DashboardCard title="Cost Trend by Quarter and Category">
          <BarChartPanel
            data={view.quarterly}
            dataKeys={series(view.quarterKeys)}
            stacked
            layout="horizontal"
            valueFormat="currency"
            xLabel="Quarter"
            yLabel="Amount (₹)"
            height={360}
          />
        </DashboardCard>
      )}
      {view.fixedVariable && (
        <DashboardCard title="Fixed vs Variable Cost Analysis">
          <BarChartPanel
            data={view.fixedVariable}
            dataKeys={series(view.fixedKeys)}
            stacked
            layout="horizontal"
            valueFormat="currency"
            xLabel="Cost type"
            yLabel="Amount (₹)"
            height={320}
          />
        </DashboardCard>
      )}
    </div>
  );
}

function ThirdPartyPanel({ view }) {
  const columns = [
    { name: "Category", selector: (row) => row.category, sortable: true, grow: 2 },
    { name: "Revenue", selector: (row) => row.revenue, format: (row) => formatCurrency(row.revenue), sortable: true, right: true },
    { name: "Cost", selector: (row) => row.cost, format: (row) => formatCurrency(row.cost), sortable: true, right: true },
    { name: "Profit", selector: (row) => row.profit, format: (row) => formatCurrency(row.profit), sortable: true, right: true },
    { name: "Margin", selector: (row) => row.margin, format: (row) => formatPercent(row.margin), sortable: true, right: true },
  ];
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardCard title="3rd Party Revenue Trend">
          <TrendLineChart data={view.revenueTrend} currency yLabel="Revenue (₹)" xLabel="Month" />
        </DashboardCard>
        <DashboardCard title="3rd Party Cost Trend">
          <TrendLineChart data={view.costTrend} currency yLabel="Cost (₹)" xLabel="Month" />
        </DashboardCard>
      </div>
      <DashboardCard title="Profit Margin by Category" noPadding>
        <DataTableSimple columns={columns} data={view.table} />
      </DashboardCard>
    </div>
  );
}

function ThirdPartyCategoryPanel({ view }) {
  return (
    <div className="space-y-6">
      <DashboardCard title="Revenue Mix by Month and Category">
        <BarChartPanel
          data={view.data}
          dataKeys={series(view.keys)}
          stacked
          normalize
          layout="horizontal"
          valueFormat="currency"
          xLabel="Month"
          yLabel="Share of revenue"
          height={380}
        />
      </DashboardCard>
      <DashboardCard title="3rd Party Revenue by Month and Category">
        <BarChartPanel
          data={view.data}
          dataKeys={series(view.keys)}
          stacked
          layout="horizontal"
          valueFormat="currency"
          xLabel="Month"
          yLabel="Revenue (₹)"
          height={380}
        />
      </DashboardCard>
      <DashboardCard title="Profit Margin by Category">
        <BarChartPanel
          data={view.margins}
          layout="vertical"
          valueFormat="percent"
          xLabel="Profit margin (%)"
          categoryWidth={140}
          height={280}
            dataKeys={[{ key: "value", name: "Profit margin", color: "#059669" }]}
            showShare={false}
        />
      </DashboardCard>
    </div>
  );
}

function PatientsPanel({ view }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <DashboardCard title="Unique Patients by Gender">
          <DonutChart data={view.gender} />
        </DashboardCard>
        <DashboardCard title="Unique Patients by Category">
          <DonutChart data={view.category} />
        </DashboardCard>
        <DashboardCard title="Unique Patients by Age Group">
          <DonutChart data={view.age} />
        </DashboardCard>
      </div>
      {view.segmentation.rows.length > 0 && (
        <DashboardCard title="Age and Gender-wise Patient Segmentation — APL vs BPL">
          <SegmentationHeatTable columns={view.segmentation.columns} rows={view.segmentation.rows} />
        </DashboardCard>
      )}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {view.maleAge.length > 0 && (
          <DashboardCard title="Unique Male Patients by Age Group">
            <BarChartPanel
              data={view.maleAge.map((item) => ({ label: item.name, value: item.value }))}
              layout="vertical"
              xLabel="Patients"
              yLabel="Age group"
              height={260}
              dataKeys={[{ key: "value", name: "Patients", color: "#2563eb" }]}
            />
          </DashboardCard>
        )}
        {view.femaleAge.length > 0 && (
          <DashboardCard title="Unique Female Patients by Age Group">
            <BarChartPanel
              data={view.femaleAge.map((item) => ({ label: item.name, value: item.value }))}
              layout="vertical"
              xLabel="Patients"
              height={260}
              dataKeys={[{ key: "value", name: "Patients", color: "#db2777" }]}
            />
          </DashboardCard>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardCard title="Patients Geographic Distribution (Top 10 Areas)">
          <BarChartPanel
            data={view.geo.map((row) => ({ label: row.area, value: row.patients }))}
            layout="vertical"
            categoryWidth={180}
            xLabel="Patients"
            height={Math.max(300, view.geo.length * 32)}
            dataKeys={[{ key: "value", name: "Patients", color: "#059669" }]}
          />
        </DashboardCard>
        <DashboardCard title="Area breakdown" noPadding>
          <DataTableSimple
            columns={[
              { name: "Area", selector: (row) => row.area, sortable: true, grow: 2 },
              { name: "Patients", selector: (row) => row.patients, sortable: true, right: true },
            ]}
            data={view.geo}
          />
        </DashboardCard>
      </div>
    </div>
  );
}

function FootfallPanel({ view }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <DashboardCard title="Total Patients Footfall">
        <TrendLineChart data={view.totalTrend} yLabel="Patients" xLabel="Month" />
      </DashboardCard>
      <DashboardCard title="Unique Patients Footfall">
        <TrendLineChart data={view.uniqueTrend} yLabel="Unique patients" xLabel="Month" />
      </DashboardCard>
    </div>
  );
}

function DiseasePanel({ view }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      {view.trendKeys.length > 0 && (
        <DashboardCard title="Disease Trend (Top 5)">
          <TrendLineChart
            data={view.trend}
            series={series(view.trendKeys)}
            yLabel="Patient visits"
            xLabel="Month"
            height={360}
          />
        </DashboardCard>
      )}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardCard title="Top 10 Diseases">
          <BarChartPanel
            data={view.diseases.map((item) => ({ label: item.name, value: item.visits }))}
            layout="vertical"
            categoryWidth={170}
            xLabel="Patient visits"
            height={Math.max(300, view.diseases.length * 34)}
            dataKeys={[{ key: "value", name: "Patient visits", color: "#7c3aed" }]}
          />
        </DashboardCard>
        <DashboardCard title="Specialty-wise Patient Visits">
          <BarChartPanel
            data={view.specialties.map((item) => ({ label: item.name, value: item.value }))}
            layout="vertical"
            categoryWidth={150}
            xLabel="Patient visits"
            height={Math.max(300, view.specialties.length * 34)}
            dataKeys={[{ key: "value", name: "Patient visits", color: "#0891b2" }]}
          />
        </DashboardCard>
      </div>
    </div>
  );
}

function ComplaintsPanel({ view }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardCard title="Complaints by Patients">
          <BarChartPanel
            data={view.complaints}
            layout="vertical"
            categoryWidth={160}
            xLabel="Patients"
            height={Math.max(260, view.complaints.length * 40)}
            dataKeys={[{ key: "value", name: "Patients", color: "#7c3aed" }]}
          />
        </DashboardCard>
        {view.gender && (
          <DashboardCard title="Gender wise Distribution">
            <DonutChart data={view.gender} />
          </DashboardCard>
        )}
      </div>
      <DashboardCard title="Complaints by Age Group">
        <BarChartPanel
          data={view.byAge}
          dataKeys={series(view.names)}
          stacked
          layout="horizontal"
          xLabel="Age group"
          yLabel="Patients"
          height={340}
        />
      </DashboardCard>
      {view.revenueByComplaint && (
        <DashboardCard title="Revenue by Complaints">
          <BarChartPanel
            data={view.revenueByComplaint}
            layout="vertical"
            categoryWidth={170}
            valueFormat="currency"
            xLabel="Revenue (₹)"
            height={Math.max(260, view.revenueByComplaint.length * 40)}
            dataKeys={[{ key: "value", name: "Revenue", color: "#d97706" }]}
          />
        </DashboardCard>
      )}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardCard title="Area-wise Health Complaint Distribution">
          <BarChartPanel
            data={view.areas.map((row) => ({ label: row.area, value: row.patients }))}
            layout="vertical"
            categoryWidth={160}
            xLabel="Patients"
            height={Math.max(260, view.areas.length * 36)}
            dataKeys={[{ key: "value", name: "Patients", color: "#059669" }]}
          />
        </DashboardCard>
        <DashboardCard title="Areas" noPadding>
          <DataTableSimple
            columns={[
              { name: "Area", selector: (row) => row.area, sortable: true, grow: 2 },
              { name: "Patients", selector: (row) => row.patients, sortable: true, right: true },
            ]}
            data={view.areas}
          />
        </DashboardCard>
      </div>
    </div>
  );
}

function FeedbackPanel({ view }) {
  return (
    <div className="space-y-6">
      <KpiRow items={view.kpis} />
      <DashboardCard title="Feedback by Patients">
        <DonutChart data={view.slices} height={360} />
      </DashboardCard>
    </div>
  );
}

const PANELS = {
  revenue: RevenuePanel,
  cost: CostPanel,
  "third-party": ThirdPartyPanel,
  "third-party-category": ThirdPartyCategoryPanel,
  patients: PatientsPanel,
  footfall: FootfallPanel,
  disease: DiseasePanel,
  complaints: ComplaintsPanel,
  feedback: FeedbackPanel,
};

export function DashboardPanel({ view }) {
  if (!view || view.empty) {
    return <ChartEmpty message="No records for the selected filters." />;
  }
  const Panel = PANELS[view.panel];
  if (!Panel) return <ChartEmpty message="This tab is not available." />;
  return <Panel view={view} />;
}
