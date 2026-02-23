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

  const { data: User, isLoading: SupplierLoading } = useGetComboQuery("users");
  const [tempFilters, setTempFilters] = useState({
    RecieptNo: "",
    ItemTypeID: "",
    descriptions: "",
    startDate: "",
    endDate: "",
    AddedBy: "",
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
  const UserOptions = User
    ? User.map((t) => ({ value: t.ID, label: t.username }))
    : [];

  const Stock = data?.data || [];
  const pagination = data?.pagination || {};

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
      CustommerName: "",
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
      name: "CustommerName",
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
      label: "Added By",
      name: "AddedBy",
      type: "select",
      options: UserOptions,
    },
    { label: "Date from", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
  ];
  console.log("vaaku", Stock[0]?.footerItems[0].ItemName); // Here getting data
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
    {
      name: "ItemName",
      selector: (row) => row.footerItems[0]?.ItemName || "N/A",
      width: "120px",
    },
    {
      name: "Qty",
      selector: (row) => row.footerItems[0]?.IssueQty,
      width: "120px",
    },
    {
      name: "Rate",
      selector: (row) => row.footerItems[0]?.Rate || "N/A",
      width: "120px",
    },
    {
      name: "NetAmount",
      selector: (row) => row.footerItems[0]?.NetAmount || "N/A",
      width: "120px",
    },
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
       <td>${row.BillNo || ""}</td>
        <td>${row.PicasoID || ""}</td>
        <td>${row.CustommerName || ""}</td>
        <td>${row.PatientType || ""}</td>
        <td>${row.footerItems[0]?.ItemName || "N/A"}</td>
        <td>${row.footerItems[0]?.IssueQty || "N/A"}</td>
        <td>${row.footerItems[0]?.Rate || "N/A"}</td>
        <td>${row.footerItems[0]?.NetAmount || "N/A"}</td>
        <td>${row.CustommerName || "N/A"}</td>
        <td>${new Date(row.AddedDate).toLocaleDateString()}</td>
      </tr>
    `,
    ).join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Medicine Sales List</title>
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

        <h2>Medicine Sales List</h2>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>BillNo</th>
              <th>Uhid</th>
              <th>Custommer Name</th>
              <th>Fin. Category</th>
              <th>ItemName</th>
              <th>IssueQty</th>
              <th>Rate</th>
              <th>Net Amount</th>
              <th>Added By</th>
              <th>Added Date</th>
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
          <Stat label="Total Amount" value={data?.totalSales} />
          <Stat label="Total Qty" value={data?.totalQty} />
        </div>
      </section>
    </div>
  );
};

export default MedicineSalesRecord;
