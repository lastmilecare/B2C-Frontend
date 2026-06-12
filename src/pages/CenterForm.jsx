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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { formatDateOnly } from "../utils/helper";
const STEPS = [
  { id: 1, label: "Project Details", icon: ClipboardDocumentIcon },
  { id: 2, label: "Agency Details", icon: UserPlusIcon },
  { id: 3, label: "Duration Details", icon: CheckCircleIcon },
  { id: 4, label: "Confirm", icon: CheckCircleIcon },
];

const ROLE_ADMIN = "LMC_ADMIN";

const CenterForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  const role = cookie.get("role");
  const isAdmin = role === ROLE_ADMIN;
  const cookieTenantId = cookie.get("tenantId");
  const userId = cookie.get("user_id");
  const { data, refetch, } = useGetTenantsQuery();
  const tenants = data?.data?.data || [];
  const [createCenter] = useCreateCenterMutation();
  const [updateCenter] = useUpdateCenterMutation();
  const formik = useFormik({
    initialValues: {
      tenant_id: editData?.tenant_id || (!isAdmin ? cookieTenantId : ""),
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
      tenant_id: isAdmin
        ? Yup.string().required("Tenant is required")
        : Yup.string().nullable(),
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
//       project_end_date: Yup.string().test(
//   "end-date-validation",
//   "End Date cannot be before Start Date",
//   function (value) {
//     const { project_start_date } = this.parent;

//     if (!project_start_date || !value) {
//       return true; // dono me se koi empty hai to validation pass
//     }

//     return new Date(value) >= new Date(project_start_date);
//   }
// ),

      // project_start_date: Yup.string().required("Start Date is required"),
      // project_end_date: Yup.string().required("End Date is required"),
      project_end_date: Yup.string().test(
  "end-date-validation",
  "End Date cannot be before Start Date",
  function (value) {
    const { project_start_date } = this.parent;

    if (!project_start_date || !value) {
      return true;
    }

    return new Date(value) >= new Date(project_start_date);
  }
),
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
          await refetch();

          healthAlert({
            title: "Success",
            text: "Center Updated Successfully",
            icon: "success",
          });
        } else {
          result = await createCenter(payload).unwrap();
          await refetch();
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
    if (
  activeStep === 3 &&
  formik.errors.project_end_date
) {
  return;
}

    setActiveStep((p) => p + 1);
  };

  const prevStep = () => setActiveStep((p) => p - 1);
  const handleReset = () => {
    if (activeStep === 1) {
      formik.setValues({
        ...formik.values,
        tenant_id: "",
        project_name: "",
        short_code: "",
        project_district: "",
        project_state: "",
        project_address: "",
      });
    }

    if (activeStep === 2) {
      formik.setValues({
        ...formik.values,
        agency_name: "",
        agency_district: "",
        agency_address: "",
        agency_state: "",
        agency_spoc_name: "",
        agency_spoc_email: "",
        agency_spoc_contact_number: "",
        agency_spoc_alternate_name: "",
        agency_spoc_alternate_contact_number: "",
      });
    }

    if (activeStep === 3) {
      formik.setValues({
        ...formik.values,
        project_start_date: "",
        project_end_date: "",
      });
    }

    if (activeStep === 4) {
  formik.setValues({
    tenant_id: !isAdmin ? cookieTenantId : "",
    project_name: "",
    short_code: "",
    project_district: "",
    project_state: "",
    project_address: "",
    agency_name: "",
    agency_district: "",
    agency_address: "",
    agency_state: "",
    agency_spoc_name: "",
    agency_spoc_email: "",
    agency_spoc_contact_number: "",
    agency_spoc_alternate_name: "",
    agency_spoc_alternate_contact_number: "",
    project_start_date: "",
    project_end_date: "",
  });

  setActiveStep(1);
}
  };
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
                  error={
                    formik.touched.agency_name &&
                    formik.errors.agency_name
                  }
                />
                <Input
                  label="Agency District"
                  required
                  {...formik.getFieldProps("agency_district")}
                  error={
                    formik.touched.agency_district &&
                    formik.errors.agency_district
                  }

                />
                <Input
                  label="Agency State"
                  required
                  {...formik.getFieldProps("agency_state")}
                  error={
                    formik.touched.agency_state &&
                    formik.errors.agency_state
                  }
                />
                <Input
                  label="Agency Address"
                  required
                  {...formik.getFieldProps("agency_address")}
                  error={
                    formik.touched.agency_address &&
                    formik.errors.agency_address
                  }
                />

                <Input
                  label="SPOC Name"
                  {...formik.getFieldProps("agency_spoc_name")}
                />
                <Input
                  label="SPOC Email"
                  {...formik.getFieldProps("agency_spoc_email")}
                />
                {/* <Input
                  label="SPOC Contact"
                   inputMode="numeric"
                      maxLength={10}

                  {...formik.getFieldProps("agency_spoc_contact_number")}
                /> */}
                <Input
                  label="SPOC Contact"
                  maxLength={10}
                  value={formik.values.agency_spoc_contact_number}
                  onChange={(e) => {
                    const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                    formik.setFieldValue(
                      "agency_spoc_contact_number",
                      onlyNumbers
                    );
                  }}
                />
              </div>
            )}

            {/* STEP 3 */}
            {activeStep === 3 && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* <Input
                  type="date"
                  label="Start Date"
                  // required
                  {...formik.getFieldProps("project_start_date")}
                  // error={
                  //   formik.touched.project_start_date &&
                  //   formik.errors.project_start_date
                  // }
                /> */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>

                  <DatePicker
                    selected={
                      formik.values.project_start_date
                        ? new Date(formik.values.project_start_date)
                        : null
                    }
                    onChange={(date) => {
                      formik.setFieldValue(
                        "project_start_date",
                        formatDateOnly(date)
                      );
                    }}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    showMonthDropdown
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    wrapperClassName="w-full"
                    popperClassName="z-[99999]"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm
    outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                </div>
                {/* <Input
                  type="date"
                  label="End Date"
                  // required
                  {...formik.getFieldProps("project_end_date")}
                  // error={
                  //   formik.touched.project_end_date &&
                  //   formik.errors.project_end_date
                  // }
                /> */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>

                 <DatePicker
  selected={
    formik.values.project_end_date
      ? new Date(formik.values.project_end_date)
      : null
  }
onChange={(date) => {
  const start = formik.values.project_start_date;

  if (start) {
    const startDate = new Date(start);

    if (date < startDate) {
      formik.setFieldTouched("project_end_date", true);

      formik.setFieldError(
        "project_end_date",
        "End Date cannot be before Start Date"
      );

      return;
    }
  }

  formik.setFieldError("project_end_date", "");

  formik.setFieldValue(
    "project_end_date",
    formatDateOnly(date)
  );
}}
                    
                    dateFormat="dd/MM/yyyy"
                    placeholderText="DD/MM/YYYY"
                    showMonthDropdown
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    wrapperClassName="w-full"
                    popperClassName="z-[99999]"
                    className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm
    outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
    
                  />
                    {formik.touched.project_end_date &&
    formik.errors.project_end_date && (
      <p className="text-red-500 text-xs mt-1">
        {formik.errors.project_end_date}
      </p>
    )}
                </div>
              </div>
            )}
            {activeStep === 4 && (
              <section>
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">

                  <h3 className="text-lg font-semibold text-sky-600">
                    Confirm Center / Project Details
                  </h3>

                  <div className="border-b pb-4">
                    <h4 className="font-semibold text-sky-700 mb-3">
                      Project Details
                    </h4>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <p>
                        <b>Tenant:</b>{" "}
                        {tenants.find(
                          (t) => String(t.id) === String(formik.values.tenant_id)
                        )?.name ||
                          cookie.get("tenant_name") ||
                          "-"}
                      </p>

                      <p><b>Project Name:</b> {formik.values.project_name || "-"}</p>
                      <p><b>Center ID:</b> {formik.values.short_code || "-"}</p>
                      <p><b>District:</b> {formik.values.project_district || "-"}</p>
                      <p><b>State:</b> {formik.values.project_state || "-"}</p>
                      <p><b>Address:</b> {formik.values.project_address || "-"}</p>
                    </div>
                  </div>

                  <div className="border-b pb-4">
                    <h4 className="font-semibold text-sky-700 mb-3">
                      Agency Details
                    </h4>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <p><b>Agency Name:</b> {formik.values.agency_name || "-"}</p>
                      <p><b>Agency District:</b> {formik.values.agency_district || "-"}</p>
                      <p><b>Agency State:</b> {formik.values.agency_state || "-"}</p>
                      <p><b>Agency Address:</b> {formik.values.agency_address || "-"}</p>
                      <p><b>SPOC Name:</b> {formik.values.agency_spoc_name || "-"}</p>
                      <p><b>SPOC Email:</b> {formik.values.agency_spoc_email || "-"}</p>
                      <p><b>SPOC Contact:</b> {formik.values.agency_spoc_contact_number || "-"}</p>
                      {/* <p><b>Alternate SPOC:</b> {formik.values.agency_spoc_alternate_name || "-"}</p>
                      <p><b>Alternate Contact:</b> {formik.values.agency_spoc_alternate_contact_number || "-"}</p> */}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sky-700 mb-3">
                      Duration Details
                    </h4>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <p><b>Start Date:</b> {formik.values.project_start_date || "-"}</p>
                      <p><b>End Date:</b> {formik.values.project_end_date || "-"}</p>
                    </div>
                  </div>

                </div>
              </section>
            )}

            {/* ACTIONS */}
            <div className="flex justify-between pt-6 border-t">
              <div className="flex gap-3">
                {activeStep > 1 && (
                  <Button type="button" variant="gray" onClick={prevStep}>
                    Back
                  </Button>
                )}

                <Button
                  type="button"
                  variant="gray"
                  onClick={handleReset}
                >
                  <ArrowPathIcon className="w-4 mr-1" />
                  Reset
                </Button>
              </div>

              <div>
                {activeStep < 4 ? (
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
