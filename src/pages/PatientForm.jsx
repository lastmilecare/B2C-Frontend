import React from "react";
import FormBuilder from "../components/common/FormBuilder";
import * as Yup from "yup";

const PatientRegistration = () => {
  const fields = [
    // Basic Info
    { name: "name", label: "Full Name", type: "text", required: true },
    { name: "dateOfBirthOrAge", label: "Date of Birth", type: "date" },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    { name: "contactNumber", label: "Contact Number", type: "text", required: true },
    { name: "email", label: "Email", type: "email" },
    { name: "healthCardNumber", label: "Health Card Number", type: "text" },
    { name: "abhaNumber", label: "ABHA Number", type: "text" },

    // Address
    { name: "localAddress", label: "Local Address", type: "text" },
    { name: "localAddressDistrict", label: "District", type: "text" },
    { name: "localAddressState", label: "State", type: "text" },
    { name: "pin", label: "Pin Code", type: "text" },

    // Emergency
    { name: "emergencyContactName", label: "Emergency Contact Name", type: "text" },
    { name: "emergencyContactNumber", label: "Emergency Contact Number", type: "text" },

    // Identification
    { name: "idProof_name", label: "ID Proof Type", type: "text" },
    { name: "idProof_number", label: "ID Proof Number", type: "text" },
    { name: "blood_group", label: "Blood Group", type: "select", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
    {
      name: "preferred_language",
      label: "Preferred Language",
      type: "select",
      options: ["English", "Hindi", "Other"],
    },
  ];

  const initialValues = fields.reduce((acc, cur) => {
    acc[cur.name] = "";
    return acc;
  }, {});

  const validationSchema = {
    name: Yup.string().required("Name is required"),
    contactNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "Must be 10 digits")
      .required("Contact Number is required"),
    email: Yup.string().email("Invalid email address"),
  };

  const handleSubmit = (values) => {
    console.log("Form Data:", values);
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 bg-white p-8 rounded-2xl shadow-lg border border-sky-100">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">
        🏥 Patient Registration
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

export default PatientRegistration;
