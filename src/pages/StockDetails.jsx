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

    healthAlert({
      title: "Are you sure?",
      text: `You are about to delete item id: ${id}. This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteitemid(id).unwrap();

          healthAlert({
            title: "Deleted!",
            text: "Stock record deleted successfully.",
            icon: "success",
          });
        } catch (error) {
          healthAlert({
            title: "Delete Error",
            text:
              error?.data?.message || "Something went wrong while deleting.",
            icon: "error",
          });
        }
      }
    });
  };
  const [ItemSearch, ItemNameSearch] = useState("");
  const debouncedItemSearch = useDebounce(ItemSearch, 500);
  const { data: suggestions = [] } = useGetMediceneListQuery(
    { searchTerm: debouncedItemSearch || skipToken },
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
    { name: "CGST", selector: (row) => row.CGST, width: "120px" },
    { name: "SGST", selector: (row) => row.SGST, width: "120px" },
    {
      name: "CP",
      width: "110px",
      right: true,
      cell: (row) => (
        <span className="font-semibold text-green-600">₹{row.CP}</span>
      ),
    },
    {
      name: "MRP",
      width: "110px",
      right: true,
      cell: (row) => (
        <span className="font-semibold text-blue-600">₹{row.MRP}</span>
      ),
    },
    { name: "CPU", selector: (row) => row.CPU, width: "120px" },
    { name: "MRPU", selector: (row) => row.MRPU, width: "120px" },
    { name: "Cnd.Qty", selector: (row) => row.CondmQty, width: "120px" },
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
      name: "Date",
      selector: (row) => new Date(row.AddedDate).toISOString().split("T")[0],
      width: "120px",
    },
    {
      name: "Supplier",
      width: "160px",
      cell: (row) => (
        <span className="text-gray-700 font-medium">{row.SupplierName}</span>
      ),
    },
    {
      name: "ID",
      selector: (row) => row.ID,
      hidden: true,
    },
  ];
  const handlePrint = () => {
    const today = new Date().toLocaleDateString();
    const loginUser = username || "Admin";
    const printWindow = window.open("", "", "width=1200,height=800");
    const tableRows = Stock.map(
      (row, index) => `
      <tr>
        <td>${index + 1}</td>
       <td>${new Date(row.InvoiceDate).toLocaleDateString()}</td>
        <td>${row.RecieptNo || ""}</td>
        <td>${row.BatchNo || ""}</td>
        <td>${row.RagNo || ""}</td>
        <td>${row.HSNCode || ""}</td>
        <td>${row.CGST || "N/A"}</td>
        <td>${row.SGST || "N/A"}</td>
        <td>${row.CP || "N/A"}</td>
        <td>${row.MRP || "N/A"}</td>
        <td>${row.CPU || "N/A"}</td>
        <td>${row.MRPU || "N/A"}</td>
        <td>${row.CondmQty || "N/A"}</td>
        <td>${row.RecvQty || "N/A"}</td>
        <td>${row.RecvQty - row.BalQty || "N/A"}</td>
        <td>${row.BalQty || "N/A"}</td>
        <td>${new Date(row.ExpiryDate).toLocaleDateString()}</td>
        <td>${new Date(row.AddedDate).toLocaleDateString()}</td>
        <td>${row.SupplierName || "N/A"}</td>
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
              <th>Invoice Date</th>
              <th>RecieptNo</th>
              <th>Batch No</th>
              <th>Rag No</th>
              <th>HSN Code</th>
              <th>CGST</th>
              <th>SGST</th>
              <th>CP</th>
              <th>MRP</th>
              <th>CPU</th>
              <th>MRPU</th>
              <th>Cond. Qty</th>
              <th>Recv. Qty</th>
              <th>Sales Qty</th>
              <th>Bal Qty</th>
              <th>Expiry Date</th>
              <th>Date</th>
              <th>Supplier Name</th>
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
        onPrint={handlePrint}
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
      <section className="mt-4 border rounded-xl bg-emerald-50 px-6 py-3 shadow-sm">
        <div className="flex flex-wrap justify-between items-center w-full text-sm text-emerald-900">
          <span>
            Total Stock : <span className="font-semibold">{Stock.length}</span>
          </span>

          <span>
            Received Qty :{" "}
            <span className="font-semibold">
              {Stock.reduce((a, b) => a + (b.RecvQty || 0), 0)}
            </span>
          </span>

          <span>
            Balance Qty :{" "}
            <span className="font-semibold">
              {Stock.reduce((a, b) => a + (b.BalQty || 0), 0)}
            </span>
          </span>

          <span>
            Sales Qty :{" "}
            <span className="font-semibold">
              {Stock.reduce(
                (a, b) => a + ((b.RecvQty || 0) - (b.BalQty || 0)),
                0,
              )}
            </span>
          </span>

          <span>
            Low Stock :{" "}
            <span className="font-semibold">
              {Stock.filter((i) => i.BalQty < 5).length}
            </span>
          </span>
        </div>
      </section>
    </div>
  );
};

export default StockDetailsCopy;
