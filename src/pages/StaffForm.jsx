import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import {
  UsersIcon,
  UserPlusIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import {
  useGetAllRoleComboQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../redux/apiSlice";

import { Input, Select, Button } from "../components/UIComponents";
import { healthAlert } from "../utils/healthSwal";

const StaffForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [editUser, setEditUser] = useState(null);

  const location = useLocation();
  const { tenantId } = useSelector((state) => state.auth);

  const { data: rolesData } = useGetAllRoleComboQuery();
  const [createStaff, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateUserMutation();

  const roles = rolesData?.data || [];

  // ✅ EDIT MODE AUTO SET
  useEffect(() => {
    if (location.state?.editData) {
      setEditUser(location.state.editData);
    }
  }, [location.state]);

  // ─────────────────────────────
  // FORMIK
  // ─────────────────────────────
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
          if (!values.password) errors.password = "Password required";
          if (values.password !== values.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
          }
        }
      }

      if (activeStep === 2) {
        if (!values.b2cRoleId) errors.b2cRoleId = "Role required";
      }

      return errors;
    },

    onSubmit: async (values) => {
      try {
        const selectedRole = roles.find(
          (r) => String(r.id) === String(values.b2cRoleId)
        );

        if (!selectedRole) {
          return healthAlert({
            icon: "error",
            title: "Invalid Role",
          });
        }

        const payload = {
          ...values,
          tenantId: selectedRole.tenantId,
        };

        const { confirmPassword, ...finalPayload } = payload;

        if (editUser) {
          const { password, ...updatePayload } = finalPayload;

          await updateStaff({
            id: editUser.id,
            ...updatePayload,
          }).unwrap();

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
        setEditUser(null);
        setActiveStep(1);

      } catch (err) {
        healthAlert({
          icon: "error",
          title: "Error",
          text: err?.data?.message || "Something went wrong",
        });
      }
    },
  });

  // ─────────────────────────────
  // STEP CONTROL
  // ─────────────────────────────
  const nextStep = async () => {
    const errors = await formik.validateForm();

    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(errors).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  // ─────────────────────────────
  // UI
  // ─────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <UsersIcon className="w-6 text-blue-600" />
            </span>
            {editUser ? "Edit Staff" : "Add Staff"}
          </h1>

          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${
                  activeStep >= s ? "bg-sky-600" : "bg-blue-100"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">

          {/* STEP TABS */}
          <div className="flex border-b">
            {[
              { id: 1, label: "Staff Details", icon: ClipboardDocumentIcon },
              { id: 2, label: "Role", icon: UserPlusIcon },
            ].map((step) => (
              <button
                key={step.id}
                disabled
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold ${
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

          <form className="p-9 space-y-8">

            {/* STEP 1 */}
            {activeStep === 1 && (
              <section>
                <h3 className="text-lg font-semibold text-sky-700 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                  Staff Details
                </h3>

                <div className="grid md:grid-cols-3 gap-6">

                  <div>
                    <Input label="Name *" {...formik.getFieldProps("name")} />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-xs">{formik.errors.name}</p>
                    )}
                  </div>

                  <Input label="Username" {...formik.getFieldProps("username")} />

                  <Input label="Employee No" {...formik.getFieldProps("employeeNo")} />

                  <div>
                    <Input label="Mobile *" {...formik.getFieldProps("phone")} />
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="text-red-500 text-xs">{formik.errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Email *"
                      {...formik.getFieldProps("email")}
                      disabled={!!editUser}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-xs">{formik.errors.email}</p>
                    )}
                  </div>

                  {!editUser && (
                    <>
                      <Input label="Password *" type="password" {...formik.getFieldProps("password")} />
                      <Input label="Confirm Password *" type="password" {...formik.getFieldProps("confirmPassword")} />
                    </>
                  )}

                </div>
              </section>
            )}

            {/* STEP 2 */}
            {activeStep === 2 && (
              <section>
                <h3 className="text-lg font-semibold text-sky-700 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                  Assign Role
                </h3>

                <div className="grid md:grid-cols-2 gap-6">

                  <div>
                    <Select {...formik.getFieldProps("b2cRoleId")} label="Role *">
                      <option value="">Select Role</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </Select>

                    {formik.touched.b2cRoleId && formik.errors.b2cRoleId && (
                      <p className="text-red-500 text-xs">{formik.errors.b2cRoleId}</p>
                    )}
                  </div>

                  {/* ROLE PREVIEW */}
                  {formik.values.b2cRoleId && (
                    <div className="bg-sky-50 border rounded-xl p-4">
                      <p className="text-xs text-gray-500">Selected Role</p>
                      <p className="text-sky-700 font-semibold">
                        {
                          roles.find(
                            (r) =>
                              String(r.id) ===
                              String(formik.values.b2cRoleId)
                          )?.name
                        }
                      </p>
                    </div>
                  )}

                </div>
              </section>
            )}

            {/* BUTTONS */}
            <div className="flex justify-between border-t pt-6">

              <div>
                {activeStep > 1 && (
                  <Button variant="gray" onClick={prevStep}>
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-3">

                <Button variant="gray" onClick={formik.handleReset}>
                  <ArrowPathIcon className="w-5 h-5 mr-1" />
                  Reset
                </Button>

                {activeStep < 2 ? (
                  <Button variant="sky" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="sky"
                    onClick={formik.handleSubmit}
                    disabled={isCreating || isUpdating}
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-1" />
                    {isCreating || isUpdating
                      ? "Saving..."
                      : editUser
                      ? "Update"
                      : "Save"}
                  </Button>
                )}

              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffForm;