// src/pages/Staff.jsx
import React, { useState } from "react";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import {
  UserPlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  useToggleUserStatusMutation,
  useGetAllRoleComboQuery,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "../redux/apiSlice";
import { Input, Select, Button } from "../components/UIComponents";
import { healthAlert } from "../utils/healthSwal";

// ── Constants ─────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Staff Details", icon: ClipboardDocumentIcon },
  { id: 2, label: "Role", icon: UserPlusIcon },
];

const TABS = [
  { id: "list", label: "Staff List", icon: UsersIcon },
  { id: "add", label: "Add Staff", icon: UserPlusIcon },
];

// ── Main Component ─────────────────────────────────────────────────────────────
const StaffFormold = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [activeStep, setActiveStep] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    name: "",
    email: "",
    status: undefined,
  });

  const { tenantId } = useSelector((state) => state.auth);

  // ── API hooks ──────────────────────────────────────────────────────────────
  const { data: staffData, isLoading, isFetching } = useGetUsersQuery(filters);
  const { data: rolesData } = useGetAllRoleComboQuery();

  const [createStaff, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();
  const [deleteStaff] = useDeleteUserMutation();

  const staffList = staffData?.data?.data || [];
  const pagination = staffData?.data?.pagination || {};
  const roles = rolesData?.data || [];

  // ── Formik ─────────────────────────────────────────────────────────────────
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: editUser?.name || "",
      username: editUser?.username || "",
      email: editUser?.email || "",
      phone: editUser?.phone || "",
      employeeNo: editUser?.employeeNo || "",
      password: "",
      confirmPassword: "",
      b2cRoleId: editUser?.b2c_role_id || "",
    },

    validate: (values) => {
      const errors = {};

      if (activeStep === 1) {
        if (!values.name) errors.name = "Name is required";
        if (!values.email) errors.email = "Email is required";
        if (!values.phone) errors.phone = "Mobile is required";

        if (!editUser) {
          if (!values.password) {
            errors.password = "Password is required";
          }
          if (values.password !== values.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
          }
        }
      }

      if (activeStep === 2) {
        if (!values.b2cRoleId) errors.b2cRoleId = "Role is required";
      }

      return errors;
    },

    onSubmit: async (values) => {
      try {
        const selectedRole = roles.find(
          (r) => String(r.id) === String(values.b2cRoleId),
        );

        if (!selectedRole) {
          return healthAlert({
            icon: "error",
            title: "Error",
            text: "Invalid role selected",
          });
        }

        const payload = {
          ...values,
          tenantId: selectedRole.tenantId, // ✅ FIXED
        };

        const { confirmPassword, ...finalPayload } = payload;

        if (editUser) {
          const { password, ...updatePayload } = finalPayload;
          await updateStaff({ id: editUser.id, ...updatePayload }).unwrap();
          healthAlert({
            icon: "success",
            title: "Updated",
            text: "Staff updated successfully",
          });
        } else {
          await createStaff(finalPayload).unwrap();
          healthAlert({
            icon: "success",
            title: "Created",
            text: "Staff created successfully",
          });
        }

        formik.resetForm();
        setActiveStep(1);
        setEditUser(null);
        setActiveTab("list");
      } catch (error) {
        healthAlert({
          icon: "error",
          title: "Error",
          text: error?.data?.message || "Something went wrong",
        });
      }
    },
  });

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleEdit = (user) => {
    setEditUser(user);
    setActiveTab("add");
    setActiveStep(1);
  };

  const handleToggle = async (id) => {
    try {
      await toggleStatus(id).unwrap();
    } catch (error) {
      healthAlert({
        icon: "error",
        title: "Error",
        text: error?.data?.message || "Failed",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await healthAlert({
      icon: "warning",
      title: "Are you sure?",
      text: "This will permanently delete the staff member.",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteStaff(id).unwrap();
      healthAlert({
        icon: "success",
        title: "Deleted",
        text: "Staff deleted successfully",
      });
    } catch (error) {
      healthAlert({
        icon: "error",
        title: "Error",
        text: error?.data?.message || "Failed",
      });
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "add" && !editUser) {
      formik.resetForm();
      setActiveStep(1);
    }
    if (tab === "list") setEditUser(null);
  };

  const nextStep = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(errors).reduce((acc, k) => ({ ...acc, [k]: true }), {}),
      );
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const prevStep = () => setActiveStep((prev) => Math.max(prev - 1, 1));

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-sky-500 text-white rounded-[2.5rem] p-6 flex items-center gap-4 shadow-xl">
          <div className="bg-white/20 p-3 rounded-xl">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Staff Management</h2>
            <p className="text-xs opacity-80">Manage your team members</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Main tab switcher */}
          <div className="flex border-b">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-sky-600 border-b-2 border-sky-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.id === "add" && editUser ? "Edit Staff" : tab.label}
              </button>
            ))}
          </div>

          {/* ── LIST TAB ──────────────────────────────────────────────────── */}
          {activeTab === "list" && (
            <div className="p-6 space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Search by name..."
                  className="p-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                />
                <input
                  name="email"
                  value={filters.email}
                  onChange={handleFilterChange}
                  placeholder="Search by email..."
                  className="p-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                />
                <select
                  name="status"
                  value={filters.status ?? ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      status:
                        e.target.value === "" ? undefined : e.target.value,
                      page: 1,
                    }))
                  }
                  className="p-2 rounded-lg border border-gray-300 text-sm outline-none"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
                <button
                  onClick={() =>
                    setFilters({
                      page: 1,
                      limit: 10,
                      name: "",
                      email: "",
                      status: undefined,
                    })
                  }
                  className="p-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  Reset
                </button>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading || isFetching ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-gray-400"
                        >
                          Loading...
                        </td>
                      </tr>
                    ) : staffList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="text-center py-8 text-gray-400"
                        >
                          No staff found
                        </td>
                      </tr>
                    ) : (
                      staffList.map((staff, index) => (
                        <tr
                          key={staff.id}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-4 py-3 text-gray-500">
                            {(filters.page - 1) * filters.limit + index + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">
                            {staff.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {staff.email}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {staff.phone || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded-md text-xs font-medium">
                              {staff.roleb2c?.name || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleToggle(staff.id)}
                              className={`px-2 py-1 rounded-full text-xs font-medium transition ${
                                staff.status
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-red-100 text-red-600 hover:bg-red-200"
                              }`}
                            >
                              {staff.status ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleEdit(staff)}
                                className="text-sky-500 hover:text-sky-700 transition"
                                title="Edit"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(staff.id)}
                                className="text-red-400 hover:text-red-600 transition"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <p className="text-xs text-gray-500">
                      Showing {(filters.page - 1) * filters.limit + 1} to{" "}
                      {Math.min(filters.page * filters.limit, pagination.total)}{" "}
                      of {pagination.total} staff
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-3 py-1 rounded-lg border border-gray-300 text-xs disabled:opacity-40 hover:bg-white transition"
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
                          className={`px-3 py-1 rounded-lg border text-xs transition ${
                            p === filters.page
                              ? "bg-sky-600 text-white border-sky-600"
                              : "border-gray-300 hover:bg-white"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-3 py-1 rounded-lg border border-gray-300 text-xs disabled:opacity-40 hover:bg-white transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── FORM TAB ──────────────────────────────────────────────────── */}
          {activeTab === "add" && (
            <div>
              {/* Step progress bars */}
              <div className="flex justify-between items-center px-6 pt-4">
                <div className="flex gap-2">
                  {STEPS.map((s) => (
                    <div
                      key={s.id}
                      className={`h-2 w-24 rounded-full transition-all ${
                        activeStep >= s.id ? "bg-sky-600" : "bg-sky-100"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400">
                  Step {activeStep} of {STEPS.length}
                </span>
              </div>

              {/* Step indicator tabs */}
              <div className="flex border-b mt-2">
                {STEPS.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    disabled
                    className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${
                      activeStep === step.id
                        ? "text-sky-600 border-b-2 border-sky-600"
                        : "text-gray-400"
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                    {step.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="p-6 space-y-6"
              >
                {/* ── Step 1 — Staff Details ──────────────────────────── */}
                {activeStep === 1 && (
                  <section className="space-y-4">
                    <h3 className="text-sky-700 font-semibold text-lg">
                      Staff Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Input
                          label="Name *"
                          {...formik.getFieldProps("name")}
                        />
                        {formik.touched.name && formik.errors.name && (
                          <p className="text-red-500 text-xs mt-1">
                            {formik.errors.name}
                          </p>
                        )}
                      </div>

                      <Input
                        label="Username"
                        {...formik.getFieldProps("username")}
                      />
                      <Input
                        label="Employee Number"
                        {...formik.getFieldProps("employeeNo")}
                      />

                      {/* <Select
                        label="Gender"
                        {...formik.getFieldProps("gender")}
                      >
                        <option value="">-- Select --</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Select> */}

                      <div>
                        <Input
                          label="Mobile *"
                          {...formik.getFieldProps("phone")}
                        />
                        {formik.touched.phone && formik.errors.phone && (
                          <p className="text-red-500 text-xs mt-1">
                            {formik.errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <Input
                          label="Email *"
                          type="email"
                          {...formik.getFieldProps("email")}
                          disabled={!!editUser}
                        />
                        {formik.touched.email && formik.errors.email && (
                          <p className="text-red-500 text-xs mt-1">
                            {formik.errors.email}
                          </p>
                        )}
                      </div>

                      {/* Password — only on create */}
                      {!editUser && (
                        <>
                          <div>
                            <Input
                              label="Password *"
                              type="password"
                              {...formik.getFieldProps("password")}
                            />
                            {formik.touched.password &&
                              formik.errors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                  {formik.errors.password}
                                </p>
                              )}
                          </div>
                          <div>
                            <Input
                              label="Confirm Password *"
                              type="password"
                              {...formik.getFieldProps("confirmPassword")}
                            />
                            {formik.touched.confirmPassword &&
                              formik.errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">
                                  {formik.errors.confirmPassword}
                                </p>
                              )}
                          </div>
                        </>
                      )}
                    </div>
                  </section>
                )}

                {/* ── Step 2 — Role ──────────────────────────────────── */}
                {activeStep === 2 && (
                  <section className="bg-sky-50/40 p-6 rounded-xl border border-sky-100 space-y-4">
                    <h3 className="text-sky-700 font-semibold text-lg">
                      Assign Role
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Select
                          label="Role *"
                          {...formik.getFieldProps("b2cRoleId")}
                        >
                          <option value="">-- Select Role --</option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.name}
                            </option>
                          ))}
                        </Select>
                        {formik.touched.b2cRoleId &&
                          formik.errors.b2cRoleId && (
                            <p className="text-red-500 text-xs mt-1">
                              {formik.errors.b2cRoleId}
                            </p>
                          )}
                      </div>

                      {/* Role preview card */}
                      {formik.values.b2cRoleId && (
                        <div className="bg-white border border-sky-200 rounded-xl p-4 flex items-center gap-3">
                          <div className="bg-sky-100 p-2 rounded-lg">
                            <UserPlusIcon className="w-5 h-5 text-sky-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Selected Role
                            </p>
                            <p className="text-sm font-semibold text-sky-700">
                              {roles.find(
                                (r) =>
                                  String(r.id) ===
                                  String(formik.values.b2cRoleId),
                              )?.name || "—"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* ── Navigation ─────────────────────────────────────── */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <div>
                    {activeStep > 1 && (
                      <Button type="button" variant="gray" onClick={prevStep}>
                        Back
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="gray"
                      onClick={() => {
                        formik.resetForm();
                        setActiveStep(1);
                        setEditUser(null);
                      }}
                    >
                      <ArrowPathIcon className="w-5 h-5 mr-1" />
                      Reset
                    </Button>

                    {activeStep < STEPS.length ? (
                      <Button type="button" variant="sky" onClick={nextStep}>
                        Continue
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="sky"
                        disabled={isCreating || isUpdating}
                        onClick={() => formik.handleSubmit()}
                      >
                        <CheckCircleIcon className="w-5 h-5 mr-1" />
                        {isCreating || isUpdating
                          ? "Saving..."
                          : editUser
                            ? "Update Staff"
                            : "Save Staff"}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffFormold;
