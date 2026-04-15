import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";

const MedicalHistoryList = () => {
  const navigate = useNavigate();

  const [records] = useState([
    {
      id: 1,
      patientName: "Ravi Kumar",
      pastIllness: "Diabetes",
      medications: "Metformin",
      allergies: "Dust",
      smoking: "No",
      alcohol: "Occasionally",
      tobacco: "No",
    },
    {
      id: 2,
      patientName: "Amit Singh",
      pastIllness: "Hypertension",
      medications: "Amlodipine",
      allergies: "None",
      smoking: "Regular",
      alcohol: "No",
      tobacco: "Occasionally",
    },
  ]);

  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    smoking: "",
    alcohol: "",
    tobacco: "",
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
      smoking: "",
      alcohol: "",
      tobacco: "",
    };
    setTempFilters(reset);
    setFilters({});
  };

  const filteredData = records.filter((item) => {
    const { patientName, smoking, alcohol, tobacco } = filters;

    return (
      (!patientName ||
        item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&
      (!smoking || item.smoking === smoking) &&
      (!alcohol || item.alcohol === alcohol) &&
      (!tobacco || item.tobacco === tobacco)
    );
  });

  const filtersConfig = [
    {
      label: "Patient Name",
      name: "patientName",
      type: "text",
    },
    {
      label: "Smoking",
      name: "smoking",
      type: "select",
      options: [
        { label: "No", value: "No" },
        { label: "Occasionally", value: "Occasionally" },
        { label: "Regular", value: "Regular" },
      ],
    },
    {
      label: "Alcohol",
      name: "alcohol",
      type: "select",
      options: [
        { label: "No", value: "No" },
        { label: "Occasionally", value: "Occasionally" },
        { label: "Regular", value: "Regular" },
      ],
    },
    {
      label: "Tobacco",
      name: "tobacco",
      type: "select",
      options: [
        { label: "No", value: "No" },
        { label: "Occasionally", value: "Occasionally" },
        { label: "Regular", value: "Regular" },
      ],
    },
  ];

  const columns = [
    {
      name: "Patient",
      selector: (row) => row.patientName,
    },
    {
      name: "Past Illness",
      selector: (row) => row.pastIllness,
    },
    {
      name: "Medications",
      selector: (row) => row.medications,
    },
    {
      name: "Allergies",
      selector: (row) => row.allergies,
    },
    {
      name: "Smoking",
      selector: (row) => row.smoking,
    },
    {
      name: "Alcohol",
      selector: (row) => row.alcohol,
    },
    {
      name: "Tobacco",
      selector: (row) => row.tobacco,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Medical History List
      </h1>

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      
      <PatientTable
        title="Medical History"
        data={filteredData}
        columns={columns}
        totalRows={filteredData.length}
        currentPage={1}
        perPage={10}
        onPageChange={() => {}}
        onPerPageChange={() => {}}
        isLoading={false}

        onEdit={(row) => {
          navigate(`/medical-history/${row.id}`);
        }}

        onDelete={(row) => {
          console.log("Delete", row);
        }}
      />

    </div>
  );
};

export default MedicalHistoryList;