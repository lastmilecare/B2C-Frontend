import React from "react";
import CommonList from "../components/CommonList";

const PrescriptionList = () => {
  // 🧾 Columns for prescription table
  const columns = [
    { name: "Prescription ID", selector: (row) => row.prescription_id, sortable: true },
    { name: "Doctor ID", selector: (row) => row.doctor_id },
    { name: "Driver ID", selector: (row) => row.driver_id },
    { name: "Diagnosis", selector: (row) => row.diagnose || "-" },
    {
      name: "Follow Up",
      selector: (row) =>
        row.follow_up ? new Date(row.follow_up).toLocaleDateString() : "-",
    },
    {
      name: "Status",
      selector: (row) => (row.isReady ? "✅ Ready" : "🕓 Pending"),
    },
  ];

  // 📋 Sample data
  const data = [
    {
      prescription_id: "PR-1001",
      doctor_id: 23,
      driver_id: 554,
      diagnose: "Flu and cold",
      follow_up: "2025-11-10",
      isReady: true,
    },
    {
      prescription_id: "PR-1002",
      doctor_id: 12,
      driver_id: 431,
      diagnose: "Diabetes management",
      follow_up: "2025-11-15",
      isReady: false,
    },
  ];

  // 🔍 Filter options
  const filters = [
    { label: "All", value: "all" },
    { label: "Ready", value: "ready" },
    { label: "Pending", value: "pending" },
  ];

  // ⚙️ Filter logic
  const handleFilterChange = (filterValue) => {
    console.log("Filter applied:", filterValue);
  };

  // 👆 Row click action
  const handleRowClick = (row) => {
    alert(`Opening details for Prescription ID: ${row.prescription_id}`);
  };

  return (
    <div className="p-6">
      <CommonList
        title="Prescription List"
        columns={columns}
        data={data}
        filters={filters}
        onFilterChange={handleFilterChange}
        onRowClick={handleRowClick}
        searchPlaceholder="Search by diagnosis or doctor..."
        onEdit={(row) => alert(`Prescription List #${row.ID}`)}
        onView={(row) => alert(`Prescription #${row.ID}`)}
        onDelete={(row) => alert(`Prescription  #${row.ID}`)}
        enableActions
        enableExport
        onExport={() => console.log("Export clicked!")}

      />
    </div>
  );
};

export default PrescriptionList;
