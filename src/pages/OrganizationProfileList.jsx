import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  useGetOrgProfilesQuery,
  useDeleteOrgProfileMutation,
  useToggleOrgProfileStatusMutation,
  useGetAllTenantsQuery,
  useCenterComboListQuery,
} from "../redux/apiSlice";

import CommonList from "../components/CommonList";
import CopyFilterBar from "../components/Updates/Filter";
import { healthAlert } from "../utils/healthSwal";

const OrganizationProfileList = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [tempFilters, setTempFilters] = useState({
    tenant_id: "",
    center_id: "",
    display_name: "",
    address: "",

  });

  const [filters, setFilters] = useState({});

  const { data, isLoading, refetch } = useGetOrgProfilesQuery({
    page,
    limit,
    ...filters,
  });

  const [deleteProfile] = useDeleteOrgProfileMutation();
  const [toggleStatus] = useToggleOrgProfileStatusMutation();

  const profiles = data?.data || [];
  const pagination = data?.pagination || {
    currentPage: page,
    totalRecords: 0,
  };

  // ---------------- Tenants ----------------
  const { data: tenantsData } = useGetAllTenantsQuery();
  const tenants = tenantsData?.data?.data || [];
// const BASE_URL = import.meta.env.VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  const tenantMap = useMemo(() => {
    const map = {};
    tenants.forEach((t) => {
      map[t.id] = t.name;
    });
    return map;
  }, [tenants]);

  // ---------------- Centers ----------------
  const { data: centersData } = useCenterComboListQuery();
  const centers = centersData?.data || [];

  const centerMap = useMemo(() => {
    const map = {};
    centers.forEach((c) => {
      map[c.id] = c.project_name;
    });
    return map;
  }, [centers]);

  // ---------------- Filters ----------------
  const filtersConfig = [
    {
      label: "Tenant",
      name: "tenant_id",
      type: "select",
      options: tenants.map((t) => ({
        label: t.name,
        value: t.id,
      })),
    },
    {
      label: "Center",
      name: "center_id",
      type: "select",
      options: centers.map((c) => ({
        label: c.project_name,
        value: c.id,
      })),
    },
    {
      label: "Address",
      name: "address",
      type: "text",
    },
    {
      label: "Display Name",
      name: "display_name",
      type: "text",
    },
  ];

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({
      tenant_id: "",
      center_id: "",
      display_name: "",
      address: "",
    });
    setFilters({});
    setPage(1);
  };

  // ---------------- Actions ----------------
  const handleEdit = (row) => {
    navigate(`/organization-profile/${row.id}`, {
      state: { editData: row },
    });
  };

  const handleDelete = async (row) => {
    try {
      await deleteProfile(row.id).unwrap();

      healthAlert({
        title: "Deleted",
        text: "Profile deleted successfully",
        icon: "success",
      });

      refetch();
    } catch {
      healthAlert({
        title: "Error",
        text: "Delete failed",
        icon: "error",
      });
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
console.log("Imga",BASE_URL)
  // ---------------- Columns ----------------
  const columns = [
    {
      name: "SL No",
      selector: (_, i) => i + 1,
    },
    {
      name: "Tenant",
      selector: (row) => tenantMap[row.tenant_id] || "N/A",
    },
    {
      name: "Center",
      selector: (row) =>
        row.center_id ? centerMap[row.center_id] || "N/A" : "All Centers",
    },
   {
  name: "Address",
  selector: (row) => row.address || "N/A",
},
    {
      name: "Display Name",
      selector: (row) => row.display_name,
    },
    {
      name: "Mobile",
      selector: (row) => row.mobile,
    },
    {
      name: "Logo",
      cell: (row) =>
        row.logo ? (
          <img
            src={`${BASE_URL}${row.logo}`}
            alt="logo"
            className="h-10 w-10 object-contain rounded"
          />
        ) : (
          "N/A"
        ),
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded ${
            row.is_active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {row.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      name: "Created At",
      selector: (row) => new Date(row.createdAt).toISOString().split("T")[0],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Organization Profiles</h1>

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        onChange={(e) =>
          setTempFilters({
            ...tempFilters,
            [e.target.name]: e.target.value,
          })
        }
      />

      <CommonList
        data={profiles}
        columns={columns}
        isLoading={isLoading}
        title="Organization Profiles"
        totalRows={pagination.totalRecords}
        currentPage={pagination.currentPage}
        perPage={limit}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        enableActions
        actionButtons={["edit", "delete", "toggle"]}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        enableAdd
  addButtonText="Add"
  onAdd={() => navigate("/organization-profile")}
      />
    </div>
  );
};

export default OrganizationProfileList;
