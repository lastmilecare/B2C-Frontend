import React, { useState } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import { useGetPatientsQuery } from "../redux/apiSlice";

const PatientList = () => {
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
    { name: "S.No", selector: (row, i) => (page - 1) * limit + i + 1 },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Mobile", selector: (row) => row.contactNumber, width: "120px" },
    { name: "Centre", selector: (row) => row.driver_cetname },
    { name: "UHID", selector: (row) => row.external_id, width: "120px", sortable: true },
    { name: "Gender", selector: (row) => row.gender },
    { name: "Age", selector: (row) => row.age, sortable: true },
    { name: "Complaint", selector: (row) => row.Disease },
    { name: "Credit Amt", selector: (row) => row.creditamount },
    { name: "Address", selector: (row) => row.localAddressDistrict },
    { name: "Category", selector: (row) => row.category, sortable: true },
    {
      name: "Added On",
      selector: (row) => new Date(row.createdAt).toISOString().split("T")[0],
      sortable: true,
    },
    {
      name: "Added By", selector: (row) => row.addedby,

      // width: "60px",
      // center: true,
      // minWidth: "200px",    we Have these option also to manage the column width here

    },
    {
      name: "id", selector: (row) => row.id, hidden: true
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
        title="Patient List"
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

export default PatientList;
