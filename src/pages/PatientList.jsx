import React, { useState } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import { useGetPatientsQuery, useSearchUHIDQuery } from "../redux/apiSlice";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { cookie } from "../utils/cookie";
import { healthAlert } from "../utils/healthSwal";
const username = cookie.get("username");
const PatientList = () => {
  const [uhidSearch, setUhidSearch] = useState("");
  const debouncedUhid = useDebounce(uhidSearch, 500);
  const { data: suggestions = [] } = useSearchUHIDQuery(debouncedUhid, {
    skip: debouncedUhid.length < 2,
  });
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
    idProof_number: "",
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
    setTempFilters((prev) => ({ ...prev, external_id: val }));
    setUhidSearch("");
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleApplyFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    const { startDate, endDate } = tempFilters;

    if (endDate && endDate > today) {
      healthAlert({
        title: "Invalid Date",
        text: "End date cannot be greater than today.",
        icon: "info",
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
     healthAlert({
        title: "Date Range Error",
        text: "Start date cannot be after end date.",
        icon: "info",
      });
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
      idProof_number: "",
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
        { label: "BPL", value: "bpl" },
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
    {
      name: "UHID",
      selector: (row) => row.external_id,
      width: "120px",
      sortable: true,
    },
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
      name: "Added By",
      selector: (row) => row.addedby,

      // width: "60px",
      // center: true,
      // minWidth: "200px",    we Have these option also to manage the column width here
    },
    {
      name: "id",
      selector: (row) => row.id,
      hidden: true,
    },
  ];
  const handlePrint = () => {
    const today = new Date().toLocaleDateString();
    const loginUser = username || "Admin";

    const printWindow = window.open("", "", "width=1200,height=800");

    const tableRows = patients
      .map(
        (row, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${row.external_id || ""}</td>
        <td>${row.name || ""}</td>
        <td>${row.gender || ""}</td>
        <td>${row.age || ""}</td>
        <td>${row.category || ""}</td>
        <td>${row.co || "N/A"}</td>
        <td>${row.contactNumber || ""}</td>
        <td>${row.localAddress || "N/A"}</td>
        <td>${row.localAddressState || "N/A"}</td>
        <td>${row.localAddressDistrict || "N/A"}</td>
        <td>${row.idProof_number || "N/A"}</td>
        <td>${new Date(row.createdAt).toLocaleDateString()}</td>
      </tr>
    `,
      )
      .join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>OPD Patient List</title>
        <style>
          @page {
            size: landscape;
          }

          body { 
            font-family: Arial; 
            padding: 20px; 
          }

          h2 { 
            text-align: center; 
            margin-bottom: 20px; 
          }

          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            font-size: 12px;
          }

          th, td { 
            border: 1px solid #000; 
            padding: 6px; 
            text-align: left; 
          }

          th { 
            background-color: #f2f2f2; 
          }

          .footer { 
            margin-top: 30px; 
            display: flex; 
            justify-content: space-between; 
            font-size: 13px; 
          }
        </style>
      </head>
      <body>

        <h2>List of OPD Patient</h2>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>UHID</th>
              <th>Name</th>
              <th>Gender</th>
              <th>Age</th>
              <th>Category</th>
              <th>C/O</th>
              <th>Mobile</th>
              <th>Address</th>
              <th>State</th>
              <th>District</th>
              <th>Identity No.</th>
              <th>Added On</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <div><strong>Powered by : Last Mile Care</strong></div>
          <div>Prepared By: ${loginUser}</div>
          <div>Date: ${today}</div>
        </div>

      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="p-0">
      <FilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        // onExport={() => console.log("Export clicked!")}
        suggestions={suggestions}
        uhidSearch={uhidSearch}
        onSelectSuggestion={handleSelectSuggestion}
        onPrint={handlePrint}
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
        actionButtons={["edit", "delete"]}
        onEdit={(row) => {
          navigate(`/patient-registration/${row.id}`);
        }}
      />
    </div>
  );
};

export default PatientList;
