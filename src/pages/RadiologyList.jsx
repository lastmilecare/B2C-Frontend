import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import { useGetRadiologyQuery, useDeleteRadiologyMutation } from "../redux/apiSlice";
const RadiologyList = () => {
  const navigate = useNavigate();
const { data: records = [], isLoading } = useGetRadiologyQuery();
const [deleteRadiology] = useDeleteRadiologyMutation();
 
  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    
    testType: "",
    fromDate: "",
    toDate: "",
  });
  
  const [filters, setFilters] = useState({});
const formattedData = records.map((item) => ({
  id: item.id,
  patientName: item.name,
  date: item.created_at?.split("T")[0],
  tests: item.tests || [],
}));
 
  const handleChange = (e) => {
    const { name, value } = e.target;

    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  
  const handleApplyFilters = () => {
    setFilters(tempFilters);
  };


  const handleResetFilters = () => {
    const reset = {
      patientName: "",
     
      testType: "",
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };

const filteredData = formattedData.filter((item) => {
  const { patientName, testType, fromDate, toDate } = filters;

  return (
    (!patientName ||
      item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&

    (!testType ||
      item.tests.some((t) =>
        t.test_type?.toLowerCase().includes(testType.toLowerCase())
      )) &&

    (!fromDate || item.date >= fromDate) &&
    (!toDate || item.date <= toDate)
  );
});

  
  const filtersConfig = [
    {
      label: "Patient Name",
      name: "patientName",
      type: "text",
    },
    
   
    {
      label: "Test Type",
      name: "testType",
      type: "text",
    },
    {
      label: "Date Form",
      name: "fromDate",
      type: "date",
    },
    {
      label: "Date To",
      name: "toDate",
      type: "date",
    },
  ];

  
 const columns = [
  {
    name: "Patient",
    selector: (row) => row.patientName,
  },
  {
    name: "Date",
    selector: (row) => row.date,
  },
  {
    name: "Total Tests",
    selector: (row) => row.tests.length,
  },
  {
    name: "Test Summary",
    cell: (row) => (
      <div className="text-xs space-y-1">
        {row.tests.map((t, i) => (
          <div key={i}>
            {t.test_type} ({t.result_summary})
          </div>
        ))}
      </div>
    ),
  },
];

  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Radiology & Special Tests List
      </h1>

     
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

     
      <PatientTable
        title="Radiology Tests"
        data={filteredData}
        columns={columns}
        totalRows={filteredData.length}
        currentPage={1}
        perPage={10}
        onPageChange={() => {}}
        onPerPageChange={() => {}}
        isLoading={isLoading}

        onEdit={(row) => {
          navigate(`/radiology-screen/${row.id}`);
        }}

       onDelete={async (row) => {
  try {
    await deleteRadiology(row.id).unwrap();
    healthAlerts.success("Deleted Successfully");
  } catch {
    healthAlerts.error("Delete Failed");
  }
}}
      />

    </div>
  );
};

export default RadiologyList;