import React, { useState } from "react";
import CommonList from "../components/CommonList";
import FilterBar from "../components/common/FilterBar";
import { useGetExpireStockDetailsQuery } from "../redux/apiSlice";
import { cookie } from "../utils/cookie";
import { motion } from "framer-motion";
import {
  ExclamationTriangleIcon,
  ClockIcon,
  ArchiveBoxXMarkIcon,
} from "@heroicons/react/24/outline";
import {parseCurrency, formatDate } from "../utils/helper";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const username = cookie.get("username");

const ExpiryItemsCopy = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading } = useGetExpireStockDetailsQuery({
    page,
    limit,
  });

  const Stock = data?.data || [];
  const pagination = data?.pagination || {};

 
  const today = new Date();

  const expired = Stock.filter(
    (i) => new Date(i.ExpiryDate) < today
  ).length;

  const critical = Stock.filter((i) => {
    const diff =
      (new Date(i.ExpiryDate) - today) / (1000 * 60 * 60 * 24);
    return diff <= 30 && diff > 0;
  }).length;

  const warning = Stock.filter((i) => {
    const diff =
      (new Date(i.ExpiryDate) - today) / (1000 * 60 * 60 * 24);
    return diff > 30 && diff <= 90;
  }).length;

  const columns = [
    {
      name: "S.No",
      selector: (row, i) => (page - 1) * limit + i + 1,
      width: "80px",
    },
    { name: "Batch No",
      center: true,
      selector: (row) => row.BatchNo, width: "150px" },
    { name: "Supplier",
      center: true,
      selector: (row) => row.SupplierName, width: "300px" },
    { name: "Receipt No", selector: (row) => row.RecieptNo, width: "150px" },
    { name: "Item Name",
      center: true,
      selector: (row) => row.ItemName, width: "200px" },
    { name: "CPU (Rs.)", selector: (row) => parseCurrency(row.CPU), width: "120px" },
    { name: "MRPU (Rs.)", selector: (row) => parseCurrency(row.MRPU), width: "120px" },

    {
      name: "Expiry",
      center: true,
      selector: (row) => {
        const expiry = new Date(row.ExpiryDate);
        const diffDays = Math.ceil(
          (expiry - today) / (1000 * 60 * 60 * 24)
        );

        let badge =
          "bg-amber-100 text-amber-800";

        if (diffDays <= 0) {
          badge = "bg-red-100 text-red-700";
        } else if (diffDays <= 30) {
          badge = "bg-orange-100 text-orange-700";
        }

        return (
          <div className="flex justify-center items-center">
  <span
    className={`px-2 py-1 rounded-md text-xs font-semibold text-center min-w-[90px] ${badge}`}
  >
            {formatDate(row.ExpiryDate)}
           </span>
</div>
        );
      },
      width: "150px",
      sortFunction: (a, b) =>
        new Date(a.ExpiryDate) - new Date(b.ExpiryDate),
    },
  ];
const handleDownloadPdf = () => {
  const todayDate = new Date().toLocaleDateString();
  const loginUser = username || "Admin";

  const doc = new jsPDF("landscape");

  doc.setFontSize(16);
  doc.text("Expired Medicines List", 14, 15);

  const tableColumn = [
    "S.No",
    "Batch",
    "Supplier",
    "Receipt",
    "Item Name",
    "CPU (Rs.)",
    "MRPU (Rs.)",
    "Expiry",
  ];

  const tableRows = Stock.map((row, index) => [
    index + 1,
    row.BatchNo || "",
    row.SupplierName || "N/A",
    row.RecieptNo || "N/A",
    row.ItemName || "N/A",
    Number(parseCurrency(row.CPU || 0)).toFixed(2),
    Number(parseCurrency(row.MRPU || 0)).toFixed(2),
    formatDate(row.ExpiryDate),
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: {
      fontSize: 8,
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

  doc.text("Powered by Last Mile Care", 14, finalY + 10);
  doc.text(`Prepared By: ${loginUser}`, 120, finalY + 10);
  doc.text(`Date: ${todayDate}`, 240, finalY + 10);

  doc.save(`Expired_Medicines_${Date.now()}.pdf`);
};
  const handlePrint = () => {
    const todayDate = new Date().toLocaleDateString();
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
        <td>${parseCurrency(row.CPU).toFixed(2)}</td>
        <td>${parseCurrency(row.MRPU).toFixed(2)}</td>
        <td>${formatDate(row.ExpiryDate)}</td>
      </tr>
    `
    ).join("");

    printWindow.document.write(`
    <html>
    <head>
    <title>Expired Medicines List</title>
    <style>
      @page { size: landscape; }

      body{
        font-family: Arial;
        padding:20px;
      }

      table{
        width:100%;
        border-collapse:collapse;
        margin-top:20px;
        font-size:12px;
      }

      th,td{
        border:1px solid #000;
        padding:6px;
      }

      th{
        background:#f2f2f2;
      }

      h2{
        text-align:center;
      }

      .footer{
        margin-top:30px;
        display:flex;
        justify-content:space-between;
      }

    </style>
    </head>

    <body>

    <h2>Expired Medicines List</h2>

    <table>
    <thead>
    <tr>
    <th>S.No</th>
    <th>Batch</th>
    <th>Supplier</th>
    <th>Receipt</th>
    <th>Item Name</th>
    <th>CPU (Rs.)</th>
    <th>MRPU (Rs.)</th>
    <th>Expiry</th>
    </tr>
    </thead>

    <tbody>
    ${tableRows}
    </tbody>

    </table>

    <div class="footer">
      <div>Powered by Last Mile Care</div>
      <div>Prepared By: ${loginUser}</div>
      <div>Date: ${todayDate}</div>
    </div>

    </body>
    </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`flex items-center gap-3 p-4 rounded-xl shadow-sm border ${color}`}
    >
      <Icon className="w-6 h-6" />
      <div>
        <p className="text-xs opacity-80">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-4">

      <FilterBar
        title="Medicine Expire Stock List"
        onExport={handleDownloadPdf}
        showSearch={false}
        
      />

      

      

      <div className="bg-white rounded-xl shadow-sm border p-2">

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

      </div>

    

     <section className="border rounded-xl bg-emerald-50 px-6 py-3 shadow-sm">

  <div className="flex flex-wrap justify-between items-center w-full text-sm text-emerald-900">

    <span>
      Expired Medicines : <span className="font-semibold">{expired}</span>
    </span>

    <span>
      Expiring in 30 Days : <span className="font-semibold">{critical}</span>
    </span>

    <span>
      Expiring in 90 Days : <span className="font-semibold">{warning}</span>
    </span>

    <span>
      Total Medicines (90 days) :{" "}
      <span className="font-semibold">
        {(expired + critical + warning).toLocaleString("en-IN")}
      </span>
    </span>

  </div>

</section>

    </div>
  );
};

export default ExpiryItemsCopy;