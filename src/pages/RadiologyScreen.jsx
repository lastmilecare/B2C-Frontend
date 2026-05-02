import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import {
    ArrowPathIcon,
    UserIcon,
    CreditCardIcon,
    DocumentCheckIcon,
    BeakerIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon } from "@heroicons/react/24/solid";
import {
    useCreateRadiologyMutation,
    useUploadRadiologyFileMutation,
    useGetRadiologyByIdQuery,
    useUpdateRadiologyMutation
} from "../redux/apiSlice";
import { healthAlerts } from "../utils/healthSwal";
import { Input, Select, Button, baseInput } from "../components/FormControls";
import { useNavigate } from "react-router-dom";
import PatientSelector from "../components/common/PatientSelector";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
const RadiologyScreen = () => {
    const [activeStep, setActiveStep] = useState(1);

    const [testList, setTestList] = useState([]);
    const navigate = useNavigate();
    const [createRadiology] = useCreateRadiologyMutation();
    const [uploadFile] = useUploadRadiologyFileMutation();
    const { id } = useParams();

    const { data: editData } = useGetRadiologyByIdQuery(id, {
        skip: !id,
    });

    const [updateRadiology] = useUpdateRadiologyMutation();

    const formik = useFormik({
        initialValues: {
            EmployeeId: "",
            patient_id: "",
            Name: "",
            Gender: "",
            Age: "",
            testType: "",
            resultSummary: "",
            doctorRemarks: "",
            reportFile: null,
        },
        validationSchema: Yup.object({
            patient_id: Yup.string().required("Patient is required"),

            
        }),
        onSubmit: async (values) => {
            try {
                let fileUrl = testList[0]?.report_url || "";

                // upload new file if exists
                if (values.reportFile) {
                    const formData = new FormData();
                    formData.append("file", values.reportFile);

                    const res = await uploadFile(formData).unwrap();
                    fileUrl = res.path;
                }

                const payload = {
                    patient_id: values.patient_id,
                    name: values.Name,
                    gender: values.Gender,
                    age: Number(values.Age),
                    employee_id: values.EmployeeId,

                    tests: testList.map((t) => ({
                        test_type: t.testType,
                        result_summary: t.resultSummary,
                        doctor_remarks: t.doctorRemarks,
                        report_url: fileUrl,
                    })),
                };

                if (id) {

                    await updateRadiology({ id, body: payload }).unwrap();
                    healthAlerts.success("Updated Successfully");
                } else {

                    await createRadiology(payload).unwrap();
                    healthAlerts.success("Created Successfully");
                }

               setTimeout(() => {
  navigate("/radiology-screen", { state: { goToList: true } });
}, 800);
            } catch (err) {
                healthAlerts.error("Save Failed");
            }
        },
    });
    useEffect(() => {
        if (editData) {
            formik.setValues({
                EmployeeId: editData.employee_id || "",
                patient_id: editData.patient_id || "",
                Name: editData.name || "",
                Gender: editData.gender || "",
                Age: editData.age || "",
                reportFile: null,
            });

            const mappedTests =
                editData.tests?.map((t) => ({
                    testType: t.test_type || "",
                    resultSummary: t.result_summary || "",
                    doctorRemarks: t.doctor_remarks || "",
                    report_url: t.report_url || "",
                })) || [];

            setTestList(mappedTests);


            if (mappedTests.length > 0) {
                formik.setFieldValue("testType", mappedTests[0].testType);
                formik.setFieldValue("resultSummary", mappedTests[0].resultSummary);
                formik.setFieldValue("doctorRemarks", mappedTests[0].doctorRemarks);
            }
        }
    }, [editData]);


    const nextStep = async () => {


        if (activeStep === 1 && !formik.values.Name) {
            healthAlerts.warning("Name is required");
            return;
        }


        if (activeStep === 2) {


            if (testList.length === 0) {
                healthAlerts.warning("Add at least one test");
                return;
            }

        }

        setActiveStep((p) => p + 1);
    };

    const prevStep = () => setActiveStep((p) => p - 1);


    const handleAddTest = () => {
        const { testType, resultSummary, doctorRemarks } = formik.values;

        if (!testType || !resultSummary) {
            healthAlerts.warning("Test Type & Result required");
            return;
        }

        setTestList((prev) => [
            ...prev,
            { testType, resultSummary, doctorRemarks },
        ]);

        formik.setFieldValue("testType", "");
        formik.setFieldValue("resultSummary", "");
        formik.setFieldValue("doctorRemarks", "");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
            <div className="max-w-[1400px] mx-auto px-8">


                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <span className="bg-blue-100 p-2 rounded-xl">
                            <BeakerIcon className="w-6 text-blue-600" />
                        </span>
                        Radiology & Special Tests
                    </h1>

                    <div className="flex gap-2">
                        {[1, 2, 3, 4].map((s) => (
                            <div
                                key={s}
                                className={`h-2 w-12 rounded-full ${activeStep >= s ? "bg-sky-600" : "bg-blue-100"
                                    }`}
                            />
                        ))}
                    </div>
                </div>


                <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">


                    <div className="flex border-b">
                        {[
                            { id: 1, label: "Patient", icon: UserIcon },
                            { id: 2, label: "Test", icon: BeakerIcon },
                            { id: 3, label: "Report", icon: CreditCardIcon },
                            { id: 4, label: "Confirm", icon: DocumentCheckIcon },
                        ].map((step) => (
                            <button
                                key={step.id}
                                disabled
                                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold ${activeStep === step.id
                                    ? "bg-white text-sky-600 shadow"
                                    : "text-gray-400"
                                    }`}
                            >
                                <step.icon className="w-4 h-4" />
                                {step.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={formik.handleSubmit} className="p-9 space-y-8">


                        {activeStep === 1 && (
                            <section>
                                <PatientSelector formik={formik} />

                            </section>
                        )}


                        {activeStep === 2 && (
                            <section>
                                <h3 className="text-lg font-semibold text-sky-700 mb-4 flex gap-2">
                                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                                    Radiology Tests
                                </h3>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <Select
                                        label="Test Type"
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

                                    <Input label="Result Summary" {...formik.getFieldProps("resultSummary")} />
                                    <Input label="Doctor Remarks" {...formik.getFieldProps("doctorRemarks")} />
                                </div>


                                <div className="mt-4">
                                    <button
                                        type="button"
                                        onClick={handleAddTest}
                                        className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-600 text-white"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                    </button>
                                </div>


                                {testList.length > 0 && (
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
                                                {testList.map((t, i) => (
                                                    <tr key={i} className="border-t">
                                                        <td className="p-3">{t.testType}</td>
                                                        <td className="p-3">{t.resultSummary}</td>
                                                        <td className="p-3">{t.doctorRemarks}</td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() =>
                                                                    setTestList((prev) =>
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


                        {activeStep === 3 && (
                            <section>
                                <h3 className="text-sky-700 font-semibold mb-3">
                                    Upload Report
                                </h3>

                                <input
                                    type="file"
                                    onChange={(e) =>
                                        formik.setFieldValue("reportFile", e.target.files[0])
                                    }
                                />
                            </section>
                        )}


                        {activeStep === 4 && (
                            <section>
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">
                                    <h3 className="text-lg font-semibold text-sky-600">
                                        RADIOLOGY PREVIEW
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                                        <p><b>Name:</b> {formik.values.Name}</p>
                                        <p><b>Gender:</b> {formik.values.Gender}</p>
                                        <p><b>Age:</b> {formik.values.Age}</p>
                                        <p><b>patient_id:</b> {formik.values.patient_id}</p>
                                    </div>

                                    {testList.map((t, i) => (
                                        <div key={i} className="border-t pt-3 text-sm">
                                            <p><b>Test Type:</b> {t.testType}</p>
                                            <p><b>Result Summary:</b> {t.resultSummary}</p>
                                            <p><b>Doctor Remarks:</b> {t.doctorRemarks}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}


                        <div className="flex justify-end gap-3 pt-6 border-t">

                            {activeStep > 1 && (
                                <Button type="button" variant="gray" onClick={prevStep}>
                                    Back
                                </Button>
                            )}

                            <Button type="button" variant="gray" onClick={formik.handleReset}>
                                <ArrowPathIcon className="w-5 mr-1 inline" />
                                Reset
                            </Button>

                            {activeStep < 4 ? (
                                <Button type="button" variant="sky" onClick={nextStep}>
                                    Continue
                                </Button>
                            ) : (
                                <Button
  type="button"
  onClick={() => {
    
    formik.handleSubmit();
  }}
>
  Save
</Button>
                            )}

                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default RadiologyScreen;