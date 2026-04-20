import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";

const VitalsList = () => {
  const navigate = useNavigate();

  
  const [records] = useState([
    {
      id: 1,
      billno: "5001",
      patientName: "Ravi Kumar",
      uhid: "UH123",
      date: "2026-04-10",
      bpsystolic: "120",
      bpdiastolic: "80",
      pulserate: "72",
      spo2: "98",
      temprature: "98.6",
      height: "170",
      weight: "70",
      bmi: "24.22",
      respiratoryRate: "18",
    },
    {
      id: 2,
      billno: "5002",
      patientName: "Amit Singh",
      uhid: "UH124",
      date: "2026-04-12",
      bpsystolic: "140",
      bpdiastolic: "90",
      pulserate: "85",
      spo2: "95",
      temprature: "99",
      height: "165",
      weight: "80",
      bmi: "29.38",
      respiratoryRate: "22",
    },
  ]);

 
  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    billno: "",
    uhid: "",
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
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };

  
  const filteredData = records.filter((item) => {
    const { patientName, billno, uhid, fromDate, toDate } = filters;

    return (
      (!patientName ||
        item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&

      (!billno || item.billno.includes(billno)) &&

      (!uhid ||
        item.uhid.toLowerCase().includes(uhid.toLowerCase())) &&

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
      name: "BP",
      cell: (row) => `${row.bpsystolic}/${row.bpdiastolic}`,
    },
    {
      name: "Pulse",
      selector: (row) => row.pulserate,
    },
    {
      name: "SPO2",
      selector: (row) => row.spo2,
    },
    {
      name: "Temp",
      selector: (row) => row.temprature,
    },
    {
      name: "BMI",
      selector: (row) => row.bmi,
    },
    {
      name: "Resp Rate",
      selector: (row) => row.respiratoryRate,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Vitals List
      </h1>

     
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      
      <PatientTable
        title="Vitals Records"
        data={filteredData}
        columns={columns}
        totalRows={filteredData.length}
        currentPage={1}
        perPage={10}
        onPageChange={() => {}}
        onPerPageChange={() => {}}
        isLoading={false}

        onEdit={(row) => {
          navigate(`/vitals/${row.id}`);
        }}

        onDelete={(row) => {
          console.log("Delete", row);
        }}
      />

    </div>
  );
};

export default VitalsList;