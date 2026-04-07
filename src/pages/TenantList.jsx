import React, { useState } from "react";
import {
  useGetTenantsQuery,
  useDeleteTenantMutation,
  useToggleTenantStatusMutation,
} from "../redux/apiSlice";
import CommonList from "../components/CommonList";
import { healthAlert } from "../utils/healthSwal";
import { useNavigate } from "react-router-dom";
import CopyFilterBar from "../components/Updates/Filter";

const TenantList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [tempFilters, setTempFilters] = useState({
    name: "",
  });
  const [filters, setFilters] = useState({});
  const {
    data = [],
    isLoading,
    isError,
    error,
  } = useGetTenantsQuery(
    {
      page,
      limit,
      ...filters,
    },
    { skip: !page || !limit },
  );
  const [deleteTenant] = useDeleteTenantMutation();
  const [toggleStatus] = useToggleTenantStatusMutation();
  const tenants = data?.data?.data || [];

  const pagination = data?.pagination || { currentPage: page, totalRecords: 0 };
  const filtersConfig = [
    { label: "Name", name: "name", type: "text" },
    { label: "Date from ", name: "startDate", type: "date" },
    { label: "Date to", name: "endDate", type: "date" },
  ];
  const handleResetFilters = () => {
    setTempFilters({
      name: "",
      startDate: "",
      endDate: "",
    });
    setFilters({});
    setPage(1);
  };
  const handleDelete = async (row) => {
    try {
      await deleteTenant(row.id).unwrap();
      healthAlert({
        title: "Deleted",
        text: "Tenant deleted",
        icon: "success",
      });
      refetch();
    } catch {
      healthAlert({ title: "Error", text: "Delete failed", icon: "error" });
    }
  };

  const handleToggle = async (row) => {
    try {
      await toggleStatus(row.id).unwrap();
      refetch();
    } catch {
      healthAlert({
        title: "Error",
        text: "Status update failed",
        icon: "error",
      });
    }
  };

  const handleEdit = (row) => {
    if (!row || !row.id) {
      healthAlert({
        title: "Error",
        text: "Tenant ID not found for this record.",
        icon: "error",
      });
      return;
    }
    navigate(`/tenants`, {
      state: {
        editData: row,
      },
    });
  };
  const handleApplyFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    const { startDate, endDate } = tempFilters;

    if (endDate && endDate > today) {
      healthAlert({
        title: "Tenant List",
        text: `End date cannot be greater than today.`,
        icon: "info",
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      healthAlert({
        title: "Tenant List",
        text: `Start date cannot be after end date.`,
        icon: "info",
      });
      return;
    }

    setFilters(tempFilters);
    setPage(1);
  };

  const columns = [
    {
      name: "SL No",
      selector: (_, x) => x + 1,
    },
    {
      name: "Name",
      selector: (row) => row.name,
    },
    {
      name: "Created At",
      selector: (row) => new Date(row.created_at).toISOString().split("T")[0],
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            row.status
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {row.status ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Tenant List</h1>
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      <CommonList
        data={tenants}
        columns={columns}
        isLoading={isLoading}
        title="Tenant list"
        totalRows={pagination.totalRecords || 0}
        currentPage={pagination.currentPage || page}
        perPage={limit}
        onPageChange={(newPage) => setPage(newPage)}
        onPerPageChange={(newLimit) => {
          setLimit(newLimit);
          setPage(1);
        }}
        enableActions
        actionButtons={["edit", "delete"]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default TenantList;
