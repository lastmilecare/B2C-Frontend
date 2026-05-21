import React from "react";
import { useFormik, FormikProvider } from "formik";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { useCreateTenantMutation, useUpdateTenantMutation } from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { Input, Button } from "../components/UIComponents";
import { Tenant_Type_Options } from "../utils/constants";
import { Select } from "../components/FormControls";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
const TenantForm = ({ refetchList }) => {
  const [createTenant, { isLoading }] = useCreateTenantMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  const [updateTenant, { isLoading: isUpdating }] =
    useUpdateTenantMutation();
  const formik = useFormik({
    initialValues: {
      name: editData?.name || "",
      tenant_type: editData?.tenant_type || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required("Tenant Name is required"),
      tenant_type: Yup.string().required("Tenant Type is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editData?.id) {
          await updateTenant({
            id: editData.id,
            ...values,
          }).unwrap();

          healthAlert({
            title: "Success",
            text: "Tenant Updated Successfully",
            icon: "success",
          });
        } else {
          await createTenant(values).unwrap();

          healthAlert({
            title: "Success",
            text: "Tenant Created Successfully",
            icon: "success",
          });
        }

        resetForm();
        refetchList?.();
        navigate("/tenant-list");
      } catch (err) {
        healthAlert({
          title: "Error",
          text: err?.data?.message || "Failed",
          icon: "error",
        });
      }
    },
  });

  return (
    <FormikProvider value={formik}>
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <UserPlusIcon className="w-6 text-blue-600" />
          {editData ? "Edit Tenant" : "Add Tenant"}
        </h1>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <Input
            label="Tenant Name"
            required
            {...formik.getFieldProps("name")}
            error={
              formik.touched.name && formik.errors.name
                ? formik.errors.name
                : null
            }
          />

          <Select
            {...formik.getFieldProps("tenant_type")}
            label="Tenant Type"
            required
            error={
              formik.touched.tenant_type && formik.errors.tenant_type
                ? formik.errors.tenant_type
                : null
            }
          >
            <option value="">Select</option>
            {Tenant_Type_Options.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </Select>
          <div className="flex gap-3">
            <Button type="button" variant="gray" onClick={formik.handleReset}>
              <ArrowPathIcon className="w-4 mr-1" />
              Reset
            </Button>

            <Button
              type="submit"
              variant="sky"
              disabled={isLoading || isUpdating}
            >
              <CheckCircleIcon className="w-4 mr-1" />
              {isLoading || isUpdating
                ? "Saving..."
                : editData
                  ? "Update"
                  : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
};

export default TenantForm;
