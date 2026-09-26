import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CopyFilterBar from "../components/Updates/Filter";
import PatientTable from "../components/Updates/PatientTable";
import Avatar from "../components/common/Avatar";
import {
  useDeleteAmbulanceServiceMutation,
  useGetAmbulanceServicesQuery,
  useUpdateAmbulanceMutation,
} from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { formatDate, formatTime, getApiErrorMessage } from "../utils/helper";

const AMBULANCE_STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "on_trip", label: "On Trip" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inactive", label: "Inactive" },
];

const STATUS_COLORS = {
  available: "bg-green-100 text-green-700",
  on_trip: "bg-amber-100 text-amber-700",
  maintenance: "bg-orange-100 text-orange-700",
  inactive: "bg-gray-100 text-gray-600",
};

const displayText = (value, fallback = "—") => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return fallback;
  }
  return String(value);
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
      STATUS_COLORS[status] || STATUS_COLORS.inactive
    }`}
  >
    {(status || "inactive").replace("_", " ")}
  </span>
);

const TypeBadge = ({ type }) => (
  <span
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
      type === "company"
        ? "bg-green-100 text-green-700"
        : "bg-purple-100 text-purple-700"
    }`}
  >
    {displayText(type, "—")}
  </span>
);

const LabeledLines = ({ lines }) => (
  <div className="flex flex-col gap-1 py-2 text-xs leading-snug text-slate-700">
    {lines.map(({ label, value, title }) => (
      <div key={label} className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 items-start">
        <span className="text-slate-500 font-medium whitespace-nowrap">{label}</span>
        <span className="truncate" title={title || value}>
          {value}
        </span>
      </div>
    ))}
  </div>
);

const AmbulanceServiceList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [tempFilters, setTempFilters] = useState({
    patient_name: "",
    patient_type: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useGetAmbulanceServicesQuery({
    page,
    limit,
    ...filters,
  });
  const [deleteService] = useDeleteAmbulanceServiceMutation();
  const [updateAmbulance] = useUpdateAmbulanceMutation();

  const services = data?.data || [];
  const pagination = data?.pagination || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    const { startDate, endDate } = tempFilters;

    if (endDate && endDate > today) {
      healthAlert({
        title: "Invalid Date",
        text: "End date cannot be greater than today",
        icon: "info",
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      healthAlert({
        title: "Date Range Error",
        text: "Start date cannot be after end date",
        icon: "info",
      });
      return;
    }

    const cleanedFilters = Object.fromEntries(
      Object.entries(tempFilters).filter(([, value]) => value !== ""),
    );
    setFilters(cleanedFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({
      patient_name: "",
      patient_type: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setFilters({});
    setPage(1);
  };

  const handleStatusChange = async (row, status) => {
    const ambulanceId = row.ambulance_id || row.ambulance?.id;
    if (!ambulanceId) {
      healthAlert({
        title: "Error",
        text: "No ambulance linked to this service",
        icon: "error",
      });
      return;
    }

    try {
      await updateAmbulance({ id: ambulanceId, status }).unwrap();
      healthAlert({
        title: "Success",
        text: "Ambulance status updated",
        icon: "success",
      });
    } catch (err) {
      healthAlert({
        title: "Error",
        text: getApiErrorMessage(err, "Status update failed"),
        icon: "error",
      });
    }
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete service for ${row.patient_name}?`)) return;

    try {
      await deleteService(row.id).unwrap();
      healthAlert({
        title: "Success",
        text: "Service record deleted",
        icon: "success",
      });
    } catch (err) {
      healthAlert({
        title: "Error",
        text: err?.data?.message || "Delete failed",
        icon: "error",
      });
    }
  };

  const filtersConfig = [
    { label: "Patient Name", name: "patient_name", type: "text" },
    {
      label: "Patient Type",
      name: "patient_type",
      type: "select",
      options: [
        { label: "Outsider", value: "outsider" },
        { label: "Company", value: "company" },
      ],
    },
    {
      label: "Status",
      name: "status",
      type: "select",
      options: [
        { label: "Pending", value: "pending" },
        { label: "In Progress", value: "in_progress" },
        { label: "Completed", value: "completed" },
        { label: "Cancelled", value: "cancelled" },
      ],
    },
    { label: "Date from", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
  ];

  const columns = [
    {
      name: "Patient",
      minWidth: "200px",
      grow: 1.2,
      wrap: false,
      cell: (row) => (
        <div className="flex items-center gap-3 py-2 min-h-[52px]">
          <Avatar name={displayText(row.patient_name, "Patient")} />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 truncate">
              {displayText(row.patient_name, "No name")}
            </p>
            <p className="text-xs text-gray-500">
              {displayText(row.patient_mobile, "No mobile")}
            </p>
          </div>
        </div>
      ),
    },
    {
      name: "Ambulance",
      minWidth: "160px",
      grow: 1,
      wrap: false,
      cell: (row) => (
        <LabeledLines
          lines={[
            {
              label: "ID:",
              value: displayText(row.ambulance?.unique_name),
              title: row.ambulance?.unique_name,
            },
            {
              label: "Plate:",
              value: displayText(row.ambulance?.number_plate),
              title: row.ambulance?.number_plate,
            },
          ]}
        />
      ),
    },
    {
      name: "Route",
      minWidth: "180px",
      grow: 1.2,
      wrap: false,
      cell: (row) => (
        <LabeledLines
          lines={[
            {
              label: "From:",
              value: displayText(row.start_point),
              title: row.start_point,
            },
            {
              label: "To:",
              value: displayText(row.end_point),
              title: row.end_point,
            },
          ]}
        />
      ),
    },
    {
      name: "Pickup / Drop",
      minWidth: "200px",
      grow: 1.4,
      wrap: false,
      cell: (row) => (
        <LabeledLines
          lines={[
            {
              label: "Pickup:",
              value: displayText(row.pickup_address),
              title: row.pickup_address,
            },
            {
              label: "Drop:",
              value: displayText(row.drop_address),
              title: row.drop_address,
            },
          ]}
        />
      ),
    },
    {
      name: "Symptom",
      minWidth: "110px",
      grow: 0.8,
      wrap: false,
      center: true,
      cell: (row) => (
        <span
          className="text-xs text-slate-600 text-center block max-w-[120px] truncate mx-auto"
          title={displayText(row.major_symptom, "N/A")}
        >
          {displayText(row.major_symptom, "N/A")}
        </span>
      ),
    },
    {
      name: "Type",
      minWidth: "100px",
      grow: 0.6,
      wrap: false,
      center: true,
      cell: (row) => (
        <div className="flex justify-center py-2">
          <TypeBadge type={row.patient_type} />
        </div>
      ),
    },
    {
      name: "Status",
      minWidth: "110px",
      grow: 0.7,
      wrap: false,
      center: true,
      cell: (row) => (
        <div className="flex justify-center py-2">
          <StatusBadge status={row.ambulance?.status || "available"} />
        </div>
      ),
    },
    {
      name: "Date & Time",
      minWidth: "130px",
      grow: 0.8,
      wrap: false,
      center: true,
      cell: (row) => (
        <div className="py-2 text-xs leading-tight text-center">
          <p className="font-medium text-slate-700">
            {formatDate(row.createdAt)}
          </p>
          <p className="text-slate-400">{formatTime(row.createdAt)}</p>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-[100%] mx-auto px-1">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Ambulance Services
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
          title="Service Requests"
          responsive={true}
          data={services}
          columns={columns}
          totalRows={pagination.totalRecords || 0}
          currentPage={pagination.currentPage || page}
          perPage={limit}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          isLoading={isLoading}
          actionButtons={["edit", "status", "delete"]}
          statusOptions={AMBULANCE_STATUS_OPTIONS}
          getRowStatus={(row) => row.ambulance?.status}
          onStatus={handleStatusChange}
          onEdit={(row) =>
            navigate(`/ambulance-service/${row.id}`, {
              state: { goToForm: true },
            })
          }
          onDelete={handleDelete}
          enableAdd
          addButtonText="New Service"
          onAdd={() =>
            navigate("/ambulance-service", {
              state: { goToForm: true },
            })
          }
        />
      </div>
    </div>
  );
};

export default AmbulanceServiceList;
