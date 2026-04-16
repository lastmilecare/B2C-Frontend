import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";

const DoctorAssessmentList = () => {
  const navigate = useNavigate();

 
  const [records] = useState([
    {
      id: 1,
      billno: "3001",
      patientName: "Ravi Kumar",
      uhid: "UH123",
      date: "2026-04-10",
      fitness: "Fit",
      healthStatus: "Healthy",
      restrictions: "None",
      followUp: "No",
    },
    {
      id: 2,
      billno: "3002",
      patientName: "Amit Singh",
      uhid: "UH124",
      date: "2026-04-12",
      fitness: "Fit with Restrictions",
      healthStatus: "BP High",
      restrictions: "Heavy Work Avoid",
      followUp: "Yes",
    },
    {
      id: 3,
      billno: "3003",
      patientName: "Neha Verma",
      uhid: "UH125",
      date: "2026-04-15",
      fitness: "Unfit",
      healthStatus: "Weak",
      restrictions: "Rest Required",
      followUp: "Yes",
    },
  ]);

  
  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    billno: "",
    uhid: "",
    fitness: "",
    followUp: "",
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
      fitness: "",
      followUp: "",
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
      fitness,
      followUp,
      fromDate,
      toDate,
    } = filters;

    return (
      (!patientName ||
        item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&
      (!billno || item.billno.includes(billno)) &&
      (!uhid ||
        item.uhid.toLowerCase().includes(uhid.toLowerCase())) &&
      (!fitness || item.fitness === fitness) &&
      (!followUp || item.followUp === followUp) &&
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
      label: "Fitness",
      name: "fitness",
      type: "select",
      options: [
        { label: "Fit", value: "Fit" },
        { label: "Fit with Restrictions", value: "Fit with Restrictions" },
        { label: "Unfit", value: "Unfit" },
      ],
    },
    {
      label: "Follow Up",
      name: "followUp",
      type: "select",
      options: [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" },
      ],
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
      name: "Fitness",
      selector: (row) => row.fitness,
    },
    {
      name: "Health Status",
      selector: (row) => row.healthStatus,
    },
    {
      name: "Restrictions",
      selector: (row) => row.restrictions,
    },
    {
      name: "Follow Up",
      selector: (row) => row.followUp,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Doctor Assessment List
      </h1>

      
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

     
      <PatientTable
        title="Doctor Assessment"
        data={filteredData}
        columns={columns}
        totalRows={filteredData.length}
        currentPage={1}
        perPage={10}
        onPageChange={() => {}}
        onPerPageChange={() => {}}
        isLoading={false}

        onEdit={(row) => {
          navigate(`/doctor-assessment/${row.id}`);
        }}

        onDelete={(row) => {
          console.log("Delete", row);
        }}
      />

    </div>
  );
};

export default DoctorAssessmentList;