import React, { useState } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";

const ResourceList = () => {
  const navigate = useNavigate();

  
  const [records] = useState([
    {
      id: 1,
      name: "User Management",
      description: "Handles user roles and permissions",
      date: "2026-04-10",
    },
    {
      id: 2,
      name: "Inventory",
      description: "Manage stock and medicines",
      date: "2026-04-12",
    },
    {
      id: 3,
      name: "Billing",
      description: "Handles billing and invoices",
      date: "2026-04-15",
    },
  ]);

 
  const [tempFilters, setTempFilters] = useState({
    name: "",
    description: "",
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
      description: "",
      fromDate: "",
      toDate: "",
    };
    setTempFilters(reset);
    setFilters({});
  };


  const filteredData = records.filter((item) => {
    const { name, description, fromDate, toDate } = filters;

    return (
      (!name ||
        item.name.toLowerCase().includes(name.toLowerCase())) &&

      (!description ||
        item.description.toLowerCase().includes(description.toLowerCase())) &&

      (!fromDate || item.date >= fromDate) &&
      (!toDate || item.date <= toDate)
    );
  });

 
  const filtersConfig = [
    {
      label: "Resource Name",
      name: "name",
      type: "text",
    },
    {
      label: "Description",
      name: "description",
      type: "text",
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
      name: "Resource Name",
      selector: (row) => row.name,
    },
    {
      name: "Description",
      selector: (row) => row.description,
    },
    {
      name: "Date",
      selector: (row) => row.date,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Resource List
      </h1>

   
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

     
      <PatientTable
        title="Resources"
        data={filteredData}
        columns={columns}
        totalRows={filteredData.length}
        currentPage={1}
        perPage={10}
        onPageChange={() => {}}
        onPerPageChange={() => {}}
        isLoading={false}

        onEdit={(row) => {
          navigate(`/resource/${row.id}`);
        }}

        onDelete={(row) => {
          console.log("Delete", row);
        }}
      />

    </div>
  );
};

export default ResourceList;