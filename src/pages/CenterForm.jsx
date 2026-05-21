import React, { useState } from "react";
import { useFormik } from "formik";
import { useNavigate, useLocation } from "react-router-dom";

import {
  ClipboardDocumentIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { Input, Select, Button } from "../components/UIComponents";
import { healthAlert } from "../utils/healthSwal";
import * as Yup from "yup";

import { useGetTenantsQuery, useCreateCenterMutation, useUpdateCenterMutation } from "../redux/apiSlice";
import { cookie } from "../utils/cookie";

const STEPS = [
  { id: 1, label: "Project Details", icon: ClipboardDocumentIcon },
  { id: 2, label: "Agency Details", icon: UserPlusIcon },
  { id: 3, label: "Duration & Confirm", icon: CheckCircleIcon },
];

const ROLE_ADMIN = "LMC_ADMIN";

const CenterForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  const role = cookie.get("role");
  const isAdmin = role === ROLE_ADMIN;
  const cookieTenantId = cookie.get("tenant_id");
  const userId = cookie.get("user_id");
  const { data } = useGetTenantsQuery();
  const tenants = data?.data?.data || [];
  const [createCenter] = useCreateCenterMutation();
  const [updateCenter] = useUpdateCenterMutation();
  const formik = useFormik({
   initialValues: {
  tenant_id: editData?.tenant_id || "",
  project_name: editData?.project_name || "",
  short_code: editData?.short_code || "",
  project_district: editData?.project_district || "",
  project_state: editData?.project_state || "",
  project_address: editData?.project_address || "",

  agency_name: editData?.agency_name || "",
  agency_district: editData?.agency_district || "",
  agency_address: editData?.agency_address || "",
  agency_state: editData?.agency_state || "",

  agency_spoc_name: editData?.agency_spoc_name || "",
  agency_spoc_email: editData?.agency_spoc_email || "",
  agency_spoc_contact_number:
    editData?.agency_spoc_contact_number || "",

  agency_spoc_alternate_name:
    editData?.agency_spoc_alternate_name || "",

  agency_spoc_alternate_contact_number:
    editData?.agency_spoc_alternate_contact_number || "",

  project_start_date: editData?.project_start_date || "",
  project_end_date: editData?.project_end_date || "",
},
enableReinitialize: true,

    validationSchema: Yup.object({
      tenant_id: Yup.string().required("Tenant is required"),
      project_name: Yup.string().required("Project Name is required"),
      short_code: Yup.string()
        .required("Center ID is required")
        .max(3, "Max 3 characters"),
      project_district: Yup.string().required("District is required"),
      project_state: Yup.string().required("State is required"),
      project_address: Yup.string().required("Address is required"),

      agency_name: Yup.string().required("Agency Name is required"),
      agency_district: Yup.string().required("Agency District is required"),
      agency_address: Yup.string().required("Agency Address is required"),
      agency_state: Yup.string().required("Agency State is required"),

      // project_start_date: Yup.string().required("Start Date is required"),
      // project_end_date: Yup.string().required("End Date is required"),
    }),

   
    onSubmit: async (values, { setSubmitting }) => {
  try {
    const finalTenantId = isAdmin
      ? values.tenant_id
      : cookieTenantId;

    const payload = {
      tenant_id: Number(finalTenantId),

      createdBy: Number(userId),

      project_name: values.project_name,
      short_code: values.short_code,

      project_district: values.project_district,
      project_state: values.project_state,
      project_address: values.project_address,

      agency_name: values.agency_name,
      agency_address: values.agency_address,
      agency_district: values.agency_district,
      agency_state: values.agency_state,

      agency_spoc_name: values.agency_spoc_name,
      agency_spoc_email: values.agency_spoc_email,
      agency_spoc_contact_number:
        values.agency_spoc_contact_number,

      agency_spoc_alternate_name:
        values.agency_spoc_alternate_name || null,

      agency_spoc_alternate_contact_number:
        values.agency_spoc_alternate_contact_number || null,

      project_start_date:
        values.project_start_date || null,

      project_end_date:
        values.project_end_date || null,
    };

    let result;

    if (editData?.id) {
      result = await updateCenter({
        id: editData.id,
        ...payload,
      }).unwrap();

      healthAlert({
        title: "Success",
        text: "Center Updated Successfully",
        icon: "success",
      });
    } else {
      result = await createCenter(payload).unwrap();

      healthAlert({
        title: "Success",
        text: "Center Created Successfully",
        icon: "success",
      });
    }

    navigate(`/center-list`);
  } catch (err) {
    healthAlert({
      title: "Error",
      text:
        err?.data?.message ||
        "Failed to save center",
      icon: "error",
    });
  } finally {
    setSubmitting(false);
  }
},
  });

  const nextStep = async () => {
    const errors = await formik.validateForm();

    const stepFields = {
      1: isAdmin
        ? [
            "tenant_id",
            "project_name",
            "short_code",
            "project_district",
            "project_state",
            "project_address",
          ]
        : [
            "project_name",
            "short_code",
            "project_district",
            "project_state",
            "project_address",
          ],

      2: ["agency_name", "agency_district", "agency_address", "agency_state"],

      3: ["project_start_date", "project_end_date"],
    };

    const fields = stepFields[activeStep] || [];

    const hasError = fields.some((f) => errors[f]);

    if (hasError) {
      formik.setTouched(
        fields.reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {}),
      );
      return;
    }

    setActiveStep((p) => p + 1);
  };

  const prevStep = () => setActiveStep((p) => p - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
  <UsersIcon className="w-7 text-blue-600" />
  {editData ? "Edit Center / Project" : "Add Center / Project"}
</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          {/* STEP HEADER */}
          <div className="flex border-b">
            {STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
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
            {/* STEP 1 */}
            {activeStep === 1 && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* ✅ TENANT ONLY FOR ADMIN */}
                {isAdmin && (
                  <Select
                    label="Tenant"
                    required
                    {...formik.getFieldProps("tenant_id")}
                    error={formik.touched.tenant_id && formik.errors.tenant_id}
                  >
                    <option value="">Select Tenant</option>
                    {tenants.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </Select>
                )}

                <Input
                  label="Project Name"
                  required
                  {...formik.getFieldProps("project_name")}
                  error={
                    formik.touched.project_name && formik.errors.project_name
                  }
                />

                <Input
                  label="Center ID (3 chars)"
                  required
                  maxLength={3}
                  {...formik.getFieldProps("short_code")}
                  error={formik.touched.short_code && formik.errors.short_code}
                />

                <Input
                  label="District"
                  required
                  {...formik.getFieldProps("project_district")}
                  error={
                    formik.touched.project_district &&
                    formik.errors.project_district
                  }
                />

                <Input
                  label="State"
                  required
                  {...formik.getFieldProps("project_state")}
                  error={
                    formik.touched.project_state && formik.errors.project_state
                  }
                />

                <Input
                  label="Address"
                  required
                  {...formik.getFieldProps("project_address")}
                  error={
                    formik.touched.project_address &&
                    formik.errors.project_address
                  }
                />
              </div>
            )}

            {/* STEP 2 */}
            {activeStep === 2 && (
              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  label="Agency Name"
                  required
                  {...formik.getFieldProps("agency_name")}
                />
                <Input
                  label="Agency District"
                  required
                  {...formik.getFieldProps("agency_district")}
                />
                <Input
                  label="Agency State"
                  required
                  {...formik.getFieldProps("agency_state")}
                />
                <Input
                  label="Agency Address"
                  required
                  {...formik.getFieldProps("agency_address")}
                />

                <Input
                  label="SPOC Name"
                  {...formik.getFieldProps("agency_spoc_name")}
                />
                <Input
                  label="SPOC Email"
                  {...formik.getFieldProps("agency_spoc_email")}
                />
                <Input
                  label="SPOC Contact"
                  {...formik.getFieldProps("agency_spoc_contact_number")}
                />
              </div>
            )}

            {/* STEP 3 */}
            {activeStep === 3 && (
              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  type="date"
                  label="Start Date"
                  // required
                  {...formik.getFieldProps("project_start_date")}
                  // error={
                  //   formik.touched.project_start_date &&
                  //   formik.errors.project_start_date
                  // }
                />

                <Input
                  type="date"
                  label="End Date"
                  // required
                  {...formik.getFieldProps("project_end_date")}
                  // error={
                  //   formik.touched.project_end_date &&
                  //   formik.errors.project_end_date
                  // }
                />
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-between pt-6 border-t">
              <div className="flex gap-3">
                {activeStep > 1 && (
                  <Button type="button" variant="gray" onClick={prevStep}>
                    Back
                  </Button>
                )}

                <Button type="button" variant="gray" onClick={formik.resetForm}>
                  <ArrowPathIcon className="w-4 mr-1" />
                  Reset
                </Button>
              </div>

              <div>
                {activeStep < 3 ? (
                  <Button
                    type="button"
                    variant="sky"
                    onClick={async () => {
                      await nextStep();
                    }}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
  type="button"
  variant="sky"
  onClick={formik.handleSubmit}
>
  <CheckCircleIcon className="w-4 mr-1" />
  {editData ? "Update" : "Save"}
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

export default CenterForm;
