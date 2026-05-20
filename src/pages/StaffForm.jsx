import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useSelector } from "react-redux";

import { useLocation, useNavigate } from "react-router-dom";

import {
  UsersIcon,
  UserPlusIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

import {
  useGetAllRoleComboQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useCenterComboListQuery,
} from "../redux/apiSlice";

import { Input, Select, Button } from "../components/UIComponents";
import { healthAlert } from "../utils/healthSwal";

import * as Yup from "yup";

const STEPS = [
  { id: 1, label: "Staff Details", icon: ClipboardDocumentIcon },
  { id: 2, label: "Role", icon: UserPlusIcon },
  { id: 3, label: "Confirm", icon: CheckCircleIcon },
];

const StaffForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { tenantId } = useSelector((state) => state.auth);

  const { data: rolesData } = useGetAllRoleComboQuery();
  const [createStaff, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateStaff, { isLoading: isUpdating }] = useUpdateUserMutation();

  const roles = rolesData?.data || [];
  const { data: centersData = [] } = useCenterComboListQuery();
  const centerData = centersData?.data || [];
  useEffect(() => {
    if (location.state?.editData) {
      setEditUser(location.state.editData);
    }
  }, [location.state]);
  const validationSchema = Yup.object({
    name: Yup.string().trim().required("Name is required"),

    email: Yup.string().email("Invalid email").required("Email is required"),

    phone: Yup.string()
      .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
      .required("Mobile is required"),

    password: !editUser
      ? Yup.string().required("Password is required")
      : Yup.string(),

    confirmPassword: !editUser
      ? Yup.string()
          .oneOf([Yup.ref("password")], "Passwords do not match")
          .required("Confirm Password is required")
      : Yup.string(),

    b2cRoleId: Yup.string().required("Role is required"),
  });
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
      center_id: editUser?.center_id || "",
    },
    validationSchema,

    onSubmit: async (values) => {
      try {
        const selectedRole = roles.find(
          (r) => String(r.id) === String(values.b2cRoleId),
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
          title: "Success",
          icon: "success",

          text: editUser
            ? "Staff Updated Successfully"
            : "Staff Created Successfully",
        });

        navigate("/staff-list");
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
        }, {}),
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
                className={`h-2 w-12 rounded-full ${
                  activeStep >= s.id ? "bg-sky-600" : "bg-blue-100"
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
                <Input
                  label="Employee No"
                  {...formik.getFieldProps("employeeNo")}
                />
                <Select
                  label="Role"
                  required
                  error={formik.touched.center_id && formik.errors.center_id}
                  {...formik.getFieldProps("center_id")}
                >
                  <option value="">Select Role</option>
                  {centerData.map((r) => (
                    <option key={r.id} value={r.id}>
                      {`${r.project_name} - ${r.project_address} `}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Mobile"
                  required
                  maxLength={10}
                  value={formik.values.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");

                    if (value.length <= 10) {
                      formik.setFieldValue("phone", value);
                    }
                  }}
                  onBlur={formik.handleBlur}
                  name="phone"
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
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        required
                        error={
                          formik.touched.password && formik.errors.password
                        }
                        {...formik.getFieldProps("password")}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-9 text-gray-500"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        label="Confirm Password"
                        required
                        error={
                          formik.touched.confirmPassword &&
                          formik.errors.confirmPassword
                        }
                        {...formik.getFieldProps("confirmPassword")}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-9 text-gray-500"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
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
                      error={
                        formik.touched.b2cRoleId && formik.errors.b2cRoleId
                      }
                      {...formik.getFieldProps("b2cRoleId")}
                    >
                      <option value="">Select Role</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {formik.values.b2cRoleId && (
                    <div className="bg-white border border-sky-200 rounded-xl p-4 flex items-center gap-3">
                      <div className="bg-sky-100 p-2 rounded-lg">
                        <UserPlusIcon className="w-5 h-5 text-sky-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Selected Role</p>
                        <p className="text-sm font-semibold text-sky-700">
                          {roles.find(
                            (r) =>
                              String(r.id) === String(formik.values.b2cRoleId),
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
                <h3 className="font-semibold text-sky-700">Confirm Details</h3>

                <p>
                  <b>Name:</b> {formik.values.name}
                </p>

                <p>
                  <b>Username:</b> {formik.values.username || "-"}
                </p>

                <p>
                  <b>Employee No:</b> {formik.values.employeeNo || "-"}
                </p>

                <p>
                  <b>Email:</b> {formik.values.email}
                </p>

                <p>
                  <b>Mobile:</b> {formik.values.phone}
                </p>

                <p>
                  <b>Role:</b>{" "}
                  {roles.find(
                    (r) => String(r.id) === String(formik.values.b2cRoleId),
                  )?.name || "-"}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t border-black flex-wrap gap-3">
              <div className="flex gap-3">
                {activeStep > 1 && (
                  <Button type="button" variant="gray" onClick={prevStep}>
                    Back
                  </Button>
                )}

                <Button
                  type="button"
                  variant="gray"
                  onClick={() => {
                    if (activeStep === 1) {
                      formik.setValues({
                        ...formik.values,
                        name: "",
                        username: "",
                        email: "",
                        phone: "",
                        employeeNo: "",
                        password: "",
                        confirmPassword: "",
                      });
                    }

                    if (activeStep === 2) {
                      formik.setFieldValue("b2cRoleId", "");
                    }
                  }}
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
                    {editUser ? "Update " : "Save "}
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
