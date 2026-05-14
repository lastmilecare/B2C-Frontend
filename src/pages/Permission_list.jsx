import React, { useState } from "react";
import {
  useGetPermissionsQuery,
  useDeletePermissionMutation,
  useGetAllPermissionsComboQuery,
} from "../redux/apiSlice";
import CopyFilterBar from "../components/Updates/Filter";
import CommonList from "../components/CommonList";
import { KeyIcon } from "@heroicons/react/24/outline";
import { healthAlert } from "../utils/healthSwal";
import {
  formatDate,
  formatTime,
} from "../utils/helper";

const PermissionList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [tempFilters, setTempFilters] = useState({
    action: "",
    resource: "",
    startDate: "",
    endDate: "",
  });
  const [filters, setFilters] = useState({});

  const { data, isLoading, isFetching } = useGetPermissionsQuery({
    page,
    limit,
    ...filters,
  });
  const [deletePermission] = useDeletePermissionMutation();
  const { data: permissionComboData } = useGetAllPermissionsComboQuery();
  const comboPermissions = permissionComboData?.data?.data || [];
  const ACTIONS = [...new Set(comboPermissions.map((p) => p?.action))];
  const RESOURCES = [...new Set(comboPermissions.map((p) => p?.resource))];

  const permissions = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({
      action: "",
      resource: "",
      startDate: "",
      endDate: "",
    });

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
    const result = await healthAlert({
      title: "Are you sure?",
      text: `Do you want to delete permission "${row.action}:${row.resource}"?`,
      type: "confirm",
    });
    if (result.isConfirmed) {
      try {
        await deletePermission(row.id).unwrap();

        healthAlert({
          title: "Deleted!",
          text: "Permission removed.",
          type: "success",
        });
      } catch (err) {
        healthAlert({
          title: "Error",
          text: err?.data?.message || "Failed",
        });
      }
    }
  };

  const filtersConfig = [
    {
      label: "Action",
      center: true,
      name: "action",
      
      type: "select",
      options: ACTIONS.map((a) => ({ label: a.toUpperCase(), value: a })),
    },
    {
      label: "Resource",
      name: "resource",
      type: "select",
      options: RESOURCES.map((r) => ({ label: r.toUpperCase(), value: r })),
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

  //   const columns = [
  //     {
  //         name: "SL No",
  //         selector: (row, index) => index + 1,
  //     },
  //     {
  //       name: "Permission Key",
  //       cell: (row) => (
  //         <div className="flex items-center gap-3">
  //           <div className="bg-sky-100 p-2 rounded-lg">
  //             <KeyIcon className="h-5 w-5 text-sky-600" />
  //           </div>
  //           <p className="font-mono font-bold text-sky-700 uppercase tracking-tight">
  //             {row.action}:{row.resource}
  //           </p>
  //         </div>
  //       ),
  //     },
  //     {
  //       name: "Action Type",
  //       cell: (row) => (
  //         <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold uppercase">
  //           {row.action}
  //         </span>
  //       ),
  //     },
  //     {
  //       name: "Resource Entity",
  //       cell: (row) => (
  //         <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-xs font-bold uppercase">
  //           {row.resource}
  //         </span>
  //       ),
  //     },
  //   ];
  const columns = [
    {
      name: "SL No",
      width: "80px",
      cell: (_, index) => (
        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold shadow-sm">
          {index + 1}
        </div>
      ),
    },

    {
      name: "Permission",

      grow: 2,

      cell: (row) => (
        <div className="flex items-center gap-3 py-2">
          <div className="bg-gradient-to-br from-sky-100 to-blue-100 p-2.5 rounded-xl shadow-sm border border-sky-200">
            <KeyIcon className="h-5 w-5 text-sky-700" />
          </div>

          <div className="flex flex-col">
            <p className="font-mono font-bold text-slate-800 text-sm uppercase tracking-tight">
              {row.action}:{row.resource}
            </p>

            {row.description ? (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                {row.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No description</p>
            )}
          </div>
        </div>
      ),
    },

    {
      name: "Action",

      center: true,

      cell: (row) => {
        const actionColors = {
          create: "bg-emerald-50 text-emerald-700 border-emerald-200",
          read: "bg-blue-50 text-blue-700 border-blue-200",
          update: "bg-amber-50 text-amber-700 border-amber-200",
          delete: "bg-red-50 text-red-700 border-red-200",
        };

        return (
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase border shadow-sm
          ${
            actionColors[row.action?.toLowerCase()] ||
            "bg-slate-50 text-slate-700 border-slate-200"
          }`}
          >
            {row.action}
          </span>
        );
      },
    },

    {
      name: "Resource",

      center: true,

      cell: (row) => (
        <div className="flex items-center">
          <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
            {row.resource?.replaceAll("_", " ")}
          </span>
        </div>
      ),
    },

    {
      name: "Added On",

      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-700">
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
        <h1 className="text-2xl font-bold text-slate-800">Permission List</h1>
      </div>

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={(e) =>
          setTempFilters({ ...tempFilters, [e.target.name]: e.target.value })
        }
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <CommonList
          title="Permissions List"
          data={permissions}
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
          onDelete={handleDelete}
          enableActions={true}
          actionButtons={["delete"]}
        />
      </div>
    </div>
  );
};

export default PermissionList;

