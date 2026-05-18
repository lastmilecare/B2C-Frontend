import React, { useState, useEffect, useRef, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    ArrowPathIcon,
    UserIcon,
    ClipboardDocumentIcon,
    ClipboardDocumentCheckIcon,
    BeakerIcon,
    CreditCardIcon,
    DocumentArrowUpIcon,
    DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
    useCreateVitalsMutation,
    useUpdateVitalsMutation,
    useGetVitalsByIdQuery
} from "../redux/apiSlice";

import { healthAlerts } from "../utils/healthSwal";
import { useNavigate, useParams } from "react-router-dom";
import { Input, Select, Button, baseInput } from "../components/FormControls";
import PatientSelector from "../components/common/PatientSelector";
import { PlusIcon } from "@heroicons/react/24/solid";
const PatientExaminationDetails = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [bloodTestList, setBloodTestList] = useState([]);
    const [radiologyTestList, setRadiologyTestList] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [createVitals] = useCreateVitalsMutation();
    const [updateVitals] = useUpdateVitalsMutation();

    const { data: editData } = useGetVitalsByIdQuery(id, {
        skip: !id,
    });
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
            // clinical examination 
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
            // lab investigation 
            testName: "",
            result: "",
            minRange: "",
            maxRange: "",
            remarks: "",
            labReportFile: null,
            // radiology
            testType: "",
            resultSummary: "",
            doctorRemarks: "",
            radiologyReportFile: null,
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

            generalAppearance: Yup.string()
                .required("General Appearance required"),

            vision: Yup.string()
                .required("Vision required"),

            colorBlindness: Yup.string()
                .required("Color blindness required"),

            ear: Yup.string()
                .required("Ear required"),

            nose: Yup.string()
                .required("Nose required"),

            throat: Yup.string()
                .required("Throat required"),

            cardiovascular: Yup.string()
                .required("Cardio required"),

            respiratory: Yup.string()
                .required("Respiratory required"),

            abdomen: Yup.string()
                .required("Abdomen required"),

            nervousSystem: Yup.string()
                .required("Nervous system required"),

            musculoskeletal: Yup.string()
                .required("Musculoskeletal required"),

            skin: Yup.string()
                .required("Skin condition required"),

        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                const payload = {

                    patient: {
                        patient_id: values.patient_id,
                        employee_id: values.EmployeeId,
                        name: values.Name,
                        gender: values.Gender,
                        age: values.Age,
                    },

                    vitals: {
                        bpsystolic: values.bpsystolic,
                        bpdiastolic: values.bpdiastolic,
                        pulserate: values.pulserate,
                        spo2: values.spo2,
                        temperature: values.temprature,
                        height: values.height,
                        weight: values.weight,
                        bmi: values.bmi,
                        respiratory_rate: values.respiratoryRate,
                    },

                    clinical_examination: {
                        generalAppearance: values.generalAppearance,
                        vision: values.vision,
                        colorBlindness: values.colorBlindness,
                        ear: values.ear,
                        nose: values.nose,
                        throat: values.throat,
                        cardiovascular: values.cardiovascular,
                        respiratory: values.respiratory,
                        abdomen: values.abdomen,
                        nervousSystem: values.nervousSystem,
                        musculoskeletal: values.musculoskeletal,
                        skin: values.skin,
                    },

                    laboratory: bloodTestList,

                    radiology: radiologyTestList,
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
   const nextStep = async () => {

  const errors = await formik.validateForm();

  if (activeStep === 1 && !formik.values.Name) {

    healthAlerts.warning("Name is required");
    return;
  }
  if (
    activeStep === 2 &&
    (
      errors.bpsystolic ||
      errors.bpdiastolic ||
      errors.pulserate ||
      errors.spo2 ||
      errors.temprature ||
      errors.height ||
      errors.weight ||
      errors.respiratoryRate
    )
  ) {

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
  if (
    activeStep === 3 &&
    (
      errors.generalAppearance ||
      errors.vision ||
      errors.colorBlindness ||
      errors.ear ||
      errors.nose ||
      errors.throat
    )
  ) {

    formik.setTouched({
      generalAppearance: true,
      vision: true,
      colorBlindness: true,
      ear: true,
      nose: true,
      throat: true,
    });

    const firstError = Object.values(errors)[0];

    healthAlerts.warning(firstError);

    return;
  }

  if (
    activeStep === 4 &&
    (
      errors.cardiovascular ||
      errors.respiratory ||
      errors.abdomen ||
      errors.nervousSystem ||
      errors.musculoskeletal ||
      errors.skin
    )
  ) {

    formik.setTouched({
      cardiovascular: true,
      respiratory: true,
      abdomen: true,
      nervousSystem: true,
      musculoskeletal: true,
      skin: true,
    });

    const firstError = Object.values(errors)[0];

    healthAlerts.warning(firstError);

    return;
  }

  if (activeStep === 5) {

    if (bloodTestList.length === 0) {
      healthAlerts.warning("Add at least one blood test");
      return;
    }
  }


  if (activeStep === 6) {

    if (radiologyTestList.length === 0) {
      healthAlerts.warning("Add at least one radiology test");
      return;
    }
  }

  setActiveStep((prev) => prev + 1);
};

    const prevStep = () => setActiveStep((prev) => prev - 1);
    const handleAddLabTest = () => {
        const {
            testName,
            result,
            minRange,
            maxRange,
            remarks,
        } = formik.values;

        if (!testName || !result) {
            healthAlerts.warning("Test Name & Result required");
            return;
        }

        const newTest = {
            name: testName,
            result,
            min: minRange,
            max: maxRange,
            remarks,
        };

        setBloodTestList((prev) => [...prev, newTest]);

        formik.setFieldValue("testName", "");
        formik.setFieldValue("result", "");
        formik.setFieldValue("minRange", "");
        formik.setFieldValue("maxRange", "");
        formik.setFieldValue("remarks", "");
    };
    const handleDeleteLabTest = (index) => {
        setBloodTestList((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };
    const handleAddRadiologyTest = () => {
        const {
            testType,
            resultSummary,
            doctorRemarks,
        } = formik.values;

        if (!testType || !resultSummary) {
            healthAlerts.warning(
                "Test Type & Result Summary required"
            );
            return;
        }

        setRadiologyTestList((prev) => [
            ...prev,
            {
                testType,
                resultSummary,
                doctorRemarks,
            },
        ]);

        formik.setFieldValue("testType", "");
        formik.setFieldValue("resultSummary", "");
        formik.setFieldValue("doctorRemarks", "");
    };
    const handleDeleteRadiologyTest = (index) => {
        setRadiologyTestList((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10"> <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <span className="bg-blue-100 p-2 rounded-xl">
                    <ClipboardDocumentIcon className="w-6 text-blue-600" />
                </span>
                Patient Examination Details
            </h1>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
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
                    { id: 3, label: "Clinical", icon: ClipboardDocumentCheckIcon },
                    { id: 4, label: "Clinical Systems", icon: ClipboardDocumentCheckIcon },
                    { id: 5, label: "Laboratory", icon: BeakerIcon },
                    { id: 6, label: "Radiology", icon: CreditCardIcon },
                    { id: 7, label: "Reports", icon: DocumentArrowUpIcon },
                    { id: 8, label: "Confirm", icon: DocumentCheckIcon },

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
                    <section className="space-y-6">


                        <div>
                            <h3 className="text-sky-700 font-semibold mb-2">General Appearance</h3>
                            <Input
                                label="General Appearance "
                                required
                                {...formik.getFieldProps("generalAppearance")}
                                error={formik.touched.generalAppearance && formik.errors.generalAppearance}
                            />
                        </div>

                        <div>
                            <h3 className="text-sky-700 font-semibold mb-2">Eye Examination</h3>

                            <div className="grid md:grid-cols-2 gap-3">
                                <Input label="Vision " required error={formik.touched.vision && formik.errors.vision}{...formik.getFieldProps("vision")} />
                                <Select label="Color Blindness" required error={formik.touched.colorBlindness && formik.errors.colorBlindness} {...formik.getFieldProps("colorBlindness")}>
                                    <option value="">Select</option>
                                    <option>No</option>
                                    <option>Yes</option>
                                </Select>
                            </div>
                        </div>


                        <div>
                            <h3 className="text-sky-700 font-semibold mb-2">ENT</h3>
                            <div className="grid md:grid-cols-3 gap-3">
                                <Input label="Ear" required error={formik.touched.ear && formik.errors.ear} {...formik.getFieldProps("ear")} />
                                <Input label="Nose" required error={formik.touched.nose && formik.errors.nose} {...formik.getFieldProps("nose")} />
                                <Input label="Throat" required error={formik.touched.throat && formik.errors.throat} {...formik.getFieldProps("throat")} />
                            </div>
                        </div>

                    </section>
                )}

                {activeStep === 4 && (
                    <section>
                        <h3 className="text-sky-700 font-semibold mb-4">System Examination</h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <Input label="Cardiovascular System " required error={formik.touched.cardiovascular && formik.errors.cardiovascular} {...formik.getFieldProps("cardiovascular")} />
                            <Input label="Respiratory System " required error={formik.touched.respiratory && formik.errors.respiratory} {...formik.getFieldProps("respiratory")} />
                            <Input label="Abdomen " required error={formik.touched.abdomen && formik.errors.abdomen} {...formik.getFieldProps("abdomen")} />
                            <Input label="Nervous System " required error={formik.touched.nervousSystem && formik.errors.nervousSystem} {...formik.getFieldProps("nervousSystem")} />
                            <Input label="Musculoskeletal System " required error={formik.touched.musculoskeletal && formik.errors.musculoskeletal} {...formik.getFieldProps("musculoskeletal")} />
                            <Input label="Skin Condition " required error={formik.touched.skin && formik.errors.skin} {...formik.getFieldProps("skin")} />
                        </div>
                    </section>
                )}

                {activeStep === 5 && (
                    <section>
                        <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                            Blood Test
                        </h3>

                        <div className="grid md:grid-cols-3 gap-8">

                            <Select
                                label="Select Test"
                                required
                                error={formik.touched.testName && formik.errors.testName}
                                value={formik.values.testName}
                                onChange={(e) =>
                                    formik.setFieldValue("testName", e.target.value)
                                }
                            >
                                <option value="">Select Test</option>
                                <option>Hemoglobin</option>
                                <option>CBC</option>
                                <option>Blood Sugar</option>
                                <option>Urine Analysis</option>
                                <option>Lipid Profile</option>
                                <option>LFT</option>
                                <option>KFT</option>
                            </Select>

                            <Input label="Result" required error={formik.touched.result && formik.errors.result} {...formik.getFieldProps("result")} />
                            <Input label="Min Range" {...formik.getFieldProps("minRange")} />
                            <Input label="Max Range" {...formik.getFieldProps("maxRange")} />
                            <Input label="Remarks" {...formik.getFieldProps("remarks")} />
                        </div>


                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={handleAddLabTest}
                                className="h-9 w-9 flex items-center justify-center rounded-full
                    bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>


                        {bloodTestList.length > 0 && (
                            <div className="mt-6 bg-white rounded-xl shadow-sm border border-sky-100">
                                <div className="px-4 py-3 border-b border-sky-100">
                                    <h2 className="text-sky-700 font-semibold text-sm">
                                        Added Tests
                                    </h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-sky-50 text-sky-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Test</th>
                                                <th className="px-4 py-3 text-left">Result</th>
                                                <th className="px-4 py-3 text-left">Range</th>
                                                <th className="px-4 py-3 text-left">Remarks</th>
                                                <th className="px-4 py-3 text-left">Action</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {bloodTestList.map((t, i) => (
                                                <tr key={i} className="border-t">
                                                    <td className="px-4 py-3">{t.name}</td>
                                                    <td className="px-4 py-3">{t.result}</td>
                                                    <td className="px-4 py-3">
                                                        {t.min} - {t.max}
                                                    </td>
                                                    <td className="px-4 py-3">{t.remarks}</td>

                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteLabTest(i)}
                                                            className="text-red-400 hover:text-red-600 font-semibold"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {activeStep === 6 && (
                    <section>
                        <h3 className="text-lg font-semibold text-sky-700 mb-4 flex gap-2">
                            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                            Radiology Tests
                        </h3>

                        <div className="grid md:grid-cols-3 gap-6">
                            <Select
                                label="Test Type"
                                required
                                error={formik.touched.testType && formik.errors.testType}
                                value={formik.values.testType}
                                onChange={(e) =>
                                    formik.setFieldValue("testType", e.target.value)
                                }
                            >
                                <option value="">Select Test</option>
                                <option>Chest X-ray</option>
                                <option>ECG</option>
                                <option>Audiometry</option>
                                <option>Spirometry</option>
                                <option>Vision Test</option>
                            </Select>

                            <Input label="Result Summary" required error={formik.touched.resultSummary && formik.errors.resultSummary} {...formik.getFieldProps("resultSummary")} />
                            <Input label="Doctor Remarks" {...formik.getFieldProps("doctorRemarks")} />
                        </div>


                        <div className="mt-4">
                            <button
                                type="button"
                                onClick={handleAddRadiologyTest}
                                className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-600 text-white"
                            >
                                <PlusIcon className="h-5 w-5" />
                            </button>
                        </div>


                        {radiologyTestList.length > 0 && (
                            <div className="mt-6 border rounded-xl overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-sky-50 text-sky-700">
                                        <tr>
                                            <th className="p-3 text-left">Test</th>
                                            <th className="p-3 text-left">Result</th>
                                            <th className="p-3 text-left">Remarks</th>
                                            <th className="p-3 text-center">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {radiologyTestList.map((t, i) => (
                                            <tr key={i} className="border-t">
                                                <td className="p-3">{t.testType}</td>
                                                <td className="p-3">{t.resultSummary}</td>
                                                <td className="p-3">{t.doctorRemarks}</td>
                                                <td className="p-3 text-center">
                                                    <button
                                                        onClick={() =>
                                                            setRadiologyTestList((prev) =>
                                                                prev.filter((_, idx) => idx !== i)
                                                            )
                                                        }
                                                        className="text-red-500"
                                                    >
                                                        ❌
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
                {activeStep === 7 && (
                    <section>

                        <div className="grid md:grid-cols-2 gap-8">

                            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-sky-700 mb-4">
                                    Laboratory Report
                                </h3>

                                <input
                                    type="file"
                                    onChange={(e) =>
                                        formik.setFieldValue(
                                            "labReportFile",
                                            e.target.files[0]
                                        )
                                    }
                                />
                            </div>

                            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-sky-700 mb-4">
                                    Radiology Report
                                </h3>

                                <input
                                    type="file"
                                    onChange={(e) =>
                                        formik.setFieldValue(
                                            "radiologyReportFile",
                                            e.target.files[0]
                                        )
                                    }
                                />
                            </div>

                        </div>

                    </section>
                )}

                {activeStep === 8 && (
                    <section>
                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-6">

                            <h3 className="text-2xl font-bold text-sky-700">
                                FINAL PREVIEW
                            </h3>

                            <div>
                                <h4 className="font-semibold text-sky-600 mb-2">
                                    Patient Details
                                </h4>

                                <div className="grid md:grid-cols-2 gap-2 text-sm">
                                    <p><b>Name:</b> {formik.values.Name}</p>
                                    <p><b>Gender:</b> {formik.values.Gender}</p>
                                    <p><b>Age:</b> {formik.values.Age}</p>
                                    <p><b>Patient ID:</b> {formik.values.patient_id}</p>
                                </div>
                            </div>

                      
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-sky-600 mb-2">
                                    Vitals
                                </h4>

                                <div className="grid md:grid-cols-3 gap-2 text-sm">
                                    <p><b>BP:</b> {formik.values.bpsystolic}/{formik.values.bpdiastolic}</p>
                                    <p><b>Pulse:</b> {formik.values.pulserate}</p>
                                    <p><b>SPO2:</b> {formik.values.spo2}</p>
                                    <p><b>Temperature:</b> {formik.values.temprature}</p>
                                    <p><b>BMI:</b> {formik.values.bmi}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-sky-600 mb-2">
                                    Laboratory Tests
                                </h4>

                                {bloodTestList.map((t, i) => (
                                    <div key={i} className="text-sm mb-2">
                                        <p><b>Test:</b> {t.name}</p>
                                        <p><b>Result:</b> {t.result}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-sky-600 mb-2">
                                    Radiology Tests
                                </h4>

                                {radiologyTestList.map((t, i) => (
                                    <div key={i} className="text-sm mb-2">
                                        <p><b>Test:</b> {t.testType}</p>
                                        <p><b>Result:</b> {t.resultSummary}</p>
                                    </div>
                                ))}
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
                            onClick={() => {
                                formik.resetForm();
                                setBloodTestList([]);
                                setRadiologyTestList([]);
                                setActiveStep(1);
                            }}
                            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 transition flex items-center gap-1"
                        >
                            Reset
                        </button>
                    </div>

                    {/* RIGHT SIDE */}
                    {activeStep < 8 ? (
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

export default PatientExaminationDetails;
