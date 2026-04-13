import React, { useState } from "react";
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
} from "../redux/apiSlice";

import CopyFilterBar from "../components/Updates/Filter";
import PatientTable from "../components/Updates/PatientTable";
import useDebounce from "../hooks/useDebounce";
import { healthAlert } from "../utils/healthSwal";
import Avatar from "../components/common/Avatar";
import { useNavigate } from "react-router-dom";

const StaffList = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [loadingId, setLoadingId] = useState(null); 

  const [tempFilters, setTempFilters] = useState({
    name: "",
    email: "",
    status: "",
  });

  const [filters, setFilters] = useState({});

  const debouncedName = useDebounce(tempFilters.name, 400);
  const debouncedEmail = useDebounce(tempFilters.email, 400);

  const { data, isLoading, isFetching } = useGetUsersQuery({
    page,
    limit,
    name: debouncedName,
    email: debouncedEmail,
    status: tempFilters.status || undefined,
  });

  const [deleteStaff] = useDeleteUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();
  const staffList = data?.data?.data || [];
  const pagination = data?.data?.pagination || {};
  const handleChange = (e) => {
    const { name, value } = e.target;

    setTempFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({
      name: "",
      email: "",
      status: "",
    });
    setFilters({});
    setPage(1);
  };



  const handleDelete = async (row) => {
    const result = await healthAlert({
      icon: "warning",
      title: "Delete Staff?",
      text: "This action cannot be undone",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      setLoadingId(row.id);

      await deleteStaff(row.id).unwrap();

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
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggle = async (row) => {
    try {
      setLoadingId(row.id);

      await toggleStatus(row.id).unwrap();
    } catch (err) {
      healthAlert({
        icon: "error",
        title: "Error",
        text: err?.data?.message || "Status update failed",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleEdit = (row) => {
    navigate("/staff-form", { state: { editData: row } });
  };



  const columns = [
    {
      name: "Staff",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} />

          <div>
            <p className="font-semibold text-gray-800">{row.name}</p>
            <p className="text-xs text-gray-500">{row.email}</p>
          </div>
        </div>
      ),
    },

    {
      name: "Mobile",
      selector: (row) => row.phone || "-",
    },

    {
      name: "Role",
      cell: (row) => (
        <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded text-xs font-medium">
          {row.roleb2c?.name || "-"}
        </span>
      ),
    },

    {
      name: "Status",
      cell: (row) => (
        <button
          onClick={() => handleToggle(row)}
          disabled={loadingId === row.id}
          className={`px-3 py-1 text-xs rounded-full font-medium transition flex items-center gap-1
          ${
            row.status
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {loadingId === row.id ? "..." : row.status ? "Active" : "Inactive"}
        </button>
      ),
    },
  ];


  const filtersConfig = [
    { label: "Name", name: "name", type: "text" },
    { label: "Email", name: "email", type: "text" },
    {
      label: "Status",
      name: "status",
      type: "select",
      options: [
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
      ],
    },
  ];
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">
          Staff List
        </h1>

        {/* <button
          onClick={() => navigate("/staff")}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Staff
        </button> */}
      </div>
      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
      <PatientTable
        title="Staff List"
        data={staffList}
        columns={columns}
        totalRows={pagination.total || 0}
        currentPage={pagination.page || page}
        perPage={limit}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        isLoading={isLoading || isFetching}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loadingId={loadingId}
      />

    </div>
  );
};

export default StaffList;