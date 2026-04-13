import React, { useState } from "react";
import {
    useGetRolesQuery,
    useDeleteRoleMutation,
    useGetAllTenantsQuery,
} from "../redux/apiSlice";
import CopyFilterBar from "../components/Updates/Filter";
import PatientTable from "../components/Updates/PatientTable";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { healthAlert } from "../utils/healthSwal";

const RoleList = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [tempFilters, setTempFilters] = useState({ name: "", tenantId: "" });
    const [filters, setFilters] = useState({});

    
    const {
        data,
        isLoading,
        isFetching,
        refetch, 
    } = useGetRolesQuery({ page, limit, ...filters });

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
        setTempFilters({ name: "", tenantId: "" });
        setFilters({});
        setPage(1);
    };

   
    const handleDelete = async (row) => {
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
    ];

    
    const columns = [
        {
            name: "Role Details",
            cell: (row) => (
                <div className="flex items-center gap-3">
                    <div className="bg-sky-100 p-2 rounded-lg">
                        <ShieldCheckIcon className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">{row.name}</p>
                        <p className="text-xs text-gray-400">
                            {row.description || "No description"}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            name: "Tenant",
            selector: (row) => row?.tenant?.name || "Global",
        },
        {
            name: "Status",
            cell: (row) => (
                <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${row.status
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                >
                    {row.status ? "Active" : "Inactive"}
                </span>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto py-10 px-6">
           
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-800">
                    Role List
                </h1>

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
                <PatientTable
                    title="Role List"
                    data={roles}
                    columns={columns}
                    isLoading={isLoading || isFetching}
                    totalRows={pagination.totalRecords || 0}
                    currentPage={page}
                    perPage={limit}
                    onPageChange={setPage}
                    onPerPageChange={setLimit}

                    enableActions={true}
                    actionButtons={["delete"]}

                    onDelete={(row) => handleDelete(row)}
                />
            </div>
        </div>
    );
};

export default RoleList;