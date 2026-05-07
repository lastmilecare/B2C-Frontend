import React, { useState } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import {
  useGetSalesStockDetailsQuery,
  useGetComboQuery,
  useGetMediceneListQuery,
  useGetPatientNameFromSalesQuery,
} from "../redux/apiSlice";
import useDebounce from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import { cookie } from "../utils/cookie";
import { healthAlert } from "../utils/healthSwal";
const username = cookie.get("username");

const MedicineSalesRecord = () => {
  const [searchTerms, setSearchTerms] = useState({
    descriptions: "",
    CustommerName: "",
  });
  const debouncedMedicine = useDebounce(searchTerms.descriptions, 500);
  const debouncedPatient = useDebounce(searchTerms.CustommerName, 500);
  const { data: medicineSuggestions = [] } = useGetMediceneListQuery(
     { searchTerm: debouncedMedicine || skipToken },
    { skip: debouncedMedicine.length < 2 },
  );

  const { data: patientSuggestions = [] } = useGetPatientNameFromSalesQuery(
    debouncedPatient,
    { skip: debouncedPatient.length < 2 },
  );

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: itemType, isLoading: doctorsComboLoading } =
    useGetComboQuery("medicine-type");

  const { data: User, isLoading: SupplierLoading } = useGetComboQuery("users");
  const [tempFilters, setTempFilters] = useState({
    CustommerName: "",
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
  const UserOptions = User
    ? User.map((t) => ({ value: t.id, label: t.username }))
    : [];

  const rawStock = data?.data || [];

  const Stock = rawStock.flatMap((header) =>
    (header.footerItems || []).map((footer) => ({
      ...header,
      ...footer,
    })),
  );
  const pagination = data?.pagination || {};

  const userLookup = React.useMemo(() => {
    if (!User?.length) return {};

    return User.reduce((acc, user) => {
      acc[String(user.id)] = user.username;
      return acc;
    }, {});
  }, [User]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "descriptions" || name === "CustommerName") {
      setSearchTerms((prev) => ({
        ...prev,
        [name]: value,
      }));
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
      suggestionConfig: {
        minLength: 2,
        keyField: "CustommerName",
        valueField: "CustommerName",
      },
    },
    {
      label: "Medicine Name",
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
  const columns = [
    {
      name: "S.No",
      selector: (row, i) => (page - 1) * limit + i + 1,
      width: "80px",
    },
    { name: "Bill No", selector: (row) => row.BillNo, width: "120px" },
    { name: "UHID", selector: (row) => row.PicasoID, width: "140px" },
    {
      name: "Customer Name",
      selector: (row) => row.CustommerName,
      width: "180px",
    },
    {
      name: "Category",
      selector: (row) => row.PatientType,
      width: "80px",
    },
    {
      name: "Medicine Name",
      selector: (row) => row.ItemName || "N/A",
      width: "180px",
    },
    {
      name: "Qty",
      selector: (row) => row.IssueQty || 0,

      width: "80px",
    },
    {
      name: "Rate",
      selector: (row) => row.Rate || "N/A",

      width: "120px",
    },
    {
      name: "NetAmount",
      selector: (row) => row.NetAmount || "N/A",
      width: "120px",
    },
    {
      name: "Added By",
      selector: (row) => userLookup[row.AddedBy] || "N/A",
      width: "180px",
    },
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
        <td>${row.ItemName || "N/A"}</td>
        <td>${row.IssueQty || 0}</td>
        <td>${row.Rate || "N/A"}</td>
        <td>${row.NetAmount || "N/A"}</td>
        <td>${userLookup[row.AddedBy] || "N/A"}</td>
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

  return (
    <div className="p-0">
      <FilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        suggestionsMap={{
          descriptions: medicineSuggestions?.data || [],
          CustommerName: patientSuggestions?.data?.data || patientSuggestions?.data || [],
        }}
        onSelectSuggestion={(fieldName, value) => {
          setTempFilters((prev) => ({
            ...prev,
            [fieldName]: value,
          }));
          setSearchTerms((prev) => ({
            ...prev,
            [fieldName]: "",   
          }));
        }}
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

      <section className="border-t bg-amber-50 text-[12px]">
        <div className="flex flex-wrap gap-x-6 gap-y-1 px-2 py-2">
          <span className="text-amber-800 font-medium">Total Qty:</span>
          <span className="font-semibold text-amber-900">
            {Number(data?.totalQty || 0)}
          </span>
          <span className="text-amber-800 font-medium">Total Amount:</span>
          <span className="font-semibold text-amber-900">
            {data?.totalSales || 0}
          </span>
        </div>
      </section>
    </div>
  );
};

export default MedicineSalesRecord;
