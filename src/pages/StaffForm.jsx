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


const STEPS = [
  { id: 1, label: "Staff Details", icon: ClipboardDocumentIcon },
  { id: 2, label: "Role", icon: UserPlusIcon },
  { id: 3, label: "Confirm", icon: CheckCircleIcon },
];

const StaffForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [editUser, setEditUser] = useState(null);

  const location = useLocation();
  const { tenantId } = useSelector((state) => state.auth);

  const { data: rolesData } = useGetAllRoleComboQuery();
  const [createStaff, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateUserMutation();

  const roles = rolesData?.data || [];


  useEffect(() => {
    if (location.state?.editData) {
      setEditUser(location.state.editData);
    }
  }, [location.state]);

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
        if (!values.name) errors.name = "Name required";
        if (!values.email) errors.email = "Email required";
        if (!values.phone) errors.phone = "Mobile required";

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

        const payload = {
          ...values,
          tenantId: selectedRole?.tenantId || tenantId,
        };

        const { confirmPassword, ...finalPayload } = payload;

        if (editUser) {
          const { password, ...updatePayload } = finalPayload;
          await updateStaff({
            id: editUser.id,
            ...updatePayload,
          }).unwrap();
        } else {
          await createStaff(finalPayload).unwrap();
        }

        healthAlert({
          icon: "success",
          title: editUser ? "Updated" : "Created",
        });

        formik.resetForm();
        setActiveStep(1);
        setEditUser(null);

      } catch (err) {
        healthAlert({
          icon: "error",
          title: "Error",
          text: err?.data?.message || "Failed",
        });
      }
    },
  });


  const nextStep = async () => {
    const errors = await formik.validateForm();

    const stepFields = {
      1: ["name", "email", "phone", "password", "confirmPassword"],
      2: ["b2cRoleId"],
    };

    const currentFields = stepFields[activeStep] || [];

    const hasError = currentFields.some((f) => errors[f]);

    if (hasError) {
      formik.setTouched(
        currentFields.reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">


        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <UsersIcon className="w-6 text-blue-600" />
            </span>
            {editUser ? "Edit Staff" : "Add Staff"}
          </h1>

          <div className="flex gap-2">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-2 w-12 rounded-full ${activeStep >= s.id ? "bg-sky-600" : "bg-blue-100"
                  }`}
              />
            ))}
          </div>
        </div>


        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">


          <div className="flex border-b">
            {STEPS.map((step) => (
              <button
                key={step.id}
                disabled
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold ${activeStep === step.id
                    ? "text-sky-600 border-b-2 border-sky-600"
                    : "text-gray-400"
                  }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="p-9 space-y-8">


            {activeStep === 1 && (
              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  label="Name"
                  required
                  error={formik.touched.name && formik.errors.name}
                  {...formik.getFieldProps("name")}
                />
                <Input label="Username" {...formik.getFieldProps("username")} />
                <Input label="Employee No" {...formik.getFieldProps("employeeNo")} />
                <Input
                  label="Mobile"
                  required
                  error={formik.touched.phone && formik.errors.phone}
                  {...formik.getFieldProps("phone")}
                />
                <Input
                  label="Email"
                  required
                  error={formik.touched.email && formik.errors.email}
                  {...formik.getFieldProps("email")}
                  disabled={!!editUser}
                />

                {!editUser && (
                  <>
                    <Input
                      type="password"
                      label="Password"
                      required
                      error={formik.touched.password && formik.errors.password}
                      {...formik.getFieldProps("password")}
                    />
                    <Input
                      type="password"
                      label="Confirm Password"
                      required
                      error={
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                      }
                      {...formik.getFieldProps("confirmPassword")}
                    />
                  </>
                )}
              </div>
            )}


            {activeStep === 2 && (
              <section className="bg-sky-50/40 p-6 rounded-xl border border-sky-100 space-y-4">
                <h3 className="text-sky-700 font-semibold text-lg">
                  Assign Role
                </h3>

                <div className="grid md:grid-cols-2 gap-6">

                  <div>
                    <Select
                      label="Role"
                      required
                     
                      {...formik.getFieldProps("b2cRoleId")}
                    >
                      <option value="">Select Role</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </Select>

                    {formik.touched.b2cRoleId && formik.errors.b2cRoleId && (
                      <p className="text-red-500 text-xs mt-1">
                        {formik.errors.b2cRoleId}
                      </p>
                    )}
                  </div>


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
                              String(formik.values.b2cRoleId)
                          )?.name || "—"}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </section>
            )}


            {activeStep === 3 && (
              <div className="bg-sky-50 p-6 rounded-xl border space-y-3">
                <h3 className="font-semibold text-sky-700">
                  Confirm Details
                </h3>

                <p><b>Name:</b> {formik.values.name}</p>
                <p><b>Email:</b> {formik.values.email}</p>
                <p><b>Mobile:</b> {formik.values.phone}</p>
                <p><b>Role:</b> {
                  roles.find(
                    (r) =>
                      String(r.id) ===
                      String(formik.values.b2cRoleId)
                  )?.name
                }</p>
              </div>
            )}


            <div className="flex justify-between items-center pt-6 border-t border-gray-100">


              <div className="flex gap-3">
                {activeStep > 1 && (
                  <Button type="button" variant="gray" onClick={prevStep}>
                    Back
                  </Button>
                )}

                <Button
                  type="button"
                  variant="gray"
                  onClick={formik.handleReset}
                >
                  <ArrowPathIcon className="w-5 h-5 inline mr-1" />
                  Reset
                </Button>
              </div>


              <div>
                {activeStep < STEPS.length ? (
                  <Button type="button" variant="sky" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="sky"
                    onClick={formik.handleSubmit}
                    disabled={isCreating || isUpdating}
                  >
                    <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                    {isCreating || isUpdating ? "Saving..." : "Save Staff"}
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