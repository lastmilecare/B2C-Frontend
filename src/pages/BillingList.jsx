import React, { useState, useRef, useEffect } from "react";
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
import PharmaBillPrint from "./PharmaBillPrint";
import { useReactToPrint } from "react-to-print";
const username = cookie.get("username");

const BillingList = () => {
  const [searchTerms, setSearchTerms] = useState({
    descriptions: "",
    CustommerName: "",
  });
  const debouncedMedicine = useDebounce(searchTerms.descriptions, 500);
  const debouncedPatient = useDebounce(searchTerms.CustommerName, 500);
  const { data: medicineSuggestions = [] } = useGetMediceneListQuery(
    debouncedMedicine,
    { skip: debouncedMedicine.length < 2 },
  );
  const [printRow, setPrintRow] = useState(null);
  const printRef = useRef();
  const { data: patientSuggestions = [] } = useGetPatientNameFromSalesQuery(
    debouncedPatient,
    { skip: debouncedPatient.length < 2 },
  );

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: User, isLoading: SupplierLoading } = useGetComboQuery("users");
  const [tempFilters, setTempFilters] = useState({
    CustommerName: "",
    BillNo: "",
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

  const parseCurrency = (value) => {
    if (!value) return 0;

    // Remove $ and commas safely
    const cleaned = value.replace(/[^0-9.-]+/g, "");
    const parsed = Number(cleaned);

    return isNaN(parsed) ? 0 : parsed;
  };

  const formatCurrency = (num) => {
    return `$${num.toFixed(2)}`;
  };

  const Stock = rawStock.map((header) => {
    const footerItems = header.footerItems || [];

    let totalTaxableAmount = 0;
    let totalQty = 0;
    const itemNames = [];
    let DueAmount = 0;
    for (const footer of footerItems) {
      totalTaxableAmount += parseCurrency(footer.TaxableAmount);
      totalQty += Number(footer.IssueQty) || 0;
      DueAmount = parseCurrency(footer.DueAmount); // This did by intentianaliy kept as DueAmount because in some cases due amount is coming from backend and in some cases we need to calculate it by GrossAmount - PaidAmount. So to avoid confusion I kept the same name. We can change it later when we are sure about the data coming from backend.

      if (footer.ItemName) {
        itemNames.push(footer.ItemName);
      }
    }

    return {
      ...header,
      // override aggregated fields
      TaxableAmount: formatCurrency(totalTaxableAmount),
      TotalQty: totalQty,
      ItemName: itemNames.join(", "),
      DueAmount: formatCurrency(DueAmount),
      // footerItems: undefined,
    };
  });
  console.log("Stock data:", Stock);
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
      BillNo: "",
      startDate: "",
      endDate: "",
      AddedBy: "",
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
      label: "Bill No",
      name: "BillNo",
      type: "text",
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
    { name: "Bill No", selector: (row) => row.BillNo, width: "80px" },
    { name: "UHID", selector: (row) => row.PicasoID, width: "140px" },
    {
      name: "Patient Name",
      selector: (row) => row.CustommerName,
      width: "140px",
    },
    {
      name: "Opd Bill No",
      selector: (row) => row.OPDBillNo,
      width: "80px",
    },
    {
      name: "Qty",
      selector: (row) => row.TotalQty,
      width: "60px",
    },
    {
      name: "Item Name",
      selector: (row) => row.ItemName || "N/A",
      width: "180px",
    },
    {
      name: "Taxable Amount",
      selector: (row) => row.TaxableAmount || 0,

      width: "80px",
    },
    {
      name: "Gross Amount",
      selector: (row) => row.GrossAmount || "N/A",

      width: "80px",
    },
    {
      name: "Discount Amount",
      selector: (row) => row.DiscountAmount || "N/A",
      width: "80px",
    },
    {
      name: "Paid Amount",
      selector: (row) => row.PaidAmount || "N/A",
      width: "80px",
    },
    {
      name: "Due Amount",
      selector: (row) =>
        // (row.GrossAmount || 0) - (row.PaidAmount || 0) || "N/A", // need to check picasoid logic
        row.DueAmount || "N/A",
      width: "80px",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.AddedDate).toLocaleDateString(),
      width: "100px",
    },
    {
      name: "id",
      selector: (row) => row.ID,
      hidden: true,
    },
  ];
  // const handlePrint = () => {
  //   const today = new Date().toLocaleDateString();
  //   const loginUser = username || "Admin";
  //   const printWindow = window.open("", "", "width=1200,height=800");
  //   const tableRows = Stock.map(
  //     (row, index) => `
  //     <tr>
  //       <td>${index + 1}</td>
  //      <td>${row.BillNo || ""}</td>
  //       <td>${row.PicasoID || ""}</td>
  //       <td>${row.CustommerName || ""}</td>
  //       <td>${row.ItemName || "N/A"}</td>
  //       <td>${row.TotalQty || 0}</td>
  //       <td>${row.TaxableAmount || 0}</td>
  //       <td>${row.GrossAmount || 0}</td>
  //       <td>${row.DiscountAmount || 0}</td>
  //       <td>${row.PaidAmount || 0}</td>
  //       <td>${row.DueAmount || 0}</td>
  //       <td>${new Date(row.AddedDate).toLocaleDateString()}</td>
  //     </tr>
  //   `,
  //   ).join("");

  //   printWindow.document.write(`
  //   <html>
  //     <head>
  //       <title>Medicine Sales List</title>
  //       <style>
  //         @page {
  //           size: landscape;
  //         }

  //         body {
  //           font-family: Arial;
  //           padding: 20px;
  //         }

  //         h2 {
  //           text-align: center;
  //           margin-bottom: 20px;
  //         }

  //         table {
  //           width: 100%;
  //           border-collapse: collapse;
  //           margin-top: 20px;
  //           font-size: 12px;
  //         }

  //         th, td {
  //           border: 1px solid #000;
  //           padding: 6px;
  //           text-align: left;
  //         }

  //         th {
  //           background-color: #f2f2f2;
  //         }

  //         .footer {
  //           margin-top: 30px;
  //           display: flex;
  //           justify-content: space-between;
  //           font-size: 13px;
  //         }
  //       </style>
  //     </head>
  //     <body>

  //       <h2>Medicine Sales List</h2>

  //       <table>
  //         <thead>
  //           <tr>
  //             <th>S.No</th>
  //             <th>BillNo</th>
  //             <th>Uhid</th>
  //             <th>Custommer Name</th>
  //             <th>ItemName</th>
  //               <th>Qty</th>
  //             <th>TaxableAmount</th>
  //              <th>GrossAmount</th>
  //               <th>DiscountAmount</th>
  //                <th>PaidAmount</th>
  //                 <th>DueAmount</th>
  //             <th>Added Date</th>
  //           </tr>
  //         </thead>
  //         <tbody>
  //           ${tableRows}
  //         </tbody>
  //       </table>

  //       <div class="footer">
  //         <div><strong>Powered by : Last Mile Care</strong></div>
  //         <div>Prepared By: ${loginUser}</div>
  //         <div>Date: ${today}</div>
  //       </div>

  //     </body>
  //   </html>
  // `);

  //   printWindow.document.close();
  //   printWindow.focus();
  //   printWindow.print();
  // };

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
    <div className="p-0">
      <FilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        suggestionsMap={{
          descriptions: medicineSuggestions?.data || [],
          CustommerName: patientSuggestions?.data || [],
        }}
        onSelectSuggestion={(fieldName, value) => {
          setTempFilters((prev) => ({
            ...prev,
            [fieldName]: value,
          }));
        }}
        // onPrint={handlePrint}
      />

      <CommonList
        title="Pharamacy Billing List"
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
        enableActions
        actionButtons={["edit", "delete", "print"]}
        onEdit={(row) => {
          navigate(`/patient-registration/${row.id}`);
        }}
        onPrint={onPrint}
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
      {printRow && (
        <div style={{ display: "none" }}>
          <PharmaBillPrint ref={printRef} data={printRow} />
        </div>
      )}
    </div>
  );
};

export default BillingList;
