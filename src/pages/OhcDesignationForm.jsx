import React, { useState, useMemos } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import * as Yup from "yup";

import {
  ClipboardDocumentIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

import { Input, Select, Button } from "../components/UIComponents";
import { healthAlert } from "../utils/healthSwal";

import {
  useGetCentersQuery,
  useCreateDesignationMutation,
  useGetDepartmentListQuery,
  useUpdateDesignationMutation,
} from "../redux/apiSlice";

import { cookie } from "../utils/cookie";

const DesignationForm = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const [filters, setFilters] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const editData = location.state?.editData;

  const userId = cookie.get("user_id");

  const { data: centersData, isLoading: centersLoading } = useGetCentersQuery({
    page: 1,
    limit: 1000,
  });

  const centers = centersData?.data?.data || [];
  const {
    data = [],
    isLoading: isDepartmentLoading,
    isError,
    error,
    refetch,
  } = useGetDepartmentListQuery(
    {
      page,
      limit,
      ...filters,
    },
    {
      skip: !page || !limit,
    },
  );

  const departmentsData = data?.data || [];

  const departments = [...departmentsData].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const [createDesignation] = useCreateDesignationMutation();
  const [updateDesignation] = useUpdateDesignationMutation();

  const formik = useFormik({
    initialValues: {
      name: editData?.name || "",
      description: editData?.description || "",
      code: editData?.code || "",
      center_id: editData?.center_id || "",
      is_active: editData?.is_active ?? true,
      department_id: editData?.department_id || "",
    },

    enableReinitialize: true,

    validationSchema: Yup.object({
      name: Yup.string()
        .trim()
        .required("Designation Name is required")
        .max(100, "Designation Name cannot exceed 100 characters"),

      code: Yup.string()
        .trim()
        .max(20, "Designation Code cannot exceed 20 characters"),

      description: Yup.string().max(
        500,
        "Description cannot exceed 500 characters",
      ),

      center_id: Yup.number()
        .nullable()
        .transform((value, originalValue) =>
          originalValue === "" ? null : value,
        ),

      is_active: Yup.boolean(),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          name: values.name.trim(),

          description: values.description?.trim() || null,

          code: values.code?.trim() || null,

          //   center_id: values.center_id
          //     ? Number(values.center_id)
          //     : null,
          center_id: 2,
          department_id: values.department_id
            ? Number(values.department_id)
            : null,
          is_active: values.is_active,

          modified_by: userId ? Number(userId) : null,
        };

        if (editData?.id) {
          await updateDesignation({
            id: editData.id,
            ...payload,
          }).unwrap();

          healthAlert({
            title: "Success",
            text: "Designation updated successfully",
            icon: "success",
          });
        } else {
          await createDesignation(payload).unwrap();

          healthAlert({
            title: "Success",
            text: "Designation created successfully",
            icon: "success",
          });
        }

        navigate("/opd-designation-list", {
          state: {
            goToList: true,
          },
        });
      } catch (err) {
        healthAlert({
          title: "Error",
          text: err?.data?.message || "Failed to save Designation",
          icon: "error",
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1200px] mx-auto px-8">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BuildingOffice2Icon className="w-7 text-blue-600" />

            {editData ? "Edit Designation" : "Add Designation"}
          </h1>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          {/* CARD HEADER */}
          <div className="flex items-center gap-2 px-8 py-5 border-b">
            <ClipboardDocumentIcon className="w-5 h-5 text-sky-600" />

            <h2 className="text-lg font-semibold text-gray-700">
              Designation Information
            </h2>
          </div>

          <form onSubmit={formik.handleSubmit} className="p-8 space-y-8">
            {/* Designation DETAILS */}
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-5">
                Basic Details
              </h3>

              <div className="grid md:grid-cols-3 gap-6">
                {/* NAME */}
                <Input
                  label="Designation Name"
                  required
                  maxLength={100}
                  {...formik.getFieldProps("name")}
                  error={formik.touched.name && formik.errors.name}
                />

                {/* CODE */}
                <Input
                  label="Designation Code"
                  maxLength={20}
                  {...formik.getFieldProps("code")}
                  error={formik.touched.code && formik.errors.code}
                />

                <Select
                  {...formik.getFieldProps("department_id")}
                  label="Department"
                  required
                  error={formik.touched.department_id && formik.errors.department_id}
                >
                  <option value="">Select</option>
                  {departments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || `Department #${item.id}`}
                    </option>
                  ))}
                </Select>

                {/* STATUS */}
                <Select
                  label="Status"
                  value={formik.values.is_active ? "true" : "false"}
                  onChange={(e) =>
                    formik.setFieldValue("is_active", e.target.value === "true")
                  }
                >
                  <option value="true">Active</option>

                  <option value="false">Inactive</option>
                </Select>

                {/* DESCRIPTION */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>

                  <textarea
                    name="description"
                    rows={4}
                    maxLength={500}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Designation description"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />

                  {formik.touched.description && formik.errors.description && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="gray"
                onClick={() => formik.resetForm()}
              >
                <ArrowPathIcon className="w-4 mr-1" />
                Reset
              </Button>

              <Button
                type="submit"
                variant="sky"
                disabled={formik.isSubmitting}
              >
                <CheckCircleIcon className="w-4 mr-1" />

                {formik.isSubmitting
                  ? "Saving..."
                  : editData
                    ? "Update"
                    : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DesignationForm;
