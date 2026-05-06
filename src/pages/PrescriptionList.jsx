import React, { useState, useRef, useEffect } from "react";
import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";
import {
  useTogglePrescriptionStatusMutation,
  useLazyExportPrescriptionsExcelQuery,
  useSearchOpdBillNoQuery,
  useGetPrescriptionsListQuery,
} from "../redux/apiSlice";
import { useReactToPrint } from "react-to-print";
import PrescriptionPrint from "./PrescriptionPrint";
import { useNavigate } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";
import { healthAlerts, healthAlert } from "../utils/healthSwal";
import { generateFileName, downloadBlob } from "../utils/helper";
import Avatar from "../components/common/Avatar";
const PrescriptionListCopy = () => {
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
    try {
      const blob = await exportExcel(filters).unwrap();
      const fileName = generateFileName("prescriptions", {
        dateFrom: filters?.date_from,
        dateTo: filters?.date_to,
        extension: "xlsx",
      });

      downloadBlob(blob, fileName);
    } catch (error) {
      healthAlert({
        title: "Prescriptions Error",
        text: error?.data?.message || "Something went wrong",
        icon: "error",
      });
    }
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
      name: "Patient",
      minWidth: "250px",

      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={row.patientName} gender={row.gender} age={row.age} />

            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <div className="leading-tight">
            <p className="font-semibold text-gray-800">
              {row.patientName || "-"}
            </p>

            <p className="text-xs text-gray-500">
              UHID : {row.picasoId || "-"}
            </p>
          </div>
        </div>
      ),
    },
    {
      name: "Age",
      cell: (row) => (
        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
          {`${row.age ? `${row.age} yrs` : "N/A"}`}
        </span>
      ),
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
       : "bg-pink-100 text-pink-700"
   }

   `}
          >
            {gender === "male" ? "👨 Male" : "👩 Female"}
          </span>
        );
      },
    },
    {
      name: "Phone",
      title: "Mobile Number",
      selector: (row) => safeString(row?.contactNo, "-"),

      grow: 1,
    },
    {
      name: "Added Date",
      selector: (row) =>
        row?.addedDate
          ? new Date(row.addedDate).toISOString().split("T")[0]
          : "-",
    },
    {
      name: "Status",
      cell: (row) => {
        const active = row.isActive;

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold

   ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}

   `}
          >
            {active ? "Active" : "Inactive"}
          </span>
        );
      },
    },
  ];

  const navigate = useNavigate();
  const handleEdit = (row) => {
    if (!row?.ID) return;

    navigate(`/prescription-form/${row.ID}`, {
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
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Prescription List
      </h1>
      <CopyFilterBar
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
        title="Prescription List"
        data={patients}
        columns={columns}
        totalRows={pagination.totalRecords || 0}
        currentPage={pagination.currentPage || page}
        perPage={limit}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        enableActions
        actionButtons={["edit", "delete", "print"]}
        isLoading={isLoading}
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

export default PrescriptionListCopy;
