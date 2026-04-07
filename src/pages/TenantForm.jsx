import React from "react";
import { useFormik, FormikProvider } from "formik";
import { CheckCircleIcon, ArrowPathIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { useCreateTenantMutation } from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { Input, Button } from "../components/UIComponents";

const TenantForm = ({ refetchList }) => {
  const [createTenant, { isLoading }] = useCreateTenantMutation();

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        await createTenant(values).unwrap();

        healthAlert({
          title: "Success",
          text: "Tenant Created Successfully",
          icon: "success",
        });

        resetForm();
        refetchList?.();
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
          Add Tenant
        </h1>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <Input
            label="Tenant Name"
            {...formik.getFieldProps("name")}
          />

          <div className="flex gap-3">
            <Button type="button" variant="gray" onClick={formik.handleReset}>
              <ArrowPathIcon className="w-4 mr-1" />
              Reset
            </Button>

            <Button type="submit" variant="sky" disabled={isLoading}>
              <CheckCircleIcon className="w-4 mr-1" />
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </FormikProvider>
  );
};

export default TenantForm;