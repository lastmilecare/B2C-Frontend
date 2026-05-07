import React, { useState, useEffect, useRef, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowPathIcon,
  UserIcon,
  ClipboardDocumentIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
  useCreateVitalsMutation,
  useUpdateVitalsMutation,
  useGetVitalsByIdQuery
} from "../redux/apiSlice";

import { healthAlerts } from "../utils/healthSwal";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Button, baseInput } from "../components/FormControls";
import PatientSelector from "../components/common/PatientSelector";
const VitalsForm = () => {
  const [activeStep, setActiveStep] = useState(1);
  // const [empSearch, setEmpSearch] = useState("");
  // const [selectedEmp, setSelectedEmp] = useState("");
  // const [suggestionsList, setSuggestionsList] = useState([]);
  // const populatedUhidRef = useRef("");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [createVitals] = useCreateVitalsMutation();
  const [updateVitals] = useUpdateVitalsMutation();

  const { data: editData } = useGetVitalsByIdQuery(id, {
    skip: !id,
  });
  // const { data: patientData } = useGetPatientByEmployeeIdQuery(
  // selectedEmp ? selectedEmp : skipToken
  // );
  // const { data: suggestions = [] } = useSearchEmployeeQuery(empSearch, {
  // skip: empSearch.length < 1,
  // });
  const formik = useFormik({
    initialValues: {
      patient_id: "",
      EmployeeId: "",
      Name: "",
      Gender: "",
      Age: "",
      bpsystolic: "",
      bpdiastolic: "",
      pulserate: "",
      spo2: "",
      temprature: "",
      height: "",
      weight: "",
      bmi: "",
      respiratoryRate: "",
    },
    validationSchema: Yup.object({
      patient_id: Yup.string().required("Patient is required"),

      bpsystolic: Yup.number()
        .required("BP Systolic required")
        .min(70, "Too low for systolic BP")
        .max(250, "Too high for systolic BP"),

      bpdiastolic: Yup.number()
        .required("BP Diastolic required")
        .min(40, "Too low for diastolic BP")
        .max(150, "Too high for diastolic BP"),

      pulserate: Yup.number()
        .required("Pulse required")
        .min(30, "Pulse too low")
        .max(220, "Pulse too high"),

      spo2: Yup.number()
        .required("SPO2 required")
        .min(70, "Critically low SpO₂")
        .max(100, "Invalid SpO₂ value"),

      temprature: Yup.number()
        .required("Temperature required")
        .min(35, "Hypothermia risk")
        .max(42, "Dangerously high temperature"),

      height: Yup.number()
        .required("Height required")
        .min(30, "Invalid height")
        .max(250, "Invalid height"),

      weight: Yup.number()
        .required("Weight required")
        .min(2, "Invalid weight")
        .max(300, "Invalid weight"),

      respiratoryRate: Yup.number()
        .required("Respiratory Rate required")
        .min(5)
        .max(60),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          employee_id: values.EmployeeId,
          patient_id: values.patient_id,
          name: values.Name,
          gender: values.Gender,
          age: Number(values.Age),

          bpsystolic: Number(values.bpsystolic),
          bpdiastolic: Number(values.bpdiastolic),
          pulserate: Number(values.pulserate),
          spo2: Number(values.spo2),

          temperature: Number(values.temprature),
          height: Number(values.height),
          weight: Number(values.weight),
          bmi: Number(values.bmi),
          respiratory_rate: Number(values.respiratoryRate),
        };

        let res;

        if (isEditMode) {
          res = await updateVitals({
            id,
            body: payload,
          }).unwrap();
        } else {
          res = await createVitals(payload).unwrap();
        }

        healthAlerts.success(
          res.message || "Vitals saved successfully"
        );

        resetForm();

        navigate("/vitals", {
          state: { goToList: true },
        });

      } catch (error) {
        healthAlerts.error(
          error?.data?.message || "Save failed"
        );
      }
    }
  });
  useEffect(() => {
    console.log(editData);
    if (!editData?.data) return;

    const v = editData.data;

    formik.setValues({
      EmployeeId: v.employee_id || "",
      Name: v.name || "",
      Gender: v.gender || "",
      Age: v.age || "",

      bpsystolic: v.bpsystolic || "",
      bpdiastolic: v.bpdiastolic || "",
      pulserate: v.pulserate || "",
      spo2: v.spo2 || "",

      temprature: v.temperature || "",
      height: v.height || "",
      weight: v.weight || "",
      bmi: v.bmi || "",
      respiratoryRate: v.respiratory_rate || "",
      patient_id: v.patient_id || "",
    });

  }, [editData]);

  const bmiValue = useMemo(() => {
    const h = Number(formik.values.height);
    const w = Number(formik.values.weight);
    if (h > 0 && w > 0) {
      return (w / ((h / 100) * (h / 100))).toFixed(2);
    }
    return "";
  }, [formik.values.height, formik.values.weight]);
  useEffect(() => {
    formik.setFieldValue("bmi", bmiValue);
  }, [bmiValue]);
  // useEffect(() => {
  //   if (!empSearch || selectedEmp) return;
  //   setSuggestionsList(suggestions);
  // }, [suggestions, empSearch, selectedEmp]);
  // useEffect(() => {
  // if (!patientData) return;
  // if (patientData.ID !== selectedEmp) return;
  // if (populatedUhidRef.current === selectedBill) return;
  // populatedUhidRef.current = selectedBill;
  // formik.setValues({
  //   ...formik.values,
  //   UHID: patientData.PicasoNo || "",
  //   Name: patientData.driverDetails[0]?.name || "",
  //   Gender: patientData.driverDetails[0]?.gender || "",
  //   Mobile: patientData.Mobile || "",
  //   FinCategory: patientData.driverDetails[0]?.category || "",
  //   Age: patientData.driverDetails[0]?.age || "",
  //   billno: selectedBill,
  // });
  // }, [patientData, selectedBill]);
  // useEffect(() => {
  //   if (!patientData) return;
  //   if (populatedUhidRef.current === selectedEmp) return;

  //   populatedUhidRef.current = selectedEmp;

  //   formik.setValues({
  //     ...formik.values,
  //     EmployeeId: patientData.employeeId || "",
  //     Name: patientData.name || "",
  //     Gender: patientData.gender || "",
  //     Age: patientData.age || "",
  //   });

  // }, [patientData, selectedEmp]);

  const nextStep = async () => {
    const errors = await formik.validateForm();


    if (activeStep === 2 && Object.keys(errors).length > 0) {

      formik.setTouched({
        bpsystolic: true,
        bpdiastolic: true,
        pulserate: true,
        spo2: true,
        temprature: true,
        height: true,
        weight: true,
        respiratoryRate: true,
      });

      const firstError = Object.values(errors)[0];

      healthAlerts.warning(firstError);

      return;
    }

    if (activeStep === 2 && Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      healthAlerts.warning(firstError);
      return;
    }

    setActiveStep((prev) => prev + 1);


  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  return (<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10"> <div className="max-w-[1400px] mx-auto px-8">


    <div className="flex justify-between items-center mb-10">
      <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
        <span className="bg-blue-100 p-2 rounded-xl">
          <ClipboardDocumentIcon className="w-6 text-blue-600" />
        </span>
        Vitals Form
      </h1>

      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-blue-100"
              }`}
          />
        ))}
      </div>
    </div>

    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

      <div className="flex border-b">
        {[
          { id: 1, label: "Patient", icon: UserIcon },
          { id: 2, label: "Vitals", icon: ClipboardDocumentIcon },
          { id: 3, label: "Confirm", icon: DocumentCheckIcon },
        ].map((step) => (
          <button
            key={step.id}
            type="button"
            disabled
            className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold
            ${activeStep === step.id
                ? "bg-white text-sky-600 shadow"
                : "text-gray-400"}`}
          >
            <step.icon className="w-4 h-4" />
            {step.label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="space-y-8 p-9"
      >

        {activeStep === 1 && (
          <section>
            <PatientSelector formik={formik} />

          </section>
        )}

        {activeStep === 2 && (
          <section>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">

              <Input
                label="BP Systolic"
                required
                error={
                  formik.touched.bpsystolic &&
                  formik.errors.bpsystolic
                }
                {...formik.getFieldProps("bpsystolic")}
              />
              <Input
                label="BP Diastolic"
                required
                error={
                  formik.touched.bpdiastolic &&
                  formik.errors.bpdiastolic
                }
                {...formik.getFieldProps("bpdiastolic")}
              />
              <Input
                label="Pulse"
                required
                error={
                  formik.touched.pulserate &&
                  formik.errors.pulserate
                }
                {...formik.getFieldProps("pulserate")}
              />
              <Input
                label="SPO2"
                required
                error={
                  formik.touched.spo2 &&
                  formik.errors.spo2
                }
                {...formik.getFieldProps("spo2")}
              />
              <Input
                label="Temperature"
                required
                error={
                  formik.touched.temprature &&
                  formik.errors.temprature
                }
                {...formik.getFieldProps("temprature")}
              />
              <Input
                label="Height (cm)"
                required
                error={
                  formik.touched.height &&
                  formik.errors.height
                }
                {...formik.getFieldProps("height")}
              />
              <Input
                label="Weight (kg)"
                required
                error={
                  formik.touched.weight &&
                  formik.errors.weight
                }
                {...formik.getFieldProps("weight")}
              />
              <Input label="BMI" value={formik.values.bmi} readOnly className="bg-sky-50" />
              <Input
                label="Respiratory Rate"
                required
                error={
                  formik.touched.respiratoryRate &&
                  formik.errors.respiratoryRate
                }
                {...formik.getFieldProps("respiratoryRate")}
              />

            </div>
          </section>
        )}

        {activeStep === 3 && (
          <section>
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">

              <h3 className="text-lg font-semibold text-sky-600">
                VITALS PREVIEW
              </h3>

              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <p><b>Name:</b> {formik.values.Name}</p>
                <p><b>Gender:</b> {formik.values.Gender}</p>
                <p><b>Age:</b> {formik.values.Age}</p>
                <p><b> patient_id:</b> {formik.values.patient_id}</p>
              </div>

              <div className="border-t pt-3 text-sm">
                <p><b>BP Systolic:</b> {formik.values.bpsystolic}</p>
                <p><b>BP Diastolic:</b> {formik.values.bpdiastolic}</p>
              </div>


              <div className="border-t pt-3 text-sm">
                <p><b>Pulse:</b> {formik.values.pulserate}</p>
                <p><b>SPO2:</b> {formik.values.spo2}</p>
              </div>


              <div className="border-t pt-3 text-sm">
                <p>
                  <b>BMI:</b>{formik.values.bmi}

                </p>
              </div>


              <div className="border-t pt-3 text-sm">
                <p><b>Respiratory Rate:</b> {formik.values.respiratoryRate}</p>
              </div>

            </div>
          </section>
        )}

        <div className="flex justify-between items-center pt-6 border-t border-gray-100">


          <div className="flex gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
              >
                Back
              </button>
            )}

            <button
              type="button"
              onClick={formik.handleReset}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition flex items-center gap-1"
            >
              Reset
            </button>
          </div>

          {/* RIGHT SIDE */}
          {activeStep < 3 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                nextStep();
              }}
              className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                formik.handleSubmit();
              }}
              className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition"
            >
              Save
            </button>
          )}
        </div>

      </form>
    </div>
  </div>
  </div>


  );
};

export default VitalsForm;
