import React, { useEffect, useState } from "react";
import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import {
  useFetchResourceMutation,
  useDeleteResourceMutation,
} from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { formatDate, formatTime } from "../utils/helper";
const ResourceList = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [tempFilters, setTempFilters] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [deleteResource] = useDeleteResourceMutation();
  const [filters, setFilters] = useState({});

  const [fetchResource, { data, isLoading }] = useFetchResourceMutation();

  useEffect(() => {
    fetchResource({
      page,
      limit,
      ...filters,
    });
  }, [page, limit, filters]);

  const filteredData = data?.data?.data || [];

  const pagination = data?.data?.pagination || {};

  const handleChange = (e) => {
    const { name, value } = e.target;

    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setPage(1);

    setFilters({
      ...tempFilters,
    });
  };

  const handleResetFilters = () => {
    const reset = {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
    };

    setTempFilters(reset);

    setFilters({});

    setPage(1);
  };

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
      label: "Date From",
      name: "startDate",
      type: "date",
    },
    {
      label: "Date To",
      name: "endDate",
      type: "date",
    },
  ];

  const columns = [
    {
      name: "SL No",
      width: "70px",
      height: "100px",
      cell: (_, index) => (
        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold">
          {index + 1}
        </div>
      ),
    },
    {
      name: "Resource Name",
      selector: (row) => row.name || "-",
    },
    {
      name: "Description",
      selector: (row) => row.description || "-",
    },
    {
      name: "Status",
      center: true,
      cell: (row) => {
        const isActive = Boolean(row.status);

        return (
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase border shadow-sm
          ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      name: "Added On",
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-800">
            {formatDate(row.createdAt)}
          </span>

          <span className="text-slate-400">{formatTime(row.createdAt)}</span>
        </div>
      ),
    },
  ];
  const handleDelete = async (row) => {
    healthAlert({
      title: "info!",
      text: "Feature Needs to be implemented.",
      icon: "success",
    });
    return;

    if (!window.confirm(`Delete resource "${row.name}"?`)) return;

    try {
      await deleteResource(row.id).unwrap();

      healthAlert({
        title: "Deleted!",
        text: "Resource deleted successfully",
        icon: "success",
      });

      refetch();
    } catch (error) {
      healthAlert({
        title: "Error",
        text: error?.data?.message || "Delete failed",
        icon: "error",
      });
    }
  };

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

      <CommonList
        title="Resources"
        data={filteredData}
        columns={columns}
        totalRows={pagination.total || 0}
        currentPage={pagination.page || page}
        perPage={pagination.limit || limit}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        isLoading={isLoading}
        enableActions={true}
        actionButtons={["delete"]}
        onDelete={(row) => handleDelete(row)}
      />
    </div>
  );
};

export default ResourceList;
