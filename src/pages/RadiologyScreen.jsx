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
import useDebounce from "../hooks/useDebounce";
import {
    useSearchOpdBillNoQuery,
    useGetOpdBillByIdQuery,
} from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { healthAlerts } from "../utils/healthSwal";
import { Input, Select, Button, baseInput } from "../components/FormControls";
import { useNavigate } from "react-router-dom";

const RadiologyScreen = () => {
    const [activeStep, setActiveStep] = useState(1);
    const [billSearch, setBillSearch] = useState("");
    const [selectedBill, setSelectedBill] = useState("");
    const [suggestionsList, setSuggestionsList] = useState([]);
    const [testList, setTestList] = useState([]);
    const navigate = useNavigate();
    const debouncedBill = useDebounce(billSearch, 500);
    const populatedRef = useRef("");

    
    const { data: suggestions = [] } = useSearchOpdBillNoQuery(debouncedBill, {
        skip: debouncedBill.length < 1,
    });

   
    const { data: patientData } = useGetOpdBillByIdQuery(
        selectedBill ? String(selectedBill) : skipToken
    );

    
    useEffect(() => {
        if (!selectedBill && billSearch.length >= 1) {
            setSuggestionsList(suggestions);
        }
    }, [suggestions, selectedBill, billSearch]);

   
    useEffect(() => {
        if (!patientData) return;
        if (populatedRef.current === selectedBill) return;

        populatedRef.current = selectedBill;

        formik.setValues({
            ...formik.values,
            billno: selectedBill,
            UHID: patientData.PicasoNo || "",
            Name: patientData.driverDetails?.[0]?.name || "",
            Gender: patientData.driverDetails?.[0]?.gender || "",
            Mobile: patientData.Mobile || "",
            Age: patientData.driverDetails?.[0]?.age || "",
        });
    }, [patientData]);

    const formik = useFormik({
        initialValues: {
            billno: "",
            Name: "",
            UHID: "",
            Age: "",
            Gender: "",
            Mobile: "",
            testType: "",
            resultSummary: "",
            doctorRemarks: "",
            reportFile: null,
        },
        onSubmit: (values) => {
            const payload = {
                ...values,
                tests: testList,
            };
            healthAlerts.success("Radiology Saved", "Success");

      navigate("/radiology", {
        state: { goToList: true }
      });
            
        },
    });

    
    const nextStep = () => {
        if (activeStep === 1 && !formik.values.billno) {
            healthAlerts.warning("Bill No is required");
            return;
        }

        if (activeStep === 2 && testList.length === 0) {
            healthAlerts.warning("Add at least one test");
            return;
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

                    <form className="p-9 space-y-8">

                       
                        {activeStep === 1 && (
                            <section>
                                <h3 className="text-lg font-semibold text-sky-700 mb-4 flex gap-2">
                                    <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                                    Patient Details
                                </h3>

                                <div className="grid md:grid-cols-3 gap-6">

                                    
                                    <div className="relative">
                                        <Input
                                            label="Bill No"
                                            placeholder="Search Bill No"
                                            value={billSearch}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "");
                                                setBillSearch(val);
                                                setSelectedBill("");
                                                formik.setFieldValue("billno", "");
                                                setSuggestionsList([]);
                                            }}
                                        />

                                        {suggestionsList.length > 0 && (
                                            <ul className="absolute z-20 bg-white border rounded-md shadow w-full max-h-48 overflow-auto">
                                                {suggestionsList.map((item) => (
                                                    <li
                                                        key={item.ID}
                                                        onClick={() => {
                                                            setSelectedBill(item.ID);
                                                            formik.setFieldValue("billno", item.ID);
                                                            setBillSearch(item.ID);
                                                            setSuggestionsList([]);
                                                        }}
                                                        className="px-3 py-2 hover:bg-sky-100 cursor-pointer"
                                                    >
                                                        {item.ID}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <Input label="Name" {...formik.getFieldProps("Name")} readOnly className="bg-sky-50" />
                                    <Input label="UHID" {...formik.getFieldProps("UHID")} readOnly className="bg-sky-50" />
                                    <Input label="Age" {...formik.getFieldProps("Age")} readOnly className="bg-sky-50" />
                                    <Input label="Gender" {...formik.getFieldProps("Gender")} readOnly className="bg-sky-50" />
                                    <Input label="Mobile" {...formik.getFieldProps("Mobile")} readOnly className="bg-sky-50" />

                                </div>
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
                            <div className="bg-sky-50 p-6 rounded-xl">
                                <h3 className="text-sky-700 font-semibold">
                                    Confirm Details
                                </h3>

                                <p><b>Name:</b> {formik.values.Name}</p>
                                <p><b>Total Tests:</b> {testList.length}</p>
                            </div>
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
                                <Button type="button" variant="sky" onClick={formik.handleSubmit}>
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