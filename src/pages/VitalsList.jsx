import React, { useState, useEffect, useRef } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import {
  useGetVitalsQuery,
  useDeleteVitalsMutation,
  useSearchEmployeeQuery,
} from "../redux/apiSlice";
import { healthAlerts } from "../utils/healthSwal";

const VitalsList = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetVitalsQuery();
  const [deleteVitals] = useDeleteVitalsMutation();
  const [tempFilters, setTempFilters] = useState({
    employee_id: "",
    name: "",
    fromDate: "",
    toDate: "",
  });
  const { data: empSuggestions = [] } = useSearchEmployeeQuery(
  tempFilters.employee_id,
  {
    skip: !tempFilters.employee_id,
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
      employee_id: "",
      name: "",
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
    
  };
  const records = (data?.data || []).map((item) => ({
    id: item.id,
    employee_id: item.employee_id,
    name: item.name,
    date: item.created_at?.split("T")[0],
    bpsystolic: item.bpsystolic,
    bpdiastolic: item.bpdiastolic,
    pulserate: item.pulserate,
    spo2: item.spo2,
    temperature: item.temperature,
    bmi: item.bmi,
    respiratory_rate: item.respiratory_rate,
  }));

  
  const filteredData = records.filter((item) => {
    const { employee_id, name, fromDate, toDate } = filters;

    return (
      (!employee_id ||
        item.employee_id
          ?.toLowerCase()
          .includes(employee_id.toLowerCase())) &&

      (!name ||
        item.name?.toLowerCase().includes(name.toLowerCase())) &&

      (!fromDate || item.date >= fromDate) &&
      (!toDate || item.date <= toDate)
    );
  });

  
  const filtersConfig = [
    {
      label: "Employee ID",
      name: "employee_id",
      type: "text",
      suggestionConfig: {
      minLength: 1,
      keyField: "employeeId",
      valueField: "employeeId",
    },
    },
    {
      label: "Name",
      name: "name",
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

  
  const handleDelete = async (row) => {
    try {
      await deleteVitals(row.id).unwrap();
      healthAlerts.success("Vitals deleted successfully");
    } catch (err) {
      healthAlerts.error(err?.data?.message || "Delete failed");
    }
  };

  
  const columns = [
    { name: "Employee ID", selector: (row) => row.employee_id },
    { name: "Name", selector: (row) => row.name },
    { name: "Date", selector: (row) => row.date },
    {
      name: "BP",
      cell: (row) =>
        `${row.bpsystolic || "-"} / ${row.bpdiastolic || "-"}`,
    },
    { name: "Pulse", selector: (row) => row.pulserate || "-" },
    { name: "SPO2", selector: (row) => row.spo2 || "-" },
    { name: "Temp", selector: (row) => row.temperature || "-" },
    { name: "BMI", selector: (row) => row.bmi || "-" },
    { name: "Resp Rate", selector: (row) => row.respiratory_rate || "-" },
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
           suggestionsMap={{
    employee_id: empSuggestions,
  }}

  onSelectSuggestion={(field, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }}
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
        isLoading={isLoading}
        onEdit={(row) => navigate(`/vitals/${row.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default VitalsList;