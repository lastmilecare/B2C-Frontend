import React, { useState, useCallback } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  DocumentCheckIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { Input, Select, Button } from "../components/FormControls";
import { healthAlerts } from "../utils/healthSwal";

const ClinicalExamination = () => {
  const [activeStep, setActiveStep] = useState(1);

  const formik = useFormik({
    initialValues: {
      generalAppearance: "",
      vision: "",
      colorBlindness: "",
      ear: "",
      nose: "",
      throat: "",
      cardiovascular: "",
      respiratory: "",
      abdomen: "",
      nervousSystem: "",
      musculoskeletal: "",
      skin: "",
    },

    validationSchema: Yup.object({
      generalAppearance: Yup.string().required("Required"),
    }),

    onSubmit: (values) => {
      healthAlerts.success("Clinical Examination Saved", "Success");
    },
  });

  const nextStep = useCallback(async () => {
    const errors = await formik.validateForm();

    if (activeStep === 1 && errors.generalAppearance) {
      formik.setTouched({ generalAppearance: true });
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
              <ClipboardDocumentCheckIcon className="w-6 text-blue-600" />
            </span>
            Clinical Examination
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-gray-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">

         
          <div className="flex border-b mb-6">
            {[
              { id: 1, label: "Basic", icon: ClipboardDocumentCheckIcon },
              { id: 2, label: "Systems", icon: EyeIcon },
              { id: 3, label: "Confirm", icon: DocumentCheckIcon },
            ].map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`flex-1 py-4 flex items-center justify-center gap-2 ${
                  activeStep === step.id ? "bg-white text-sky-600 shadow" : "text-gray-400"
                }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
            ))}
          </div>

          <div className="p-10">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

              
              {activeStep === 1 && (
                <section className="space-y-6">

                 
                  <div>
                    <h3 className="text-sky-700 font-semibold mb-2">General Appearance</h3>
                    <Input
                      label="General Appearance"
                      {...formik.getFieldProps("generalAppearance")}
                      error={formik.touched.generalAppearance && formik.errors.generalAppearance}
                    />
                  </div>

                  
                  <div>
                    <h3 className="text-sky-700 font-semibold mb-2">Eye Examination</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      <Input label="Vision" {...formik.getFieldProps("vision")} />
                      <Select label="Color Blindness" {...formik.getFieldProps("colorBlindness")}>
                        <option value="">Select</option>
                        <option>No</option>
                        <option>Yes</option>
                      </Select>
                    </div>
                  </div>

                 
                  <div>
                    <h3 className="text-sky-700 font-semibold mb-2">ENT</h3>
                    <div className="grid md:grid-cols-3 gap-3">
                      <Input label="Ear" {...formik.getFieldProps("ear")} />
                      <Input label="Nose" {...formik.getFieldProps("nose")} />
                      <Input label="Throat" {...formik.getFieldProps("throat")} />
                    </div>
                  </div>

                </section>
              )}

              
              {activeStep === 2 && (
                <section>
                  <h3 className="text-sky-700 font-semibold mb-4">System Examination</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input label="Cardiovascular System" {...formik.getFieldProps("cardiovascular")} />
                    <Input label="Respiratory System" {...formik.getFieldProps("respiratory")} />
                    <Input label="Abdomen" {...formik.getFieldProps("abdomen")} />
                    <Input label="Nervous System" {...formik.getFieldProps("nervousSystem")} />
                    <Input label="Musculoskeletal System" {...formik.getFieldProps("musculoskeletal")} />
                    <Input label="Skin Condition" {...formik.getFieldProps("skin")} />
                  </div>
                </section>
              )}

              
              {activeStep === 3 && (
                <section>
                  <div className="bg-blue-50 p-6 rounded-xl space-y-2">
                    <p><b>General:</b> {formik.values.generalAppearance}</p>
                    <p><b>Vision:</b> {formik.values.vision}</p>
                    <p><b>ENT:</b> {formik.values.ear}, {formik.values.nose}, {formik.values.throat}</p>
                    <p><b>Cardio:</b> {formik.values.cardiovascular}</p>
                    <p><b>Respiratory:</b> {formik.values.respiratory}</p>
                    <p><b>Skin:</b> {formik.values.skin}</p>
                  </div>
                </section>
              )}

              
              <div className="flex justify-between pt-6 border-t">

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

export default ClinicalExamination;