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
    useSaveOhcCombinedMutation,
    useGetOhcCombinedByIdQuery,
    useUpdateOhcCombinedMutation,
    useUploadLabReportMutation,
    useUploadRadiologyReportMutation,
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

    const [saveOhcCombined] =
        useSaveOhcCombinedMutation();

    const [updateOhcCombined] = useUpdateOhcCombinedMutation();
    const [uploadLabReport] = useUploadLabReportMutation();
    const [uploadRadiologyReport] = useUploadRadiologyReportMutation();
    const { data: editData } =
    useGetOhcCombinedByIdQuery(id, {
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
            packageName: "",
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
        onSubmit: async (
            values,
            { resetForm }
        ) => {

            try {              
                const uploadedLabTests =
                    await Promise.all(

                        bloodTestList.map(
                            async (test) => {

                                let report_url = "";

                                if (test.report_file) {

                                    const formData =
                                        new FormData();

                                    formData.append(
                                        "file",
                                        test.report_file
                                    );

                                    const uploadRes =
                                        await uploadLabReport(
                                            formData
                                        ).unwrap();

                                    report_url =
                                        uploadRes.path;
                                }

                                return {

                                    test_name:
                                        test.test_name,

                                    result_value:
                                        test.result_value,

                                    normal_range:
                                        test.normal_range,

                                    remarks:
                                        test.remarks,

                                    report_url,
                                };
                            }
                        )
                    );

                

                const uploadedRadiologyTests =
                    await Promise.all(

                        radiologyTestList.map(
                            async (test) => {

                                let report_url = "";

                                if (test.report_file) {

                                    const formData =
                                        new FormData();

                                    formData.append(
                                        "file",
                                        test.report_file
                                    );

                                    const uploadRes = await uploadRadiologyReport(
                                            formData
                                        ).unwrap();

                                    report_url =
                                        uploadRes.path;
                                }

                                return {

                                    test_type:
                test.test_type,
                    result_summary:test.result_summary,
                                    doctor_remarks:test.doctor_remarks,
                                    report_url,
                                };
                            }
                        )
                    );
                const payload = {
                    selected_package_name: [
                        values.packageName,],
                    blood_pressure_unit: {

                        systolic:values.bpsystolic,

                        diastolic:values.bpdiastolic,
                    },

                    pulse_unit: {pulse: values.pulserate,},

                    spo2_unit: {

                        spo2:values.spo2,
                    },

                    bmi_unit: {

                        bmi:values.bmi,
                    },

                    temperature_unit: {

                        temperature: values.temprature,
                    },

                   

                    patient: {
                        patient_id:values.patient_id,
                        employee_id:values.EmployeeId,
                        name: values.Name,
                        gender:values.Gender,
                        age:values.Age,
                    },
                    vitals: {
                        bpsystolic:values.bpsystolic,
                        bpdiastolic: values.bpdiastolic,
                        pulserate:values.pulserate,
                        spo2:values.spo2,
                        temperature:values.temprature,
                        height:values.height,
                        weight:values.weight,
                        bmi:values.bmi,
                        respiratory_rate:values.respiratoryRate,
                    },
                    clinical_examination: {
      general_appearance: values.generalAppearance,
      eye_examination: values.vision,
      ear: values.ear,
      nose: values.nose,
      throat: values.throat,
      cardiovascular_system: values.cardiovascular,
      respiratory_system: values.respiratory,
      abdomen: values.abdomen,
      nervous_system: values.nervousSystem,
      musculoskeletal_system: values.musculoskeletal,
      skin_condition: values.skin,
      color_blindness: values.colorBlindness,
                    },
        laboratory: {
  investigation_date: new Date(),
  remarks: "",
  tests: uploadedLabTests,   
},
radiology: {
  remarks: "",
  tests: uploadedRadiologyTests,
                    },
                };

                let res;
                if (isEditMode) {
                    res =
                        await updateOhcCombined({
                            id,
                            body: payload,
                        }).unwrap();
                } else {
                    res =
                        await saveOhcCombined(
                            payload
                        ).unwrap();
                }
                healthAlerts.success(
                    res.message ||
                    "Saved Successfully"
                );
                resetForm();
                navigate("/patient-examination-details", {
          state: { goToList: true },
        });
                setBloodTestList([]);
                setRadiologyTestList([]);
            } catch (error) {
                healthAlerts.error(
                    error?.data?.message ||
                    "Save Failed"
                );
            }
        }
    });
  useEffect(() => {
    if (!editData?.data) return;

    const v = editData.data;
    const patient = v.selected_test?.patient || {};
    const vitals = v.selected_test?.vitals || {};
    const clinical = v.selected_test?.clinical_examination || {};
    const lab = v.selected_test?.laboratory || {};
    const radiology = v.selected_test?.radiology || {};

  
    formik.setValues({
        patient_id: patient.patient_id || "",
        EmployeeId: patient.employee_id || "",
        Name: patient.name || "",
        Gender: patient.gender || "",
        Age: patient.age || "",

        bpsystolic: vitals.bpsystolic || "",
        bpdiastolic: vitals.bpdiastolic || "",
        pulserate: vitals.pulserate || "",
        spo2: vitals.spo2 || "",
        temprature: vitals.temperature || "",
        height: vitals.height || "",
        weight: vitals.weight || "",
        bmi: vitals.bmi || "",
        respiratoryRate: vitals.respiratory_rate || "",
        generalAppearance: clinical.general_appearance || "",
        vision: clinical.eye_examination || "",
        colorBlindness: clinical.color_blindness || "",
        ear: clinical.ear || "",
        nose: clinical.nose || "",
        throat: clinical.throat || "",
        cardiovascular: clinical.cardiovascular_system || "",
        respiratory: clinical.respiratory_system || "",
        abdomen: clinical.abdomen || "",
        nervousSystem: clinical.nervous_system || "",
        musculoskeletal: clinical.musculoskeletal_system || "",
        skin: clinical.skin_condition || "",
        testName: "",
        result: "",
        minRange: "",
        maxRange: "",
        remarks: "",
        labReportFile: null,
        testType: "",
        resultSummary: "",
        doctorRemarks: "",
        radiologyReportFile: null,
        packageName: v.selected_package_name?.[0] || "",
    });
    if (lab.tests?.length) {
        setBloodTestList(
            lab.tests.map((t) => ({
                test_name: t.test_name,
                result_value: t.result_value,
                normal_range: t.normal_range,
                remarks: t.remarks,
                report_file: null,
            }))
        );
    }

    
    if (radiology.tests?.length) {
        setRadiologyTestList(
            radiology.tests.map((t) => ({
                test_type: t.test_type,
                result_summary: t.result_summary,
                doctor_remarks: t.doctor_remarks,
                report_file: null,
            }))
        );
    }
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
                errors.throat ||
                errors.cardiovascular ||
                errors.respiratory ||
                errors.abdomen ||
                errors.nervousSystem ||
                errors.musculoskeletal ||
                errors.skin
            )
        ) {

            formik.setTouched({
                generalAppearance: true,
                vision: true,
                colorBlindness: true,
                ear: true,
                nose: true,
                throat: true,
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



        if (activeStep === 4) {

            if (bloodTestList.length === 0) {
                healthAlerts.warning("Add at least one blood test");
                return;
            }
        }


        if (activeStep === 5) {

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

    test_name: testName,

    result_value: result,

    normal_range:
        `${minRange} - ${maxRange}`,

    remarks,

    report_file:
        formik.values.labReportFile,
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
    const { testType, resultSummary, doctorRemarks } = formik.values;

    if (!testType || !resultSummary) {
        healthAlerts.warning("Test Type & Result Summary required");
        return;
    }

    setRadiologyTestList((prev) => [
        ...prev,
        {
            test_type: testType,
            result_summary: resultSummary, 
            doctor_remarks: doctorRemarks, 
            report_file: formik.values.radiologyReportFile,
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
                {[1, 2, 3, 4, 5, 6,].map((s) => (
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
                    // { id: 4, label: "Clinical Systems", icon: ClipboardDocumentCheckIcon },
                    { id: 4, label: "Laboratory", icon: BeakerIcon },
                    { id: 5, label: "Radiology", icon: CreditCardIcon },
                    // { id: 7, label: "Reports", icon: DocumentArrowUpIcon },
                    { id: 6, label: "Confirm", icon: DocumentCheckIcon },

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
                    <section className="space-y-6">

                        <PatientSelector formik={formik} />

                        <div className="grid md:grid-cols-2 gap-4">

                            <Select
                                label="Select Package"
                                // required
                                value={formik.values.packageName || ""}
                                onChange={(e) =>
                                    formik.setFieldValue("packageName", e.target.value)
                                }
                            >
                                <option value="">Select Package</option>
                                <option value="COUNSELLING">COUNSELLING</option>
                                <option value="ADVANCED">ADVANCED</option>
                                <option value="BASIC">BASIC</option>
                            </Select>

                        </div>

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

                        {/* General Appearance */}
                        <div>
                            <h3 className="text-sky-700 font-semibold mb-2">
                                General Appearance
                            </h3>

                            <Input
                                label="General Appearance"
                                required
                                {...formik.getFieldProps("generalAppearance")}
                                error={
                                    formik.touched.generalAppearance &&
                                    formik.errors.generalAppearance
                                }
                            />
                        </div>

                        {/* Eye Examination */}
                        <div>
                            <h3 className="text-sky-700 font-semibold mb-2">
                                Eye Examination
                            </h3>

                            <div className="grid md:grid-cols-2 gap-3">

                                <Input
                                    label="Vision"
                                    required
                                    error={
                                        formik.touched.vision &&
                                        formik.errors.vision
                                    }
                                    {...formik.getFieldProps("vision")}
                                />

                                <Select
                                    label="Color Blindness"
                                    required
                                    error={
                                        formik.touched.colorBlindness &&
                                        formik.errors.colorBlindness
                                    }
                                    {...formik.getFieldProps("colorBlindness")}
                                >
                                    <option value="">Select</option>
                                    <option>No</option>
                                    <option>Yes</option>
                                </Select>

                            </div>
                        </div>

                        <div>
                            <h3 className="text-sky-700 font-semibold mb-2">
                                ENT
                            </h3>

                            <div className="grid md:grid-cols-3 gap-3">

                                <Input
                                    label="Ear"
                                    required
                                    error={
                                        formik.touched.ear &&
                                        formik.errors.ear
                                    }
                                    {...formik.getFieldProps("ear")}
                                />

                                <Input
                                    label="Nose"
                                    required
                                    error={
                                        formik.touched.nose &&
                                        formik.errors.nose
                                    }
                                    {...formik.getFieldProps("nose")}
                                />

                                <Input
                                    label="Throat"
                                    required
                                    error={
                                        formik.touched.throat &&
                                        formik.errors.throat
                                    }
                                    {...formik.getFieldProps("throat")}
                                />

                            </div>
                        </div>

                        {/* System Examination */}
                        <div>
                            <h3 className="text-sky-700 font-semibold mb-4">
                                System Examination
                            </h3>

                            <div className="grid md:grid-cols-6 gap-4">

                                <Input
                                    label="Cardiovascular System"
                                    required
                                    error={
                                        formik.touched.cardiovascular &&
                                        formik.errors.cardiovascular
                                    }
                                    {...formik.getFieldProps("cardiovascular")}
                                />

                                <Input
                                    label="Respiratory System"
                                    required
                                    error={
                                        formik.touched.respiratory &&
                                        formik.errors.respiratory
                                    }
                                    {...formik.getFieldProps("respiratory")}
                                />

                                <Input
                                    label="Abdomen"
                                    required
                                    error={
                                        formik.touched.abdomen &&
                                        formik.errors.abdomen
                                    }
                                    {...formik.getFieldProps("abdomen")}
                                />

                                <Input
                                    label="Nervous System"
                                    required
                                    error={
                                        formik.touched.nervousSystem &&
                                        formik.errors.nervousSystem
                                    }
                                    {...formik.getFieldProps("nervousSystem")}
                                />

                                <Input
                                    label="Musculoskeletal System"
                                    required
                                    error={
                                        formik.touched.musculoskeletal &&
                                        formik.errors.musculoskeletal
                                    }
                                    {...formik.getFieldProps("musculoskeletal")}
                                />

                                <Input
                                    label="Skin Condition"
                                    required
                                    error={
                                        formik.touched.skin &&
                                        formik.errors.skin
                                    }
                                    {...formik.getFieldProps("skin")}
                                />

                            </div>
                        </div>

                    </section>
                )}



                {activeStep === 4 && (
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
                            <div className="flex items-center gap-3 mt-1">

                                <label
                                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2
    rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100
    text-sky-700 text-sm font-medium transition"
                                >
                                    <DocumentArrowUpIcon className="w-5 h-5" />

                                    Upload Report

                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                "labReportFile",
                                                e.target.files[0]
                                            )
                                        }
                                    />
                                </label>

                                <span className="text-sm text-gray-500 truncate max-w-[180px]">
                                    {formik.values.labReportFile
                                        ? formik.values.labReportFile.name
                                        : "No file selected"}
                                </span>

                            </div>
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
        <td className="px-4 py-3">{t.test_name}</td>   
        <td className="px-4 py-3">{t.result_value}</td> 
        <td className="px-4 py-3">{t.normal_range}</td> 
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

                {activeStep === 5 && (
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
                            <div className="flex items-center gap-3 mt-1">

                                <label
                                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2
    rounded-xl border border-sky-200 bg-sky-50 hover:bg-sky-100
    text-sky-700 text-sm font-medium transition"
                                >
                                    <DocumentArrowUpIcon className="w-5 h-5" />

                                    Upload Report

                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) =>
                                            formik.setFieldValue(
                                                "radiologyReportFile",
                                                e.target.files[0]
                                            )
                                        }
                                    />
                                </label>

                                <span className="text-sm text-gray-500 truncate max-w-[180px]">
                                    {formik.values.radiologyReportFile
                                        ? formik.values.radiologyReportFile.name
                                        : "No file selected"}
                                </span>

                            </div>
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
        <td className="p-3">{t.test_type}</td>         
        <td className="p-3">{t.result_summary}</td>    
        <td className="p-3">{t.doctor_remarks}</td>    
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
                

               {activeStep === 6 && (
  <section>

    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-sky-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">

        <h2 className="text-3xl font-bold">
          Final Preview
        </h2>

        <p className="text-sky-100 mt-1">
          Verify all patient examination details before save
        </p>

      </div>

      {/* PATIENT DETAILS */}
      <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">

        <div className="bg-sky-50 px-5 py-3 border-b border-sky-100">
          <h3 className="font-semibold text-sky-700 text-lg">
            Patient Details
          </h3>
        </div>

        <div className="grid md:grid-cols-4 gap-4 p-5">

          <div>
            <p className="text-xs text-gray-500">
              Patient Name
            </p>

            <p className="font-semibold text-slate-700">
              {formik.values.Name || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Gender
            </p>

            <p className="font-semibold text-slate-700">
              {formik.values.Gender || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Age
            </p>

            <p className="font-semibold text-slate-700">
              {formik.values.Age || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Employee ID
            </p>

            <p className="font-semibold text-slate-700">
              {formik.values.EmployeeId || "-"}
            </p>
          </div>

        </div>

      </div>

      {/* VITALS */}
      <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">

        <div className="bg-sky-50 px-5 py-3 border-b border-sky-100">
          <h3 className="font-semibold text-sky-700 text-lg">
            Vitals
          </h3>
        </div>

        <div className="grid md:grid-cols-4 gap-4 p-5">

          <div>
            <p className="text-xs text-gray-500">BP</p>

            <p className="font-semibold">
              {formik.values.bpsystolic}/
              {formik.values.bpdiastolic}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Pulse</p>

            <p className="font-semibold">
              {formik.values.pulserate}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">SPO2</p>

            <p className="font-semibold">
              {formik.values.spo2}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Temperature</p>

            <p className="font-semibold">
              {formik.values.temprature}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Height</p>

            <p className="font-semibold">
              {formik.values.height}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Weight</p>

            <p className="font-semibold">
              {formik.values.weight}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">BMI</p>

            <p className="font-semibold">
              {formik.values.bmi}
            </p>
          </div>

        </div>

      </div>

      {/* CLINICAL */}
      <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">

        <div className="bg-sky-50 px-5 py-3 border-b border-sky-100">
          <h3 className="font-semibold text-sky-700 text-lg">
            Clinical Examination
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4 p-5">

          <div>
            <p className="text-xs text-gray-500">
              General Appearance
            </p>

            <p className="font-semibold">
              {formik.values.generalAppearance}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Vision
            </p>

            <p className="font-semibold">
              {formik.values.vision}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Color Blindness
            </p>

            <p className="font-semibold">
              {formik.values.colorBlindness}
            </p>
          </div>

        </div>

      </div>

      {/* LAB TEST */}
      <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">

        <div className="bg-sky-50 px-5 py-3 border-b border-sky-100">
          <h3 className="font-semibold text-sky-700 text-lg">
            Laboratory Tests
          </h3>
        </div>

        <div className="p-5 space-y-3">

          {bloodTestList.map((t, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 bg-slate-50"
            >

              <div className="grid md:grid-cols-4 gap-4">

                <div>
                  <p className="text-xs text-gray-500">
                    Test Name
                  </p>

                  <p className="font-semibold">
                    {t.test_name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Result
                  </p>

                  <p className="font-semibold">
                    {t.result_value}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Range
                  </p>

                  <p className="font-semibold">
                    {t.normal_range}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Remarks
                  </p>

                  <p className="font-semibold">
                    {t.remarks}
                  </p>
                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

      {/* RADIOLOGY */}
      <div className="bg-white border border-sky-100 rounded-2xl shadow-sm overflow-hidden">

        <div className="bg-sky-50 px-5 py-3 border-b border-sky-100">
          <h3 className="font-semibold text-sky-700 text-lg">
            Radiology Tests
          </h3>
        </div>

        <div className="p-5 space-y-3">

          {radiologyTestList.map((t, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 bg-slate-50"
            >

              <div className="grid md:grid-cols-3 gap-4">

                <div>
                  <p className="text-xs text-gray-500">
                    Test Type
                  </p>

                  <p className="font-semibold">
                    {t.test_type}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Result
                  </p>

                  <p className="font-semibold">
                    {t.result_summary}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Doctor Remarks
                  </p>

                  <p className="font-semibold">
                    {t.doctor_remarks}
                  </p>
                </div>

              </div>

            </div>
          ))}

        </div>

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
                    {activeStep < 6 ? (
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
