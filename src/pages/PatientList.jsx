import React from "react";
import CommonList from "../components/CommonList";
import { useGetPatientsQuery } from "../redux/apiSlice";

const PatientList = () => {
  const columns = [
    { name: "S.no", selector: (row) => row.sno, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Contact", selector: (row) => row.contactNumber },
    { name: "Centre", selector: (row) => row.centreName },
    { name: "UHID", selector: (row) => row.UHID },
    { name: "Gender", selector: (row) => row.gender },
    { name: "Age", selector: (row) => row.age },
    { name: "Complaint", selector: (row) => row.Disease },
    { name: "Credit Amt", selector: (row) => row.creditamount },
    { name: "Address", selector: (row) => row.address },
    { name: "Category", selector: (row) => row.category },
    { name: "Added On", selector: (row) => row.createdAt },
    { name: "Id_Proof", selector: (row) => row.idProof_number },
    { name: "Added_By", selector: (row) => row.added_by },
    { name: "Remarks", selector: (row) => row.remarks },
  ];

  const data = [
    {
      sno: 1,
      name: "Ravi Kumar",
      contactNumber: "9876543210",
      centreName: "City Health Centre",
      UHID: "UH123456",
      gender: "Male",
      age: 34,
      Disease: "Fever",
      creditamount: 1500,
      address: "123, MG Road, Delhi",
      category: "APL",
      createdAt: "2025-11-06",
      idProof_number: "A123456789",
      added_by: "Admin",
      remarks: "First visit",
    },
    {
      sno: 2,
      name: "Priya Sharma",
      contactNumber: "9898123456",
      centreName: "Green Clinic",
      UHID: "UH987654",
      gender: "Female",
      age: 29,
      Disease: "Cough & Cold",
      creditamount: 2000,
      address: "45, Park Street, Mumbai",
      category: "BPL",
      createdAt: "2025-11-05",
      idProof_number: "B987654321",
      added_by: "Reception",
      remarks: "Follow-up",
    },
  ];


  const filters = [
    { label: "All", value: "all" },
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
  ];

  const handleFilter = (val) => console.log("Selected Filter:", val);
  const handleRowClick = (row) => alert(`Clicked on ${row.name}`);

  return (
    <div className="p-0">
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
