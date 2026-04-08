// src/pages/Roles.jsx
import React, { useState } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetAllTenantsQuery,
  useGetAllPermissionsComboQuery,
} from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { cookie } from "../utils/cookie";
const Roles = () => {
  const [form, setForm] = useState({
    name: "",
    tenantId: "",
    description: "",
    permissionIds: [],
  });
  const role = cookie.get("role");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    name: "",
    tenantId: "",
  });

  // ── API Hooks ─────────────────────────────────────────────
  const { data, isLoading, isFetching } = useGetRolesQuery(filters);
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [deleteRole] = useDeleteRoleMutation();
  const { data: tenantData } = useGetAllTenantsQuery();
  const roles = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  // ── TEMP Tenants (replace with API later) ─────────────────
  const tenants = tenantData?.data?.data || [];
  const { data: permissionsData } = useGetAllPermissionsComboQuery();
  const permissions = permissionsData?.data?.data || [];
  const permissionFilters =
    role === "LMC_Admin"
      ? permissions
      : permissions.filter(
          (p) => p.resource !== "tenant" && p.resource !== "role",
        );
  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handlePermissionChange = (e) => {
    const values = Array.from(e.target.selectedOptions, (opt) =>
      Number(opt.value),
    );

    setForm((prev) => ({
      ...prev,
      permissionIds: values,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.tenantId || form.permissionIds.length === 0) {
      healthAlert({
        title: "Role",
        text: "Role name, tenant, and permissions are required",
        icon: "info",
      });
      return;
    }
    try {
      await createRole({
        name: form.name,
        tenantId: Number(form.tenantId),
        description: form.description,
        permissionIds: form.permissionIds,
      }).unwrap();

      setForm({ name: "", tenantId: "", description: "" });
      healthAlert({
        title: "Role",
        text: "Role created successfully",
        icon: "success",
      });
    } catch (error) {
      healthAlert({
        title: "Role",
        text: error?.data?.message || "Failed to create role",
        icon: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this role?")) return;

    try {
      await deleteRole(id).unwrap();
    } catch (error) {
      healthAlert({
        title: "Role",
        text: error?.data?.message || "Failed to delete role",
        icon: "error",
      });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return (
    <div className="p-8 space-y-8 bg-gray-100 min-h-screen">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-[2.5rem] p-6 flex items-center gap-4 shadow-xl">
        <ShieldCheckIcon className="h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-xs opacity-80">Tenant Based Roles</p>
        </div>
      </div>

      {/* ── Create Form ───────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 border">
        <h3 className="text-lg font-semibold text-gray-700">Create Role</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Role Name */}
          <div>
            <label className="text-sm">Role Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg"
              placeholder="Enter role name"
            />
          </div>

          {/* Tenant */}
          <div>
            <label className="text-sm">Tenant</label>
            <select
              name="tenantId"
              value={form.tenantId}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg"
            >
              <option value="">Select Tenant</option>
              {tenants?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Permission *</label>
            <select
              multiple
              value={form.permissionIds}
              onChange={handlePermissionChange}
              className="w-full mt-1 p-3 border rounded-lg h-40"
            >
              {permissionFilters.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.action}:{p.resource}
                </option>
              ))}
            </select>
          </div>
          {/* Description */}
          <div>
            <label className="text-sm">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="bg-green-600 text-white px-6 py-2 rounded-lg"
          >
            {isCreating ? "Saving..." : "Save Role"}
          </button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Tenant</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  Loading...
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  No roles found
                </td>
              </tr>
            ) : (
              roles.map((role, index) => (
                <tr key={role.id} className="border-t">
                  <td className="px-6 py-4">
                    {(filters.page - 1) * filters.limit + index + 1}
                  </td>
                  <td className="px-6 py-4">{role.name}</td>
                  <td className="px-6 py-4">{role?.tenant?.name || "-"}</td>
                  <td className="px-6 py-4">
                    {role.status ? "Active" : "Inactive"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(role.id)}
                      className="text-red-500 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Pagination ───────────────────────────────── */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between p-4">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={!pagination.hasPrevPage}
            >
              Prev
            </button>

            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={!pagination.hasNextPage}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roles;
