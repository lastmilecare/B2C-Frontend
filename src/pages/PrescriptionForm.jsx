import React from "react";
import FormBuilder from "../components/common/FormBuilder";
import * as Yup from "yup";

const PrescriptionForm = () => {
  const fields = [
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
    {
      name: "vitals",
      label: "Vitals (JSON)",
      type: "textarea",
      placeholder: '{"bp":"120/80","pulse":"72"}',
    },
    {
      name: "health_conditions",
      label: "Health Conditions (JSON)",
      type: "textarea",
      placeholder: '{"diabetes":true,"hypertension":false}',
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
