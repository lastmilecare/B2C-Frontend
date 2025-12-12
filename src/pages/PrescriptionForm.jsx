import React from "react";
import FormBuilder from "../components/common/FormBuilder";
import * as Yup from "yup";

const PrescriptionForm = () => {
  const fields = [
    { name: "uhid_no", label: "UHID", type: "text", required: true },
    { name: "patient_name", label: "Patient Name", type: "text", required: true },
    { name: "contact_no", label: "Contact No", type: "number", required: true },
    { name:"age", label: "Age", type: "number"},
    // 🔗 Relations
    { name: "consultation_id", label: "Consultation ID", type: "text", required: true },
    { name: "doctor_id", label: "Doctor ID", type: "number", required: true },
    { name: "driver_id", label: "Driver ID", type: "number", required: true },
    { name: "bill_no", label: "Bill No", type: "number", required: true },
    
    // 💊 Prescription Details
    {
      name: "diagnose",
      label: "Diagnosis",
      type: "text",
      placeholder: "Enter diagnosis",
    },
    {
      name: "chief_complaints",
      label: "Chief Complaints",
      type: "textarea",
      placeholder: "Enter complaints (comma separated)",
    },
    {
      name: "instructions",
      label: "Instructions",
      type: "textarea",
      placeholder: "Enter instructions (comma separated)",
    },
    {
      name: "lab",
      label: "Lab Tests",
      type: "textarea",
      placeholder: "Enter lab tests (comma separated)",
    },
    {
      name: "other_lab",
      label: "Other Lab Name",
      type: "text",
      placeholder: "Enter other lab name if any",
    },
    {
      name: "preventive_advice",
      label: "Preventive Advice",
      type: "textarea",
      placeholder: "Enter advice (comma separated)",
    },
    {
      name: "drug_allergies",
      label: "Drug Allergies",
      type: "textarea",
      placeholder: "Enter allergies (comma separated)",
    },

    // 📅 Dates
    { name: "follow_up", label: "Follow Up Date", type: "date" },

    // 🧠 Health Info
   { name: "vital_bp", label: "BP (mmHg)", type: "text", placeholder: "e.g. 120/80" },
    { name: "vital_pulse", label: "Pulse (BPM)", type: "number", placeholder: "e.g. 72" },
    { name: "vital_temp", label: "Temperature (°F)", type: "number", placeholder: "e.g. 98.6" },
    { name: "vital_weight", label: "Weight (kg)", type: "number", placeholder: "e.g. 65" },
    { name: "vital_spo2", label: "SPO2 (%)", type: "number", placeholder: "e.g. 98" },
    { 
      name: "condition_diabetes", 
      label: "Diabetic?", 
      type: "select", 
      options: ["No", "Yes"] 
    },
    { 
      name: "condition_hypertension", 
      label: "Hypertension (BP)?", 
      type: "select", 
      options: ["No", "Yes"] 
    },

    // 🧾 Status
    {
      name: "isReady",
      label: "Prescription Ready?",
      type: "select",
      options: ["Yes", "No"],
    },
  ];

  const initialValues = fields.reduce((acc, cur) => {
    acc[cur.name] = "";
    return acc;
  }, {});

  const validationSchema = {
    consultation_id: Yup.string().required("Consultation ID is required"),
    doctor_id: Yup.number().required("Doctor ID is required"),
    driver_id: Yup.number().required("Driver ID is required"),
    bill_no: Yup.number().required("Bill number is required"),
    uhid_no: Yup.string().required("UHID is required"),
    patient_name: Yup.string().required("Patient Name is required"),
    contact_no: Yup.string().matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Contact Number is required"),

  };

  const handleSubmit = (values) => {
    const formatted = {
      ...values,
      isReady: values.isReady === "Yes",
      chief_complaints: values.chief_complaints
        ? values.chief_complaints.split(",").map((v) => v.trim())
        : [],
      instructions: values.instructions
        ? values.instructions.split(",").map((v) => v.trim())
        : [],
      lab: values.lab ? values.lab.split(",").map((v) => v.trim()) : [],
      preventive_advice: values.preventive_advice
        ? values.preventive_advice.split(",").map((v) => v.trim())
        : [],
      drug_allergies: values.drug_allergies
        ? values.drug_allergies.split(",").map((v) => v.trim())
        : [],
      vitals: values.vitals ? JSON.parse(values.vitals || "{}") : {},
      health_conditions: values.health_conditions
        ? JSON.parse(values.health_conditions || "{}")
        : {},
    };

    console.log("Prescription Submitted:", formatted);
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
