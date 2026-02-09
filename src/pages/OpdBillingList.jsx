import React, { useState, useRef, useEffect } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import { useGetOpdBillingQuery, useGetComboQuery, useSearchUHIDQuery, useDeleteOpdBillMutation} from "../redux/apiSlice";
import PrintOpdForm from "./PrintOpdForm";
import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "./InvoicePage";
import { healthAlert } from "../utils/healthSwal";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";

const OpdBillingList = () => {
  const navigate = useNavigate();
  const [deleteOpdBill] = useDeleteOpdBillMutation();
  const handleDelete = async (row) => {
  if (!row || !row.bill_no) {
    alert("Bill number not found");
    return;
  }
  const confirm = window.confirm(
    `Are you sure you want to delete OPD Bill No ${row.bill_no}?`
  );
  if (!confirm) return;

  // 3️⃣ API call
  try {
    await deleteOpdBill(Number(row.bill_no)).unwrap();

    healthAlert({
  title: "Success",
  text: "OPD Bill deleted successfully",
  icon: "success",
});   

  } catch (error) {
    alert("Delete failed");
    error.message("DELETE ERROR:", error);
  }
};

const handleEdit = (row) => {
  if (!row || !row.bill_no) {
    alert("Bill number not found");
    return;
  }

   navigate(`/opd-form/${row.bill_no}`, {
    state: {
      editData: row,    
    }
  });
};

  
  
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
    idProof_number: "",
  });
  const [filters, setFilters] = useState({});
  const [printRow, setPrintRow] = useState(null);
  const [printRow1, setPrintRow1] = useState(null);
  const printRef = useRef();
  const printRef1 = useRef();
  // API call (assumes this hook exists in your apiSlice)
  const { data, isLoading, isError, error } = useGetOpdBillingQuery(
    {
      page,
      limit,
      ...filters,
    },
    { skip: !page || !limit }
  );

  const { data: doctors, isLoading: doctorsComboLoading } = useGetComboQuery("doctor");
  const { data: department, isLoading: departmentComboLoading } = useGetComboQuery("department");
  const { data: paymode, isLoading: paymodeComboLoading } = useGetComboQuery("paymode");
  const { data: collectedBy, isLoading: collectedComboLoading } = useGetComboQuery("collectedBy");

  const patients = data?.data || [];
  const pagination = data?.pagination || { currentPage: page, totalRecords: 0 };
const handleChange = (e) => {
  const { name, value } = e.target;
  let finalValue = value;
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
  };
  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return `₹0.00`;
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
    if (!Number.isFinite(n)) return `₹0.00`;
    return `₹${n.toFixed(0)}`; // change as per need the value value ex 2
  };
  const safeString = (v, fallback = "-") =>
    v === null || v === undefined || v === "" ? fallback : String(v);

  const filtersConfig = [
    { label: "UHID", name: "external_id", type: "text" },
    { label: "Bill No", name: "id", type: "text" },
    {
      label: "Department",
      name: "department",
      type: "select",
      options: department?.map((d) => ({ label: d.name, value: d.id })) || [],
    },

    {
      label: "Doctor",
      name: "doctor",
      type: "select",
      options: doctors?.map((d) => ({ label: d.name || d.doctor_name, value: d.id })) || [],
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
    {
      label: "Pay Mode",
      name: "payment_mode",
      type: "select",
      options: paymode?.map((p) => ({ label: p.name, value: p.id })) || [],
    },

    {
      label: "Collected By",
      name: "collected_by",
      type: "select",
      options: collectedBy?.map((u) => ({ label: u.name, value: u.id })) || [],
    },

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

    { label: "Date from ", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
    { label: "Unique Id", name: "idProof_number", type: "text" },
  ];
  // const handlePrintForm = () => {
  //   window.open("/print-opd-form", "_blank");
  // };
  const columns = [
    {
      name: "S.No",
      title: "Serial Number",
      selector: (row, i) => (page - 1) * limit + i + 1,
    },
    {
      name: "T.No",
      title: "Token Number",
      selector: (row) => safeString(row?.token, "-"),
      sortable: true,
    },
    {
      name: "B.No",
      title: "Bill Number",
      selector: (row) => safeString(row?.bill_no, "-"),
      sortable: true,
      width: "70px",
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
      width: "115px",
      sortable: true,
    },
    {
      name: "Name",
      title: "Patient Name",
      selector: (row) => safeString(row?.patient_name, "-"),
      sortable: true,
      width: "100px",
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
      selector: (row) => safeString(row?.contactNumber, "-"),
      width: "93px"
    },
    {
      name: "P.Due",
      title: "Previous Due Amount",
      selector: (row) => formatCurrency(row?.DueAmount),
      sortable: true,
      width: "70px",
    },
    {
      name: "B.Amt",
      title: "Bill Amount",
      selector: (row) => formatCurrency(row?.BillAmount ?? row?.PaidAmount),
      sortable: true,
      width: "70px",
    },
    {
      name: "T.Bill",
      title: "Total Bill Amount",
      selector: (row) => formatCurrency(row?.TotalServiceAmount),
      sortable: true,
      width: "70px",
    },
    {
      name: "P.Amt",
      title: "Paid Amount",
      selector: (row) => formatCurrency(row?.PaidAmount),
      sortable: true,
      width: "70px",
    },
    {
      name: "D.Amt",
      title: "Due Amount",
      selector: (row) => formatCurrency(row?.DueAmount),
      sortable: true,
      width: "70px",
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
      width: "100px",
    },
    {
      name: "Srvc",
      title: "Service Name",
      selector: (row) => safeString((row?.opd_billing_data || []).map((item, idx) => (item?.ServiceName))),
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


  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Opd"
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
    documentTitle: "Invoice"
  });


  useEffect(() => {
    if (printRow1 && printRef1.current) {
      handlePrint1();

      setTimeout(() => {
        setPrintRow1(null);
      }, 300);
    }
  }, [printRow1]);

  const onPrintInvoice = (row) => {
    setPrintRow1(row);
  };


  return (
    <div className="p-0">
      <FilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={(e) => {
          const { name, value } = e.target;
          if (name === "external_id") {
            setUhidSearch(value); 
          }
          handleChange(e); 
        }}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onExport={() => console.log("Export clicked!")}
        suggestions={suggestions}
        uhidSearch={uhidSearch}
        onSelectSuggestion={handleSelectSuggestion}

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
        actionButtons={["edit", "delete", "print", "printCS"]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrintCS={onPrintCS}
        onPrint={onPrintInvoice}
      />
      {printRow && (
        <div style={{ display: 'none' }}>
          <PrintOpdForm ref={printRef} data={printRow} />
        </div>
      )}
      {printRow1 && (
        <div style={{ display: "none" }}>
          <InvoiceTemplate ref={printRef1} data={printRow1} />
        </div>
      )}

    </div>
  );
};

export default OpdBillingList;
