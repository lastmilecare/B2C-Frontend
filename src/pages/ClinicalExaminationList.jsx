import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import {
  useGetClinicalExamQuery,
  useDeleteClinicalExamMutation
} from "../redux/apiSlice";
const ClinicalExaminationList = () => {
  const navigate = useNavigate();
const { data = [], isLoading } = useGetClinicalExamQuery();
const [deleteClinicalExam] = useDeleteClinicalExamMutation();
const records = data?.map((item) => ({
  id: item.id,
  patientName: item.name,
  date: item.created_at,
  generalAppearance: item.general_appearance,
  vision: item.eye_examination,
  colorBlindness: "-", 
  ear: item.ear,
  nose: item.nose,
  throat: item.throat,
  cardiovascular: item.cardiovascular_system,
  respiratory: item.respiratory_system,
  skin: item.skin_condition,
}));
  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    colorBlindness: "",
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
      colorBlindness: "",
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };


  const filteredData = records.filter((item) => {
    const { patientName, colorBlindness, fromDate, toDate } = filters;

    return (
      (!patientName ||
        item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&

      (!colorBlindness || item.colorBlindness === colorBlindness) &&

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
      label: "Color Blindness",
      name: "colorBlindness",
      type: "select",
      options: [
        { label: "No", value: "No" },
        { label: "Yes", value: "Yes" },
      ],
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
  navigate(`/clinical-examination/${row.id}`, {
    state: { editData: row },
  });
}}

        onDelete={async (row) => {
  try {
    await deleteClinicalExam(row.id).unwrap();
    healthAlerts.success("Deleted Successfully");
  } catch (err) {
    healthAlerts.error("Delete Failed");
  }
}}
      />

    </div>
  );
};

export default ClinicalExaminationList;