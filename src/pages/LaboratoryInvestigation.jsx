import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import {
  ArrowPathIcon,
  UserIcon,
  ClipboardDocumentIcon,
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

const LaboratoryInvestigation = () => {
  const [activeStep, setActiveStep] = useState(1);
  const navigate = useNavigate();
  const [billSearch, setBillSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState("");
  const [suggestionsList, setSuggestionsList] = useState([]);
  const [bloodTestList, setBloodTestList] = useState([]);

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
      UHID: patientData.PicasoNo || "",
      Name: patientData.driverDetails[0]?.name || "",
      Gender: patientData.driverDetails[0]?.gender || "",
      Mobile: patientData.Mobile || "",
      Age: patientData.driverDetails[0]?.age || "",
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
      FinCategory: "",

      commonTest: "",

      testName: "",
      result: "",
      minRange: "",
      maxRange: "",
      remarks: "",

      reportFile: null,
    },
    onSubmit: (values) => {
      const payload = {
        ...values,
        bloodTests: bloodTestList,
      };

      console.log("FINAL PAYLOAD ", payload);
       healthAlerts.success("Lab Investigation Saved", "Success");

      navigate("/lab-investigation", {
        state: { goToList: true }
      });
    },
  });

  const nextStep = () => {
    if (activeStep === 1 && !formik.values.billno) {
      healthAlerts.warning("Bill No is required");
      return;
    }

    if (activeStep === 3 && bloodTestList.length === 0) {
      healthAlerts.warning("Add at least one blood test");
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  const handleAddTest = () => {
    const { testName, result, minRange, maxRange, remarks } = formik.values;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">

     
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <BeakerIcon className="w-6 text-blue-600" />
            </span>
            Laboratory Investigation
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 w-12 rounded-full ${
                  activeStep >= s ? "bg-sky-600" : "bg-blue-100"
                }`}
              />
            ))}
          </div>
        </div>

        
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">

          
          <div className="flex border-b">
            {[
              { id: 1, label: "Patient", icon: UserIcon },
              { id: 2, label: "Common Test", icon: ClipboardDocumentIcon },
              { id: 3, label: "Blood Test", icon: BeakerIcon },
              { id: 4, label: "Report", icon: CreditCardIcon },
              { id: 5, label: "Confirm", icon: DocumentCheckIcon },
            ].map((step) => (
              <button
                key={step.id}
                disabled
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold
                ${
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

         
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (activeStep !== 5) return;
              formik.handleSubmit();
            }}
            className="space-y-8 p-9"
          >

            
            {activeStep === 1 && (
              <section>
                <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                  Patient Details
                </h3>

                <div className="grid md:grid-cols-3 gap-8">

                  
                  <div className="relative">
                                      <Input
                                        label="Bill No"
                                        value={billSearch}
                                        onChange={(e)=>{
                                          const val=e.target.value.replace(/\D/g,"");
                                          setBillSearch(val);
                                          setSelectedBill("");
                                          formik.setFieldValue("billno","");
                                        }}
                                      />
                  
                                      {suggestionsList.length > 0 && (
                                        <ul className="absolute z-50 bg-white border rounded-lg shadow w-full mt-1 max-h-48 overflow-auto">
                                          {suggestionsList.map((item)=>(
                                            <li
                                              key={item.ID}
                                              onClick={()=>{
                                                setSelectedBill(item.ID);
                                                setBillSearch(item.ID);
                                                formik.setFieldValue("billno",item.ID);
                                                setSuggestionsList([]);
                                              }}
                                              className="px-4 py-2 hover:bg-sky-100 cursor-pointer"
                                            >
                                              {item.ID}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>

                  <Input label="Name" {...formik.getFieldProps("Name")} readOnly className="bg-sky-50"/>
                  <Input label="UHID" {...formik.getFieldProps("UHID")} readOnly className="bg-sky-50"/>
                  <Input label="Age" {...formik.getFieldProps("Age")} readOnly className="bg-sky-50"/>
                  <Input label="Gender" {...formik.getFieldProps("Gender")} readOnly className="bg-sky-50"/>
                  <Input label="Mobile" {...formik.getFieldProps("Mobile")} readOnly className="bg-sky-50"/>

                </div>
              </section>
            )}

            
            {activeStep === 2 && (
              <section>
                <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                  Common Test
                </h3>

                <Input label="Common Test" {...formik.getFieldProps("commonTest")} />
              </section>
            )}

            
            {activeStep === 3 && (
              <section>
                <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
                  Blood Test
                </h3>

                <div className="grid md:grid-cols-3 gap-8">

                  <Select
                    label="Select Test"
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

                  <Input label="Result" {...formik.getFieldProps("result")} />
                  <Input label="Min Range" {...formik.getFieldProps("minRange")} />
                  <Input label="Max Range" {...formik.getFieldProps("maxRange")} />
                  <Input label="Remarks" {...formik.getFieldProps("remarks")} />
                </div>

               
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleAddTest}
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
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>
            )}

           
            {activeStep === 4 && (
              <section>
                <h3 className="text-lg font-semibold text-sky-700 mb-3">
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

       
            {activeStep === 5 && (
              <div className="bg-sky-50 p-6 rounded-xl">
                <h3 className="text-sky-700 font-semibold">
                  Confirm Details
                </h3>

                <p><b>Name:</b> {formik.values.Name}</p>
                <p><b>Common Test:</b> {formik.values.commonTest}</p>
                <p><b>Total Tests:</b> {bloodTestList.length}</p>
              </div>
            )}

            
            <div className="flex justify-between items-center pt-6 border-t">

              <div className="flex gap-2">
                {activeStep > 1 && (
                  <Button type="button" variant="gray" onClick={prevStep}>
                    Back
                  </Button>
                )}

                <Button type="button" variant="gray" onClick={formik.handleReset}>
                  <ArrowPathIcon className="w-5 inline mr-1" />
                  Reset
                </Button>
              </div>

              {activeStep < 5 ? (
                <Button type="button" variant="sky" onClick={nextStep}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" variant="sky">
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

export default LaboratoryInvestigation;