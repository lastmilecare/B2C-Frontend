import React from "react";
import CommonList from "../components/CommonList";

const OpdBillingList = () => {
  const columns = [
    { name: "Bill No", selector: (row) => row.ID, sortable: true },
    { name: "Patient ID", selector: (row) => row.PatientID },
    { name: "Mobile", selector: (row) => row.Mobile },
    { name: "Service Type ID", selector: (row) => row.ServiceTypeID },
    {
      name: "Total Amount",
      selector: (row) => `₹${row.TotalServiceAmount?.toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Paid Amount",
      selector: (row) => `₹${row.PaidAmount?.toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Due Amount",
      selector: (row) => `₹${row.DueAmount?.toFixed(2)}`,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row) => (row.DueAmount > 0 ? "🟠 Pending" : "🟢 Paid"),
    },
  ];

  const data = [
    {
      ID: 101,
      PatientID: 2001,
      Mobile: "9876543210",
      ServiceTypeID: 3,
      TotalServiceAmount: 1500,
      PaidAmount: 1500,
      DueAmount: 0,
    },
    {
      ID: 102,
      PatientID: 2002,
      Mobile: "9812345678",
      ServiceTypeID: 5,
      TotalServiceAmount: 2200,
      PaidAmount: 1200,
      DueAmount: 1000,
    },
    {
      ID: 103,
      PatientID: 2002,
      Mobile: "9812345678",
      ServiceTypeID: 5,
      TotalServiceAmount: 2200,
      PaidAmount: 1200,
      DueAmount: 1000,
    },
    {
      ID: 104,
      PatientID: 2002,
      Mobile: "9812345678",
      ServiceTypeID: 5,
      TotalServiceAmount: 2200,
      PaidAmount: 1200,
      DueAmount: 1000,
    },
    {
      ID: 105,
      PatientID: 2002,
      Mobile: "9812345678",
      ServiceTypeID: 5,
      TotalServiceAmount: 2200,
      PaidAmount: 1200,
      DueAmount: 1000,
    },
    {
      ID: 106,
      PatientID: 2002,
      Mobile: "9812345678",
      ServiceTypeID: 5,
      TotalServiceAmount: 2200,
      PaidAmount: 1200,
      DueAmount: 1000,
    },
    {
      ID: 107,
      PatientID: 2002,
      Mobile: "9812345678",
      ServiceTypeID: 5,
      TotalServiceAmount: 2200,
      PaidAmount: 1200,
      DueAmount: 1000,
    },

  ];

  const filters = [
    { label: "All", value: "all" },
    { label: "Paid", value: "paid" },
    { label: "Pending", value: "pending" },
  ];

  return (
    <div className="p-6">
      <CommonList
        title="💳 OPD Billing List"
        columns={columns}
        data={data}
        filters={filters}
        enableActions
        onEdit={(row) => alert(`Edit Bill #${row.ID}`)}
        onView={(row) => alert(`Viewing Bill #${row.ID}`)}
        onDelete={(row) => alert(`Deleted Bill #${row.ID}`)}
        onFilterChange={(f) => console.log("Filter:", f)}
        searchPlaceholder="Search by patient, mobile, or bill no..."
        enableExport
        onExport={() => console.log("Export clicked!")}
      />
    </div>
  );
};

export default OpdBillingList;
