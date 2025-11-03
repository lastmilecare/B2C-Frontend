import React from "react";
import CommonList from "../components/CommonList";

const PatientList = () => {
  const columns = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Contact", selector: (row) => row.contactNumber },
    { name: "Gender", selector: (row) => row.gender },
    { name: "Age", selector: (row) => row.age },
  ];

  const data = [
    { name: "Ravi Kumar", contactNumber: "9876543210", gender: "Male", age: 34 },
    { name: "Priya Sharma", contactNumber: "9898123456", gender: "Female", age: 29 },
  ];

  const filters = [
    { label: "All", value: "all" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  const handleFilter = (val) => console.log("Selected Filter:", val);
  const handleRowClick = (row) => alert(`Clicked on ${row.name}`);

  return (
    <div className="p-6">
      <CommonList
        title="Patient List"
        columns={columns}
        data={data}
        filters={filters}
        onFilterChange={handleFilter}
        onRowClick={handleRowClick}
        onEdit={(row) => alert(`Patient List #${row.ID}`)}
        onView={(row) => alert(`Patient #${row.ID}`)}
        onDelete={(row) => alert(`Patient  #${row.ID}`)}
        enableActions
        enableExport
        onExport={() => console.log("Export clicked!")}
      />
    </div>
  );
};

export default PatientList;
