import React, { useState, useRef, useEffect } from "react";
import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";
import {
  useGetPatientDetailsQuery,
  useGetComboQuery,
  useSearchUHIDQuery,
  useDeleteOpdBillMutation,
  useGetCollectedByQuery,
} from "../redux/apiSlice";
import PrintOpdForm from "./PrintOpdForm";
import { useReactToPrint } from "react-to-print";
import InvoiceTemplate from "./InvoicePage";
import { healthAlert } from "../utils/healthSwal";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate, formatTime } from "../utils/helper";
import { cookie } from "../utils/cookie";
import * as XLSX from "xlsx-js-style";
const username = cookie.get("username");
const OpdBillAnalysis = () => {
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
  const [limit, setLimit] = useState(500);
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
  const hasFilters = Object.values(filters).some(
    (value) => value !== "" && value !== null && value !== undefined,
  );
  const [printRow, setPrintRow] = useState(null);
  const [printRow1, setPrintRow1] = useState(null);
  const printRef = useRef();
  const printRef1 = useRef();
  const [depCurrentVal, setDepCurrentVal] = useState();
  const { data, isLoading, isError, error, refetch } =
    useGetPatientDetailsQuery(
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
  const tenantId = Number(
    data?.mergedData?.[0]?.tenant_id ?? data?.data?.[0]?.tenant_id,
  );

  const showSpectacle = tenantId === 1;
  const showPharmacy = tenantId === 2;
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
  const { data: nursing, isLoading: nursingComboLoading } =
    useGetComboQuery("nursing");
  const { data: lab, isLoading: labComboLoading } = useGetComboQuery("lab");

  const collectedBy = collectedByResponse?.data || [];

  const patients = data?.mergedData || [];
  const pharmaSummary = patients?.[0]?.pharmaSummary || {};
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
    setLimit(500);
  };

  const handleExport = () => {
    const todayDate = new Date().toLocaleDateString();
    const loginUser = username || "Admin";

    // =========================================================
    // CREATE PDF
    // =========================================================

    const doc = new jsPDF("landscape", "mm", "a2");

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // =========================================================
    // TITLE
    // =========================================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);

    doc.text("OPD Analysis Report", 15, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    // =========================================================
    // FILTER INFORMATION
    // =========================================================

    let filterText = "";

    if (filters?.startDate) {
      filterText += `From: ${filters.startDate} `;
    }

    if (filters?.endDate) {
      filterText += `To: ${filters.endDate}`;
    }

    if (filterText) {
      doc.text(filterText, 15, 22);
    }

    // =========================================================
    // TABLE HEADERS
    // =========================================================

    const tableColumn = [
      "S.No",
      "T.No",
      "Bill No",
      "Center",
      "UHID",
      "Name",
      "Age",
      "Gender",
      "Address",
      "Category",
      "Mobile",
      "Previous Due",
      "Bill Amt",
      "Total Amt",
      "Paid Amt",
      "Due Amt",
      "Pay Mode",
      "Doctor",
      "Service",
      "Referred By",
      "Collected By",
      "Bill Date",
      ...(showPharmacy
        ? ["Pharmacy Bill No", "Pharmacy Item", "Pharmacy Amt", "Pharmacy Due"]
        : []),
      ...(showSpectacle ? ["Specs Amt", "Specs Due"] : []),
    ];

    // =========================================================
    // TABLE DATA
    // =========================================================

    const tableRows = patients.map((row, index) => [
      index + 1,

      safeString(row?.token, "-"),

      safeString(row?.bill_no, "-"),

      safeString(row?.center_name, "-"),

      safeString(row?.uhid, "-"),

      safeString(row?.patient_name, "-"),

      `${row?.iage ?? 0}y ${row?.imonth ?? 0}m ${row?.idays ?? 0}d`,

      safeString(row?.gender, "-"),

      safeString(row?.localAddress, "-"),

      safeString(row?.patient_type, "-"),

      safeString(row?.contactNumber, "-"),

      formatCurrency(
        Math.max(0, Number(calculateDue(patients, row?.uhid)) || 0),
      ),

      formatCurrency(row?.NetServiceAmount),

      formatCurrency(row?.NetServiceAmount),

      formatCurrency(row?.NetPaidAmount),

      formatCurrency(row?.NetDueAmount),

      safeString(row?.payment_mode, "-"),

      safeString(row?.doctor_name, "-"),

      // SERVICE
      (row?.opd_billing_data || [])
        .map((item) => item?.ServiceName)
        .filter(Boolean)
        .join(", ") || "-",

      safeString(row?.refer_to, "-"),

      safeString(row?.added_by, "-"),

      row?.AddedDate ? formatDate(row.AddedDate) : "-",
      ...(showPharmacy
        ? [
            safeString(row?.PharmaBillNo, "-"),
            safeString(row?.PharmaItemName, "-"),
            formatCurrency(row?.PharmaTotalAmount),
            formatCurrency(row?.pharmaSummary?.totalDue),
          ]
        : []),
      // SPECTACLE
      ...(showSpectacle
        ? [
            formatCurrency(row?.specTotalAmount),

            formatCurrency(row?.specDueAmount),
          ]
        : []),
    ]);

    // =========================================================
    // COLUMN WIDTHS
    // =========================================================

    // These are the preferred widths.
    // We automatically scale them so that ALL columns
    // fit inside the A2 page.

    const baseColumnWidths = [
      10, // S.No
      12, // T.No
      18, // Bill No
      18, // Center
      23, // UHID
      25, // Name
      18, // Age
      13, // Gender
      25, // Address
      13, // Category
      20, // Mobile
      18, // Previous Due
      16, // Bill Amt
      16, // Total Amt
      16, // Paid Amt
      16, // Due Amt
      25, // Pay Mode
      27, // Doctor
      50, // Service
      22, // Referred By
      25, // Collected By
      20, // Bill Date
    ];
    if (showPharmacy) {
      baseColumnWidths.push(
        22, // Pharmacy Bill No
        38, // Pharmacy Item
        18, // Pharmacy Amt
        18, // Pharmacy Due
      );
    }
    // Add spectacle widths
    if (showSpectacle) {
      baseColumnWidths.push(
        18, // Specs Amt
        18, // Specs Due
      );
    }

    // =========================================================
    // FIT ALL COLUMNS TO PAGE
    // =========================================================

    const tableLeftMargin = 8;
    const tableRightMargin = 8;

    const availableTableWidth = pageWidth - tableLeftMargin - tableRightMargin;

    const totalOriginalWidth = baseColumnWidths.reduce(
      (sum, width) => sum + width,
      0,
    );

    const widthScale = availableTableWidth / totalOriginalWidth;

    const scaledColumnWidths = baseColumnWidths.map(
      (width) => width * widthScale,
    );

    // =========================================================
    // COLUMN STYLE OBJECT
    // =========================================================

    const columnStyles = {};

    scaledColumnWidths.forEach((width, index) => {
      columnStyles[index] = {
        cellWidth: width,
      };
    });

    // =========================================================
    // MAIN TABLE
    // =========================================================

    autoTable(doc, {
      head: [tableColumn],

      body: tableRows,

      startY: filterText ? 30 : 24,

      theme: "grid",

      tableWidth: availableTableWidth,

      styles: {
        fontSize: 6,
        cellPadding: 1.5,
        overflow: "linebreak",
        valign: "middle",
        halign: "left",
        lineWidth: 0.15,
        textColor: [0, 0, 0],
      },

      headStyles: {
        fillColor: [235, 235, 235],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 6,
        halign: "center",
        valign: "middle",
        lineWidth: 0.15,
      },

      bodyStyles: {
        fontSize: 6,
        valign: "top",
      },

      columnStyles,

      margin: {
        left: tableLeftMargin,
        right: tableRightMargin,
        top: 10,
        bottom: 15,
      },

      rowPageBreak: "auto",

      showHead: "everyPage",
    });

    // =========================================================
    // NEW PAGE FOR SUMMARY
    // =========================================================

    doc.addPage();

    let y = 18;

    // =========================================================
    // SUMMARY TITLE
    // =========================================================

    doc.setFont("helvetica", "bold");

    doc.setFontSize(16);

    doc.setTextColor(0, 0, 0);

    doc.text("OPD BILLING SUMMARY", pageWidth / 2, y, {
      align: "center",
    });

    y += 10;

    // =========================================================
    // SECTION HEADER
    // =========================================================

    const drawSectionHeader = (title) => {
      doc.setFont("helvetica", "bold");

      doc.setFontSize(11);

      doc.setTextColor(0, 0, 0);

      doc.text(title, 15, y);

      y += 3;

      doc.setDrawColor(100, 100, 100);

      doc.line(15, y, pageWidth - 15, y);

      y += 7;
    };

    // =========================================================
    // SUMMARY ROW
    // =========================================================

    const drawSummaryRow = (items) => {
      const left = 15;

      const availableWidth = pageWidth - 30;

      const columnWidth = availableWidth / items.length;

      doc.setFont("helvetica", "normal");

      doc.setFontSize(9);

      doc.setTextColor(0, 0, 0);

      items.forEach((item, index) => {
        const x = left + index * columnWidth;

        // Label
        doc.setFont("helvetica", "normal");

        doc.text(item.label, x, y);

        // Value
        doc.setFont("helvetica", "bold");

        doc.text(String(item.value), x, y + 6);
      });

      y += 15;
    };

    // =========================================================
    // 1. OPD SUMMARY
    // =========================================================

    drawSectionHeader("OPD SUMMARY");

    drawSummaryRow([
      {
        label: "Total Bill Amount",
        value: `Rs. ${summary?.totalBillAmount || 0}`,
      },

      {
        label: "Total Paid Amount",
        value: `Rs. ${summary?.totalPaidAmount || 0}`,
      },

      {
        label: "Total Due Amount",
        value: `Rs. ${summary?.totalDueAmount || 0}`,
      },

      {
        label: "Total Cash Amount",
        value: `Rs. ${summary?.totalCashAmount || 0}`,
      },
    ]);

    drawSummaryRow([
      {
        label: "Total Online / UPI / Cost Free / Card",
        value: `Rs. ${summary?.totalUpiAmount || 0}`,
      },
    ]);

    y += 3;

    // =========================================================
    // 2. PHARMACY SUMMARY
    // =========================================================

    drawSectionHeader("PHARMACY SUMMARY");

    drawSummaryRow([
      {
        label: "Total Pharmacy Revenue",
        value: `Rs. ${pharmacy?.pharmacyRevenue || 0}`,
      },

      {
        label: "Pharmacy Paid Amount",
        value: `Rs. ${pharmacy?.pharmacyPaid || 0}`,
      },

      {
        label: "Pharmacy Due Amount",
        value: `Rs. ${pharmacy?.pharmacyDue || 0}`,
      },

      {
        label: "Pharmacy Cash Amount",
        value: `Rs. ${pharmacy?.pharmacyCash || 0}`,
      },
    ]);

    drawSummaryRow([
      {
        label: "Pharmacy Online / UPI / Cost Free / Card Amount",
        value: `Rs. ${pharmacy?.pharmacyUpi || 0}`,
      },
    ]);

    y += 3;

    // =========================================================
    // 3. PHARMACY BILLING SUMMARY
    // =========================================================
    if (showPharmacy) {
      drawSectionHeader("PHARMACY BILLING SUMMARY");

      drawSummaryRow([
        {
          label: "Pharmacy Total Sales",
          value: `Rs. ${pharmaSummary?.totalSales || 0}`,
        },

        {
          label: "Pharmacy Paid",
          value: `Rs. ${pharmaSummary?.totalPaid || 0}`,
        },

        {
          label: "Pharmacy Due",
          value: `Rs. ${pharmaSummary?.totalDue || 0}`,
        },

        {
          label: "Pharmacy Cash",
          value: `Rs. ${pharmaSummary?.cashTotal || 0}`,
        },
      ]);

      drawSummaryRow([
        {
          label: "Pharmacy Online / UPI",
          value: `Rs. ${pharmaSummary?.onlineTotal || 0}`,
        },

        {
          label: "Pharmacy Cost Free",
          value: `Rs. ${pharmaSummary?.costFreeTotal || 0}`,
        },

        {
          label: "Pharmacy Discount",
          value: `Rs. ${pharmaSummary?.totalDiscount || 0}`,
        },

        {
          label: "Pharmacy Issue Qty",
          value: pharmaSummary?.totalIssueQty || 0,
        },
      ]);

      y += 3;
    }
    // =========================================================
    // 4. SPECTACLE SUMMARY
    // =========================================================

    if (showSpectacle) {
      drawSectionHeader("SPECTACLE SUMMARY");

      drawSummaryRow([
        {
          label: "Total Spectacle Revenue",
          value: `Rs. ${spectacle?.spectacleRevenue || 0}`,
        },

        {
          label: "Spectacle Paid Amount",
          value: `Rs. ${spectacle?.spectaclePaid || 0}`,
        },

        {
          label: "Spectacle Due Amount",
          value: `Rs. ${spectacle?.spectacleDue || 0}`,
        },

        {
          label: "Spectacle Cash Amount",
          value: `Rs. ${spectacle?.spectacleCash || 0}`,
        },
      ]);

      drawSummaryRow([
        {
          label: "Spectacle Online / UPI / Cost Free / Card",
          value: `Rs. ${spectacle?.spectacleUpi || 0}`,
        },
      ]);

      y += 3;
    }

    // =========================================================
    // 5. GRAND TOTAL
    // =========================================================

    drawSectionHeader("GRAND TOTAL");

    drawSummaryRow([
      {
        label: "Grand Total",
        value: `Rs. ${summary?.grandTotal || 0}`,
      },

      {
        label: "Total Paid",
        value: `Rs. ${summary?.grandPaid || 0}`,
      },

      {
        label: "Total Due",
        value: `Rs. ${summary?.grandDue || 0}`,
      },

      {
        label: "Total Cash",
        value: `Rs. ${summary?.grandCash || 0}`,
      },
    ]);

    drawSummaryRow([
      {
        label: "Total Online / UPI / Cost Free / Card",
        value: `Rs. ${summary?.grandUpi || 0}`,
      },
    ]);

    // =========================================================
    // FOOTER
    // =========================================================

    doc.setDrawColor(100, 100, 100);

    doc.line(15, pageHeight - 22, pageWidth - 15, pageHeight - 22);

    doc.setFont("helvetica", "normal");

    doc.setFontSize(9);

    doc.setTextColor(80, 80, 80);

    doc.text("Powered by Last Mile Care", 15, pageHeight - 12);

    doc.text(`Prepared By: ${loginUser}`, pageWidth / 2, pageHeight - 12, {
      align: "center",
    });

    doc.text(`Date: ${todayDate}`, pageWidth - 15, pageHeight - 12, {
      align: "right",
    });

    // =========================================================
    // SAVE PDF
    // =========================================================

    doc.save(`OPD_Analysis_${Date.now()}.pdf`);
  };

  const handleExportExcel = () => {
    const todayDate = new Date().toLocaleDateString();
    const loginUser = username || "Admin";
    const HEADER_STYLE = {
      fill: { patternType: "solid", fgColor: { rgb: "059669" } },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "047857" } },
        bottom: { style: "thin", color: { rgb: "047857" } },
        left: { style: "thin", color: { rgb: "047857" } },
        right: { style: "thin", color: { rgb: "047857" } },
      },
    };
    const applyHeaderStyle = (sheet, rowIndex, colCount) => {
      for (let c = 0; c < colCount; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c });
        if (!sheet[cellRef]) sheet[cellRef] = { t: "s", v: "" };
        sheet[cellRef].s = HEADER_STYLE;
      }
    };

    const tableColumn = [
      "S.No",
      "T.No",
      "Bill No",
      "Center",
      "UHID",
      "Name",
      "Age",
      "Gender",
      "Address",
      "Category",
      "Mobile",
      "Previous Due",
      "Bill Amt",
      "Total Amt",
      "Paid Amt",
      "Due Amt",
      "Pay Mode",
      "Doctor",
      "Service",
      "Referred By",
      "Collected By",
      "Bill Date",
      ...(showPharmacy
        ? ["Pharmacy Bill No", "Pharmacy Item", "Pharmacy Amt", "Pharmacy Due"]
        : []),
      ...(showSpectacle ? ["Specs Amt", "Specs Due"] : []),
    ];

    const tableRows = patients.map((row, index) => [
      index + 1,
      safeString(row?.token, "-"),
      safeString(row?.bill_no, "-"),
      safeString(row?.center_name, "-"),
      safeString(row?.uhid, "-"),
      safeString(row?.patient_name, "-"),
      `${row?.iage ?? 0}y ${row?.imonth ?? 0}m ${row?.idays ?? 0}d`,
      safeString(row?.gender, "-"),
      safeString(row?.localAddress, "-"),
      safeString(row?.patient_type, "-"),
      safeString(row?.contactNumber, "-"),
      formatCurrency(
        Math.max(0, Number(calculateDue(patients, row?.uhid)) || 0),
      ),
      formatCurrency(row?.NetServiceAmount),
      formatCurrency(row?.NetServiceAmount),
      formatCurrency(row?.NetPaidAmount),
      formatCurrency(row?.NetDueAmount),
      safeString(row?.payment_mode, "-"),
      safeString(row?.doctor_name, "-"),
      (row?.opd_billing_data || [])
        .map((i) => i?.ServiceName)
        .filter(Boolean)
        .join(", ") || "-",
      safeString(row?.refer_to, "-"),
      safeString(row?.added_by, "-"),
      row?.AddedDate ? formatDate(row.AddedDate) : "-",
      ...(showPharmacy
        ? [
            safeString(row?.PharmaBillNo, "-"),
            safeString(row?.PharmaItemName, "-"),
            formatCurrency(row?.PharmaTotalAmount),
            formatCurrency(row?.pharmaSummary?.totalDue),
          ]
        : []),
      ...(showSpectacle
        ? [
            formatCurrency(row?.specTotalAmount),
            formatCurrency(row?.specDueAmount),
          ]
        : []),
    ]);
    const detailRows = [];

    let filterText = "";
    if (filters?.startDate) filterText += `From: ${filters.startDate} `;
    if (filters?.endDate) filterText += `To: ${filters.endDate}`;
    if (filterText) detailRows.push([filterText]);
    detailRows.push(tableColumn);
    detailRows.push(...tableRows);

    const detailSheet = XLSX.utils.aoa_to_sheet(detailRows);
    const headerRowIndex = filterText ? 1 : 0;

    applyHeaderStyle(detailSheet, headerRowIndex, tableColumn.length);
    detailSheet["!cols"] = tableColumn.map((col) => ({
      wch: Math.min(Math.max(col.length, 12), 40),
    }));
    detailSheet["!rows"] = detailSheet["!rows"] || [];
    detailSheet["!rows"][headerRowIndex] = { hpt: 28 };

    const summaryRows = [
      ["OPD BILLING SUMMARY"],
      [],
      ["OPD SUMMARY"],
      [
        "Total Bill Amount",
        `Rs. ${summary?.totalBillAmount || 0}`,
        "Total Paid Amount",
        `Rs. ${summary?.totalPaidAmount || 0}`,
        "Total Due Amount",
        `Rs. ${summary?.totalDueAmount || 0}`,
        "Total Cash Amount",
        `Rs. ${summary?.totalCashAmount || 0}`,
      ],
      [
        "Total Online / UPI / Cost Free / Card",
        `Rs. ${summary?.totalUpiAmount || 0}`,
      ],
      [],
      ["PHARMACY SUMMARY"],
      [
        "Total Pharmacy Revenue",
        `Rs. ${pharmacy?.pharmacyRevenue || 0}`,
        "Pharmacy Paid Amount",
        `Rs. ${pharmacy?.pharmacyPaid || 0}`,
        "Pharmacy Due Amount",
        `Rs. ${pharmacy?.pharmacyDue || 0}`,
        "Pharmacy Cash Amount",
        `Rs. ${pharmacy?.pharmacyCash || 0}`,
      ],
      [
        "Pharmacy Online / UPI / Cost Free / Card Amount",
        `Rs. ${pharmacy?.pharmacyUpi || 0}`,
      ],
    ];

    if (showPharmacy) {
      summaryRows.push(
        [],
        ["PHARMACY BILLING SUMMARY"],
        [
          "Pharmacy Total Sales",
          `Rs. ${pharmaSummary?.totalSales || 0}`,
          "Pharmacy Paid",
          `Rs. ${pharmaSummary?.totalPaid || 0}`,
          "Pharmacy Due",
          `Rs. ${pharmaSummary?.totalDue || 0}`,
          "Pharmacy Cash",
          `Rs. ${pharmaSummary?.cashTotal || 0}`,
        ],
        [
          "Pharmacy Online / UPI",
          `Rs. ${pharmaSummary?.onlineTotal || 0}`,
          "Pharmacy Cost Free",
          `Rs. ${pharmaSummary?.costFreeTotal || 0}`,
          "Pharmacy Discount",
          `Rs. ${pharmaSummary?.totalDiscount || 0}`,
          "Pharmacy Issue Qty",
          pharmaSummary?.totalIssueQty || 0,
        ],
      );
    }

    if (showSpectacle) {
      summaryRows.push(
        [],
        ["SPECTACLE SUMMARY"],
        [
          "Total Spectacle Revenue",
          `Rs. ${spectacle?.spectacleRevenue || 0}`,
          "Spectacle Paid Amount",
          `Rs. ${spectacle?.spectaclePaid || 0}`,
          "Spectacle Due Amount",
          `Rs. ${spectacle?.spectacleDue || 0}`,
          "Spectacle Cash Amount",
          `Rs. ${spectacle?.spectacleCash || 0}`,
        ],
        [
          "Spectacle Online / UPI / Cost Free / Card",
          `Rs. ${spectacle?.spectacleUpi || 0}`,
        ],
      );
    }

    summaryRows.push(
      [],
      ["GRAND TOTAL"],
      [
        "Grand Total",
        `Rs. ${summary?.grandTotal || 0}`,
        "Total Paid",
        `Rs. ${summary?.grandPaid || 0}`,
        "Total Due",
        `Rs. ${summary?.grandDue || 0}`,
        "Total Cash",
        `Rs. ${summary?.grandCash || 0}`,
      ],
      [
        "Total Online / UPI / Cost Free / Card",
        `Rs. ${summary?.grandUpi || 0}`,
      ],
      [],
      ["Powered by Last Mile Care"],
      [`Prepared By: ${loginUser}`, `Date: ${todayDate}`],
    );

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, detailSheet, "OPD Analysis");
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    XLSX.writeFile(workbook, `OPD_Analysis_${Date.now()}.xlsx`);
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
    setLimit(500);
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
        const total = Number(curr.NetServiceAmount) || 0;
        const paid = Number(curr.NetPaidAmount) || 0;

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
      options:
        department?.map((d) => ({
          label: d.name,
          value: d.name,
        })) || [],
    },
    {
      label:
        depCurrentVal === "DOCTORS"
          ? "Consulting Doctor"
          : depCurrentVal === "NURSING"
            ? "Nursing"
            : depCurrentVal === "LAB"
              ? "Lab"
              : "Consultant",

      name: "doctor",
      type: "select",

      options: [
        {
          label:
            depCurrentVal === "DOCTORS"
              ? "All Doctors"
              : depCurrentVal === "NURSING"
                ? "All Nursing"
                : depCurrentVal === "LAB"
                  ? "All Lab"
                  : "Select Department First",

          value: "",
        },

        ...(depCurrentVal === "DOCTORS"
          ? (doctors || []).map((d) => ({
              label: d.name || d.doctor_name,
              value: d.name || d.doctor_name,
            }))
          : []),

        ...(depCurrentVal === "NURSING"
          ? (nursing || []).map((d) => ({
              label: d.username,
              value: d.username,
            }))
          : []),

        ...(depCurrentVal === "LAB"
          ? (lab || []).map((d) => ({
              label: d.username,
              value: d.username,
            }))
          : []),
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
    // {
    //   label: "Gender",
    //   name: "gender",
    //   type: "select",
    //   options: [
    //     { label: "Male", value: "Male" },
    //     { label: "Female", value: "Female" },
    //     { label: "Other", value: "Other" },
    //   ],
    // },

    { label: "Date from ", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
    // { label: "Unique Id", name: "idProof_number", type: "text" },
  ];
  // const truncateText = (text, maxLength = 30) => {
  //   if (!text) return "-";

  //   return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  // };
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
      selector: (row) => {
        const due = Number(calculateDue(patients, row.uhid)) || 0;
        return formatCurrency(Math.max(0, due));
      },
      sortable: true,
      width: "110px",
    },
    {
      name: "Bill.Amt (Rs.)",
      title: "Bill Amount",
      selector: (row) => formatCurrency(row?.NetServiceAmount),
      sortable: true,
      width: "100px",
    },
    {
      name: "T.Amt (Rs.)",
      title: "Total Bill Amount",
      selector: (row) => formatCurrency(row?.NetServiceAmount),
      sortable: true,
      width: "95px",
    },
    {
      name: "P.Amt (Rs.)",
      title: "Paid Amount",
      selector: (row) => formatCurrency(row?.NetPaidAmount),
      sortable: true,
      width: "95px",
    },
    {
      name: "Due.Amt (Rs.)",
      title: "Due Amount",
      selector: (row) => formatCurrency(row?.NetDueAmount),
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
        (row?.opd_billing_data || [])
          .map((item) => item?.ServiceName)
          .filter(Boolean)
          .join(", ") || "-",
      sortable: true,
      width: "280px",
      wrap: true,
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
    ...(showPharmacy
      ? [
          {
            name: "Pharmacy Bill No",
            title: "Pharmacy Bill No",
            selector: (row) => safeString(row?.PharmaBillNo),
            width: "150px",
          },

          {
            name: "Pharmacy Item",
            title: "Pharmacy Item Name",
            selector: (row) => safeString(row?.PharmaItemName),
            width: "250px",
            wrap: true,
          },
          {
            name: "Pharmacy Amt",
            title: "Pharmacy Amount",
            selector: (row) => formatCurrency(row?.PharmaTotalAmount),
            sortable: true,
            width: "110px",
          },

          {
            name: "Pharmacy Due Amt",
            title: "Pharmacy Due Amount",
            selector: (row) => formatCurrency(row?.pharmaSummary?.totalDue),
            sortable: true,
            width: "120px",
          },
        ]
      : []),
    ...(showSpectacle
      ? [
          {
            name: "Specs Amt",
            title: "Specs Amount",
            selector: (row) => formatCurrency(row?.specTotalAmount),
            sortable: true,
            width: "110px",
          },

          {
            name: "Specs Due Amt",
            title: "Specs Due Amount",
            selector: (row) => formatCurrency(row?.specDueAmount),
            sortable: true,
            width: "120px",
          },
        ]
      : []),
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
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Opd Analysis
      </h1>
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
        onExport={handleExportExcel}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <CommonList
        title="💳 Opd Analysis List"
        columns={columns}
        data={patients}
        totalRows={hasFilters ? pagination.total || 0 : patients.length}
        currentPage={hasFilters ? pagination.page || page : 1}
        perPage={hasFilters ? limit : patients.length || 500}
        onPageChange={(newPage) => {
          if (hasFilters) {
            setPage(newPage);
          }
        }}
        onPerPageChange={(newLimit) => {
          if (hasFilters) {
            setLimit(newLimit);
            setPage(1);
          }
        }}
        isLoading={isLoading}
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
            <span className="font-semibold ml-1">{summary.totalDueAmount}</span>
          </span>

          <span>
            Total Cash Amount : Rs.
            <span className="font-semibold ml-1">
              {summary.totalCashAmount}
            </span>
          </span>

          <span>
            Total Online / UPI / Cost Free / Card : Rs.
            <span className="font-semibold ml-1">{summary.totalUpiAmount}</span>
          </span>
        </div>

        <hr className="my-4 border-emerald-200" />

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
            <span className="font-semibold ml-1">{pharmacy.pharmacyPaid}</span>
          </span>

          <span>
            Pharmacy Due Amount : Rs.
            <span className="font-semibold ml-1">{pharmacy.pharmacyDue}</span>
          </span>

          <span>
            Pharmacy Cash Amount : Rs.
            <span className="font-semibold ml-1">{pharmacy.pharmacyCash}</span>
          </span>

          <span>
            Pharmacy Online / UPI / Cost Free / Card Amount : Rs.
            <span className="font-semibold ml-1">{pharmacy.pharmacyUpi}</span>
          </span>
        </div>
        {showPharmacy && (
          <>
            {/* Pharmacy Summary */}
            <hr className="my-4 border-emerald-200" />

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-emerald-800">
                Pharmacy Billing Summary
              </h3>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-emerald-900">
              <span>
                Pharmacy Total Sales :
                <span className="font-semibold ml-1">
                  Rs. {pharmaSummary?.totalSales || 0}
                </span>
              </span>

              <span>
                Pharmacy Paid :
                <span className="font-semibold ml-1">
                  Rs. {pharmaSummary?.totalPaid || 0}
                </span>
              </span>

              <span>
                Pharmacy Due :
                <span className="font-semibold ml-1">
                  Rs. {pharmaSummary?.totalDue || 0}
                </span>
              </span>

              <span>
                Pharmacy Cash :
                <span className="font-semibold ml-1">
                  Rs. {pharmaSummary?.cashTotal || 0}
                </span>
              </span>

              <span>
                Pharmacy Online / UPI :
                <span className="font-semibold ml-1">
                  Rs. {pharmaSummary?.onlineTotal || 0}
                </span>
              </span>

              <span>
                Pharmacy Cost Free :
                <span className="font-semibold ml-1">
                  Rs. {pharmaSummary?.costFreeTotal || 0}
                </span>
              </span>

              <span>
                Pharmacy Discount :
                <span className="font-semibold ml-1">
                  Rs. {pharmaSummary?.totalDiscount || 0}
                </span>
              </span>

              <span>
                Pharmacy Issue Qty :
                <span className="font-semibold ml-1">
                  {pharmaSummary?.totalIssueQty || 0}
                </span>
              </span>
            </div>
          </>
        )}
        {showSpectacle && (
          <>
            <hr className="my-4 border-emerald-200" />

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

        <hr className="my-4 border-emerald-300" />
        {showPharmacy && (
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-red-600">
              *Note: This does not include pharmacy bill amounts. For pharmacy
              billing summary, please refer to the pharmacy section above.
            </h3>
          </div>
        )}
        {/* Grand Total */}

        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-emerald-700">
          <span>
            Grand Total : Rs.
            <span className="ml-1">{summary.grandTotal}</span>
          </span>

          <span>
            Total Paid : Rs.
            <span className="ml-1">{summary.grandPaid}</span>
          </span>

          <span>
            Total Due : Rs.
            <span className="ml-1">{summary.grandDue}</span>
          </span>

          <span>
            Total Cash : Rs.
            <span className="ml-1">{summary.grandCash}</span>
          </span>

          <span>
            Total Online / UPI / Cost Free / Card : Rs.
            <span className="ml-1">{summary.grandUpi}</span>
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

export default OpdBillAnalysis;
