import React, { useState } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import { useGetPatientsQuery } from "../redux/apiSlice";

const OpdBillingList = () => {


  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [tempFilters, setTempFilters] = useState({
    name: "",
    contactNumber: "",
    gender: "",
    category: "",
    startDate: "",
    endDate: "",
    external_id: "",
    idProof_number: ""
  });
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useGetPatientsQuery({
    page,
    limit,
    ...filters,
  });

  const patients = data?.data || [];
  const pagination = data?.pagination || {};

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
      gender: "",
      category: "",
      startDate: "",
      endDate: "",
      external_id: "",
      idProof_number: ""
    });
    setFilters({});
    setPage(1);
  };

  const filtersConfig = [
    { label: "UHID", name: "external_id", type: "text" },
    { label: "Patient Name", name: "name", type: "text" },
    { label: "Mobile", name: "contactNumber", type: "text" },
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
      label: "Fin Category",
      name: "category",
      type: "select",
      options: [
        { label: "APL", value: "apl" },
        { label: "BPL", value: "bpl" }
      ],
    },
    { label: "Start Date", name: "startDate", type: "date" },
    { label: "End Date", name: "endDate", type: "date" },
    { label: "Unique Id", name: "idProof_number", type: "text" },
  ];

  const columns = [
    { name: "Bill No", selector: (row) => row.ID, sortable: true },
    { name: "Patient ID", selector: (row) => row.PatientID },
    { name: "Mobile", selector: (row) => row.Mobile },
    { name: "Service Type ID", selector: (row) => row.ServiceTypeID },
    {
      name: "Total Amount",
      selector: (row) => `₹${row.TotalServiceAmount?.toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Paid Amount",
      selector: (row) => `₹${row.PaidAmount?.toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Due Amount",
      selector: (row) => `₹${row.DueAmount?.toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (row.DueAmount > 0 ? "🟠 Pending" : "🟢 Paid"),
    },
  ];
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
        title="💳 OPD Billing List"
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

export default OpdBillingList;
