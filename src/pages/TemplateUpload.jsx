import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  DocumentPlusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

import {
  useCreateTemplateMutation,
  useGetAllTenantsQuery,
} from "../redux/apiSlice";

import { Input, Select, Button } from "../components/FormControls";
import { healthAlert } from "../utils/healthSwal";

const TemplateUpload = () => {
  const [createTemplate, { isLoading }] = useCreateTemplateMutation();
  const { data: tenantData } = useGetAllTenantsQuery();

  const tenants = tenantData?.data?.data || [];

  const formik = useFormik({
    initialValues: {
      name: "",
      tenant_id: "",
      template_html: "",
    },

    validationSchema: Yup.object({
      name: Yup.string().required("Template name is required"),
      tenant_id: Yup.string().required("Tenant is required"),
      template_html: Yup.string().required("Template HTML is required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        await createTemplate({
          ...values,
          tenant_id: Number(values.tenant_id),
        }).unwrap();

        healthAlert({
          title: "Success",
          text: "Template created successfully",
          icon: "success",
        });

        resetForm();
      } catch (error) {
        healthAlert({
          title: "Error",
          text: error?.data?.message || "Failed to create template",
          icon: "error",
        });
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <DocumentPlusIcon className="w-7 h-7 text-sky-600" />
            Template Upload
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">

          <div className="border-b px-8 py-4">
            <h2 className="text-sky-700 font-semibold">
              Upload Certificate Template
            </h2>
          </div>

          <form onSubmit={formik.handleSubmit} className="p-9 space-y-8">

            <div className="grid md:grid-cols-2 gap-6">

              <Input
                label="Template Name"
                {...formik.getFieldProps("name")}
                error={formik.touched.name && formik.errors.name}
                placeholder="Enter template name"
                required
              />

              <Select
                label="Assign Tenant"
                {...formik.getFieldProps("tenant_id")}
                error={formik.touched.tenant_id && formik.errors.tenant_id}
                required
              >
                <option value="">Select Tenant</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>

            </div>

         
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Template HTML <span className="text-red-500">*</span>
              </label>

              <textarea
                {...formik.getFieldProps("template_html")}
                placeholder="Use placeholders like {{patient_id}}, {{fitness_status}}"
                className={`w-full h-30 p-2 border-2 rounded-xl bg-blue-50 focus:ring-3 focus:ring-blue-100 outline-none text-sm
                  ${
                    formik.touched.template_html && formik.errors.template_html
                      ? "border-red-300"
                      : "border-blue-100 focus:border-blue-400"
                  }`}
              />

              {formik.touched.template_html && formik.errors.template_html && (
                <p className="text-xs text-red-500 mt-1">
                  {formik.errors.template_html}
                </p>
              )}
            </div>

        
            <div className="flex justify-end gap-3 pt-6 border-t">

              <Button type="button" variant="gray" onClick={formik.handleReset}>
                Reset
              </Button>

              <Button type="submit" variant="sky" disabled={isLoading}>
                <CheckCircleIcon className="w-4 mr-1 inline" />
                {isLoading ? "Saving..." : "Save Template"}
              </Button>

            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default TemplateUpload;