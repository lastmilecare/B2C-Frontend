import React, { useState } from "react";
import CommonList from "../components/CommonList";

import CopyFilterBar from "../components/Updates/Filter";
import {
  useGetStockDetailsQuery,
  useGetComboQuery,
  useGetMediceneListQuery,
  useDeleteitemMutation,
} from "../redux/apiSlice";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { cookie } from "../utils/cookie";
import { healthAlert } from "../utils/healthSwal";
import { parseCurrency } from "../utils/helper";
import { formatDate, formatTime } from "../utils/helper";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
const username = cookie.get("username");

const StockDetailsCopy = () => {
  const [deleteitemid] = useDeleteitemMutation();
  const handleDelete = async (row) => {
    const id = row?.ID;

    if (!id) {
      healthAlert({
        title: "Error",
        text: "ID number not found for this record.",
        icon: "error",
      });

      return;
    }

    try {
      await deleteitemid(id).unwrap();

    healthAlert({
      title: "Deleted!",
      text: "Stock Record Deleted Successfully.",
      icon: "success",
    });

  } catch (error) {

    healthAlert({
      title: "Delete Error",
      text:
        error?.data?.message ||
        "Something went wrong while deleting.",
      icon: "error",
    });
  }
};
  const [ItemSearch, ItemNameSearch] = useState("");
  const debouncedItemSearch = useDebounce(ItemSearch, 500);
  const { data: suggestions = [] } = useGetMediceneListQuery(
    { searchTerm: debouncedItemSearch },
    {
      skip: debouncedItemSearch.length < 2,
    },
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: itemType, isLoading: doctorsComboLoading } =
    useGetComboQuery("medicine-type");

  const { data: Supplier, isLoading: SupplierLoading } =
    useGetComboQuery("mediciene-supplier");
  const [tempFilters, setTempFilters] = useState({
    RecieptNo: "",
    ItemTypeID: "",
    descriptions: "",
    startDate: "",
    endDate: "",
    SupplierID: "",
  });
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useGetStockDetailsQuery({
    page,
    limit,
    ...filters,
  });
  const medicineTypeOptions = itemType
    ? itemType.map((t) => ({ value: t.ID, label: t.Descriptions }))
    : [];
  const SupplierOptions = Supplier
    ? Supplier.map((t) => ({ value: t.ID, label: t.name }))
    : [];

  const Stock = data?.data || [];
  const pagination = data?.pagination || {};
  const summary = data?.summary || {};
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === "descriptions") {
      finalValue = value.toUpperCase();
      ItemNameSearch(finalValue);
    }
    setTempFilters((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSelectSuggestion = (val) => {
    setTempFilters((prev) => ({ ...prev, descriptions: val }));
    ItemNameSearch("");
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
      RecieptNo: "",
      ItemTypeID: "",
      descriptions: "",
      startDate: "",
      endDate: "",
      SupplierID: "",
    });
    setFilters({});
    setPage(1);
  };

  const filtersConfig = [
    {
      label: "Invoice No",
      name: "RecieptNo",
      type: "text",
    },
    {
      label: "Item Type",
      name: "ItemTypeID",
      type: "select",
      options: medicineTypeOptions,
    },
    {
      label: "Item Name",
      name: "descriptions",
      type: "text",
      suggestionConfig: {
        minLength: 2,
        keyField: "descriptions",
        valueField: "descriptions",
        secondaryField: "name",
      },
    },
    {
      label: "Supplier Name",
      name: "SupplierID",
      options: SupplierOptions,
      type: "select",
    },

    { label: "Date from", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
  ];

  const columns = [
    {
      name: "S.No",
      selector: (row, i) => (page - 1) * limit + i + 1,
      width: "80px",
    },
    {
      name: "Item Name",
      width: "160px",
      cell: (row) => (
        <span className="text-gray-700 font-medium">{row.ItemName}</span>
      ),
    },
    {
      name: "Supplier",
      width: "160px",
      cell: (row) => (
        <span className="text-gray-700 font-medium">{row.SupplierName}</span>
      ),
    },
    {
      name: "Invoice Date",
      selector: (row) => new Date(row.InvoiceDate).toISOString().split("T")[0],
      sortable: true,
      width: "120px",
    },
    {
      name: "Invoice",
      width: "120px",
      center: true,
      cell: (row) => (
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
          #{row.RecieptNo}
        </span>
      ),
    },
    {
      name: "Rack",
      width: "90px",
      center: true,
      cell: (row) => (
        <span className="font-semibold text-indigo-600">{row.RagNo}</span>
      ),
    },
    { name: "HSNCode", selector: (row) => row.HSNCode, width: "120px" },
    { name: "CGST (%)", selector: (row) => row.CGST, width: "120px" },
    { name: "SGST (%)", selector: (row) => row.SGST, width: "120px" },
    {
      name: "CP (Rs.)",
      width: "110px",
      right: true,
      cell: (row) => (
        <span className="font-semibold text-green-600">
          {parseCurrency(row.CP)}
        </span>
      ),
    },
    {
      name: "MRP (Rs.)",
      width: "110px",
      right: true,
      cell: (row) => (
        <span className="font-semibold text-blue-600">
          {parseCurrency(row.MRP)}
        </span>
      ),
    },
    {
      name: "CPU (Rs.)",
      selector: (row) => ` ${parseCurrency(row.CPU)}`,
      width: "120px",
    },
    {
      name: "MRPU (Rs.)",
      selector: (row) => `${parseCurrency(row.MRPU)}`,
      width: "120px",
    },
    {
      name: "Cnd.Qty",
      selector: (row) => parseCurrency(row.CondmQty),
      width: "120px",
    },
    {
      name: "Recv Qty",
      width: "110px",
      center: true,
      cell: (row) => (
        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
          {row.RecvQty}
        </span>
      ),
    },
    {
      name: "Sales Qty",
      selector: (row) => row.RecvQty - row.BalQty,
      width: "120px",
    },
    {
      name: "Bal Qty",
      width: "110px",
      center: true,
      cell: (row) => {
        const qty = row.BalQty;

        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold
    ${qty < 5 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {qty}
          </span>
        );
      },
    },
    {
      name: "Expiry",
      center:true,
      width: "120px",
      cell: (row) => {
        const expiry = new Date(row.ExpiryDate);
        const today = new Date();
        const diff = (expiry - today) / (1000 * 60 * 60 * 24);

        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold

   ${diff < 30 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
          >
            {expiry.toISOString().split("T")[0]}
          </span>
        );
      },
    },

    {
                  name: "Added On",
                  center: true,
                 width: "140px",
                  cell: (row) => (
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-slate-700">
                       {formatDate(row.AddedDate)}
                      </span>
            
                      <span className="text-slate-400">
                       {formatTime(row.AddedDate)}
                      </span>
                    </div>
                  ),
                },

    {
      name: "ID",
      selector: (row) => row.ID,
      hidden: true,
    },
  ];
  const handleDownloadPdf = () => {
    const today = new Date().toLocaleDateString();
    const loginUser = username || "Admin";

    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.text("Stock Report List", 14, 15);

    const tableColumn = [
      "S.No",
      "Supplier Name",
      "Invoice Date",
      "RecieptNo",
      "Batch No",
      "Rag No",
      "HSN Code",
      "CGST (%)",
      "SGST (%)",
      "CP (Rs.)",
      "MRP (Rs.)",
      "CPU (Rs.)",
      "MRPU (Rs.)",
      "Cond. Qty",
      "Recv. Qty",
      "Sales Qty",
      "Bal Qty",
      "Expiry Date",
      "Date",
    ];

    const tableRows = Stock.map((row, index) => [
      index + 1,
      row.SupplierName || "N/A",
      row.InvoiceDate ? new Date(row.InvoiceDate).toLocaleDateString() : "N/A",
      row.RecieptNo || "",
      row.BatchNo || "",
      row.RagNo || "",
      row.HSNCode || "",
      row.CGST || "N/A",
      row.SGST || "N/A",
      parseCurrency(row.CP || 0),
      parseCurrency(row.MRP || 0),
      parseCurrency(row.CPU || 0),
      parseCurrency(row.MRPU || 0),
      row.CondmQty || 0,
      row.RecvQty || 0,
      (row.RecvQty || 0) - (row.BalQty || 0),
      row.BalQty || 0,
      row.ExpiryDate ? new Date(row.ExpiryDate).toLocaleDateString() : "N/A",
      row.AddedDate ? new Date(row.AddedDate).toLocaleDateString() : "N/A",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        fontStyle: "bold",
      },
      theme: "grid",
      margin: {
        left: 5,
        right: 5,
      },
    });

    const finalY = doc.lastAutoTable.finalY || 30;

    doc.setFontSize(10);

    doc.text("Powered by : Last Mile Care", 14, finalY + 10);
    doc.text(`Prepared By: ${loginUser}`, 120, finalY + 10);
    doc.text(`Date: ${today}`, 240, finalY + 10);

    doc.save(`Stock_Report_${Date.now()}.pdf`);
  };
  
  const handlePrint = () => {
    const today = new Date().toLocaleDateString();
    const loginUser = username || "Admin";
    const printWindow = window.open("", "", "width=1200,height=800");
    const tableRows = Stock.map(
      (row, index) => `
      <tr>
        <td>${index + 1}</td>
         <td>${row.SupplierName || "N/A"}</td>
       <td>${new Date(row.InvoiceDate).toLocaleDateString()}</td>
        <td>${row.RecieptNo || ""}</td>
        <td>${row.BatchNo || ""}</td>
        <td>${row.RagNo || ""}</td>
        <td>${row.HSNCode || ""}</td>
        <td>${row.CGST || "N/A"}</td>
        <td>${row.SGST || "N/A"}</td>
        <td>${parseCurrency(row.CP || "N/A")}</td>
        <td>${parseCurrency(row.MRP || "N/A")}</td>
        <td>${parseCurrency(row.CPU || "N/A")}</td>
        <td>${parseCurrency(row.MRPU || "N/A")}</td>
        <td>${row.CondmQty || "N/A"}</td>
        <td>${row.RecvQty || "N/A"}</td>
        <td>${row.RecvQty - row.BalQty || "N/A"}</td>
        <td>${row.BalQty || "N/A"}</td>
        <td>${new Date(row.ExpiryDate).toLocaleDateString()}</td>
        <td>${new Date(row.AddedDate).toLocaleDateString()}</td>
       
      </tr>
    `,
    ).join("");

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
              <th>Supplier Name</th>
              <th>Invoice Date</th>
              <th>RecieptNo</th>
              <th>Batch No</th>
              <th>Rag No</th>
              <th>HSN Code</th>
              <th>CGST (%)</th>
              <th>SGST (%)</th>
              <th>CP (Rs.)</th>
              <th>MRP (Rs.)</th>
              <th>CPU (Rs.)</th>
              <th>MRPU (Rs.)</th>
              <th>Cond. Qty</th>
              <th>Recv. Qty</th>
              <th>Sales Qty</th>
              <th>Bal Qty</th>
              <th>Expiry Date</th>
              <th>Date</th>
              
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
  const Stat = ({ label, value }) => {
    return (
      <span className="whitespace-nowrap">
        <span className="text-gray-600">{label}:</span>{" "}
        <span className="font-medium text-gray-800">
          {Number(value || 0).toLocaleString("en-IN")}
        </span>
      </span>
    );
  };
  const inventorySummary = React.useMemo(() => {
    return Stock.reduce(
      (acc, item) => {
        const recvQty = Number(item.RecvQty || 0);
        const balQty = Number(item.BalQty || 0);
        const issueQty = Number(item.IssueQty || 0);
        const freeQty = Number(item.FreeRecvQty || 0);
        const condQty = Number(item.CondmQty || 0);

        const cp = Number(item.CP || 0);
        const mrp = Number(item.MRP || 0);

        acc.totalRecvQty += recvQty;
        acc.totalBalQty += balQty;
        acc.totalSalesQty += issueQty;
        acc.totalFreeQty += freeQty;
        acc.totalCondQty += condQty;
        acc.totalCostPrice += cp * recvQty;
        acc.totalMRP += mrp * recvQty;
        acc.totalRemainingCost += cp * balQty;
        acc.totalSalesAmount += mrp * issueQty;
        if (balQty < 5) {
          acc.lowStockCount += 1;
        }

        return acc;
      },
      {
        totalCostPrice: 0,
        totalMRP: 0,
        totalRemainingCost: 0,
        totalSalesAmount: 0,
        totalRecvQty: 0,
        totalBalQty: 0,
        totalSalesQty: 0,
        totalFreeQty: 0,
        totalCondQty: 0,

        lowStockCount: 0,
      },
    );
  }, [Stock]);
  return (
    <div className="p-0">
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        suggestions={suggestions?.data || []}
        ItemSearch={ItemSearch}
        onSelectSuggestion={handleSelectSuggestion}
        onExport={handleDownloadPdf}
      />

      <CommonList
        title="Medicine Stock List"
        columns={columns}
        data={Stock}
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
        onDelete={handleDelete}
        onEdit={(row) => {
          if (!row?.ID) return;

          navigate(`/purchased-entry/${row.ID}`, {
            state: { editData: row },
          });
        }}
      />

      <section className="mt-4 border rounded-xl bg-emerald-50 px-6 py-4 shadow-sm">
        <div className="flex flex-wrap gap-x-8 gap-y-3 items-center w-full text-sm text-emerald-900">
          <span>
            Total Cost Price : Rs.{" "}
            <span className="font-semibold">
              {summary.totalCostPrice
                ? parseCurrency(summary.totalCostPrice.toFixed(2))
                : "0"}
            </span>
          </span>

          <span>
            Total MRP : Rs.{" "}
            <span className="font-semibold">
              {summary.totalMrp
                ? parseCurrency(summary.totalMrp.toFixed(2))
                : "0"}
            </span>
          </span>

          <span>
            Total Remaining Cost Price : Rs.{" "}
            <span className="font-semibold">
              {parseCurrency(
                summary.totalRemainingCostPrice
                  ? summary.totalRemainingCostPrice.toFixed(2)
                  : 0,
              )}
            </span>
          </span>

          <span>
            Total Sales Amount : Rs.{" "}
            <span className="font-semibold">
              {parseCurrency(
                summary.totalSalesAmount
                  ? summary.totalSalesAmount.toFixed(2)
                  : 0,
              )}
            </span>
          </span>

          <span>
            Total Recv. Quantity :{" "}
            <span className="font-semibold">{summary.totalRecvQty}</span>
          </span>

          <span>
            Total Recv. Free Quantity :{" "}
            <span className="font-semibold">{summary.totalRecvFreeQty}</span>
          </span>

          <span>
            Total Bal. Quantity :{" "}
            <span className="font-semibold">{summary.totalBalQty}</span>
          </span>

          <span>
            Total Sales Quantity :{" "}
            <span className="font-semibold">{summary.totalSalesQty}</span>
          </span>

          <span>
            Total Cond. Quantity :{" "}
            <span className="font-semibold">{summary.totalCondQty}</span>
          </span>

          <span>
            Low Stock :{" "}
            <span className="font-semibold">{summary.lowStock}</span>
          </span>
        </div>
      </section>
    </div>
  );
};

export default StockDetailsCopy;

