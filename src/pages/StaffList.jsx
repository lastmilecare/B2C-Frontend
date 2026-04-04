import React, { useState } from "react";
import { useGetPatientsQuery, useSearchUHIDQuery } from "../redux/apiSlice";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import useDebounce from "../hooks/useDebounce";
import { healthAlert } from "../utils/healthSwal";
import Avatar from "../components/common/Avatar";
import { useNavigate } from "react-router-dom";

const StaffList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [uhidSearch, setUhidSearch] = useState("");
  const debouncedUhid = useDebounce(uhidSearch, 500);

  const { data: suggestions = [] } = useSearchUHIDQuery(debouncedUhid, {
    skip: debouncedUhid.length < 2,
  });

  const [tempFilters, setTempFilters] = useState({
  staffName: "",
  employeeId: "",
  mobile: "",
  gender: "",
  department: "",
  role: "",
  startDate: "",
  endDate: "",
});

  const [filters, setFilters] = useState({});

  // const { data, isLoading } = useGetPatientsQuery({
  //   page,
  //   limit,
  //   ...filters,
  // });
const staticStaff = [
  {
    id: 1,
    staffName: "Dr Sachin Sharma",
    employeeId: "EMP001",
    mobile: "9876543210",
    gender: "male",
    department: "Doctors",
    role: "Doctor",
    joiningDate: "2025-01-10",
  },
  {
    id: 2,
    staffName: "Mukesh Kumar",
    employeeId: "EMP002",
    mobile: "9123456780",
    gender: "male",
    department: "Admin",
    role: "Manager",
    joiningDate: "2025-02-15",
  },
];
const staff = staticStaff;

const pagination = {
  totalRecords: staticStaff.length,
  currentPage: page,
};

const isLoading = false;
  // const patients = data?.data || [];
  // const staff = data?.data || [];
  // const pagination = data?.pagination || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === "external_id") {
      finalValue = value.toUpperCase();
      setUhidSearch(finalValue);
    }

    if (name === "contactNumber") {
      finalValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setTempFilters((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSelectSuggestion = (val) => {
    setTempFilters((prev) => ({ ...prev, external_id: val }));
    setUhidSearch("");
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

    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({
  staffName: "",
  employeeId: "",
  mobile: "",
  gender: "",
  department: "",
  role: "",
  startDate: "",
  endDate: "",
});
    setFilters({});
    setPage(1);
  };

  const filtersConfig = [
  { label: "Employee ID", name: "employeeId", type: "text" },
  { label: "Staff Name", name: "staffName", type: "text" },
  { label: "Mobile", name: "mobile", type: "text" },

  {
    label: "Gender",
    name: "gender",
    type: "select",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
      { label: "Other", value: "other" },
    ],
  },

  {
    label: "Department",
    name: "department",
    type: "select",
    options: [
      { label: "Doctors", value: "doctors" },
      { label: "Nursing", value: "nursing" },
      { label: "Admin", value: "admin" },
    ],
  },

  {
    label: "Role",
    name: "role",
    type: "select",
    options: [
      { label: "Doctor", value: "doctor" },
      { label: "Staff", value: "staff" },
      { label: "Manager", value: "manager" },
    ],
  },

  { label: "Date From", name: "startDate", type: "date" },
  { label: "Date To", name: "endDate", type: "date" },
];

  const columns = [
  {
    name: "Staff",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.staffName} />

        <div className="leading-tight">
          <p className="font-semibold text-gray-800">
            {row.staffName}
          </p>
          <p className="text-xs text-gray-500">
            ID : {row.employeeId}
          </p>
        </div>
      </div>
    ),
  },

  {
    name: "Mobile",
    selector: (row) => row.mobile,
  },

  {
    name: "Gender",
    cell: (row) => {
      const gender = row.gender?.toLowerCase();

      return (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium
          ${
            gender === "male"
              ? "bg-blue-100 text-blue-700"
              : gender === "female"
              ? "bg-pink-100 text-pink-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {gender === "male"
            ? "👨 Male"
            : gender === "female"
            ? "👩 Female"
            : "Other"}
        </span>
      );
    },
  },

  {
    name: "Department",
    selector: (row) => row.department,
  },

  {
    name: "Role",
    selector: (row) => row.role,
  },

  {
    name: "Joining Date",
   selector: (row) =>
  row.joiningDate
    ? new Date(row.joiningDate).toISOString().split("T")[0]
    : "-"
  },
];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Staff List
      </h1>

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        suggestions={suggestions}
        uhidSearch={uhidSearch}
        onSelectSuggestion={handleSelectSuggestion}
      />

      <PatientTable
      title="Staff List"
        data={staff}
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
        onEdit={(row) => {
  navigate(`/staff/${row.id}`);
}}
        onDelete={(row) => {
          console.log("Delete Patient", row);
        }}
      />
    </div>
  );
};

export default StaffList;
