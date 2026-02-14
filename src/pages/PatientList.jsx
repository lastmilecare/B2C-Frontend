import React, { useState } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import { useGetPatientsQuery, useSearchUHIDQuery } from "../redux/apiSlice";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
const PatientList = () => {
  const [uhidSearch, setUhidSearch] = useState("");
  const debouncedUhid = useDebounce(uhidSearch, 500);
  const { data: suggestions = [] } = useSearchUHIDQuery(
    debouncedUhid,
    { skip: debouncedUhid.length < 2 }
  );
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
  const navigate = useNavigate();
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
    setTempFilters(prev => ({ ...prev, external_id: val }));
    setUhidSearch("");
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
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
    { label: "UHID", name: "external_id", type: "text",
      suggestionConfig: {
        minLength: 2,
        keyField: "external_id",
        valueField: "external_id",
        secondaryField: "name",
      },
     },
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
    { label: "Date from", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
    { label: "Unique Id", name: "idProof_number", type: "text" },
  ];

  const columns = [
    { name: "S.No", selector: (row, i) => (page - 1) * limit + i + 1 },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Mobile", selector: (row) => row.contactNumber, width: "120px" },
    // { name: "Centre", selector: (row) => row.driver_cetname },  // this will show based on the login
    { name: "UHID", selector: (row) => row.external_id, width: "120px", sortable: true },
    { name: "Gender", selector: (row) => row.gender },
    { name: "Age", selector: (row) => row.age, sortable: true },
    { name: "Complaint", selector: (row) => row.Disease || "N/A" }, //this need to fix
    { name: "Credit Amt", selector: (row) => row.creditamount || 0 },
    { name: "Address", selector: (row) => row.localAddress },
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
        suggestions={suggestions}
        uhidSearch={uhidSearch}
        onSelectSuggestion={handleSelectSuggestion}
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
        actionButtons={["edit","delete"]}
        onEdit={(row) => {
          navigate(`/patient-registration/${row.id}`);
        }}
      />
    </div>
  );
};

export default PatientList;
