import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import {
  ArrowPathIcon,
  UserIcon,
  ClipboardDocumentIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";
import useDebounce from "../hooks/useDebounce";
import {
  useSearchOpdBillNoQuery,
  useGetOpdBillByIdQuery,
} from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { healthAlerts } from "../utils/healthSwal";
import { Input, Select, Button } from "../components/FormControls";

const DoctorAssessment = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [billSearch, setBillSearch] = useState("");
  const [selectedBill, setSelectedBill] = useState("");
  const [suggestionsList, setSuggestionsList] = useState([]);

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
      Name: patientData.driverDetails?.[0]?.name || "",
      UHID: patientData.PicasoNo || "",
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

      healthStatus: "",
      fitness: "",
      restrictions: "",
      recommendations: "",
      followUp: "",
      comments: "",
    },
    onSubmit: (values) => {
      console.log("FINAL DATA 👉", values);
    },
  });

  const nextStep = () => {
    if (activeStep === 1 && !formik.values.billno) {
      healthAlerts.warning("Please select Bill No");
      return;
    }
    setActiveStep((p) => p + 1);
  };

  const prevStep = () => setActiveStep((p) => p - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800">
            Doctor Assessment
          </h1>

          <div className="flex gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-2 w-12 rounded-full ${
                activeStep >= s ? "bg-sky-600":"bg-blue-100"
              }`} />
            ))}
          </div>
        </div>

       
        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">

          
          <div className="flex border-b">
            {[
              { id:1,label:"Patient",icon:UserIcon },
              { id:2,label:"Assessment",icon:ClipboardDocumentIcon },
              { id:3,label:"Additional",icon:ClipboardDocumentIcon },
              { id:4,label:"Confirm",icon:DocumentCheckIcon },
            ].map((step)=>(
              <button
                key={step.id}
                disabled
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold ${
                  activeStep===step.id
                    ? "bg-white text-sky-600 shadow"
                    : "text-gray-400"
                }`}
              >
                <step.icon className="w-4 h-4"/>
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

                <div className="grid md:grid-cols-3 gap-6 relative">

                  
                  <div className="relative w-full">
                    <Input
                      label="Bill No"
                      value={billSearch}
                      onChange={(e)=>{
                        const val=e.target.value.replace(/\D/g,"");
                        setBillSearch(val);
                        setSelectedBill("");
                        formik.setFieldValue("billno","");
                        setSuggestionsList([]);
                      }}
                    />

                    {suggestionsList.length > 0 && (
                      <ul className="absolute z-50 bg-white border rounded-lg shadow-lg w-full mt-1 max-h-48 overflow-auto">
                        {suggestionsList.map((item)=>(
                          <li
                            key={item.ID}
                            onClick={()=>{
                              setSelectedBill(item.ID);
                              setBillSearch(item.ID);
                              formik.setFieldValue("billno", item.ID);
                              setSuggestionsList([]);
                            }}
                            className="px-4 py-2 hover:bg-sky-100 cursor-pointer text-sm"
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
                <h3 className="text-sky-700 font-semibold mb-4">
                  Assessment
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <Select
                    label="Fitness Category"
                    value={formik.values.fitness}
                    onChange={(e)=>formik.setFieldValue("fitness",e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Fit</option>
                    <option>Fit with Restrictions</option>
                    <option>Unfit</option>
                  </Select>

                  <Input label="Health Status" {...formik.getFieldProps("healthStatus")} />
                  <Input label="Restrictions" {...formik.getFieldProps("restrictions")} />
                </div>
              </section>
            )}

            
            {activeStep === 3 && (
              <section>
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Recommendations" {...formik.getFieldProps("recommendations")} />

                  <Select
                    label="Follow Up Required"
                    value={formik.values.followUp}
                    onChange={(e)=>formik.setFieldValue("followUp",e.target.value)}
                  >
                    <option value="">Select</option>
                    <option>Yes</option>
                    <option>No</option>
                  </Select>
                </div>

                <Input label="Comments" {...formik.getFieldProps("comments")} />
              </section>
            )}

            
            {activeStep === 4 && (
              <div className="bg-sky-50 p-6 rounded-xl">
                <h3 className="text-sky-700 font-semibold">
                  Confirm Details
                </h3>

                <p><b>Name:</b> {formik.values.Name}</p>
                <p><b>Fitness:</b> {formik.values.fitness}</p>
              </div>
            )}

           
            <div className="flex justify-end gap-3 pt-6 border-t">

              {activeStep > 1 && (
                <Button type="button" variant="gray" onClick={prevStep}>
                  Back
                </Button>
              )}

              <Button type="button" variant="gray" onClick={formik.handleReset}>
                <ArrowPathIcon className="w-4 mr-1 inline"/>
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

export default DoctorAssessment;