import React, { useState, useRef, useEffect } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import {
  useTogglePrescriptionStatusMutation,
  useLazyExportPrescriptionsExcelQuery,
  useSearchOpdBillNoQuery,
  useGetPrescriptionsListQuery,
} from "../redux/apiSlice";
import { useReactToPrint } from "react-to-print";
import PrescriptionPrint from "./PrescriptionPrint";
import { px, wrap } from "framer-motion";
import { useNavigate } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import { healthAlerts,healthAlert } from "../utils/healthSwal";
const PrescriptionList = () => {
  const [exportExcel] = useLazyExportPrescriptionsExcelQuery();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [billSearch, setBillSearch] = useState("");
  const [tempFilters, setTempFilters] = useState({
    name: "",
    mobileno: "",
    category: "",
    date_from: "",
    date_to: "",
    bill_no: "",
  });
  const debouncedBillSearch = useDebounce(billSearch, 500);
  const { data: billSuggestions = [] } = useSearchOpdBillNoQuery(
    debouncedBillSearch,
    {
      skip: debouncedBillSearch.length < 1,
    },
  );
  const [toggleStatus] = useTogglePrescriptionStatusMutation();
  const [filters, setFilters] = useState({});
  const [printRow, setPrintRow] = useState(null);
  const printRef = useRef();
  const { data, isLoading, isError, error } = useGetPrescriptionsListQuery(
    {
      page,
      limit,
      ...filters,
    },
    { skip: !page || !limit },
  );

  const patients = data?.data || [];
  const pagination = data?.pagination || { currentPage: page, totalRecords: 0 };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "bill_no") {
      if (!/^\d*$/.test(value)) return;
    }
    if (name === "mobileno") {
      if (!/^\d*$/.test(value)) return;
    }

    setTempFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectBillSuggestion = (val) => {
    setTempFilters((prev) => ({ ...prev, bill_no: val }));
    setBillSearch("");
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const handleExport = async () => {
    const blob = await exportExcel(filters).unwrap();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prescriptions.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleApplyFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    const { date_from, date_to } = tempFilters;
    if (date_to && date_to > today) {
      healthAlerts.success("End date cannot be greater than today.");
      return;
    }
    if (date_from && date_to && date_from > date_to) {
      healthAlerts.warning("Start date cannot be after end date.");
      return;
    }
    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({
      Name_: "",
      mobileno: "",
      date_from: "",
      date_to: "",
      bill_no: "",
      status: "",
    });
    setFilters({});
    setPage(1);
  };
  const filtersConfig = [
    {
      label: "Bill No",
      name: "bill_no",
      type: "text",
      inputMode: "numeric",
      pattern: "[0-9]*",
      suggestionConfig: {
        minLength: 1,
        keyField: "ID",
        valueField: "ID",
        secondaryField: "name",
      },
    },
    { label: "Name", name: "Name_", type: "text" },
    { label: "Start Date", name: "date_from", type: "date" },
    { label: "End Date", name: "date_to", type: "date" },
    { label: "Mobile", name: "mobileno", type: "text" },
    {
      label: "Status",
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
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
      selector: (row) => safeString(row?.billNo, "-"),
      sortable: true,
      width: "110px",
    },
    {
      name: "UHID",
      title: "Unique Health ID",
      selector: (row) => safeString(row?.picasoId, "-"),
      // width: "220px",/
      grow: 2,
      sortable: true,
      center: true,
    },
    {
      name: "Name",
      title: "Patient Name",
      selector: (row) => safeString(row?.patientName, "-"),
      sortable: true,
      grow: 2,
      center: true,
    },
    {
      name: "Age",
      title: "Patient Age",
      selector: (row) => safeString(row?.age, "-"),
      sortable: true,
      // width: "80px",
      grow: 1,
      center: true,
    },
    {
      name: "Gender",
      title: "Gender",
      selector: (row) => safeString(row?.gender, "-"),
      // width: "100px",
      grow: 1,
      // center: true,
    },
    {
      name: "Phone",
      title: "Mobile Number",
      selector: (row) => safeString(row?.contactNo, "-"),
      // width: "150px",
      grow: 1,
    },
    {
      name: "Added Date",
      title: "Added Date",
      selector: (row) =>
        row?.addedDate
          ? new Date(row.addedDate).toISOString().split("T")[0]
          : "-",
      sortable: true,
      // width: "150px",
      grow: 1,
    },
  ];

  const navigate = useNavigate();
  const handleEdit = (row) => {
    if (!row?.ID) return;

    navigate(`/prescription/edit/${row.ID}`, {
      state: { row },
    });
  };

  const handleDelete = async (row) => {
    try {
      await toggleStatus(row.ID).unwrap();
      healthAlerts.warning("Prescription Inactive successfully");
    } catch (error) {
      healthAlert({
        title: "Prescription Error",
        text: error?.data?.message || "Something went wrong",
        icon: "error",
      });
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Prescription",
  });

  useEffect(() => {
    if (printRow && printRef.current) {
      handlePrint();

      setTimeout(() => {
        setPrintRow(null);
      }, 300);
    }
  }, [printRow]);

  const onPrint = (row) => {
    setPrintRow(row);
  };

  return (
    <div className="p-0">
      <FilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={(e) => {
          const { name, value } = e.target;
          if (name === "bill_no") {
            setBillSearch(value);
          }
          handleChange(e);
        }}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onExport={handleExport}
        suggestions={billSuggestions}
        onSelectSuggestion={handleSelectBillSuggestion}
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
        actionButtons={["edit", "delete", "print"]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={onPrint}
      />
      {printRow && (
        <div style={{ display: "none" }}>
          <PrescriptionPrint ref={printRef} data={printRow} />
        </div>
      )}
    </div>
  );
};

export default PrescriptionList;
