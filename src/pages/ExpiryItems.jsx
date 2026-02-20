import React, { useState } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import { useGetExpireStockDetailsQuery } from "../redux/apiSlice";
import { cookie } from "../utils/cookie";
const username = cookie.get("username");
const ExpiryItems = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data, isLoading } = useGetExpireStockDetailsQuery({
    page,
    limit,
  });

  const Stock = data?.data || [];
  const pagination = data?.pagination || {};

  const columns = [
    {
      name: "S.No",
      selector: (row, i) => (page - 1) * limit + i + 1,
      width: "80px",
    },
    { name: "Batch No", selector: (row) => row.BatchNo, width: "150px" },
    { name: "Supplier", selector: (row) => row.SupplierName, width: "350px" },
    { name: "Reciept No", selector: (row) => row.RecieptNo, width: "150px" },
    { name: "Item Name", selector: (row) => row.ItemName, width: "150px" },
    { name: "CPU", selector: (row) => row.CPU, width: "150px" },
    { name: "MRPU", selector: (row) => row.MRPU, width: "150px" },
    {
      name: "Expiry",
      selector: (row) => {
        const expiry = new Date(row.ExpiryDate);
        const today = new Date();
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

        let colorClass = "text-amber-700"; 

        if (diffDays <= 30) {
          colorClass = "text-red-600 font-semibold"; // urgent
        }

        return (
          <span className={colorClass}>
            {expiry.toISOString().split("T")[0]}
          </span>
        );
      },
      width: "150px",
      sortFunction: (a, b) => new Date(a.ExpiryDate) - new Date(b.ExpiryDate),
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
        <td>${row.BatchNo || ""}</td>
        <td>${row.SupplierName || "N/A"}</td>
        <td>${row.RecieptNo || "N/A"}</td>
        <td>${row.ItemName || "N/A"}</td>
        <td>${row.CPU || "N/A"}</td>
        <td>${row.MRPU || "N/A"}</td>
        <td>${new Date(row.ExpiryDate).toLocaleDateString()}</td>
      </tr>
    `,
    ).join("");

    printWindow.document.write(`
    <html>
      <head>
        <title>Expired Medicines List</title>
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

        <h2>List of Expired Medicines</h2>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Batch No</th>
              <th>Supplier Name</th>
              <th>Reciept No</th>
              <th>Item Name</th>
              <th>CPU</th>
              <th>MRPU</th>
              <th>Expiry Date</th>
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
        title="Medicine Expire Stock List"
        onPrint={handlePrint}
        showSearch={false}
      />
      <CommonList
        title="Medicine Expire Stock List"
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
          <span className="text-amber-800 font-medium">
            Medicines expiring within 90 days:
          </span>
          <span className="font-semibold text-amber-900">
            {Number(data?.total || 0).toLocaleString("en-IN")}
          </span>
        </div>
      </section>
    </div>
  );
};

export default ExpiryItems;
