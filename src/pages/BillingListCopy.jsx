import React, { useState, useRef, useEffect } from "react";
import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/copy/CopyFilterBar";
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
import Avatar from "../components/common/Avatar";
const username = cookie.get("username");

const BillingListCopy = () => {
  const navigate = useNavigate();
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
   {
 name:"Bill",
 width:"90px",
 center:true,
 cell:(row)=>(
  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
   #{row.BillNo}
  </span>
 )
},
   {
 name: "Patient",
 width: "220px",
 cell: (row) => (

  <div className="flex items-center gap-3">

   <div className="relative">

    <Avatar
     name={row.CustommerName}
     gender="male"
     age="0"
    />

    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>

   </div>

   <div className="leading-tight">

    <p className="font-semibold text-gray-800">
     {row.CustommerName}
    </p>

    <p className="text-xs text-gray-500">
     UHID : {row.PicasoID}
    </p>

   </div>

  </div>

 )
},
    {
      name: "Opd Bill No",
      selector: (row) => row.OPDBillNo,
      width: "80px",
    },
   {
 name:"Qty",
 cell:(row)=>(
  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
   {row.TotalQty}
  </span>
 )
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
 name:"Gross Amount",
 cell:(row)=>(
  <span className="font-semibold text-blue-600">
   {row.GrossAmount}
  </span>
 )
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
 name:"Date",
 width:"110px",
 center:true,
 cell:(row)=>(
  <span className="text-gray-500 text-sm">
   {new Date(row.AddedDate).toISOString().split("T")[0]}
  </span>
 )
},
    {
      name: "id",
      selector: (row) => row.ID,
      hidden: true,
    },
  ];
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
  <div className="p-2 space-y-4">

    {/* Stats Cards */}
  

    {/* FilterBar */}
    <div className="bg-white/80 backdrop-blur-lg shadow rounded-xl p-4 border">
      <CopyFilterBar
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
      />
    </div>
      <div className="bg-white shadow-xl rounded-xl border p-2">
  <CommonList
    title="💊 Pharmacy Billing List"
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
    onEdit={(row) => navigate(`/billing-copy/${row.ID}`)}
    onPrint={onPrint}
  />
</div>

      <section className="border-t bg-amber-50 text-[12px]">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow">
    <p className="text-sm opacity-80">Total Sales</p>
    <h2 className="text-2xl font-bold">{data?.totalSales || 0}</h2>
  </div>

  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl shadow">
    <p className="text-sm opacity-80">Total Paid</p>
    <h2 className="text-2xl font-bold">{data?.totalPaid || 0}</h2>
  </div>

  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-xl shadow">
    <p className="text-sm opacity-80">Total Due</p>
    <h2 className="text-2xl font-bold">{data?.totalDue || 0}</h2>
  </div>

  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow">
    <p className="text-sm opacity-80">Total Discount</p>
    <h2 className="text-2xl font-bold">{data?.totalDiscount || 0}</h2>
  </div>
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

export default BillingListCopy;
