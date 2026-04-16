import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";

const ClinicalExaminationList = () => {
  const navigate = useNavigate();

  
  const [records] = useState([
    {
      id: 1,
      patientName: "Ravi Kumar",
      generalAppearance: "Normal",
      vision: "6/6",
      colorBlindness: "No",
      ear: "Normal",
      nose: "Clear",
      throat: "Normal",
      cardiovascular: "Normal",
      respiratory: "Normal",
      skin: "Healthy",
    },
    {
      id: 2,
      patientName: "Amit Singh",
      generalAppearance: "Weak",
      vision: "6/9",
      colorBlindness: "Yes",
      ear: "Infection",
      nose: "Blocked",
      throat: "Irritated",
      cardiovascular: "Mild Issue",
      respiratory: "Normal",
      skin: "Dry",
    },
  ]);

  
  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    colorBlindness: "",
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
      colorBlindness: "",
    };
    setTempFilters(reset);
    setFilters({});
  };

 
  const filteredData = records.filter((item) => {
    const { patientName, colorBlindness } = filters;

    return (
      (!patientName ||
        item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&
      (!colorBlindness || item.colorBlindness === colorBlindness)
    );
  });

 
  const filtersConfig = [
    {
      label: "Patient Name",
      name: "patientName",
      type: "text",
    },
    {
      label: "Color Blindness",
      name: "colorBlindness",
      type: "select",
      options: [
        { label: "No", value: "No" },
        { label: "Yes", value: "Yes" },
      ],
    },
  ];

 
  const columns = [
    {
      name: "Patient",
      selector: (row) => row.patientName,
    },
    {
      name: "General",
      selector: (row) => row.generalAppearance,
    },
    {
      name: "Vision",
      selector: (row) => row.vision,
    },
    {
      name: "Color Blindness",
      selector: (row) => row.colorBlindness,
    },
    {
      name: "ENT",
      cell: (row) => `${row.ear}, ${row.nose}, ${row.throat}`,
    },
    {
      name: "Cardio",
      selector: (row) => row.cardiovascular,
    },
    {
      name: "Respiratory",
      selector: (row) => row.respiratory,
    },
    {
      name: "Skin",
      selector: (row) => row.skin,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Clinical Examination List
      </h1>

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      
      <PatientTable
        title="Clinical Examination"
        data={filteredData}
        columns={columns}
        totalRows={filteredData.length}
        currentPage={1}
        perPage={10}
        onPageChange={() => {}}
        onPerPageChange={() => {}}
        isLoading={false}

        onEdit={(row) => {
          navigate(`/clinical-exam/${row.id}`);
        }}

        onDelete={(row) => {
          console.log("Delete", row);
        }}
      />

    </div>
  );
};

export default ClinicalExaminationList;