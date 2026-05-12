import React, { useState } from "react";
import {
  useGetRolesQuery,
  useDeleteRoleMutation,
  useGetAllTenantsQuery,
} from "../redux/apiSlice";
import CopyFilterBar from "../components/Updates/Filter";
import CommonList from "../components/CommonList";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { healthAlert } from "../utils/healthSwal";
import {
  formatDate,
  formatTime,
} from "../utils/helper";
const RoleList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [tempFilters, setTempFilters] = useState({
    name: "",
    tenantId: "",
    startDate: "",
    endDate: "",
  });
  const [filters, setFilters] = useState({});

  const { data, isLoading, isFetching, refetch } = useGetRolesQuery({
    page,
    limit,
    ...filters,
  });

  const { data: tenantData } = useGetAllTenantsQuery();
  const [deleteRole] = useDeleteRoleMutation();

  const roles = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};
  const tenants = tenantData?.data?.data || [];

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({ name: "", tenantId: "", startDate: "", endDate: "" });
    setFilters({});
    setPage(1);
  };

  const handleDelete = async (row) => {
    healthAlert({
      title: "info!",
      text: "Feature Needs to be implemented.",
      icon: "success",
    });
    return;
    if (!window.confirm(`Delete role "${row.name}"?`)) return;

    try {
      await deleteRole(row.id).unwrap();

      healthAlert({
        title: "Deleted!",
        text: "Role deleted successfully",
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

  const filtersConfig = [
    { label: "Search Role", name: "name", type: "text" },
    {
      label: "Filter by Tenant",
      name: "tenantId",
      type: "select",
      options: tenants.map((t) => ({
        label: t.name,
        value: t.id,
      })),
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
    cell: (_, index) => (
      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold">
        {index + 1}
      </div>
    ),
  },

  {
    name: "Role Details",
    grow: 2,
    cell: (row) => (
      <div className="flex items-center gap-3 py-2">
        <div className="bg-gradient-to-br from-sky-100 to-blue-100 p-2.5 rounded-xl border border-sky-200 shadow-sm">
          <ShieldCheckIcon className="h-5 w-5 text-sky-600" />
        </div>

        <div className="flex flex-col">
          <p className="font-semibold text-slate-800 text-sm">
            {row.name}
          </p>

          <p className="text-xs text-slate-500 line-clamp-1">
            {row.description || "No description available"}
          </p>
        </div>
      </div>
    ),
  },

  {
    name: "Tenant",
    center: true,
    cell: (row) => (
      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
        {row?.tenant?.name || "Global"}
      </span>
    ),
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

        <span className="text-slate-400">
          {formatTime(row.createdAt)}
        </span>
      </div>
    ),
  },
];

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Role List</h1>
      </div>

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={(e) =>
          setTempFilters({
            ...tempFilters,
            [e.target.name]: e.target.value,
          })
        }
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <CommonList
          title="Role List"
          data={roles}
          columns={columns}
          isLoading={isLoading || isFetching}
          totalRows={pagination.total || 0}
          currentPage={pagination.page || page}
          perPage={limit}
          onPageChange={(p) => setPage(p)}
          onPerPageChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          enableActions={true}
          actionButtons={["delete"]}
          onDelete={(row) => handleDelete(row)}
        />
      </div>
    </div>
  );
};

export default RoleList;
