import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowPathIcon,
  PrinterIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import ServiceSection from "../components/ServiceSection";

// 🩵 Reusable input components
const baseInput =
  "border rounded-lg px-3 py-2 w-full text-sm focus:ring-2 focus:ring-sky-400 focus:outline-none";
const baseBtn =
  "px-4 py-2 rounded-lg text-sm font-medium focus:ring-2 focus:ring-offset-2";

const Input = ({ label, ...props }) => (
  <div>
    {label && (
      <label className="text-sm text-gray-600 block mb-1">{label}</label>
    )}
    <input {...props} className={`${baseInput} ${props.className || ""}`} />
  </div>
);

const Select = ({ label, children, ...props }) => (
  <div>
    {label && (
      <label className="text-sm text-gray-600 block mb-1">{label}</label>
    )}
    <select {...props} className={`${baseInput} ${props.className || ""}`}>
      {children}
    </select>
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

const OpdBilling = () => {
  const [selectedServices, setSelectedServices] = useState([]);

  const formik = useFormik({
    initialValues: {
      UHID: "",
      CenterName: "",
      ChiefComplaint: "",
      Name: "",
      Mobile: "",
      Gender: "",
      Age: "",
      DOB: "",
      Department: "",
      Doctor: "",
      FinCategory: "",
      ReferBy: "",
      VisitType: "",
      LastVisitDate: "",
      Quantity: 1,
      ServiceName: "",
      PreviousDue: "",
      TotalAmount: "",
      PaidAmount: "",
      CreditBalance: "",
      AdjustWithBalance: false,
      DueAmount: "",
      PayMode: "",
      CashAmount: "",
      CardAmount: "",
    },
    validationSchema: Yup.object({
      UHID: Yup.string().required("UHID is required"),
      Name: Yup.string().required("Name is required"),
      Mobile: Yup.string()
        .matches(/^[0-9]{10}$/, "Must be 10 digits")
        .required("Mobile is required"),
      Department: Yup.string().required("Department is required"),
      Doctor: Yup.string().required("Consulting doctor is required"),
      PayMode: Yup.string().required("Pay mode is required"),
    }),
    onSubmit: (values) => {
      console.log("Form Data:", { ...values, selectedServices });
      alert("✅ OPD Billing Saved Successfully!");
    },
  });

  // 🧮 Auto Age calculation
  const handleDOBChange = (e) => {
    formik.handleChange(e);
    const dob = new Date(e.target.value);
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();
    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const ageString = `${years}y ${months}m ${days}d`;
    formik.setFieldValue("Age", ageString);
  };

  // 💰 Auto Due Calculation
  useEffect(() => {
    const total = Number(formik.values.TotalAmount) || 0;
    const paid = Number(formik.values.PaidAmount) || 0;
    const due = total - paid;
    formik.setFieldValue("DueAmount", due > 0 ? due.toFixed(2) : "0.00");
  }, [formik.values.TotalAmount, formik.values.PaidAmount]);
  const handlePrintForm = () => {
    window.open("/print-opd-form", "_blank");
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-5 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-sky-700 mb-5 text-center">
        💳 OPD Billing Form
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        {/* ================= PATIENT DETAILS ================= */}
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Patient
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input {...formik.getFieldProps("UHID")} placeholder="UHID" />
            <Select {...formik.getFieldProps("CenterName")}>
              <option value="">Select Center</option>
              <option>Main Center</option>
              <option>Branch A</option>
            </Select>
            <textarea
              {...formik.getFieldProps("ChiefComplaint")}
              placeholder="Chief Complaint"
              className={`${baseInput} h-14`}
            />

            <Input {...formik.getFieldProps("Name")} placeholder="Name" />
            <Input {...formik.getFieldProps("Mobile")} placeholder="Mobile Number" />

            <Select {...formik.getFieldProps("Gender")}>
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </Select>

            <Input
              label="Date of Birth"
              type="date"
              {...formik.getFieldProps("DOB")}
              onChange={handleDOBChange}
              max={new Date().toISOString().split("T")[0]}
            />
            <Input
              label="Age"
              {...formik.getFieldProps("Age")}
              readOnly
              className="bg-gray-100 text-gray-600 cursor-not-allowed"
            />

            <Select {...formik.getFieldProps("Department")} label="Department">
              <option value="">Select Department</option>
              <option>Cardiology</option>
              <option>Pathology</option>
              <option>Orthopedics</option>
            </Select>

            <Select {...formik.getFieldProps("Doctor")}>
              <option value="">Consulting Doctor</option>
              <option>Dr. Sharma</option>
              <option>Dr. Mehta</option>
              <option>Dr. Khan</option>
            </Select>

            <Select {...formik.getFieldProps("FinCategory")}>
              <option value="">Financial Category</option>
              <option>General</option>
              <option>Corporate</option>
              <option>Insurance</option>
            </Select>

            <Select {...formik.getFieldProps("ReferBy")}>
              <option value="">Refer By</option>
              <option>Self</option>
              <option>Other Doctor</option>
            </Select>

            <Select
              label="Visit Type"
              {...formik.getFieldProps("VisitType")}
            >
              <option value="">Visit Type</option>
              <option>New</option>
              <option>Follow-up</option>
            </Select>

            <Input
              label="Last Visit Date"
              type="date"
              {...formik.getFieldProps("LastVisitDate")}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>
        </section>

        {/* ================= SERVICE DETAILS ================= */}
        <section>
          <ServiceSection
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
          />
        </section>

        {/* ================= BILLING DETAILS ================= */}
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Billing
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input {...formik.getFieldProps("PreviousDue")} placeholder="Previous Due Amount" />
            <Input {...formik.getFieldProps("TotalAmount")} placeholder="Total Amount" />
            <Input {...formik.getFieldProps("PaidAmount")} placeholder="Paid Amount" />
            <Input {...formik.getFieldProps("CreditBalance")} placeholder="Credit / Balance Amount" />

            <label className="flex items-center gap-2 text-gray-700 text-sm mt-2">
              <input
                type="checkbox"
                {...formik.getFieldProps("AdjustWithBalance")}
                checked={formik.values.AdjustWithBalance}
              />
              Adjust with Balance
            </label>

            <Input {...formik.getFieldProps("DueAmount")} placeholder="Due Amount" readOnly />

            <Select {...formik.getFieldProps("PayMode")}>
              <option value="">Select Pay Mode</option>
              <option>Cash</option>
              <option>Card</option>
              <option>UPI</option>
              <option>Cheque</option>
            </Select>

            <Input {...formik.getFieldProps("CashAmount")} placeholder="Cash Amount" />
            <Input {...formik.getFieldProps("CardAmount")} placeholder="Card / Online / UPI Amount" />
          </div>
        </section>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex justify-center flex-wrap gap-3 pt-6 border-t border-gray-100">
          <Button type="submit" variant="sky">
            <CheckCircleIcon className="w-5 h-5 inline mr-1" /> Save
          </Button>
          <Button type="button" variant="gray" onClick={formik.handleReset}>
            <ArrowPathIcon className="w-5 h-5 inline mr-1" /> Reset
          </Button>
          <Button type="button" variant="green">
            <PrinterIcon className="w-5 h-5 inline mr-1" /> Print
          </Button>
          <Button type="button" variant="outline" onClick={handlePrintForm}>
            Print Form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OpdBilling;
