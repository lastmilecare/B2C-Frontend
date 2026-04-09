import React, { useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  HeartIcon,
  DocumentCheckIcon,
  UserIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { Input, Select, Button } from "../components/FormControls";
import { healthAlerts } from "../utils/healthSwal";

const MedicalHistory = () => {
  const [activeStep, setActiveStep] = useState(1);

  const formik = useFormik({
    initialValues: {
      pastIllness: "",
      surgicalHistory: "",
      familyHistory: "",
      medications: "",
      allergies: "",
      smoking: "",
      alcohol: "",
      tobacco: "",
    },

    validationSchema: Yup.object({
      pastIllness: Yup.string().required("Required"),
    }),

    onSubmit: (values) => {
      console.log("Medical History:", values);
      healthAlerts.success("Medical History Saved", "Success");
    },
  });

  const nextStep = useCallback(async () => {
    const errors = await formik.validateForm();

    if (activeStep === 1 && errors.pastIllness) {
      formik.setTouched({ pastIllness: true });
      healthAlerts.error("Please fill required fields", "Error");
      return;
    }

    setActiveStep((prev) => prev + 1);
  }, [activeStep, formik]);

  const prevStep = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, []);

  const handleReset = useCallback(() => {
    healthAlerts.confirm(
      "Are you sure?",
      "This will clear all data",
      () => {
        formik.resetForm();
        setActiveStep(1);
      }
    );
  }, [formik]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-6xl mx-auto">

        
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <HeartIcon className="w-6 text-blue-600" />
            </span>
            Medical History
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${
                  activeStep >= s ? "bg-sky-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">

          
          <div className="flex border-b mb-6">
            {[
              { id: 1, label: "History", icon: ClipboardDocumentListIcon },
              { id: 2, label: "Lifestyle", icon: UserIcon },
              { id: 3, label: "Confirm", icon: DocumentCheckIcon },
            ].map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`flex-1 py-4 flex items-center justify-center gap-2 ${
                  activeStep === step.id
                    ? "bg-white text-sky-600 shadow"
                    : "text-gray-400"
                }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
            ))}
          </div>

          <div className="p-10">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">

              
              {activeStep === 1 && (
                <section>
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Medical Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Input
                      label="Past Illness (Diabetes, etc.)"
                      {...formik.getFieldProps("pastIllness")}
                      error={formik.touched.pastIllness && formik.errors.pastIllness}
                    />

                    <Input
                      label="Surgical History"
                      {...formik.getFieldProps("surgicalHistory")}
                    />

                    <Input
                      label="Family Medical History"
                      {...formik.getFieldProps("familyHistory")}
                    />

                    <Input
                      label="Current Medications"
                      {...formik.getFieldProps("medications")}
                    />

                    <Input
                      label="Allergies"
                      {...formik.getFieldProps("allergies")}
                    />

                  </div>
                </section>
              )}

             
              {activeStep === 2 && (
                <section>
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Lifestyle Habits
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                    <Select label="Smoking" {...formik.getFieldProps("smoking")}>
                      <option value="">Select</option>
                      <option>No</option>
                      <option>Occasionally</option>
                      <option>Regular</option>
                    </Select>

                    <Select label="Alcohol" {...formik.getFieldProps("alcohol")}>
                      <option value="">Select</option>
                      <option>No</option>
                      <option>Occasionally</option>
                      <option>Regular</option>
                    </Select>

                    <Select label="Tobacco Use" {...formik.getFieldProps("tobacco")}>
                      <option value="">Select</option>
                      <option>No</option>
                      <option>Occasionally</option>
                      <option>Regular</option>
                    </Select>

                  </div>
                </section>
              )}

             
              {activeStep === 3 && (
                <section>
                  <div className="bg-blue-50 p-6 rounded-xl space-y-2">
                    <p><b>Past Illness:</b> {formik.values.pastIllness}</p>
                    <p><b>Medications:</b> {formik.values.medications}</p>
                    <p><b>Allergies:</b> {formik.values.allergies}</p>
                    <p><b>Smoking:</b> {formik.values.smoking}</p>
                  </div>
                </section>
              )}

              
              <div className="flex justify-between pt-6 border-t border-gray-100">

                <div className="flex gap-2">
                  {activeStep > 1 && (
                    <Button type="button" variant="gray" onClick={prevStep}>
                      Back
                    </Button>
                  )}

                  <Button type="button" variant="gray" onClick={handleReset}>
                    <ArrowPathIcon className="w-5 h-5 inline mr-1" />
                    Reset
                  </Button>
                </div>

                {activeStep < 3 ? (
                  <Button type="button" variant="sky" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button type="button" variant="sky" onClick={formik.handleSubmit}>
                    <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                    Save
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

export default MedicalHistory;