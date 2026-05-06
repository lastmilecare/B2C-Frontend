import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import { useGetAllTemplatesQuery } from "../redux/apiSlice";

const TemplateList = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useGetAllTemplatesQuery();

  const [tempFilters, setTempFilters] = useState({
    name: "",
    tenant_id: "",
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
      name: "",
      tenant_id: "",
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };

  const records = (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    tenant_id: item.tenant_id,
    date: item.created_at?.split("T")[0],
  }));

  const filteredData = records.filter((item) => {
    const { name, tenant_id, fromDate, toDate } = filters;

    return (
      (!name ||
        item.name?.toLowerCase().includes(name.toLowerCase())) &&
      (!tenant_id ||
        String(item.tenant_id)?.includes(tenant_id)) &&
      (!fromDate || item.date >= fromDate) &&
      (!toDate || item.date <= toDate)
    );
  });

  
  const filtersConfig = [
    {
      label: "Template Name",
      name: "name",
      type: "text",
    },
    {
      label: "Tenant ID",
      name: "tenant_id",
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
    { name: "Template Name", selector: (row) => row.name },
    { name: "Tenant ID", selector: (row) => row.tenant_id },
    { name: "Created Date", selector: (row) => row.date },
  ];

  return (
    <div className="max-w-7xl mx-auto">

    
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Template List
      </h1>

     
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      
      <PatientTable
        title="Template Records"
        data={filteredData}
        columns={columns}
        totalRows={filteredData.length}
        currentPage={1}
        perPage={10}
        onPageChange={() => {}}
        onPerPageChange={() => {}}
        isLoading={isLoading}
       onEdit={(row) =>
  navigate(`/fitness-certificate/template/${row.id}`, {
    state: {
      tenant_id: row.tenant_id,
      goToTemplate: true,
    },
  })
}
        
      />
    </div>
  );
};

export default TemplateList;