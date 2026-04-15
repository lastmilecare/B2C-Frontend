import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";

const RadiologyList = () => {
  const navigate = useNavigate();

  
  const [records] = useState([
    {
      id: 1,
      billno: "2001",
      patientName: "Ravi Kumar",
      uhid: "UH123",
      date: "2026-04-10",
      tests: [
        { testType: "Chest X-ray", resultSummary: "Normal", doctorRemarks: "OK" },
        { testType: "ECG", resultSummary: "Normal", doctorRemarks: "Stable" },
      ],
    },
    {
      id: 2,
      billno: "2002",
      patientName: "Amit Singh",
      uhid: "UH124",
      date: "2026-04-12",
      tests: [
        { testType: "Audiometry", resultSummary: "Mild Loss", doctorRemarks: "Check Again" },
      ],
    },
    {
      id: 3,
      billno: "2003",
      patientName: "Neha Verma",
      uhid: "UH125",
      date: "2026-04-15",
      tests: [
        { testType: "Vision Test", resultSummary: "6/9", doctorRemarks: "Glasses Needed" },
      ],
    },
  ]);

 
  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    billno: "",
    uhid: "",
    testType: "",
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
      testType: "",
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
      testType,
      fromDate,
      toDate,
    } = filters;

    return (
      (!patientName ||
        item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&

      (!billno || item.billno.includes(billno)) &&

      (!uhid ||
        item.uhid.toLowerCase().includes(uhid.toLowerCase())) &&

      
      (!testType ||
        item.tests.some((t) =>
          t.testType.toLowerCase().includes(testType.toLowerCase())
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
      label: "Test Type",
      name: "testType",
      type: "text",
    },
    {
      label: "From Date",
      name: "fromDate",
      type: "date",
    },
    {
      label: "To Date",
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
      name: "Total Tests",
      cell: (row) => row.tests.length,
    },
    {
      name: "Test Summary",
      cell: (row) => (
        <div className="text-xs space-y-1">
          {row.tests.map((t, i) => (
            <div key={i}>
              {t.testType}: {t.resultSummary}
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
        isLoading={false}

        onEdit={(row) => {
          navigate(`/radiology/${row.id}`);
        }}

        onDelete={(row) => {
          console.log("Delete", row);
        }}
      />

    </div>
  );
};

export default RadiologyList;