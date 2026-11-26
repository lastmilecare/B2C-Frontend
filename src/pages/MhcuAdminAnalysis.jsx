import React, { useMemo, useState } from "react";
import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";
import {
  useGetAdminAnalysisQuery,
  useLazyExportAdminAnalysisExcelQuery,
  useGetComboQuery,
} from "../redux/apiSlice";
import { cookie } from "../utils/cookie";
import { getTenantFeatures } from "../config/tenantFeatures";
import { healthAlert } from "../utils/healthSwal";
import { formatDate, downloadBlob } from "../utils/helper";

/**
 * Configured-tenant (MHCU) admin analysis list + Excel export.
 * Other tenants should not reach this route from sidebar.
 */
export default function MhcuAdminAnalysis() {
  const tenantFeatures = getTenantFeatures(cookie.get("tenantId"));
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [tempFilters, setTempFilters] = useState({
    name: "",
    mobileno: "",
    village: "",
    date_from: "",
    date_to: "",
  });
  const [filters, setFilters] = useState({});
  const [exportExcel, { isFetching: exporting }] =
    useLazyExportAdminAnalysisExcelQuery();

  const { data: villagesRaw = [] } = useGetComboQuery("ohc-village", {
    skip: !tenantFeatures.enableAdminAnalysis,
  });

  const villageOptions = useMemo(() => {
    const list = Array.isArray(villagesRaw)
      ? villagesRaw
      : villagesRaw?.data || [];
    return list
      .map((v) => {
        const label = String(
          v?.label ?? v?.VillageName ?? v?.name ?? "",
        ).trim();
        // Filter matches DRIVERMASTERs.localAddress (village name), not villid
        return label ? { value: label, label } : null;
      })
      .filter(Boolean);
  }, [villagesRaw]);

  const { data, isLoading, refetch } = useGetAdminAnalysisQuery(
    {
      page,
      limit,
      ...filters,
    },
    { skip: !tenantFeatures.enableAdminAnalysis },
  );

  const rows = data?.data || [];
  const total = data?.total || 0;

  const filtersConfig = useMemo(
    () => [
      { label: "Name", name: "name", type: "text" },
      { label: "Mobile", name: "mobileno", type: "text" },
      {
        label: "Village",
        name: "village",
        type: "select",
        options: villageOptions,
      },
      { label: "Start Date", name: "date_from", type: "date" },
      { label: "End Date", name: "date_to", type: "date" },
    ],
    [villageOptions],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    const today = new Date().toISOString().split("T")[0];
    const { date_from, date_to } = tempFilters;
    if (date_to && date_to > today) {
      healthAlert({
        title: "Admin Analysis",
        text: "End date cannot be greater than today.",
        icon: "info",
      });
      return;
    }
    if (date_from && date_to && date_from > date_to) {
      healthAlert({
        title: "Admin Analysis",
        text: "Start date cannot be after end date.",
        icon: "info",
      });
      return;
    }
    setFilters(tempFilters);
    setPage(1);
  };

  const handleReset = () => {
    setTempFilters({
      name: "",
      mobileno: "",
      village: "",
      date_from: "",
      date_to: "",
    });
    setFilters({});
    setPage(1);
    refetch();
  };

  const handleExport = async () => {
    try {
      const blob = await exportExcel({
        ...filters,
        page: 1,
        limit: 5000,
      }).unwrap();
      downloadBlob(blob, `mhcu-admin-analysis-${Date.now()}.xlsx`);
    } catch (error) {
      healthAlert({
        title: "Export Error",
        text: error?.data?.message || "Failed to export analysis.",
        icon: "error",
      });
    }
  };

  if (!tenantFeatures.enableAdminAnalysis) {
    return (
      <div className="p-6">
        <p className="text-slate-600">
          Admin Analysis is available only for the configured MHCU tenant.
        </p>
      </div>
    );
  }

  const columns = [
    {
      name: "SL.NO",
      selector: (row) => row.sl_no,
      width: "70px",
    },
    {
      name: "Visit Date",
      selector: (row) =>
        row.visit_date ? formatDate(row.visit_date) : "-",
      width: "120px",
    },
    {
      name: "UHID",
      selector: (row) => row.uhid || "-",
      width: "150px",
    },
    {
      name: "Name",
      selector: (row) => row.patient_name || "-",
      width: "160px",
    },
    {
      name: "Village",
      selector: (row) => row.village_name || "-",
      width: "140px",
    },
    {
      name: "ID Proof",
      selector: (row) =>
        [row.id_proof_name, row.id_proof_number].filter(Boolean).join(" / ") ||
        "-",
      width: "160px",
    },
    {
      name: "Age",
      selector: (row) => row.age || "-",
      width: "90px",
    },
    {
      name: "DOB",
      selector: (row) =>
        row.dob ? String(row.dob).split("T")[0] : "-",
      width: "110px",
    },
    {
      name: "Gender",
      selector: (row) => row.gender || "-",
      width: "90px",
    },
    {
      name: "Mobile",
      selector: (row) => row.mobile || "-",
      width: "120px",
    },
    {
      name: "BP Sys",
      selector: (row) => row.bp_systolic ?? "-",
      width: "80px",
    },
    {
      name: "BP Dia",
      selector: (row) => row.bp_diastolic ?? "-",
      width: "80px",
    },
    {
      name: "Pulse",
      selector: (row) => row.pulse_rate ?? "-",
      width: "70px",
    },
    {
      name: "SpO₂",
      selector: (row) => row.spo2 ?? "-",
      width: "70px",
    },
    {
      name: "Temp",
      selector: (row) => row.temperature ?? "-",
      width: "70px",
    },
    {
      name: "Ht",
      selector: (row) => row.height ?? "-",
      width: "60px",
    },
    {
      name: "Wt",
      selector: (row) => row.weight ?? "-",
      width: "60px",
    },
    {
      name: "Glucose",
      selector: (row) => row.glucose ?? "-",
      width: "80px",
    },
    {
      name: "Hb",
      selector: (row) => row.haemoglobin ?? "-",
      width: "70px",
    },
    {
      name: "Chief Complaint",
      selector: (row) => row.chief_complaints || "-",
      width: "180px",
    },
    {
      name: "Disease",
      selector: (row) => row.disease_name || "-",
      width: "140px",
    },
    {
      name: "Fitness",
      selector: (row) => row.fitness_status || "-",
      width: "150px",
    },
    {
      name: "Refer Details",
      selector: (row) => row.refer_details || "-",
      width: "200px",
    },
  ];

  return (
    <div className="p-0">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Admin Analysis
      </h1>
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApply}
        onReset={handleReset}
        onExport={handleExport}
      />
      {exporting && (
        <p className="mb-2 text-sm text-slate-500">Preparing Excel export…</p>
      )}
      <CommonList
        title="MHCU Admin Analysis"
        columns={columns}
        data={rows}
        totalRows={total}
        currentPage={page}
        perPage={limit}
        onPageChange={setPage}
        onPerPageChange={(n) => {
          setLimit(n);
          setPage(1);
        }}
        isLoading={isLoading}
        enableActions={false}
      />
    </div>
  );
}
