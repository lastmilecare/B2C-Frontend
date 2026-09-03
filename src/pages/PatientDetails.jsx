import React, { useState, useRef, useEffect } from "react";
import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";
import {
  useGetPatientDetailsQuery,
  useGetComboQuery,
  useSearchUHIDQuery,
  useDeleteOpdBillMutation,
  useLazyExportOpdExcelQuery,
  useGetCollectedByQuery,
} from "../redux/apiSlice";
import PrintOpdForm from "./PrintOpdForm";
import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "./InvoicePage";
import { healthAlert } from "../utils/healthSwal";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { generateFileName, downloadBlob } from "../utils/helper";
import { formatDate, formatTime } from "../utils/helper";
const PatientDetails = () => {
  const [exportExcel] = useLazyExportOpdExcelQuery();
  const [depCurrentVal, setDepCurrentVal] = useState();
  const navigate = useNavigate();
  const [deleteOpdBill] = useDeleteOpdBillMutation();
  const handleDelete = async (row) => {
    if (!row || !row.bill_no) {
      healthAlert({
        title: "Error",
        text: "Bill number not found for this record.",
        icon: "error",
      });
      return;
    }

    try {
      await deleteOpdBill(Number(row.bill_no)).unwrap();

      healthAlert({
        title: "Deleted!",
        text: "OPD Bill Deleted Successfully.",
        icon: "success",
      });
    } catch (error) {
      healthAlert({
        title: "Delete Error",
        text: error?.data?.message || "Something went wrong while deleting.",
        icon: "error",
      });
    }
  };

  const handleEdit = (row) => {
    if (!row || !row.bill_no) {
      healthAlert({
        title: "Error",
        text: "Bill number not found for this record.",
        icon: "error",
      });
      return;
    }

    navigate(`/opd-form/${row.bill_no}`, {
      state: {
        editData: row,
      },
    });
  };

  const [uhidSearch, setUhidSearch] = useState("");
  const debouncedUhid = useDebounce(uhidSearch, 500);
  const { data: suggestions = [] } = useSearchUHIDQuery(debouncedUhid, {
    skip: debouncedUhid.length < 2,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const today = new Date().toISOString().split("T")[0];
  const [tempFilters, setTempFilters] = useState({
    name: "",
    contactNumber: "",
    gender: "",
    category: "",
    startDate: "",
    endDate: "",
    external_id: "",
    idProof_number: "",
    department: "",
    bill_no: "",
    doctor: "",
    payment_mode: "",
    added_by: "",
  });
  const [filters, setFilters] = useState({});
  const [printRow, setPrintRow] = useState(null);
  const [printRow1, setPrintRow1] = useState(null);
  const printRef = useRef();
  const printRef1 = useRef();

  const { data, isLoading, isError, error, refetch } = useGetPatientDetailsQuery(
    {
      page,
      limit,
      ...filters,
    },
    { skip: !page || !limit },
  );

  const { data: doctors, isLoading: doctorsComboLoading } =
    useGetComboQuery("doctor");
  const { data: department, isLoading: departmentComboLoading } =
    useGetComboQuery("department");
  const { data: paymode, isLoading: paymodeComboLoading } =
    useGetComboQuery("paymode");
  const {
    data: collectedByResponse,
    isLoading: collectedComboLoading,
    refetch: refetchCollectedBy,
  } = useGetCollectedByQuery();

  const collectedBy = collectedByResponse?.data || [];
  const { data: nursing, isLoading: nursingComboLoading } =
    useGetComboQuery("nursing");
  const { data: lab, isLoading: labComboLoading } = useGetComboQuery("lab");

  const patients = data?.data || [];
  const pagination = data || { currentPage: page, totalRecords: 0 };
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "department") {
      setDepCurrentVal(value);
    }
    let finalValue = value;
    if (name === "contactNumber") {
      finalValue = value.replace(/[^0-9]/g, "").slice(0, 10);
    }

    setTempFilters((prev) => ({
      ...prev,
      [name]: finalValue,
      ...(name === "department" ? { doctor: "" } : {}),
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
        title: "Opd",
        text: `End date cannot be greater than today.`,
        icon: "info",
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      healthAlert({
        title: "Opd",
        text: `Start date cannot be after end date.`,
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
    setUhidSearch("");
    refetchCollectedBy();
    refetch();
  };
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return `Rs.0.00`;
    let v = value;
    if (typeof value === "object" && value !== null) {
      if ("amount" in value) v = value.amount;
      else if ("value" in value) v = value.value;
      else v = NaN;
    }
    if (typeof v === "string") {
      v = v.replace(/,/g, "");
    }
    const n = Number(v);
    if (!Number.isFinite(n)) return `Rs.0.00`;
    return `${n.toFixed(0)}`;
  };
  const safeString = (v, fallback = "-") =>
    v === null || v === undefined || v === "" ? fallback : String(v);
  const calculateDue = (rows, uhid) => {
    return rows
      .filter((r) => r.uhid === uhid) // ✅ correct field
      .reduce((acc, curr) => {
        const total = Number(curr.TotalServiceAmount) || 0;
        const paid = Number(curr.PaidAmount) || 0;

        return acc + (total - paid);
      }, 0);
  };
  const filtersConfig = [
    {
      label: "UHID",
      name: "external_id",
      type: "text",
      suggestionConfig: {
        minLength: 2,
        keyField: "external_id",
        valueField: "external_id",
        secondaryField: "name",
      },
    },
    { label: "Name", name: "name", type: "text" },
   

    { label: "Mobile", name: "contactNumber", type: "text" },
    
  ];

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "-";

    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };
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
      width: "100px",
    },
   
    {
      name: "UHID",
      title: "Unique Health ID",
      selector: (row) => safeString(row?.uhid, "-"),
      width: "150px",
      sortable: true,
    },
    {
      name: "Name",
      title: "Patient Name",
      selector: (row) => safeString(row?.patient_name, "-"),
      sortable: true,
      width: "150px",
    },
    {
      name: "Age",
      title: "Patient Age",
      selector: (row) =>
        `${row?.iage ?? 0}y ${row?.imonth ?? 0}m ${row?.idays ?? 0}d`,
      sortable: true,
      width: "150px",
    },
   
    {
      name: "Ph",
      title: "Mobile Number",
      selector: (row) => safeString(row?.contactNumber, "-"),
      width: "100px",
    },
   
    {
      name: "Service",
      title: "Service Name",
     
      selector: (row) =>
        truncateText(
          (row?.opd_billing_data || [])
            .map((item) => item?.ServiceName)
            .filter(Boolean)
            .join(", "),
          30,
        ),
      width: "220px",
      
    },


    {
      name: "Bill.Date",
      width: "140px",
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-700">
            {formatDate(row.AddedDate)}
          </span>
        </div>
      ),
    },
  ];

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Opd",
  });

  useEffect(() => {
    if (printRow && printRef.current) {
      handlePrint();

      setTimeout(() => {
        setPrintRow(null);
      }, 300);
    }
  }, [printRow]);

  const onPrintCS = (row) => {
    setPrintRow(row);
  };

  const handlePrint1 = useReactToPrint({
    contentRef: printRef1,
    documentTitle: "Invoice",
  });

  const onPrintInvoice = (row) => {
    setPrintRow1(null);

    setTimeout(() => {
      setPrintRow1({ ...row });

      setTimeout(() => {
        if (printRef1.current) {
          handlePrint1();
        }
      }, 300);
    }, 50);
  };

  return (
    <div className="p-0">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">Patient Details</h1>
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        uhidSearch={uhidSearch}
        onChange={(e) => {
          const { name, value } = e.target;
          if (name === "external_id") {
            setUhidSearch(value);
          }
          handleChange(e);
        }}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        // onExport={handleExport}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <CommonList
        title="💳 Patient Details List"
        columns={columns}
        data={patients}
        totalRows={pagination.total || 0}
        currentPage={pagination.page || page}
        perPage={limit}
        onPageChange={(newPage) => setPage(newPage)}
        onPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        enableActions
        isLoading={isLoading}
        actionButtons={["edit", "delete", "print", "printCS"]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrintCS={onPrintCS}
        onPrint={onPrintInvoice}
       
      />
      {printRow && (
        <div style={{ display: "none" }}>
          <PrintOpdForm ref={printRef} data={printRow} />
        </div>
      )}
      {printRow1 && (
        <div
          style={{
            position: "absolute",
            left: "-99999px",
            top: 0,
          }}
        >
          <InvoiceTemplate ref={printRef1} data={printRow1} />
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
