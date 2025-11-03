import React from "react";
import FormBuilder from "../components/common/FormBuilder";
import * as Yup from "yup";

const OpdBilling = () => {
  const fields = [
    // 🧍 Patient Info
    { name: "PatientID", label: "Patient ID", type: "number", required: true },
    { name: "PicasoNo", label: "Picaso No", type: "text" },
    { name: "Mobile", label: "Mobile Number", type: "text", required: true },

    // 🏥 Service Info
    { name: "ServiceTypeID", label: "Service Type ID", type: "number", required: true },
    { name: "PatientType", label: "Patient Type", type: "select", options: ["General", "Corporate", "Insurance"] },
    { name: "DepartmentID", label: "Department ID", type: "number" },
    { name: "ConsultantDoctorID", label: "Consultant Doctor ID", type: "number" },
    { name: "Visitype", label: "Visit Type", type: "select", options: ["New", "Follow-up"] },

    // 💰 Financial Info
    { name: "TotalServiceAmount", label: "Total Service Amount", type: "number" },
    { name: "TotalDiscount", label: "Discount", type: "number" },
    { name: "DiscountBy", label: "Discount By", type: "text" },
    { name: "AdjustedAmount", label: "Adjusted Amount", type: "number" },
    { name: "HospitalCharge", label: "Hospital Charge", type: "number" },
    { name: "DoctorCharge", label: "Doctor Charge", type: "number" },
    { name: "PaidAmount", label: "Paid Amount", type: "number" },
    { name: "DueAmount", label: "Due Amount", type: "number" },

    // 💳 Payment Details
    { name: "CashAmount", label: "Cash Amount", type: "number" },
    { name: "CardAmount", label: "Card Amount", type: "number" },
    {
      name: "PayMode",
      label: "Payment Mode",
      type: "select",
      options: ["Cash", "Card", "UPI", "Cheque"],
    },
    { name: "BankName", label: "Bank Name", type: "text" },
    { name: "ChallanNo", label: "Challan No", type: "text" },

    // 🧾 Reference / Remarks
    { name: "ReferTo", label: "Referred To", type: "text" },
    { name: "Remarks", label: "Remarks", type: "textarea" },

    // ⚙️ Flags
    {
      name: "Isdiscount",
      label: "Discount Applied",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "SMSAlert",
      label: "Send SMS Alert",
      type: "select",
      options: ["Yes", "No"],
    },

    // 🏛️ System Fields
    { name: "HospitalID", label: "Hospital ID", type: "number", required: true },
    { name: "FinancialYearID", label: "Financial Year ID", type: "number" },
    { name: "CenterID", label: "Center ID", type: "number", required: true },
  ];

  const initialValues = fields.reduce((acc, cur) => {
    acc[cur.name] = "";
    return acc;
  }, {});

  const validationSchema = {
    PatientID: Yup.number().required("Patient ID is required"),
    Mobile: Yup.string()
      .matches(/^[0-9]{10}$/, "Must be 10 digits")
      .required("Mobile number is required"),
    ServiceTypeID: Yup.number().required("Service Type ID is required"),
    HospitalID: Yup.number().required("Hospital ID is required"),
    CenterID: Yup.number().required("Center ID is required"),
  };

  const handleSubmit = (values) => {
    console.log("OPD Billing Submitted:", values);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg border border-sky-100">
      <h2 className="text-2xl font-bold text-sky-700 mb-6 text-center">
        💳 OPD Billing Form
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

export default OpdBilling;
