import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import {
  useGetMedicalHistoryQuery,
  useDeleteMedicalHistoryMutation,
  useSearchNameQuery
} from "../redux/apiSlice";
import { healthAlerts } from "../utils/healthSwal"; 
const MedicalHistoryList = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMedicalHistoryQuery();
const [deleteMedicalHistory] = useDeleteMedicalHistoryMutation();

const records = data || [];
 

  const [tempFilters, setTempFilters] = useState({
    name: "",
    smoking: "",
    alcohol: "",
    tobacco: "",
  });
const { data: nameSuggestions = [] } = useSearchNameQuery(
  tempFilters.name,
  {
    skip: !tempFilters.name || tempFilters.name.length < 2,
  }
);
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
      name: "",
      smoking: "",
      alcohol: "",
      tobacco: "",
    };
    setTempFilters(reset);
    setFilters({});
  };

  const filteredData = records.filter((item) => {
  const { name, smoking, alcohol, tobacco } = filters;

  return (
    (!name ||
      item.name?.toLowerCase().includes(name.toLowerCase())) &&
    (!smoking || item.smoking === smoking) &&
    (!alcohol || item.alcohol === alcohol) &&
    (!tobacco || item.tobacco_use === tobacco)
  );
});

  const filtersConfig = [
    {
    label: "Patient ID",
    name: "patient_id",
    type: "text",
  },
  {
  label: "Patient Name",
  name: "name",
  type: "text",
  suggestionConfig: {
    keyField: "name",
    valueField: "name",
    minLength: 2,
  },
},
  {
    label: "From Date",
    name: "startDate",
    type: "date",
  },
  {
    label: "To Date",
    name: "endDate",
    type: "date",
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
  { name: "Patient ID", selector: (row) => row.patient_id },
  { name: "Name", selector: (row) => row.name },
  { name: "Past Illness", selector: (row) => row.past_illness },
  { name: "Medications", selector: (row) => row.current_medications },
  { name: "Allergies", selector: (row) => row.allergies },
  { name: "Smoking", selector: (row) => row.smoking },
  { name: "Alcohol", selector: (row) => row.alcohol },
  { name: "Tobacco", selector: (row) => row.tobacco_use },
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

  suggestionsMap={{
    name: nameSuggestions,
  }}

  onSelectSuggestion={(field, value) => {
    setTempFilters((prev) => ({
      ...prev,
      name: value, 
    }));
  }}
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

       onDelete={async (row) => {
  try {
    await deleteMedicalHistory(row.id).unwrap();
    healthAlerts.success("Record deleted successfully"); 
  } catch (err) {
    healthAlerts.error("Delete failed"); 
  }
}}
      />

    </div>
  );
};

export default MedicalHistoryList;