import React, { useState, useEffect, useRef } from "react";
import FormBuilder from "../components/common/FormBuilder";
import * as Yup from "yup";
import { useGetPatientsByUhidQuery, useSearchUHIDQuery, useGetComboQuery, useCreateBillMutation } from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import useDebounce from "../hooks/useDebounce";
import { skipToken } from "@reduxjs/toolkit/query";
import { Formik, useFormik } from "formik";
import {
  ArrowPathIcon,
  PrinterIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
const baseInput =
  "border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none";
const baseBtn =
  "px-4 py-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-offset-2";

const Input = ({ label, required, error, ...props }) => (
  <div>
    {label && (
      <label className="text-sm text-gray-600 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      {...props}
      className={`${baseInput} ${error ? "border-red-500" : ""} ${props.className || ""}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);  

const Select = ({ label, required, error, children, ...props }) => (
  <div>
    {label && (
      <label className="text-sm text-gray-600 block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      {...props}
      className={`${baseInput} ${error ? "border-red-500" : ""}`}
    >
      {children}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Button = ({ variant = "sky", children, ...props }) => {
  const variants = {
    sky: `${baseBtn} bg-sky-600 text-white hover:bg-sky-700 focus:ring-sky-500`,
    gray: `${baseBtn} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-300`,
    green: `${baseBtn} bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500`,
    outline: `${baseBtn} border border-gray-300 text-gray-700 hover:bg-gray-100`,
  };
  return (
    <button {...props} className={variants[variant]}>
      {children}
    </button>
  );
};

const PrescriptionForm = () => {

  const [uhidSearch, setUhidSearch] = useState("");
    const debouncedUhid = useDebounce(uhidSearch, 500);
    const [selectedUhid, setSelectedUhid] = useState("");
    const [suggestionsList, setSuggestionsList] = useState([]);

  const fields = [
    { type: "section", label: "Patient Details" },

    {
      name: "uhid_no",
      label: "UHID",
      type: "text",
      required: true,
    },
    { name: "bill_no", label: "Bill No", type: "number", required: true },

    { name: "patient_name", label: "Name", type: "text", required: true },
    { name: "age", label: "Age", type: "number" },

    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    { name: "contact_no", label: "Mobile", type: "number", required: true },
    { type: "section", label: "Vitals" },

    { name: "vital_bp", label: "BP (mmHg)", type: "text" },
    { name: "vital_pulse", label: "Pulse (BPM)", type: "number" },

    { name: "vital_temp", label: "Temperature (°F)", type: "number" },
    { name: "vital_spo2", label: "SPO2 (%)", type: "number" },

    {
      name: "vital_weight",
      label: "Weight (kg)",
      type: "number",
      className: "col-span-full",
    },
    { type: "section", label: "Clinical Details" },

    {
      name: "diagnose",
      label: "Diagnosis",
      type: "text",
      className: "col-span-full",
    },
    { name: "chief_complaints", label: "Chief Complaints", type: "textarea" },
    { name: "drug_allergies", label: "Drug Allergies", type: "textarea" },
    // 💊 Rx (Medicines)
    { type: "section", label: "Rx (Medicines)" },

    {
      name: "rx_medicines",
      label: "Medicine | Dosage | Frequency | Duration",
      type: "textarea",
      required: true,
      className: "col-span-full",
      placeholder:
        "Paracetamol | 500mg | 1-0-1 | 5 days\nAmoxicillin | 250mg | 1-1-1 | 7 days",
    },

    // 📋 Advice & Tests
    { type: "section", label: "Advice & Tests" },

    { name: "lab", label: "Lab Tests", type: "textarea" },
    { name: "preventive_advice", label: "Preventive Advice", type: "textarea" },
    {
      name: "follow_up",
      label: "Follow-up Date",
      type: "date",
      className: "col-span-full",
    },

    // 🧾 Prescription Status
    { type: "section", label: "Prescription Status" },


    { name: "consultation_id", label: "Consultation ID", type: "text", required: true },
    { name: "doctor_id", label: "Doctor ID", type: "number", required: true },
    { name: "driver_id", label: "Driver ID", type: "number", required: true },

    {
      name: "Other_Instructions",
      label: "Other Instructions",
      type: "textarea",
      className: "col-span-full",
      required: true,
    },

    {
      name: "isReady",
      label: "Prescription Ready?",
      type: "select",
      options: ["Yes", "No"],
    },
  ];

  const initialValues = fields.reduce((acc, cur) => {
    if (cur.name) acc[cur.name] = "";
    return acc;
  }, {});

  const validationSchema = Yup.object({
    uhid_no: Yup.string().required("UHID is required"),
    patient_name: Yup.string().required("Patient Name is required"),
    contact_no: Yup.string()
      .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
      .required("Mobile is required"),

    rx_medicines: Yup.string().required("Rx Medicines are required"),

    bill_no: Yup.number().required("Bill number is required"),
    consultation_id: Yup.string().required("Consultation ID is required"),
    doctor_id: Yup.number().required("Doctor ID is required"),
    driver_id: Yup.number().required("Driver ID is required"),

    Other_Instructions: Yup.string().required("Other Instructions are required"),
  });

  const { data: patientData, isFetching } = useGetPatientsByUhidQuery(
    selectedUhid && selectedUhid.trim() !== ""
      ? { uhid: selectedUhid }
      : skipToken
  );

  const { data: suggestions = [] } = useSearchUHIDQuery(
    debouncedUhid,
    { skip: debouncedUhid.length < 2 }
  );

  useEffect(() => {
    if (selectedUhid) return;
    if (uhidSearch.length < 2) return;
    const isSame =
      suggestionsList.length === suggestions.length &&
      suggestionsList.every((x, i) => x.external_id === suggestions[i].external_id);

    if (!isSame) {
      setSuggestionsList(suggestions);
    }

  }, [suggestions, selectedUhid, uhidSearch]);
  const formik = useFormik({
    initialValues: {
      UHID: "",
      CenterName: "",
      diseases: [],
      Name: "",
      Mobile: "",
      Gender: "",
      Age: "",
      DOB: "",
      Department: 0,
      Doctor: 0,
      FinCategory: "",
      ReferBy: "",
      VisitType: "",
      LastVisitDate: "",
      Quantity: 1,
      ServiceName: "",
      PreviousDue: 0,
      TotalAmount: 0,
      PaidAmount: 0,
      CreditBalance: 0,
      AdjustWithBalance: false,

      DueAmount: 0,
      PayMode: "",
      CashAmount: 0,
      CardAmount: 0,
    },
    validationSchema: Yup.object({
      UHID: Yup.string().required("UHID is required"),
      Name: Yup.string().required("Name is required"),
      Mobile: Yup.string()
        .matches(/^[0-9]{10}$/, "Must be 10 digits")
        .required("Mobile is required"),

      Department: Yup.number()
        .min(1, "Department is required")
        .required("Department is required"),

      Doctor: Yup.number()
        .min(1, "Consulting doctor is required")
        .required("Consulting doctor is required"),
      PayMode: Yup.string().required("Payment Mode is required"),
    }),
    onSubmit: async (values) => {
      try {
        const payload = buildPayload(values);
        if (!payload) {
          healthAlert({
            title: "OPD Billing",
            text: "Service or Patient detail missing please verify before procceding.",
            icon: "error",
          });
          return;
        }
        const response = await createBill(payload).unwrap();
        healthAlert({
          title: "OPD Billing",
          text: "OPD Billing Saved Successfully",
          icon: "success",
        });
        formik.resetForm();
        setSelectedServices([]);
        setSelectedUhid("")
      } catch (err) {
        healthAlert({
          title: "OPD Billing",
          text: err?.data?.message,
          icon: "error",
        });
      }
    },


  });
  // Inside your component
  useEffect(() => {
    if (Object.keys(formik.errors).length > 0) {
      console.log("Validation Errors:", formik.errors);
    }
  }, [formik.errors]);
  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-5 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-sky-700 mb-5 text-center">
        💳 Prescription Form
      </h2>
      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Patient
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <label className="text-sm text-gray-600 block mb-1">UHID <span className="text-red-500">*</span></label>

              <input
                type="text"
                className={baseInput}
                placeholder="Search UHID (e.g., LMC-123)"
                value={uhidSearch || formik.values.UHID}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase();
                  setUhidSearch(val);
                  setSelectedUhid("");
                  formik.setFieldValue("UHID", "");
                  setSuggestionsList([]);
                  populatedUhidRef.current = "";
                }}
                autoComplete="off"
              />

              {suggestionsList.length > 0 &&
                uhidSearch.length >= 2 && (
                  <ul className="absolute z-20 bg-white border rounded-md shadow-md w-full max-h-48 overflow-auto">
                    {suggestionsList.map((item) => (
                      <li
                        key={item.external_id}
                        onClick={() => {
                          setSelectedUhid(item.external_id);
                          formik.setFieldValue("UHID", item.external_id);
                          setUhidSearch(item.external_id);
                          setSuggestionsList([]);
                        }}
                        className="px-3 py-2 hover:bg-sky-100 cursor-pointer"
                      >
                        {item.external_id}
                      </li>
                    ))}
                  </ul>
                )}
            </div>


            {/* <DiseaseSelect
              label="Complaint"
              value={formik.values.ChiefComplaint}
              onChange={(selected) => formik.setFieldValue("ChiefComplaint", selected)}
              required
            /> */}

            <Input
              label="Name"
              {...formik.getFieldProps("Name")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
            <Input
              label={
                <span>
                  Mobile <span className="text-red-500">*</span>
                </span>
              }
              {...formik.getFieldProps("Mobile")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
              error={formik.touched.Mobile && formik.errors.Mobile}
            />

            <Input
              label="Gender"
              {...formik.getFieldProps("Gender")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            >
            </Input>

            {/* <Input
              label="Date of Birth"
              type="date"
              {...formik.getFieldProps("DOB")}
              onChange={handleDOBChange}
              max={new Date().toISOString().split("T")[0]}
            /> */}
            <Input
              label="Age"
              {...formik.getFieldProps("Age")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />


            {/* <Select {...formik.getFieldProps("Department")}

              label={
                <span>
                  Department <span className="text-red-500">*</span>
                </span>
              }

              error={formik.touched.Department && formik.errors.Department}
            >
              <option value="">Select Department</option>
              {department?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>


            <Select {...formik.getFieldProps("Doctor")} label={
              <span>
                Doctor <span className="text-red-500">*</span>
              </span>
            }
              error={formik.touched.Doctor && formik.errors.Doctor}>
              <option value="">Consulting Doctor</option>
              {doctors?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name || d.doctor_name}
                </option>
              ))}
            </Select> */}


            <Input {...formik.getFieldProps("FinCategory")} className="bg-gray-100 cursor-not-allowed" label="Category" readOnly>

            </Input>

            {/* <Select {...formik.getFieldProps("ReferBy")} label="Refer By">
              <option value="">Refer By</option>
              {collectedBy?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select> */}


            <Input
              label="Visit Type"
              {...formik.getFieldProps("VisitType")}
              className="bg-gray-100 cursor-not-allowed"
              readOnly
            >
            </Input>

            <Input
              label="Last Visit Date"
              type="date"
              {...formik.getFieldProps("LastVisitDate")}
              max={new Date().toISOString().split("T")[0]}
              className="bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>
        </section>
        {/* <section>
          <ServiceSection
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            department={formik.values.Department}
            consultingDoctor={formik.values.Doctor}
            payMode={formik.values.PayMode}
            setBillingTotals={(total) => {
              formik.setFieldValue("TotalAmount", total?.toString() || "0");
              if (formik.values.PayMode == 1 || formik.values.PayMode == "") {
                formik.setFieldValue("CashAmount", total?.toString() || "0");
                formik.setFieldValue("CardAmount", "0");
                formik.setFieldValue("PaidAmount", total?.toString() || "0");
              } else {
                formik.setFieldValue("CardAmount", total?.toString() || "0");
                formik.setFieldValue("CashAmount", "0");
                formik.setFieldValue("PaidAmount", total?.toString() || "0");
              }

            }}

          />
        </section> */}

        {/* ================= BILLING DETAILS ================= */}
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Billing
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input {...formik.getFieldProps("PreviousDue")} placeholder="Previous Due Amount" className="bg-gray-100 cursor-not-allowed" disabled label="Previous Due" />
            <Input {...formik.getFieldProps("TotalAmount")} placeholder="Total Amount" className="bg-gray-100 cursor-not-allowed" disabled label="Total Amount" />
            <Input {...formik.getFieldProps("PaidAmount")} placeholder="Paid Amount" label="Paid Amount" />
            <Input {...formik.getFieldProps("CreditBalance")} placeholder="Credit / Balance Amount" label="Credit Balance" />

            <label className="flex items-center gap-2 text-gray-700 text-sm mt-2">
              <input
                type="checkbox"
                {...formik.getFieldProps("AdjustWithBalance")}
                checked={formik.values.AdjustWithBalance}
                // disabled

                // className="bg-gray-100 cursor-not-allowed"
                className="cursor-pointer h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              Adjust with Balance
            </label>

            <Input {...formik.getFieldProps("DueAmount")} placeholder="Due Amount" className="bg-gray-100 cursor-not-allowed" disabled label="Due Amount" />

            {/* <Select {...formik.getFieldProps("PayMode")} label="Payment Mode"
              required
              error={formik.touched.PayMode && formik.errors.PayMode}
            >
              <option value="">Select Pay Mode</option>
              {paymode?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select> */}

            <Input {...formik.getFieldProps("CashAmount")} placeholder="Cash Amount" label="Cash Amount" />
            <Input {...formik.getFieldProps("CardAmount")} placeholder="Card / Online / UPI Amount" label="Card / Online / UPI Amount" />
          </div>
        </section>
        <div className="flex justify-center flex-wrap gap-3 pt-6 border-t border-gray-100">
          <Button type="submit" variant="sky">
            <CheckCircleIcon className="w-5 h-5 inline mr-1" /> Save
          </Button>
          <Button type="button" variant="gray" onClick={formik.handleReset}>
            <ArrowPathIcon className="w-5 h-5 inline mr-1" /> Reset
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm;
