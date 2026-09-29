import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CopyFilterBar from "../components/Updates/Filter";
import PatientTable from "../components/Updates/PatientTable";
import {
  useGetDailyRevenueReportsQuery,
  useSendDailyRevenueReportMutation,
} from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { formatDate, formatTime, getApiErrorMessage } from "../utils/helper";

const STATUS_COLORS = {
  draft: "bg-amber-100 text-amber-700",
  sent: "bg-green-100 text-green-700",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
      STATUS_COLORS[status] || STATUS_COLORS.draft
    }`}
  >
    {status || "draft"}
  </span>
);

const formatAmount = (n) =>
  n == null ? "—" : Number(n).toLocaleString("en-IN");

const DailyRevenueReportList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [tempFilters, setTempFilters] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });
  const [filters, setFilters] = useState({});
  const { data, isLoading } = useGetDailyRevenueReportsQuery({
    page,
    limit,
    ...filters,
  });
  const [sendReport, { isLoading: isSending }] =
    useSendDailyRevenueReportMutation();
  const reports = data?.data || [];
  const pagination = data?.pagination || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const cleaned = Object.fromEntries(
      Object.entries(tempFilters).filter(([, v]) => v !== ""),
    );
    setFilters(cleaned);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({ status: "", startDate: "", endDate: "" });
    setFilters({});
    setPage(1);
  };

  const filtersConfig = [
    {
      label: "Status",
      name: "status",
      type: "select",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
      ],
    },
    { label: "Date from", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
  ];

  const openReport = (row) => {
    navigate(`/daily-revenue-report/${row.id}`);
  };

  const handleSend = async (row) => {
    if (row.status === "sent") {
      healthAlert({
        title: "Already sent",
        text: "This report was already emailed to the client.",
        icon: "info",
      });
      return;
    }

    const result = await healthAlert({
      title: "Send report?",
      text: `Email the daily revenue report for ${formatDate(row.report_date)} to the client?`,
      type: "confirm",
    });
    if (!result.isConfirmed) return;

    try {
      await sendReport(row.id).unwrap();
      healthAlert({
        title: "Sent",
        text: "Daily report emailed to client",
        icon: "success",
      });
    } catch (err) {
      healthAlert({
        title: "Error",
        text: getApiErrorMessage(err, "Send failed"),
        icon: "error",
      });
    }
  };

  const columns = [
    {
      name: "Report date",
      minWidth: "130px",
      cell: (row) => (
        <button
          type="button"
          onClick={() => openReport(row)}
          className="py-2 font-medium text-sky-700 hover:text-sky-900 hover:underline text-left"
        >
          {formatDate(row.report_date)}
        </button>
      ),
    },
    {
      name: "Patients",
      minWidth: "90px",
      center: true,
      cell: (row) => (
        <span className="text-sm">{row.total_patients ?? "—"}</span>
      ),
    },
    {
      name: "Revenue today",
      minWidth: "120px",
      cell: (row) => formatAmount(row.revenue_today),
    },
    {
      name: "Month total",
      minWidth: "120px",
      cell: (row) => formatAmount(row.month_total),
    },
    {
      name: "Status",
      minWidth: "100px",
      center: true,
      cell: (row) => (
        <div className="flex justify-center py-2">
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      name: "Sent at",
      minWidth: "130px",
      center: true,
      cell: (row) =>
        row.sent_at ? (
          <div className="py-2 text-xs text-center">
            <p className="font-medium">{formatDate(row.sent_at)}</p>
            <p className="text-slate-400">{formatTime(row.sent_at)}</p>
          </div>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="max-w-[100%] mx-auto px-1">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Daily Client Revenue
      </h1>

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <div className="overflow-x-auto">
        <PatientTable
          title="Reports"
          responsive
          data={reports}
          columns={columns}
          totalRows={pagination.totalRecords || 0}
          currentPage={pagination.currentPage || page}
          perPage={limit}
          onPageChange={setPage}
          onPerPageChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          isLoading={isLoading || isSending}
          allowStaffEdit
          actionButtons={["edit", "send"]}
          onEdit={openReport}
          onSend={handleSend}
          enableAdd
          addButtonText="New report"
          onAdd={() => navigate("/daily-revenue-report/new")}
        />
      </div>
    </div>
  );
};

export default DailyRevenueReportList;
