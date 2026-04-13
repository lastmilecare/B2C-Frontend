import React, { useState } from "react";
import {
    useGetPermissionsQuery,
    useDeletePermissionMutation,
    useGetAllPermissionsComboQuery
} from "../redux/apiSlice";
import CopyFilterBar from "../components/Updates/Filter";
import PatientTable from "../components/Updates/PatientTable";
import { KeyIcon } from "@heroicons/react/24/outline";
import { healthAlert } from "../utils/healthSwal";


const PermissionList = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [tempFilters, setTempFilters] = useState({ action: "", resource: "" });
    const [filters, setFilters] = useState({});

    const { data, isLoading, isFetching } = useGetPermissionsQuery({ page, limit, ...filters });
    const [deletePermission] = useDeletePermissionMutation();
    const { data: permissionComboData } = useGetAllPermissionsComboQuery();
    const comboPermissions = permissionComboData?.data?.data || [];
    const ACTIONS = [...new Set(comboPermissions.map(p => p?.action))];
    const RESOURCES = [...new Set(comboPermissions.map(p => p?.resource))];

    const permissions = data?.data?.data || [];
    const pagination = data?.data?.pagination || {};

    const handleApplyFilters = () => {
        setFilters(tempFilters);
        setPage(1);
    };

    const handleResetFilters = () => {
        setTempFilters({ action: "", resource: "" });
        setFilters({});
        setPage(1);
    };

    const handleDelete = async (row) => {
   const result = await healthAlert({
    title: "Are you sure?",
    text: `Do you want to delete permission "${row.action}:${row.resource}"?`,
    type: "confirm"
});
    if (result.isConfirmed) {
        try {
            await deletePermission(row.id).unwrap();

           healthAlert({
    title: "Deleted!",
    text: "Permission removed.",
    type: "success"
});
        } catch (err) {
            healthAlert({
                title: "Error",
                text: err?.data?.message || "Failed"
            });
        }
    }
};

    const filtersConfig = [
        {
            label: "Action", name: "action", type: "select",
            options: ACTIONS.map(a => ({ label: a.toUpperCase(), value: a }))
        },
        {
            label: "Resource", name: "resource", type: "select",
            options: RESOURCES.map(r => ({ label: r.toUpperCase(), value: r }))
        },
    ];

    const columns = [
        {
            name: "Permission Key",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="bg-sky-100 p-2 rounded-lg">
                        <KeyIcon className="h-5 w-5 text-sky-600" />
                    </div>
                    <p className="font-mono font-bold text-sky-700 uppercase tracking-tight">
                        {row.action}:{row.resource}
                    </p>
                </div>
            )
        },
        {
            name: "Action Type",
            cell: (row) => (
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold uppercase">
                    {row.action}
                </span>
            )
        },
        {
            name: "Resource Entity",
            cell: (row) => (
                <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-xs font-bold uppercase">
                    {row.resource}
                </span>
            )
        }
    ];

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Permission List</h1>

            </div>

            <CopyFilterBar
                filtersConfig={filtersConfig}
                tempFilters={tempFilters}
                onChange={(e) => setTempFilters({ ...tempFilters, [e.target.name]: e.target.value })}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />

            <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <PatientTable
                    title="Permissions List"
                    data={permissions}
                    columns={columns}
                    isLoading={isLoading || isFetching}
                    totalRows={pagination.totalRecords || 0}
                    currentPage={page}
                    perPage={limit}
                    onPageChange={setPage}
                    onPerPageChange={setLimit}
                    onDelete={handleDelete}
                    enableActions={true}
                    actionButtons={["delete"]}
                />

            </div>
        </div>
    );
};

export default PermissionList;