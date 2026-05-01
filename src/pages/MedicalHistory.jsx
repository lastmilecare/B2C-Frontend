import React, { useState, useCallback, useRef, useEffect } from "react";
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
import { Input, Select, Button, baseInput } from "../components/FormControls";
import { healthAlerts } from "../utils/healthSwal";
import { useNavigate, useParams } from "react-router-dom";
import {
  useSearchEmployeeQuery,
  useGetPatientByEmployeeIdQuery,
  useCreateMedicalHistoryMutation,
  useUpdateMedicalHistoryMutation,
  useGetMedicalHistoryByIdQuery,
} from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { cookie } from "../utils/cookie";
import PatientSelector from "../components/common/PatientSelector";
const MedicalHistory = () => {
  const [activeStep, setActiveStep] = useState(1);

  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const username = cookie.get("username");
  const [createMedicalHistory] = useCreateMedicalHistoryMutation();
  const [updateMedicalHistory] = useUpdateMedicalHistoryMutation();

  const { data: editData } = useGetMedicalHistoryByIdQuery(id, {
    skip: !id,
  });
  const formik = useFormik({
    initialValues: {
      patient_id: "",
      EmployeeId: "",
      Name: "",
      Gender: "",
      Age: "",
      past_illness: "",
      surgical_history: "",
      family_medical_history: "",
      current_medications: "",
      allergies: "",
      smoking: "",
      alcohol: "",
      tobacco_use: "",
    },

    validationSchema: Yup.object({
      past_illness: Yup.string().required("Required"),
    }),

    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          employee_id: values.EmployeeId,

          name: values.Name,
          gender: values.Gender,
          age: Number(values.Age),
          patient_id: values.patient_id,
          past_illness: values.past_illness,
          surgical_history: values.surgical_history,
          family_medical_history: values.family_medical_history,
          current_medications: values.current_medications,
          allergies: values.allergies,
          smoking: values.smoking,
          alcohol: values.alcohol,
          tobacco_use: values.tobacco_use,
          // created_by: username,
        };

        let res;

        if (isEditMode) {
          res = await updateMedicalHistory({
            id,
            body: payload,
          }).unwrap();
        } else {
          res = await createMedicalHistory(payload).unwrap();
        }

        healthAlerts.success(
          res.message || "Medical History saved successfully"
        );

        resetForm();

        navigate("/medical-history", {
          state: { goToList: true },
        });
      } catch (error) {
        healthAlerts.error(
          error?.data?.message || "Save failed"
        );
      }
    },
  });
  useEffect(() => {
    console.log("EDIT ID:", id);
  if (!editData || editData.length === 0) return;

  const v = editData[0];   // ✅ FIX

  formik.setValues({
    patient_id: v.patient_id || "",
    EmployeeId: v.employee_id || "",
    Name: v.name || "",
    Gender: v.gender || "",
    Age: v.age || "",

    past_illness: v.past_illness || "",
    surgical_history: v.surgical_history || "",
    family_medical_history: v.family_medical_history || "",
    current_medications: v.current_medications || "",
    allergies: v.allergies || "",
    smoking: v.smoking || "",
    alcohol: v.alcohol || "",
    tobacco_use: v.tobacco_use || "",
    
  });
}, [editData]);
  //  useEffect(() => {
  //   if (!empSearch || selectedEmp) return;
  //   setSuggestionsList(suggestions);
  // }, [suggestions, empSearch, selectedEmp]);

  // ✅ auto fill
  // useEffect(() => {
  //    if (!patientData) return;
  //    if (populatedUhidRef.current === selectedEmp) return;

  //    populatedUhidRef.current = selectedEmp;

  //    formik.setValues({
  //      ...formik.values,
  //      EmployeeId: patientData.employeeId || "",
  //      Name: patientData.name || "",
  //      Gender: patientData.gender || "",
  //      Age: patientData.age || "",
  //    });

  //  }, [patientData, selectedEmp]);
  const nextStep = useCallback(async () => {
    const errors = await formik.validateForm();

    // if (activeStep === 1 && !formik.values.EmployeeId) {
    //   healthAlerts.warning("Employee ID required");
    //   return;
    // }

    if (activeStep === 2 && Object.keys(errors).length > 0) {
      healthAlerts.warning("Fill required fields");
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
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-gray-200"
                  }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-blue-100 border border-gray-100 overflow-hidden">


          <div className="flex border-b mb-6">
            {[
              { id: 1, label: "Patient", icon: UserIcon },
              { id: 2, label: "History", icon: ClipboardDocumentListIcon },
              { id: 3, label: "Lifestyle", icon: UserIcon },
              { id: 4, label: "Confirm", icon: DocumentCheckIcon },
            ].map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(step.id)}
                className={`flex-1 py-4 flex items-center justify-center gap-2 ${activeStep === step.id
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
                  <PatientSelector formik={formik} />

                </section>
              )}




              {activeStep === 2 && (
                <section>
                  <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                    Medical Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <Input
                      label="Past Illness (Diabetes, etc.)"
                      {...formik.getFieldProps("past_illness")}
                      error={formik.touched.past_illness && formik.errors.past_illness}
                    />

                    <Input
                      label="Surgical History"
                      {...formik.getFieldProps("surgical_history")}
                    />

                    <Input
                      label="Family Medical History"
                      {...formik.getFieldProps("family_medical_history")}
                    />

                    <Input
                      label="Current Medications"
                      {...formik.getFieldProps("current_medications")}
                    />

                    <Input
                      label="Allergies"
                      {...formik.getFieldProps("allergies")}
                    />

                  </div>
                </section>
              )}


              {activeStep === 3 && (
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

                    <Select label="Tobacco Use" {...formik.getFieldProps("tobacco_use")}>
                      <option value="">Select</option>
                      <option>No</option>
                      <option>Occasionally</option>
                      <option>Regular</option>
                    </Select>

                  </div>
                </section>
              )}


              {activeStep === 4 && (
                <section>
                  <div className="bg-blue-50 p-6 rounded-xl space-y-2">
                    <p><b>Past Illness:</b> {formik.values.past_illness}</p>
                    <p><b>Medications:</b> {formik.values.current_medications}</p>
                    <p><b>Allergies:</b> {formik.values.allergies}</p>
                    <p><b>Smoking:</b> {formik.values.smoking_use}</p>
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

                {activeStep < 4 ? (
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