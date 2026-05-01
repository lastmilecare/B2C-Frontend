import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import { useGetLabInvestigationsQuery, useDeleteLabMutation } from "../redux/apiSlice";
import { healthAlerts } from "../utils/healthSwal";
const LaboratoryInvestigationList = () => {
  const navigate = useNavigate();
  const { data: records = [], isLoading } = useGetLabInvestigationsQuery();
  const [deleteLab] = useDeleteLabMutation();
  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    testName: "",
    fromDate: "",
    toDate: "",
  });

const [filters, setFilters] = useState({});
const formattedData = records.map((item) => ({
  id: item.id,
  patientName: item.name,
  totalTests: item.tests?.length || 0,
  date: item.investigation_date,
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
      billno: "",
      uhid: "",
      commonTest: "",
      testName: "",
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };

  
  const filteredData = formattedData.filter((item) => {
    const {
      patientName,
      testName,
      fromDate,
      toDate,
    } = filters;

    return (
      (!patientName ||
        item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&

     
      
      (!testName ||
        item.tests.some((t) =>
          t.test_name.toLowerCase().includes(testName.toLowerCase())
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
      label: "Test Name",
      name: "testName",
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
      selector: (row) => row.totalTests,
    },
    {
      name: "Test Summary",
      cell: (row) => (
        <div className="text-xs space-y-1">
          {row.tests.map((t, i) => (
  <div key={i}>
    {t.test_name} ({t.result_value})
  </div>
))}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Laboratory Investigation List
      </h1>

      {/* ✅ FILTER BAR */}
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      {/* ✅ TABLE */}
      <PatientTable
        title="Laboratory Investigation"
        data={filteredData}
        columns={columns}
        totalRows={filteredData.length}
        currentPage={1}
        perPage={10}
        onPageChange={() => {}}
        onPerPageChange={() => {}}
        isLoading={false}

        onEdit={(row) => {
          navigate(`/laboratory-investigation/${row.id}`);
        }}

        onDelete={async (row) => {
  try {
    await deleteLab(row.id).unwrap();
    healthAlerts.success("Deleted Successfully");
  } catch (err) {
    healthAlerts.error("Delete Failed");
  }
}}
      />

    </div>
  );
};

export default LaboratoryInvestigationList;