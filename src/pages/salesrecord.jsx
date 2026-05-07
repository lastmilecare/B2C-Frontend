import React, { useState } from "react";
import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";
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
import Avatar from "../components/common/Avatar";
import { parseCurrency } from "../utils/helper";

const username = cookie.get("username");

const SalesRecordCopy = () => {
  const [searchTerms, setSearchTerms] = useState({
    descriptions: "",
    CustommerName: "",
  });
  const debouncedMedicine = useDebounce(searchTerms.descriptions, 500);
  const debouncedPatient = useDebounce(searchTerms.CustommerName, 500);
  const { data: medicineSuggestions = [] } = useGetMediceneListQuery(
    { searchTerm: debouncedMedicine },
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

  // const Stock = rawStock.flatMap((header) =>
  //   (header.footerItems || []).map((footer) => ({
  //     ...header,
  //     footer,
  //   })),
  // );

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
    {
      name: "Patient",
      width: "240px",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={row.name} gender={row.gender} age={row.age} />

            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
          </div>

          <div className="leading-tight">
            <p className="font-semibold text-gray-800">{row.CustommerName}</p>

            {/* <p className="text-xs text-gray-500">UHID : {row.PicasoID}</p> */}
          </div>
        </div>
      ),
    },
    {
      name: "Uhid",
      cell: (row) => {
        return (
          <span className=" text-xs px-2 py-1 rounded font-semibold">
            <p className="text-xs text-gray-500">{row.PicasoID}</p>
          </span>
        );
      },
    },
    {
      name: "Category",
      cell: (row) => {
        const category = row.PatientType || "N/A";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold
     ${
       category === "APL"
         ? "bg-green-100 text-green-700"
         : category === "BPL"
           ? "bg-orange-100 text-orange-700"
           : "bg-gray-100 text-gray-600"
     }
    `}
          >
            {category}
          </span>
        );
      },
    },

    {
      name: "Mobile ",
      width: "220px",
      cell: (row) => {
        return <div>{row.Mobileno || "N/A"}</div>;
      },
    },
    {
      name: "TotalQty",
      cell: (row) => {
        return (
          <span className="text-xs px-2 py-1 rounded font-semibold">
            {row.TotalQty}
          </span>
        );
      },
    },

    {
      name: "Added By",
      width: "160px",
      cell: (row) => (
        <span className="text-gray-700 text-sm font-medium">
          {userLookup[row.AddedBy] || "N/A"}
        </span>
      ),
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
        <td>${row.footer.ItemName || "N/A"}</td>
        <td>${row.footer.IssueQty || 0}</td>
        <td>${parseCurrency(row.footer.Rate) || "N/A"}</td>
        <td>${parseCurrency(row.footer.NetAmount) || "N/A"}</td>
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
  const ExpandedComponent = ({ data }) => {
    const totalQty = (data.footerItems || []).reduce(
      (sum, item) => sum + Number(item.IssueQty || 0),
      0,
    );
debugger
    const totalAmount = (data.footerItems || []).reduce(
      (sum, item) => sum + parseCurrency(item.NetAmount) ,
      0,
    );

    return (
      <div className="mx-4 mb-4 mt-1 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-cyan-50 px-5 py-3">
          <div>
            <h3 className="text-sm font-semibold text-sky-800">
              Medicine Details
            </h3>

            <p className="text-xs text-gray-500">
              Bill No : {data.BillNo || "N/A"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl bg-white px-4 py-2 shadow-sm border border-sky-100">
              <p className="text-[11px] text-gray-500">Total Qty</p>

              <p className="text-sm font-bold text-sky-700">{totalQty}</p>
            </div>

            <div className="rounded-xl bg-white px-4 py-2 shadow-sm border border-emerald-100">
              <p className="text-[11px] text-gray-500">Total Amount</p>

              <p className="text-sm font-bold text-emerald-700">
                {parseCurrency(totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  #
                </th>

                <th className="px-4 py-3 text-left font-semibold text-slate-600">
                  Medicine Name
                </th>

                <th className="px-4 py-3 text-center font-semibold text-slate-600">
                  Qty
                </th>

                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Rate
                </th>

                <th className="px-4 py-3 text-right font-semibold text-slate-600">
                  Net Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {(data.footerItems || []).map((item, index) => (
                <tr
                  key={index}
                  className="border-t border-slate-100 transition hover:bg-sky-50/40"
                >
                  <td className="px-4 py-3 text-gray-500 font-medium">
                    {index + 1}
                  </td>

                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.ItemName || "N/A"}
                      </p>

                      <p className="text-xs text-gray-400">Medicine Item</p>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex min-w-[45px] items-center justify-center rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700">
                      {item.IssueQty || 0}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-gray-700">
                    {parseCurrency(item.Rate)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {parseCurrency(item.NetAmount)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr className="border-t-2 border-sky-100 bg-sky-50/60">
                <td colSpan={2} className="px-4 py-3 font-bold text-sky-800">
                  Grand Total
                </td>

                <td className="px-4 py-3 text-center font-bold text-sky-700">
                  {totalQty}
                </td>

                <td></td>

                <td className="px-4 py-3 text-right font-bold text-emerald-700">
                  {parseCurrency(totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
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
        suggestionsMap={{
          descriptions: medicineSuggestions?.data || [],
          CustommerName:
            patientSuggestions?.data?.data || patientSuggestions?.data || [],
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
        data={rawStock}
        totalRows={pagination.totalRecords || 0}
        currentPage={pagination.currentPage || page}
        perPage={limit}
        onPageChange={(newPage) => setPage(newPage)}
        onPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        isLoading={isLoading}
        expandableRows
        expandableRowsComponent={ExpandedComponent}
      />

      <section className="mt-4 border rounded-xl bg-emerald-50 px-6 py-3 shadow-sm">
        <div className="flex flex-wrap justify-between items-center w-full text-sm text-emerald-900">
          <span>
            Total Qty :{" "}
            <span className="font-semibold">
              {Number(data?.totalIssueQty || 0)}
            </span>
          </span>

          <span>
            Total Amount :{" "}
            <span className="font-semibold">₹ {data?.totalSales || 0}</span>
          </span>
        </div>
      </section>
    </div>
  );
};

export default SalesRecordCopy;
