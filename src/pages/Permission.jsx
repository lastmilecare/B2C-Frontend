// src/pages/Permission.jsx
import React, { useState } from "react";
import { KeyIcon } from "@heroicons/react/24/solid";
import {
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useDeletePermissionMutation,
} from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
const ACTIONS = ["read", "create", "update", "delete", "assign"];
const RESOURCES = ["user", "role", "permission", "tenant"];

const Permission = () => {
  const [form, setForm] = useState({ action: "", resource: "" });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    action: "",
    resource: "",
  });

  // ── API hooks ────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching } = useGetPermissionsQuery(filters);
  const [createPermission, { isLoading: isCreating }] =
    useCreatePermissionMutation();
  const [deletePermission] = useDeletePermissionMutation();

  const permissions = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.action || !form.resource) {
      healthAlert({
        title: "Permission",
        text: "Please select both action and resource",
        icon: "info",
      });
      return;
    }
    try {
      await createPermission({
        action: form.action,
        resource: form.resource,
      }).unwrap();
      setForm({ action: "", resource: "" });
    } catch (error) {
      healthAlert({
        title: "Permission",
        text: error?.data?.message || "Failed to create permission",
        icon: "Error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this permission?"))
      return;
    try {
      await deletePermission(id).unwrap();
    } catch (error) {
      healthAlert({
        title: "Permission",
        text: error?.data?.message || "Failed to delete permission",
        icon: "Error",
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
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-[2.5rem] p-6 flex items-center gap-4 shadow-xl">
        <div className="bg-white/20 p-3 rounded-xl">
          <KeyIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Permission Management</h2>
          <p className="text-xs opacity-80">Action & Resource Mapping</p>
        </div>
      </div>

      {/* ── Create Form ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700">
          Create Permission
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action */}
          <div>
            <label className="text-sm font-medium text-gray-700">Action</label>
            <select
              name="action"
              value={form.action}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Select Action</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Resource */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Resource
            </label>
            <select
              name="resource"
              value={form.resource}
              onChange={handleChange}
              className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Select Resource</option>
              {RESOURCES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Preview */}
        {form.action && form.resource && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700">
            Permission key:{" "}
            <span className="font-bold">
              {form.action}:{form.resource}
            </span>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isCreating}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {isCreating ? "Saving..." : "Save Permission"}
          </button>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Filter by Action
            </label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              className="w-full mt-1 p-2 rounded-lg border border-gray-300 outline-none text-sm"
            >
              <option value="">All Actions</option>
              {ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Filter by Resource
            </label>
            <select
              name="resource"
              value={filters.resource}
              onChange={handleFilterChange}
              className="w-full mt-1 p-2 rounded-lg border border-gray-300 outline-none text-sm"
            >
              <option value="">All Resources</option>
              {RESOURCES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() =>
                setFilters({ page: 1, limit: 10, action: "", resource: "" })
              }
              className="w-full p-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Resource</th>
              <th className="px-6 py-4">Key</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading || isFetching ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : permissions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  No permissions found
                </td>
              </tr>
            ) : (
              permissions.map((perm, index) => (
                <tr key={perm.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 text-gray-500">
                    {(filters.page - 1) * filters.limit + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium capitalize">
                      {perm.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-medium capitalize">
                      {perm.resource}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-600">
                    {perm.action}:{perm.resource}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(perm.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── Pagination ─────────────────────────────────────────────────── */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {(filters.page - 1) * filters.limit + 1} to{" "}
              {Math.min(filters.page * filters.limit, pagination.total)} of{" "}
              {pagination.total} permissions
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Previous
              </button>
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`px-3 py-1 rounded-lg border text-sm transition ${
                    p === filters.page
                      ? "bg-green-600 text-white border-green-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 rounded-lg border border-gray-300 text-sm disabled:opacity-40 hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Permission;
