import React, { useState } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
// Use whichever hook name your apiSlice actually exports.
// If your apiSlice exported useGetOpdBillQuery, change the import accordingly.
import { useGetOpdBillingQuery } from "../redux/apiSlice";

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
    idProof_number: "",
  });
  const [filters, setFilters] = useState({});

  // API call (assumes this hook exists in your apiSlice)
  const { data, isLoading, isError, error } = useGetOpdBillingQuery(
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

  // helper: safe currency formatting
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return `₹0.00`;
    // If value is an object with amount property, try to extract it
    let v = value;
    if (typeof value === "object" && value !== null) {
      // if it's like { amount: 123 } or { value: "123" }
      if ("amount" in value) v = value.amount;
      else if ("value" in value) v = value.value;
      else v = NaN;
    }
    // allow numeric strings with commas
    if (typeof v === "string") {
      v = v.replace(/,/g, "");
    }
    const n = Number(v);
    if (!Number.isFinite(n)) return `₹0.00`;
    return `₹${n.toFixed(2)}`;
  };

  // helper: safe string
  const safeString = (v, fallback = "-") =>
    v === null || v === undefined || v === "" ? fallback : String(v);

  const filtersConfig = [
    { label: "UHID", name: "external_id", type: "text" },
    { label: "Bill No", name: "id", type: "text" },
    { label: "Department", name: "department", type: "select" },
    { label: "Doctor", name: "doctor", type: "select" },
    {
      label: "Fin Category",
      name: "category",
      type: "select",
      options: [
        { label: "APL", value: "apl" },
        { label: "BPL", value: "bpl" },
      ],
    },
    { label: "Pay Mode", name: "payment_mode", type: "select" },
    { label: "Collected By", name: "collected_by", type: "select" },
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

    { label: "Start Date", name: "startDate", type: "date" },
    { label: "End Date", name: "endDate", type: "date" },
    { label: "Unique Id", name: "idProof_number", type: "text" },
  ];

  const columns = [
    {
      name: "S.No",
      title: "Serial Number",
      selector: (row, i) => (page - 1) * limit + i + 1,
    },
    {
      name: "T.No",
      title: "Token Number",
      selector: (row) => safeString(row?.token_no, "-"),
      sortable: true,
    },
    {
      name: "B.No",
      title: "Bill Number",
      selector: (row) => safeString(row?.bill_no, "-"),
      sortable: true,
    },
    {
      name: "Cntr",
      title: "Centre Name",
      selector: (row) => safeString(row?.center_name, "-"),
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
      name: "Gen",
      title: "Gender",
      selector: (row) => safeString(row?.gender, "-"),
      width: "60px",
    },
    {
      name: "Addr",
      title: "Address / District",
      selector: (row) => safeString(row?.localAddressDistrict, "-"),
      width: "110px",
    },
    {
      name: "Cat",
      title: "Category",
      selector: (row) => safeString(row?.patient_type, "-"),
      sortable: true,
      width: "55px",
    },
    {
      name: "Ph",
      title: "Mobile Number",
      selector: (row) => safeString(row?.Mobile, "-"),
    },
    {
      name: "P.Due",
      title: "Previous Due Amount",
      selector: (row) => formatCurrency(row?.DueAmount),
      sortable: true,
      width: "80px",
    },
    {
      name: "B.Amt",
      title: "Bill Amount",
      selector: (row) => formatCurrency(row?.BillAmount ?? row?.PaidAmount),
      sortable: true,
      width: "80px",
    },
    {
      name: "T.Bill",
      title: "Total Bill Amount",
      selector: (row) => formatCurrency(row?.TotalServiceAmount),
      sortable: true,
      width: "80px",
    },
    {
      name: "P.Amt",
      title: "Paid Amount",
      selector: (row) => formatCurrency(row?.PaidAmount),
      sortable: true,
      width: "80px",
    },
    {
      name: "D.Amt",
      title: "Due Amount",
      selector: (row) => formatCurrency(row?.DueAmount),
      sortable: true,
      width: "80px",
    },
    {
      name: "P.Mode",
      title: "Payment Mode",
      selector: (row) => safeString(row?.payment_mode, "-"),
      width: "80px",
    },
    {
      name: "Dr.",
      title: "Consultant Doctor",
      selector: (row) => safeString(row?.doctor_name, "-"),
      width: "120px",
    },
    {
      name: "Srvc",
      title: "Service Name",
      selector: (row) => safeString(row?.ServiceType, "-"),
      width: "120px",
    },
    {
      name: "Ref",
      title: "Referred By",
      selector: (row) => safeString(row?.Disease, "-"),
    },
    {
      name: "Coll By",
      title: "Collected By",
      selector: (row) => safeString(row?.added_by, "-"),
      width: "120px",
    },
    {
      name: "B.Date",
      title: "Bill Date",
      selector: (row) =>
        row?.AddedDate ? new Date(row.AddedDate).toISOString().split("T")[0] : "-",
      sortable: true,
      width: "100px",
    },
  ];


  if (isError) {
    console.error("OPD Billing Fetch Error:", error);
  }

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
