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
useSearchOpdBillNoQuery,
useGetOpdBillByIdQuery,
} from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { healthAlerts } from "../utils/healthSwal";
import { useNavigate } from "react-router-dom";
import { Input, Button, baseInput } from "../components/FormControls";

const VitalsForm = () => {
const [activeStep, setActiveStep] = useState(1);
const [billSearch, setBillSearch] = useState("");
const [selectedBill, setSelectedBill] = useState("");
const [suggestionsList, setSuggestionsList] = useState([]);
const populatedUhidRef = useRef("");
const navigate = useNavigate();

const { data: patientData } = useGetOpdBillByIdQuery(
selectedBill ? String(selectedBill) : skipToken
);

const { data: suggestions = [] } = useSearchOpdBillNoQuery(billSearch, {
skip: billSearch.length < 1,
});

const formik = useFormik({
initialValues: {
UHID: "",
Name: "",
Mobile: "",
Gender: "",
Age: "",
FinCategory: "",
billno: "",
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
respiratoryRate: Yup.number().min(5).max(60),
}),
onSubmit: () => {
  healthAlerts.success("Vitals Saved Successfully");
  navigate("/vitals", {
    state: { goToList: true }
  });
}
});

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

useEffect(() => {
if (!billSearch || selectedBill) return;
setSuggestionsList(suggestions);
}, [suggestions, billSearch, selectedBill]);

useEffect(() => {
if (!patientData) return;
if (patientData.ID !== selectedBill) return;
if (populatedUhidRef.current === selectedBill) return;


populatedUhidRef.current = selectedBill;

formik.setValues({
  ...formik.values,
  UHID: patientData.PicasoNo || "",
  Name: patientData.driverDetails[0]?.name || "",
  Gender: patientData.driverDetails[0]?.gender || "",
  Mobile: patientData.Mobile || "",
  FinCategory: patientData.driverDetails[0]?.category || "",
  Age: patientData.driverDetails[0]?.age || "",
  billno: selectedBill,
});


}, [patientData, selectedBill]);

const nextStep = async () => {
const errors = await formik.validateForm();


if (activeStep === 1 && !formik.values.billno) {
  healthAlerts.warning("Bill No is required");
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

return ( <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10"> <div className="max-w-[1400px] mx-auto px-8">


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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              <div className="relative">
                <label className="text-sm text-gray-600 block mb-1">
                  Bill no <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  className={baseInput}
                  placeholder="Search Bill no"
                  value={billSearch}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setBillSearch(val);
                    setSelectedBill("");
                    formik.setFieldValue("billno", "");
                    setSuggestionsList([]);
                    populatedUhidRef.current = "";
                  }}
                />

                {suggestionsList.length > 0 && (
                  <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">

              <Input label="BP Systolic" {...formik.getFieldProps("bpsystolic")} />
              <Input label="BP Diastolic" {...formik.getFieldProps("bpdiastolic")} />
              <Input label="Pulse" {...formik.getFieldProps("pulserate")} />
              <Input label="SPO2" {...formik.getFieldProps("spo2")} />
              <Input label="Temperature" {...formik.getFieldProps("temprature")} />
              <Input label="Height (cm)" {...formik.getFieldProps("height")} />
              <Input label="Weight (kg)" {...formik.getFieldProps("weight")} />
              <Input label="BMI" value={formik.values.bmi} readOnly className="bg-sky-50"/>
              <Input label="Respiratory Rate" {...formik.getFieldProps("respiratoryRate")} />

            </div>
          </section>
        )}

        {activeStep === 3 && (
          <div className="bg-sky-50 p-6 rounded-xl border space-y-2">
            <p><b>Name:</b> {formik.values.Name}</p>
            <p><b>UHID:</b> {formik.values.UHID}</p>
            <p><b>BMI:</b> {formik.values.bmi}</p>
            <p><b>Resp Rate:</b> {formik.values.respiratoryRate}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-6 border-t flex-wrap gap-3">

          <div className="flex gap-2">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Back
              </button>
            )}

            <button
              type="button"
              onClick={formik.handleReset}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Reset
            </button>
          </div>

          {activeStep < 3 ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                nextStep();
              }}
              className="px-5 py-2 bg-sky-600 text-white rounded"
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
              className="px-5 py-2 bg-sky-600 text-white rounded"
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
