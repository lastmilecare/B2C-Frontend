import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";

import { Input, Select, Button } from "../components/UIComponents";
import {
  BuildingOfficeIcon,
  PhotoIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useGetAllTenantsQuery,
  useCenterComboListQuery,
  useCreateOrgProfileMutation,
  useUpdateOrgProfileMutation,
} from "../redux/apiSlice";

import { healthAlert } from "../utils/healthSwal";

const OrganizationProfileForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.editData || null;

  const { data: tenantData } = useGetAllTenantsQuery();
  const { data: centersData = [] } = useCenterComboListQuery();

  const tenants = tenantData?.data?.data || [];
  const centers = centersData?.data || [];

  const [createProfile, { isLoading: isCreating }] =
    useCreateOrgProfileMutation();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateOrgProfileMutation();

const BASE_URL = import.meta.env.VITE_API_URL;

const [logoPreview, setLogoPreview] = useState("");
const [activeStep, setActiveStep] = useState(1);
const [secondaryLogoPreview, setSecondaryLogoPreview] = useState("");

useEffect(() => {

  if (editData?.logo) {
    setLogoPreview(`${BASE_URL}${editData.logo}`);
  }

  if (editData?.secondary_logo) {
    setSecondaryLogoPreview(
      `${BASE_URL}${editData.secondary_logo}`
    );
  }
}, [editData]);
  const validationSchema = Yup.object({
    tenant_id: Yup.string().required("Tenant is required"),
    display_name: Yup.string().required("Display name is required"),
    mobile: Yup.string().matches(/^[0-9]{10}$/, "Invalid mobile"),
  });
  const nextStep = async () => {
    const errors = await formik.validateForm();

    if (
      activeStep === 1 &&
      (
        errors.tenant_id ||
        errors.display_name ||
        errors.mobile
      )
    ) {
      formik.setTouched({
        tenant_id: true,
        display_name: true,
        mobile: true,
      });

      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setActiveStep((prev) => prev - 1);
  };
  const handleReset = () => {

    if (activeStep === 1) {
      formik.setValues({
        ...formik.values,
        tenant_id: "",
        center_id: "",
        display_name: "",
        mobile: "",
        email: "",
        address: "",
      });

      return;
    }

    if (activeStep === 2) {
      formik.setValues({
        ...formik.values,
        logo: null,
        secondary_logo: null,
      });

      setLogoPreview("");
      setSecondaryLogoPreview("");

      return;
    }


    if (activeStep === 3) {
      formik.setValues({
        ...formik.values,
        watermark_text: "",
        report_footer: "",
        invoice_prefix: "",
      });

      return;
    }


  if (activeStep === 4) {

  formik.setValues({
    tenant_id: "",
    center_id: "",
    display_name: "",
    address: "",
    mobile: "",
    email: "",
    logo: null,
    secondary_logo: null,
    watermark_text: "",
    report_footer: "",
    invoice_prefix: "",
  });

  formik.setTouched({});

  setLogoPreview("");
  setSecondaryLogoPreview("");

  setActiveStep(1);
}
  };
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      tenant_id: editData?.tenant_id || "",
      center_id: editData?.center_id || "",
      display_name: editData?.display_name || "",
      address: editData?.address || "",
      mobile: editData?.mobile || "",
      email: editData?.email || "",
      logo: null,
      secondary_logo: null,
      watermark_text: editData?.watermark_text || "",
      report_footer: editData?.report_footer || "",
      invoice_prefix: editData?.invoice_prefix || "",
    },

    validationSchema,

    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        Object.keys(values).forEach((key) => {
          if (values[key]) {
            formData.append(key, values[key]);
          }
        });

        if (editData) {
          await updateProfile({
            id: editData.id,
            body: formData,
          }).unwrap();
        } else {
          await createProfile(formData).unwrap();
        }

        healthAlert({
          title: "Success",
          icon: "success",
          text: editData
            ? "Profile Updated Successfully"
            : "Profile Created Successfully",
        });

        navigate("/organization-profiles-list");
      } catch (err) {
        healthAlert({
          icon: "error",
          title: "Error",
          text: err?.data?.message || "Failed",
        });
      }
    },
  });

 
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    formik.setFieldValue("logo", file);

    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSecondaryLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    formik.setFieldValue("secondary_logo", file);

    const reader = new FileReader();
    reader.onloadend = () => setSecondaryLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">

      <div className="max-w-6xl mx-auto">

        
        <div className="flex justify-between items-center mb-10">

          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">

            <span className="bg-blue-100 p-2 rounded-xl">
              <BuildingOfficeIcon className="w-6 text-blue-600" />
            </span>

            {editData
              ? "Edit Organization Profile"
              : "Create Organization Profile"}
          </h1>

          {/* STEP BAR */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${activeStep >= s
                  ? "bg-sky-600"
                  : "bg-gray-200"
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">

          {/* STEP HEADER */}
          <div className="flex border-b ">

            {[
              { id: 1, label: "Organization", icon: BuildingOfficeIcon },
              { id: 2, label: "Logos", icon: PhotoIcon },
              { id: 3, label: "Invoice", icon: DocumentCheckIcon },
              { id: 4, label: "Confirm", icon: CheckCircleIcon },
            ].map((step) => (

              <button
                key={step.id}
                type="button"
                disabled
                onClick={() => setActiveStep(step.id)}
                className={`flex-1 py-4 flex items-center justify-center gap-2
${activeStep === step.id
                    ? "bg-white text-sky-600 shadow "
                    : "text-gray-400"
                  }`}
              >
                <step.icon className="w-4 h-4" />

                {step.label}
              </button>
            ))}
          </div>

          <div className="p-10 ">

            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
              className="space-y-5"
            >
              {activeStep === 1 && (
                <section>

                  <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Organization Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                    <Select
                      label="Center (Optional)"
                      {...formik.getFieldProps("center_id")}
                    >
                      <option value="">All Centers (Default)</option>

                      {centers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.project_name}
                        </option>
                      ))}
                    </Select>

                    <Input
                      label="Display Name"
                      required
                      {...formik.getFieldProps("display_name")}
                      error={formik.touched.display_name && formik.errors.display_name}
                    />

                    <Input
                      label="Mobile"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={formik.values.mobile}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(
                          /[^0-9]/g,
                          ""
                        );

                        formik.setFieldValue(
                          "mobile",
                          onlyNumbers
                        );
                      }}
                      error={
                        formik.touched.mobile &&
                        formik.errors.mobile
                      }
                    />

                    <Input
                      label="Email"
                      {...formik.getFieldProps("email")}
                    />

                    <Input
                      label="Address"
                      {...formik.getFieldProps("address")}
                    />
                  </div>
                </section>
              )}
              {activeStep === 2 && (
                <section>

                  <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Logos & Branding
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Logo
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="w-full border p-2 rounded"
                      />

                      {logoPreview && (
                        <img
                          src={logoPreview}
                          alt="logo preview"
                          className="h-20 mt-2 object-contain border rounded"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Secondary Logo
                      </label>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSecondaryLogoChange}
                        className="w-full border p-2 rounded"
                      />

                      {secondaryLogoPreview && (
                        <img
                          src={secondaryLogoPreview}
                          alt="secondary logo preview"
                          className="h-20 mt-2 object-contain border rounded"
                        />
                      )}
                    </div>
                  </div>
                </section>
              )}
              {activeStep === 3 && (
                <section>

                  <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Invoice Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Watermark Text"
                      {...formik.getFieldProps("watermark_text")}
                    />

                    <Input
                      label="Invoice Footer"
                      {...formik.getFieldProps("report_footer")}
                    />

                    <Input
                      label="Invoice Prefix"
                      {...formik.getFieldProps("invoice_prefix")}
                    />
                  </div>
                </section>
              )}
              {activeStep === 4 && (
                <section>

                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">

                    <h3 className="text-lg font-semibold text-sky-600">
                      Confirm Organization Profile
                    </h3>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">

                      <p>
                        <b>Tenant:</b>{" "}
                        {tenants.find(
                          (t) => String(t.id) === String(formik.values.tenant_id)
                        )?.name || "-"}
                      </p>

                      <p>
                        <b>Center:</b>{" "}
                        {centers.find(
                          (c) => String(c.id) === String(formik.values.center_id)
                        )?.project_name || "All Centers"}
                      </p>

                      <p>
                        <b>Display Name:</b>{" "}
                        {formik.values.display_name || "-"}
                      </p>

                      <p>
                        <b>Mobile:</b>{" "}
                        {formik.values.mobile || "-"}
                      </p>

                      <p>
                        <b>Email:</b>{" "}
                        {formik.values.email || "-"}
                      </p>

                      <p>
                        <b>Address:</b>{" "}
                        {formik.values.address || "-"}
                      </p>

                    </div>

                    <div className="border-t pt-3 text-sm">

                      <div className="grid md:grid-cols-2 gap-3">

                        <p>
                          <b>Watermark Text:</b>{" "}
                          {formik.values.watermark_text || "-"}
                        </p>

                        <p>
                          <b>Invoice Footer:</b>{" "}
                          {formik.values.report_footer || "-"}
                        </p>

                        <p>
                          <b>Invoice Prefix:</b>{" "}
                          {formik.values.invoice_prefix || "-"}
                        </p>

                      </div>
                    </div>

                    <div className="border-t pt-3 text-sm">

                      <div className="flex gap-10 flex-wrap">

                        <div>
                          <p className="font-semibold mb-2">
                            Logo
                          </p>

                          {logoPreview ? (
                            <img
                              src={logoPreview}
                              alt="logo"
                              className="h-20 border rounded p-1 bg-white"
                            />
                          ) : (
                            "-"
                          )}
                        </div>

                        <div>
                          <p className="font-semibold mb-2">
                            Secondary Logo
                          </p>

                          {secondaryLogoPreview ? (
                            <img
                              src={secondaryLogoPreview}
                              alt="secondary logo"
                              className="h-20 border rounded p-1 bg-white"
                            />
                          ) : (
                            "-"
                          )}
                        </div>

                      </div>
                    </div>

                  </div>

                </section>
              )}
              <div className="flex justify-between pt-6 border-t border-black flex-wrap gap-3">

                <div className="flex gap-2">

                  {activeStep > 1 && (
                    <Button
                      type="button"
                      variant="gray"
                      onClick={prevStep}
                    >
                      Back
                    </Button>
                  )}

                  <Button
                    type="button"
                    variant="gray"
                    onClick={handleReset}
                  >
                    <ArrowPathIcon className="w-5 h-5 inline mr-1" />
                    Reset
                  </Button>
                </div>

                {activeStep < 4 ? (
                  <Button
                    type="button"
                    variant="sky"
                    onClick={nextStep}
                  >
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

                    {editData ? "Update" : "Save"}
                  </Button>
                )}
              </div>


            </form>
          </div>
        </div>
      </div>
    </div>
  );

};

export default OrganizationProfileForm;
