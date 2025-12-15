import React from "react";
import FormBuilder from "../components/common/FormBuilder";
import * as Yup from "yup";

const PrescriptionForm = () => {
  const fields = [

    // 🧍 Patient Details
    { type: "section", label: "Patient Details" },

    {
      name: "uhid_no",
      label: "UHID",
      type: "text",
      required: true,
      className: "col-span-full",
    },

    { name: "patient_name", label: "Name", type: "text", required: true },
    { name: "age", label: "Age", type: "number" },

    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    { name: "contact_no", label: "Mobile", type: "number", required: true },

    // 🫀 Vitals
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

    // 🩺 Clinical Details
    
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

    { name: "bill_no", label: "Bill No", type: "number", required: true },
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

  const handleSubmit = (values) => {
    console.log("Prescription Submitted:", values);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg border border-sky-100">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">
        🩺 Prescription Form
      </h2>

      <FormBuilder
        fields={fields}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        layout="grid"
      />
    </div>
  );
};

export default PrescriptionForm;
