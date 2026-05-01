import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import {
  useGetDoctorAssessmentQuery,
  useDeleteDoctorAssessmentMutation,
} from "../redux/apiSlice";

import { healthAlerts } from "../utils/healthSwal";
const DoctorAssessmentList = () => {
  const navigate = useNavigate();

 
 const { data: records = [], isLoading } = useGetDoctorAssessmentQuery();
const [deleteDoctor] = useDeleteDoctorAssessmentMutation();

  
  const [tempFilters, setTempFilters] = useState({
    patientName: "",
    
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
      
      fitness: "",
      followUp: "",
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };
const formattedData = records.map((item) => ({
  id: item.id,
  patientName: item.name,
  date: item.created_at?.split("T")[0],
  fitness: item.fitness_category,
  healthStatus: item.overall_health_status,
  restrictions: item.restrictions,
  followUp: item.follow_up_required ? "Yes" : "No",
}));
  
  const filteredData = formattedData.filter((item) => {
  const { patientName, fitness, followUp, fromDate, toDate } = filters;

  return (
    (!patientName ||
      item.patientName.toLowerCase().includes(patientName.toLowerCase())) &&

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
  label: "Fitness",
  name: "fitness",
  type: "select",
  options: [
    { label: "Fit", value: "FIT" },
    { label: "Fit with Restrictions", value: "FIT_WITH_RESTRICTIONS" },
    { label: "Unfit", value: "UNFIT" },
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
        isLoading={isLoading}

        onEdit={(row) => {
          navigate(`/doctor-assessment/${row.id}`);
        }}

        onDelete={async (row) => {
  try {
    await deleteDoctor(row.id).unwrap();
    healthAlerts.success("Deleted Successfully");
  } catch (err) {
    console.error(err);
    healthAlerts.error("Delete Failed");
  }
}}
      />

    </div>
  );
};

export default DoctorAssessmentList;