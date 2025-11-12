import React, { useState } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import { useGetPrescriptionsQuery  } from "../redux/apiSlice";

const PrescriptionList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [tempFilters, setTempFilters] = useState({
    name: "",
    contactNumber: "",
    gender: "",
    category: "",
    startDate: "",
    endDate: ""
  });
  const [filters, setFilters] = useState({});
  const { data, isLoading, isError, error } = useGetPrescriptionsQuery (
    {
      page,
      limit,
      ...filters,
    },
    { skip: !page || !limit }
  );
  const patients = data?.data || [];
  const pagination = data?.pagination || { currentPage: page, totalRecords: 0 };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    const { startDate, endDate } = tempFilters;

    if (endDate && endDate > today) {
      alert("End date cannot be greater than today.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      alert("Start date cannot be after end date.");
      return;
    }

    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({
      name: "",
      contactNumber: "",
      startDate: "",
      endDate: ""
    });
    setFilters({});
    setPage(1);
  };
  const filtersConfig = [
    { label: "Bill No", name: "id", type: "text" },
    { label: "Name", name: "name", type: "text" },
    { label: "Start Date", name: "startDate", type: "date" },
    { label: "End Date", name: "endDate", type: "date" },
    { label: "Mobile", name: "contactNumber", type: "text" }
  ];
  const safeString = (v, fallback = "-") =>
    v === null || v === undefined || v === "" ? fallback : String(v);
  const columns = [
    {
      name: "S.No",
      title: "Serial Number",
      selector: (row, i) => (page - 1) * limit + i + 1,
      width: "70px",
    },
    {
      name: "Bill No",
      title: "Bill Number",
      selector: (row) => safeString(row?.bill_no, "-"),
      sortable: true,
      width: "70px",
    },
    {
      name: "UHID",
      title: "Unique Health ID",
      selector: (row) => safeString(row?.uhid, "-"),
      width: "120px",
      sortable: true,
    },
    {
      name: "Name",
      title: "Patient Name",
      selector: (row) => safeString(row?.patient_name, "-"),
      sortable: true,
      width: "120px",
    },
    {
      name: "Age",
      title: "Patient Age",
      selector: (row) => safeString(row?.age, "-"),
      sortable: true,
      width: "50px",
    },
    {
      name: "Gender",
      title: "Gender",
      selector: (row) => safeString(row?.gender, "-"),
      width: "60px",
    },
    {
      name: "Phone",
      title: "Mobile Number",
      selector: (row) => safeString(row?.contactNumber, "-"),
      width: "99px"
    },
    {
      name: "Added Date",
      title: "Added Date",
      selector: (row) =>
        row?.createdAt ? new Date(row.createdAt).toISOString().split("T")[0] : "-",
      sortable: true,
      width: "100px",
    },
    {
      name: "Status",
      selector: (row) => (row.isReady ? "✅ Ready" : "🕓 Pending"),
    },
  ];

  const handleRowClick = (row) => {
    alert(`Opening details for Prescription ID: ${row.prescription_id}`);
  };



  return (
    <div className="p-0">
      <FilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onExport={() => console.log("Export clicked!")}
      />
      <CommonList
        title="💳 Prescription List"
        columns={columns}
        data={patients}
        totalRows={pagination.totalRecords || 0}
        currentPage={pagination.currentPage || page}
        perPage={limit}
        onPageChange={(newPage) => setPage(newPage)}
        onPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        enableActions
        isLoading={isLoading}
      />
    </div>
  );
};

export default PrescriptionList;
