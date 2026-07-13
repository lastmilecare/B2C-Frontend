import React, { useState, useRef, useEffect } from "react";
import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";
import {
  useGetOpdBillingQuery,
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
import { useSelector } from "react-redux";
const OpdListRevenue = () => {
  const [exportExcel] = useLazyExportOpdExcelQuery();
const { permissions } = useSelector((state) => state.auth);
const can = (permission) => {
  if (!permission) return true;
  return permissions?.includes(permission) ?? false;
};
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

  const { data, isLoading, isError, error, refetch } = useGetOpdBillingQuery(
    {
      page,
      limit,
      ...filters,
    },
    { skip: !page || !limit },
  );
const summary = data?.summary || {};
const pharmacy = summary.pharmaResult || {};
const spectacle = summary.specResult || {};
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

  const patients = data?.data || [];
  const pagination = data || { currentPage: page, totalRecords: 0 };
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

  const handleExport = async () => {
    try {
      const blob = await exportExcel(filters).unwrap();

      const fileName = generateFileName("OpdBillingDetail", {
        dateFrom: filters?.date_from,
        dateTo: filters?.date_to,
        extension: "xlsx",
      });

      downloadBlob(blob, fileName);
    } catch (error) {
      const status = error?.status;
      const message = error?.data?.message || "Something went wrong";

      // No data case
      if (status === 404) {
        return healthAlert({
          title: "No Data Found",
          text: message,
          icon: "info",
        });
      }

      // Real error
      healthAlert({
        title: "Export Error",
        text: message,
        icon: "error",
      });
    }
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
    { label: "Bill No", name: "bill_no", type: "text" },
    {
      label: "Department",
      name: "department",
      type: "select",
      options: department?.map((d) => ({ label: d.name, value: d.name })) || [],
    },

    {
      label: "Doctor",
      name: "doctor",
      type: "select",
      options:
        doctors?.map((d) => ({
          label: d.name || d.doctor_name,
          value: d.name,
        })) || [],
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
      options: paymode?.map((p) => ({ label: p.name, value: p.name })) || [],
    },

    {
      label: "Collected By",
      name: "added_by",
      type: "select",
      options:
        collectedBy?.map((u) => ({
          id: u.id,
          label: u.name,
          value: u.name,
        })) || [],
    },

    { label: "Mobile", name: "contactNumber", type: "text" },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      options: [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" },
      ],
    },

    { label: "Date from ", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
    { label: "Unique Id", name: "idProof_number", type: "text" },
  ];

  const columns = [
    {
      name: "S.No",
      title: "Serial Number",
      selector: (row, i) => (page - 1) * limit + i + 1,
      width: "70px",
    },
    {
      name: "T.No",
      title: "Token Number",
      selector: (row) => safeString(row?.token, "-"),
      sortable: true,
    },
    {
      name: "Bill No",
      title: "Bill Number",
      selector: (row) => safeString(row?.bill_no, "-"),
      sortable: true,
      width: "70px",
    },
    {
      name: "Center",
      title: "Centre Name",
      selector: (row) => safeString(row?.center_name, "-"),
      width: "140px",
    },
    {
      name: "UHID",
      title: "Unique Health ID",
      selector: (row) => safeString(row?.uhid, "-"),
      width: "135px",
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
        selector: (row) =>
    `${row?.iage ?? 0}y ${row?.imonth ?? 0}m ${row?.idays ?? 0}d`,
      sortable: true,
      width: "100px",
    },
    {
      name: "Gender",
      title: "Gender",
      selector: (row) => safeString(row?.gender, "-"),
      width: "60px",
    },
    {
      name: "Address",
      title: "Address / District",
      selector: (row) => safeString(row?.localAddress, "-"),
      width: "110px",
    },
    {
      name: "Category",
      title: "Category",
      selector: (row) => safeString(row?.patient_type, "-"),
      sortable: true,
      width: "55px",
    },
    {
      name: "Ph",
      title: "Mobile Number",
      selector: (row) => safeString(row?.contactNumber, "-"),
      width: "100px",
    },
    {
      name: "Total.Due (Rs.)",
      title: "Total Previous Due Amount",
      selector: (row) => formatCurrency(calculateDue(patients, row.uhid)),
      sortable: true,
      width: "110px",
    },
    {
      name: "Bill.Amt (Rs.)",
      title: "Bill Amount",
      selector: (row) => formatCurrency(row?.BillAmount ?? row?.PaidAmount),
      sortable: true,
      width: "100px",
    },
    {
      name: "T.Amt (Rs.)",
      title: "Total Bill Amount",
      selector: (row) => formatCurrency(row?.TotalServiceAmount),
      sortable: true,
      width: "95px",
    },
    {
      name: "P.Amt (Rs.)",
      title: "Paid Amount",
      selector: (row) => formatCurrency(row?.PaidAmount),
      sortable: true,
      width: "95px",
    },
    {
      name: "Due.Amt (Rs.)",
      title: "Due Amount",
      selector: (row) => formatCurrency(row?.DueAmount),
      sortable: true,
      width: "105px",
    },
    {
      name: "Pay.Mode",
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
      name: "Service",
      title: "Service Name",
      selector: (row) =>
        safeString(
          (row?.opd_billing_data || []).map((item, idx) => item?.ServiceName),
        ),
      width: "120px",
    },
    {
      name: "Ref",
      title: "Referred By",
      selector: (row) => safeString(row?.refer_to, "-"),
      width: "140px",
    },

    {
      name: "Collected By",
      title: "Collected By",
      selector: (row) => safeString(row?.added_by, "-"),
      width: "120px",
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
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">Opd Revenue</h1>
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
        onExport={handleExport}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <CommonList
        title="💳 OPD Revenue List"
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
        // enableActions
        isLoading={isLoading}
  //       actionButtons={["edit", "delete", "print", "printCS"]}
  //       onEdit={handleEdit}
  //       onDelete={handleDelete}
  //       onPrintCS={onPrintCS}
  //       onPrint={onPrintInvoice}
  //         enableAdd
  // addButtonText="Add"
  // onAdd={() => navigate("/opd-form")}
      />
      <section className="mt-4 border rounded-xl bg-emerald-50 px-6 py-4 shadow-sm">

  {/* OPD */}
  <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-emerald-900">

    <span>
      Total Bill Amount : Rs.
      <span className="font-semibold ml-1">
        {summary.totalBillAmount}
      </span>
    </span>

    <span>
      Total Paid Amount : Rs.
      <span className="font-semibold ml-1">
        {summary.totalPaidAmount}
      </span>
    </span>

    <span>
      Total Due Amount : Rs.
      <span className="font-semibold ml-1">
        {summary.totalDueAmount}
      </span>
    </span>

    <span>
      Total Cash Amount : Rs.
      <span className="font-semibold ml-1">
        {summary.totalCashAmount}
      </span>
    </span>

    <span>
      Total Online / UPI / Cost Free / Card : Rs.
      <span className="font-semibold ml-1">
        {summary.totalUpiAmount}
      </span>
    </span>

  </div>

  <hr className="my-4 border-emerald-200"/>

  {/* Pharmacy */}

  <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-emerald-900">

    <span>
      Total Pharmacy Revenue : Rs.
      <span className="font-semibold ml-1">
        {pharmacy.pharmacyRevenue}
      </span>
    </span>

    <span>
      Pharmacy Paid Amount : Rs.
      <span className="font-semibold ml-1">
        {pharmacy.pharmacyPaid}
      </span>
    </span>

    <span>
      Pharmacy Due Amount : Rs.
      <span className="font-semibold ml-1">
        {pharmacy.pharmacyDue}
      </span>
    </span>

    <span>
      Pharmacy Cash Amount : Rs.
      <span className="font-semibold ml-1">
        {pharmacy.pharmacyCash}
      </span>
    </span>

    <span>
      Pharmacy Online / UPI / Cost Free / Card Amount : Rs.
      <span className="font-semibold ml-1">
        {pharmacy.pharmacyUpi}
      </span>
    </span>

  </div>
{can("read:spectacle_revenue") && (
  <>
  <hr className="my-4 border-emerald-200"/>

  {/* Spectacle */}

  <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-emerald-900">

    <span>
      Total Spectacle Revenue : Rs.
      <span className="font-semibold ml-1">
        {spectacle.spectacleRevenue}
      </span>
    </span>

    <span>
      Spectacle Paid Amount : Rs.
      <span className="font-semibold ml-1">
        {spectacle.spectaclePaid}
      </span>
    </span>

    <span>
      Spectacle Due Amount : Rs.
      <span className="font-semibold ml-1">
        {spectacle.spectacleDue}
      </span>
    </span>

    <span>
      Spectacle Cash Amount : Rs.
      <span className="font-semibold ml-1">
        {spectacle.spectacleCash}
      </span>
    </span>

    <span>
      Spectacle Online / UPI / Cost Free / Card : Rs.
      <span className="font-semibold ml-1">
        {spectacle.spectacleUpi}
      </span>
    </span>

  </div>
  </>
)}

  <hr className="my-4 border-emerald-300"/>

  {/* Grand Total */}

  <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-emerald-700">

    <span>
      Grand Total : Rs.
      <span className="ml-1">
        {summary.grandTotal}
      </span>
    </span>

    <span>
      Total Paid : Rs.
      <span className="ml-1">
        {summary.grandPaid}
      </span>
    </span>

    <span>
      Total Due : Rs.
      <span className="ml-1">
        {summary.grandDue}
      </span>
    </span>

    <span>
      Total Cash : Rs.
      <span className="ml-1">
        {summary.grandCash}
      </span>
    </span>

    <span>
      Total Online / UPI / Cost Free / Card : Rs.
      <span className="ml-1">
        {summary.grandUpi}
      </span>
    </span>

  </div>

</section>
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

export default OpdListRevenue;
