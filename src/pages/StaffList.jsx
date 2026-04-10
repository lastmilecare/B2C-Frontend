import React, { useState } from "react";
import {
  UsersIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} from "../redux/apiSlice";

import { Button } from "../components/UIComponents";
import { healthAlert } from "../utils/healthSwal";
import { useNavigate } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";

const StaffList = () => {
  const navigate = useNavigate();

  
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    name: "",
    email: "",
    status: undefined,
  });

  const debouncedName = useDebounce(filters.name, 400);
  const debouncedEmail = useDebounce(filters.email, 400);

  const queryParams = {
    ...filters,
    name: debouncedName,
    email: debouncedEmail,
  };

  const { data, isLoading, isFetching } = useGetUsersQuery(queryParams);

  const [deleteStaff] = useDeleteUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();

  const staffList = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};


  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;

    setFilters((prev) => ({
      ...prev,
      status: value === "" ? undefined : value === "true",
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
      name: "",
      email: "",
      status: undefined,
    });
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.totalPages) return;

    setFilters((prev) => ({
      ...prev,
      page,
    }));
  };

  const handleDelete = async (id) => {
    const result = await healthAlert({
      icon: "warning",
      title: "Delete Staff?",
      text: "This action cannot be undone",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteStaff(id).unwrap();

      healthAlert({
        icon: "success",
        title: "Deleted",
        text: "Staff deleted successfully",
      });
    } catch (err) {
      healthAlert({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Delete failed",
      });
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleStatus(id).unwrap();
    } catch (err) {
      healthAlert({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Status update failed",
      });
    }
  };

  const handleEdit = (row) => {
    navigate("/staff-form", { state: { editData: row } });
  };

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8 space-y-6">

        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <UsersIcon className="w-6 text-blue-600" />
            </span>
            Staff List
          </h1>

          <Button variant="sky" onClick={() => navigate("/staff")}>
            + Add Staff
          </Button>
        </div>

       
        <div className="bg-white p-5 rounded-2xl shadow border grid md:grid-cols-4 gap-4">

          <input
            name="name"
            value={filters.name}
            onChange={handleFilterChange}
            placeholder="Search by name..."
            className="p-2 rounded-lg border focus:ring-2 focus:ring-sky-400"
          />

          <input
            name="email"
            value={filters.email}
            onChange={handleFilterChange}
            placeholder="Search by email..."
            className="p-2 rounded-lg border focus:ring-2 focus:ring-sky-400"
          />

          <select
            value={filters.status ?? ""}
            onChange={handleStatusChange}
            className="p-2 rounded-lg border"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <Button variant="gray" onClick={handleReset}>
            Reset
          </Button>
        </div>

       
        <div className="bg-white rounded-3xl shadow border overflow-hidden">

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    Loading...
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10">
                    No staff found
                  </td>
                </tr>
              ) : (
                staffList.map((item, i) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">

                    <td className="px-4 py-3">
                      {(filters.page - 1) * filters.limit + i + 1}
                    </td>

                    <td className="font-medium">{item.name || "-"}</td>
                    <td>{item.email}</td>
                    <td>{item.phone || "-"}</td>

                    <td>
                      <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded text-xs">
                        {item.roleb2c?.name || "-"}
                      </span>
                    </td>

                    <td>
                      <button
                        onClick={() => handleToggle(item.id)}
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.status ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="flex gap-3 px-4 py-3">
                      <button onClick={() => handleEdit(item)}>
                        <PencilSquareIcon className="w-4 text-sky-500" />
                      </button>

                      <button onClick={() => handleDelete(item.id)}>
                        <TrashIcon className="w-4 text-red-500" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>

          
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t text-xs">

              <p>
                Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                {Math.min(filters.page * filters.limit, pagination.total)} of{" "}
                {pagination.total}
              </p>

              <div className="flex gap-2">

                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Prev
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .slice(
                    Math.max(0, filters.page - 3),
                    Math.min(pagination.totalPages, filters.page + 2)
                  )
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1 border rounded ${
                        p === filters.page
                          ? "bg-sky-600 text-white"
                          : ""
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Next
                </button>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffList;