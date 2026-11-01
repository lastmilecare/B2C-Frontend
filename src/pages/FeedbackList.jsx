import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";
import {
  useGetFeedbackListQuery,
  useLazyExportFeedbackExcelQuery,
  useSearchUHIDQuery,
} from "../redux/apiSlice";
import useDebounce from "../hooks/useDebounce";
import { healthAlert } from "../utils/healthSwal";
import { FEEDBACK_STATUS_LABELS } from "../constants/feedbackQuestions";
import {
  FEEDBACK_CENTERS,
  getFeedbackCenterName,
} from "../constants/universalFeedbackCenters";
import { generateFileName, downloadBlob } from "../utils/helper";

const emptyFilters = {
  startDate: "",
  endDate: "",
  external_id: "",
  feedback_status: "",
  center_id: "",
  driver_id: "",
  calling_from: "",
  calling_to: "",
};

const centerOptions = FEEDBACK_CENTERS.map((c) => ({
  label: c.name,
  value: String(c.id),
}));

const FeedbackList = () => {
  const navigate = useNavigate();

  const [uhidSearch, setUhidSearch] = useState("");
  const debouncedUhid = useDebounce(uhidSearch, 500);
  const { data: suggestions = [] } = useSearchUHIDQuery(debouncedUhid, {
    skip: debouncedUhid.length < 2,
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [tempFilters, setTempFilters] = useState(emptyFilters);
  const [filters, setFilters] = useState({});
  const hasFilters = Object.values(filters).some(
    (value) => value !== "" && value !== null && value !== undefined,
  );

  const hasCenterFilter = Boolean(
    filters.center_ids && String(filters.center_ids).trim(),
  );
  const hasVisitOrCallingDate = Boolean(
    (filters.startDate && String(filters.startDate).trim()) ||
      (filters.calling_from && String(filters.calling_from).trim()) ||
      (filters.calling_to && String(filters.calling_to).trim()),
  );

  const { data, isLoading } = useGetFeedbackListQuery(
    { page, limit, ...filters },
    { skip: !page || !limit || !hasCenterFilter || !hasVisitOrCallingDate },
  );

  const [exportExcel, { isFetching: exporting }] =
    useLazyExportFeedbackExcelQuery();

  const summary = data?.summary || {};
  const patients = data?.data || [];
  const pagination = data || { page, total: 0 };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectSuggestion = (val) => {
    setTempFilters((prev) => ({ ...prev, external_id: val }));
    setUhidSearch("");
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const validateFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    const {
      startDate,
      endDate,
      center_id,
      calling_from,
      calling_to,
    } = tempFilters;
    const centerId = String(center_id || "").trim();
    const hasCallingDate = Boolean(
      String(calling_from || "").trim() || String(calling_to || "").trim(),
    );

    if (!centerId) {
      healthAlert({
        title: "Feedback",
        text: "Please select a center.",
        icon: "info",
      });
      return null;
    }
    // Date from required only when calling-date filter is not used
    if (!startDate && !hasCallingDate) {
      healthAlert({
        title: "Feedback",
        text: "Please select Date from, or Feedback calling from/to.",
        icon: "info",
      });
      return null;
    }
    if (endDate && endDate > today) {
      healthAlert({
        title: "Feedback",
        text: "End date cannot be greater than today.",
        icon: "info",
      });
      return null;
    }
    if (startDate && endDate && startDate > endDate) {
      healthAlert({
        title: "Feedback",
        text: "Start date cannot be after end date.",
        icon: "info",
      });
      return null;
    }
    if (
      calling_from &&
      calling_to &&
      String(calling_from) > String(calling_to)
    ) {
      healthAlert({
        title: "Feedback",
        text: "Feedback calling from cannot be after calling to.",
        icon: "info",
      });
      return null;
    }

    const { center_id: _c, ...rest } = tempFilters;
    return {
      ...rest,
      center_ids: centerId,
    };
  };

  const handleApplyFilters = () => {
    const next = validateFilters();
    if (!next) return;
    setFilters(next);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters(emptyFilters);
    setFilters({});
    setPage(1);
    setLimit(50);
    setUhidSearch("");
  };

  const handleExport = async () => {
    const next = validateFilters();
    if (!next) return;
    try {
      const blob = await exportExcel(next).unwrap();
      const fileName = generateFileName("Feedback", { extension: "xlsx" });
      downloadBlob(blob, fileName);
    } catch (err) {
      healthAlert({
        title: "Export Error",
        text: err?.data?.message || err?.message || "Could not export feedback.",
        icon: "error",
      });
    }
  };

  const formatPatientDetails = (row) => {
    const age =
      row.iage != null && Number(row.iage) > 0
        ? String(row.iage)
        : row.imonth != null || row.idays != null
          ? [row.iage || 0, row.imonth || 0, row.idays || 0].join("/")
          : "";
    const isCamp = Boolean(row.is_camp || row.source === "camp");
    const isKavach = Boolean(row.is_kavach || row.source === "kavach");
    return (
      <div className="text-[11px] leading-snug">
        <div className="font-medium text-slate-800">
          {row.patient_name || "-"}
        </div>
        {isCamp && (
          <div className="mt-0.5">
            <span className="inline-block text-[9px] font-semibold tracking-wider uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              CAMP
            </span>
          </div>
        )}
        {isKavach && (
          <div className="mt-0.5">
            <span className="inline-block text-[9px] font-semibold tracking-wider uppercase text-violet-800 bg-violet-100 px-1.5 py-0.5 rounded">
              KAVACH
            </span>
          </div>
        )}
        {!isKavach && (
          <div className="text-slate-500 mt-0.5">UHID: {row.uhid || "-"}</div>
        )}
        {isKavach && (
          <>
            <div className="text-slate-500 mt-0.5">
              Driver ID: {row.driver_id ?? row.patient_id ?? "-"}
            </div>
            <div className="text-slate-500">
              Health card: {row.health_card_number || "-"}
            </div>
            {(row.transporter_name || row.transporter?.name) && (
              <div className="text-slate-500">
                Transporter: {row.transporter_name || row.transporter?.name}
              </div>
            )}
          </>
        )}
        <div className="text-slate-500">
          {row.gender || "-"}
          {age ? ` · ${age}` : ""}
        </div>
        <div className="text-slate-500">{row.contactNumber || "-"}</div>
      </div>
    );
  };

  const handleFeedbackCall = (row) => {
    if (!row?.visit_key) {
      healthAlert({
        title: "Error",
        text: "Visit reference not found.",
        icon: "error",
      });
      return;
    }
    navigate(`/feedback-form/${row.visit_key}`, {
      state: {
        visitKey: row.visit_key,
        patientId: row.patient_id,
        row,
      },
    });
  };

  const filtersConfig = [
    {
      label: "Center",
      name: "center_id",
      type: "select",
      options: centerOptions,
    },
    {
      label: "UHID",
      name: "external_id",
      type: "text",
      suggestionConfig: {
        minLength: 2,
        keyField: "external_id",
        valueField: "external_id",
        secondaryField: "name",
      },
    },
    { label: "Driver ID", name: "driver_id", type: "text" },
    { label: "Date from", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
    {
      label: "Feedback status",
      name: "feedback_status",
      type: "select",
      options: [
        { label: "All", value: "" },
        { label: "Completed", value: "completed" },
        { label: "Pending", value: "pending" },
        { label: "Not attending call", value: "call_not_connected" },
      ],
    },
    { label: "Feedback calling from", name: "calling_from", type: "date" },
    { label: "Feedback calling to", name: "calling_to", type: "date" },
  ];

  const columns = [
    {
      name: "S.No",
      width: "60px",
      selector: (row, i) => (page - 1) * limit + i + 1,
    },
    {
      name: "Center",
      minWidth: "120px",
      selector: (row) =>
        row.center_name || getFeedbackCenterName(row.center_id) || "-",
      wrap: true,
    },
    {
      name: "Patient details",
      minWidth: "160px",
      cell: (row) => formatPatientDetails(row),
    },
    {
      name: "Chief complaint",
      minWidth: "140px",
      selector: (row) => row.chief_complaint || "-",
      wrap: true,
    },
    {
      name: "Feedback status",
      width: "120px",
      selector: (row) =>
        FEEDBACK_STATUS_LABELS[row.feedback_status] ||
        row.feedback_status ||
        "-",
    },
    {
      name: "Calling Date",
      minWidth: "130px",
      selector: (row) => row.calling_date || "-",
    },
    {
      name: "Action",
      width: "130px",
      cell: (row) => (
        <button
          type="button"
          onClick={() => handleFeedbackCall(row)}
          disabled={row.feedback_completed}
          className="text-xs bg-sky-600 text-white px-2 py-1 rounded hover:bg-sky-700 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {row.feedback_completed ? "Done" : "Feedback Call"}
        </button>
      ),
      ignoreRowClick: true,
    },
  ];

  return (
    <div className="p-0">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">Feedback List</h1>
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        uhidSearch={uhidSearch}
        onChange={(e) => {
          const { name, value } = e.target;
          if (name === "external_id") setUhidSearch(value);
          handleChange(e);
        }}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onExport={handleExport}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
      />
      {exporting && (
        <p className="text-sm text-slate-500 mb-2">Preparing Excel export…</p>
      )}
      <CommonList
        title="Feedback visits"
        columns={columns}
        data={patients}
        totalRows={
          hasCenterFilter && hasVisitOrCallingDate ? pagination.total || 0 : 0
        }
        currentPage={pagination.page || page}
        perPage={pagination.pageSize || limit}
        onPageChange={(newPage) => setPage(newPage)}
        onPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        isLoading={isLoading}
        onExport={handleExport}
      />
      <section className="mt-4 border rounded-xl bg-emerald-50 px-6 py-4 shadow-sm">
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-emerald-900">
          <span>
            Total Patient Visits:
            <span className="font-semibold ml-1">
              {summary.totalPatientVisits ?? 0}
            </span>
          </span>
          <span>
            Total Feedback Done:
            <span className="font-semibold ml-1">
              {summary.totalFeedbackDone ?? 0}
            </span>
          </span>
          <span>
            Total Pending Calls:
            <span className="font-semibold ml-1">
              {summary.totalPendingCalls ?? 0}
            </span>
          </span>
        </div>
      </section>
    </div>
  );
};

export default FeedbackList;
