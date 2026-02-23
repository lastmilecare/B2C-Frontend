import React, { useState } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import {
  useGetSalesStockDetailsQuery,
  useGetComboQuery,
  useGetMediceneListQuery,
} from "../redux/apiSlice";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { cookie } from "../utils/cookie";
import { healthAlert } from "../utils/healthSwal";
const username = cookie.get("username");

const MedicineSalesRecord = () => {
  const [ItemSearch, ItemNameSearch] = useState("");
  const debouncedItemSearch = useDebounce(ItemSearch, 500);
  const { data: suggestions = [] } = useGetMediceneListQuery(
    debouncedItemSearch,
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

  const { data, isLoading } = useGetSalesStockDetailsQuery({
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
      PatientName: "",
      ItemTypeID: "",
      descriptions: "",
      startDate: "",
      endDate: "",
    });
    setFilters({});
    setPage(1);
  };

  const filtersConfig = [
    {
      label: "Patient Name",
      name: "PatientName",
      type: "text",
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
      label: "Item Type",
      name: "ItemTypeID",
      type: "select",
      options: medicineTypeOptions,
    },
    { label: "Date from", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
  ];
  // Bill No	UHID	Customer Name	Fin. Category	ItemName	Qty	Rate	NetAmount	Issue By	Bill Date
  const columns = [
    {
      name: "S.No",
      selector: (row, i) => (page - 1) * limit + i + 1,
      width: "80px",
    },
    { name: "Bill No", selector: (row) => row.BillNo, width: "120px" },
    { name: "UHID", selector: (row) => row.PicasoID, width: "180px" },
    {
      name: "Customer Name",
      selector: (row) => row.CustommerName,
      width: "120px",
    },
    {
      name: "Fin. Category",
      selector: (row) => row.PatientType,
      width: "120px",
    },
    { name: "ItemName", selector: (row) => row.CGST, width: "120px" },
    { name: "Qty", selector: (row) => row.TotalQty, width: "120px" },
    { name: "Rate", selector: (row) => row.Rate, width: "120px" },
    { name: "NetAmount", selector: (row) => row.TotalAmount, width: "120px" },
    { name: "Issue By", selector: (row) => row.CPU, width: "120px" },
    {
      name: "Bill Date",
      selector: (row) => new Date(row.AddedDate).toLocaleDateString(),
      width: "120px",
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
      <FilterBar
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
        title="Medicine Sales List"
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
        isLoading={isLoading}
      />
      <section className="border-t bg-white text-[12px]">
        <div className="flex flex-wrap gap-x-6 gap-y-1 px-2 py-1">
          <Stat label="Cost" value={0} />
          <Stat label="MRP" value={0} />
          <Stat label="Recv Qty" value={0} />
          <Stat label="Free Qty" value={0} />
          <Stat label="Sales Amt" value={0} />
          <Stat label="Balance Qty" value={0} />
          <Stat label="Sales Qty" value={0} />
          <Stat label="Remain Cost" value={0} />
          <Stat label="Cond Qty" value={0} />
        </div>
      </section>
    </div>
  );
};

export default MedicineSalesRecord;
