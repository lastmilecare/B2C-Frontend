import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";

const LaboratoryInvestigationList = () => {
  const navigate = useNavigate();

  
  const [records] = useState([
    {
      id: 1,
      billno: "1001",
      patientName: "Ravi Kumar",
      uhid: "UH123",
      commonTest: "Fever Panel",
      totalTests: 2,
      date: "2026-04-10",
      tests: [
        { name: "CBC", result: "Normal" },
        { name: "Hemoglobin", result: "13" },
      ],
    },
    {
      id: 2,
      billno: "1002",
      patientName: "Amit Singh",
      uhid: "UH124",
      commonTest: "Diabetes Check",
      totalTests: 1,
      date: "2026-04-12",
      tests: [{ name: "Blood Sugar", result: "180" }],
    },
    {
      id: 3,
      billno: "1003",
      patientName: "Neha Verma",
      uhid: "UH125",
      commonTest: "Full Body Check",
      totalTests: 3,
      date: "2026-04-15",
      tests: [
        { name: "CBC", result: "Normal" },
        { name: "LFT", result: "Normal" },
        { name: "KFT", result: "Normal" },
      ],
    },
  ]);

  
  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    billno: "",
    uhid: "",
    commonTest: "",
    testName: "",
    fromDate: "",
    toDate: "",
  });

  const [filters, setFilters] = useState({});

 
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

  
  const filteredData = records.filter((item) => {
    const {
      patientName,
      billno,
      uhid,
      commonTest,
      testName,
      fromDate,
      toDate,
    } = filters;

    return (
      (!patientName ||
        item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&

      (!billno || item.billno.includes(billno)) &&

      (!uhid ||
        item.uhid.toLowerCase().includes(uhid.toLowerCase())) &&

      (!commonTest ||
        item.commonTest.toLowerCase().includes(commonTest.toLowerCase())) &&

      
      (!testName ||
        item.tests.some((t) =>
          t.name.toLowerCase().includes(testName.toLowerCase())
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
      label: "Bill No",
      name: "billno",
      type: "text",
    },
    {
      label: "UHID",
      name: "uhid",
      type: "text",
    },
    {
      label: "Common Test",
      name: "commonTest",
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
      name: "Bill No",
      selector: (row) => row.billno,
    },
    {
      name: "Patient",
      selector: (row) => row.patientName,
    },
    {
      name: "UHID",
      selector: (row) => row.uhid,
    },
    {
      name: "Date",
      selector: (row) => row.date,
    },
    {
      name: "Common Test",
      selector: (row) => row.commonTest,
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
              {t.name}: {t.result}
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
          navigate(`/lab-investigation/${row.id}`);
        }}

        onDelete={(row) => {
          console.log("Delete", row);
        }}
      />

    </div>
  );
};

export default LaboratoryInvestigationList;