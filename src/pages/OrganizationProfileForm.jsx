import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";

import { Input, Select, Button } from "../components/UIComponents";
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

  const [logoPreview, setLogoPreview] = useState(editData?.logo || "");
  const [secondaryLogoPreview, setSecondaryLogoPreview] = useState(
    editData?.secondary_logo || "",
  );

  const validationSchema = Yup.object({
    tenant_id: Yup.string().required("Tenant is required"),
    display_name: Yup.string().required("Display name is required"),
    mobile: Yup.string().matches(/^[0-9]{10}$/, "Invalid mobile"),
  });

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

  // ---------------- HANDLERS ----------------
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

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-6">
          {editData
            ? "Edit Organization Profile"
            : "Create Organization Profile"}
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tenant */}
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

          {/* Center */}
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

          <Input label="Mobile" {...formik.getFieldProps("mobile")} />
          <Input label="Email" {...formik.getFieldProps("email")} />
          <Input label="Address" {...formik.getFieldProps("address")} />

          {/* ---------------- LOGO UPLOAD ---------------- */}
          <div>
            <label className="block text-sm font-medium mb-1">Logo</label>

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

          {/* ---------------- SECONDARY LOGO ---------------- */}
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

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-8">
          <Button variant="gray" onClick={() => navigate(-1)}>
            Cancel
          </Button>

          <Button
            variant="sky"
            onClick={formik.handleSubmit}
            disabled={isCreating || isUpdating}
          >
            {editData ? "Update" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationProfileForm;
