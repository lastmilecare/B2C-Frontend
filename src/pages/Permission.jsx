import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  KeyIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
  useCreatePermissionMutation,
  useGetAllResourceComboQuery,
} from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { Select, Button } from "../components/FormControls";

const Permission = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [createPermission, { isLoading: isCreating }] =
    useCreatePermissionMutation();
  const { data: ResourceData } = useGetAllResourceComboQuery();
  const RESOURCES = ResourceData?.data?.data || [];
  const ACTIONS = ["read", "create", "update", "delete", "assign"];

  const formik = useFormik({
    initialValues: {
      action: "",
      resource: "",
    },
    validationSchema: Yup.object({
      action: Yup.string().required("Action is required"),
      resource: Yup.string().required("Resource is required"),
    }),
    onSubmit: async (values) => {
      try {
        await createPermission(values).unwrap();
        healthAlert({
          title: "Success",
          text: "Permission created successfully",
          icon: "success",
        });
        formik.resetForm();
        setActiveStep(1);
      } catch (err) {
        healthAlert({
          title: "Error",
          text: err?.data?.message || "Operation failed",
          icon: "error",
        });
      }
    },
  });

  const nextStep = async () => {
    const errors = await formik.validateForm();
    if (activeStep === 1 && (errors.action || errors.resource)) {
      formik.setTouched({ action: true, resource: true });
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <KeyIcon className="w-6 text-blue-600" />
            </span>
            Permission Registration
          </h1>
          <div className="flex gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-gray-200"}`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">
          <div className="flex border-b">
            <button
              disabled
              className={`flex-1 py-4 flex items-center justify-center gap-2 ${activeStep === 1 ? "text-sky-600 font-bold" : "text-gray-400"}`}
            >
              <ShieldCheckIcon className="w-5 h-5" /> Mapping
            </button>
            <button
              disabled
              className={`flex-1 py-4 flex items-center justify-center gap-2 ${activeStep === 2 ? "text-sky-600 font-bold" : "text-gray-400"}`}
            >
              <DocumentCheckIcon className="w-5 h-5" /> Confirm
            </button>
          </div>

          <div className="p-10">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {activeStep === 1 && (
                <section className="animate-in fade-in duration-500">
                  <h3 className="text-lg font-semibold text-sky-700 mb-6 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>{" "}
                    Permission Mapping
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Select
                      label="Action"
                      required
                      {...formik.getFieldProps("action")}
                      error={formik.touched.action && formik.errors.action}
                    >
                      <option value="">Select Action</option>
                      {ACTIONS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </Select>

                    <Select
                      label="Resource "
                      required
                      {...formik.getFieldProps("resource")}
                      error={formik.touched.resource && formik.errors.resource}
                    >
                      <option value="">Select Resource</option>
                      {RESOURCES?.map((r) => (
                        <option key={r.id} value={r.name}>
                          {`${r.name} - ${r.description}`}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {formik.values.action && formik.values.resource && (
                    <div className="mt-6 p-4 bg-sky-50 rounded-2xl border border-sky-100">
                      <p className="text-xs text-sky-600 font-bold uppercase tracking-wider mb-1">
                        Generated Key
                      </p>
                      <code className="text-lg font-mono text-sky-800">
                        {formik.values.action}:{formik.values.resource}
                      </code>
                    </div>
                  )}
                </section>
              )}

              {activeStep === 2 && (
                <section className="animate-in fade-in duration-500">
                  <div className="bg-sky-50 p-8 rounded-3xl border border-sky-100 space-y-6">
                    <h3 className="text-xl font-bold text-sky-800">
                      Confirm Permission Mapping
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <p className="text-gray-500 font-medium">
                          Selected Action
                        </p>
                        <p className="text-lg font-bold text-slate-800 uppercase">
                          {formik.values.action}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <p className="text-gray-500 font-medium">
                          Selected Resource
                        </p>
                        <p className="text-lg font-bold text-slate-800 uppercase">
                          {formik.values.resource}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-white rounded-2xl border border-sky-200">
                      <p className="text-sm text-gray-500">
                        The following unique key will be registered in the
                        system:
                      </p>
                      <p className="text-xl font-mono font-black text-sky-600 mt-2">
                        {formik.values.action}:{formik.values.resource}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <div className="flex justify-between pt-8 border-t border-slate-50">
                <div className="flex gap-3">
                  {activeStep > 1 && (
                    <Button
                      type="button"
                      variant="gray"
                      onClick={() => setActiveStep(1)}
                    >
                      Back
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="gray"
                    onClick={() => formik.resetForm()}
                  >
                    <ArrowPathIcon className="w-5 h-5 inline mr-1" /> Reset
                  </Button>
                </div>

                {activeStep < 2 ? (
                  <Button type="button" variant="sky" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="sky"
                    onClick={formik.handleSubmit}
                    disabled={isCreating}
                  >
                    <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                    {isCreating ? "Saving..." : "Save Permission"}
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

export default Permission;
