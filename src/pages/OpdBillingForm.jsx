import React, { useState, useEffect, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  ArrowPathIcon,
  PrinterIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import ServiceSection from "../components/ServiceSection";
import DiseaseSelect from "../components/DiseaseSelect";
import useDebounce from "../hooks/useDebounce";
import { PAYMENT_TYPES } from "../utils/constants";
import { useGetPatientsByUhidQuery, useSearchUHIDQuery, useGetComboQuery } from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";


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
  const [uhidSearch, setUhidSearch] = useState("");
  const debouncedUhid = useDebounce(uhidSearch, 500);
  const [selectedUhid, setSelectedUhid] = useState("");
  const [suggestionsList, setSuggestionsList] = useState([]);
  const { data: doctors, isLoading: doctorsComboLoading } = useGetComboQuery("doctor");
  const { data: department, isLoading: departmentComboLoading } = useGetComboQuery("department");
  const { data: paymode, isLoading: paymodeComboLoading } = useGetComboQuery("paymode");
  const { data: collectedBy, isLoading: collectedComboLoading } = useGetComboQuery("collectedBy");
  // Track if we've already populated data for this UHID
  const populatedUhidRef = useRef("");

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

  const parseDOB = (raw) => {
    if (!raw || !raw.includes("-")) return "";

    const [dd, mm, yyyy] = raw.split("-");
    return `${yyyy}-${mm}-${dd}`;
  };

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
      Department: "",
      Doctor: "",
      FinCategory: "",
      ReferBy: "",
      VisitType: "",
      LastVisitDate: "",
      Quantity: 1,
      ServiceName: "",
      PreviousDue: "0",
      TotalAmount: "",
      PaidAmount: "",
      CreditBalance: "0",
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
      alert("✅ OPD Billing Saved Successfully!");
    },
  });

  useEffect(() => {
    if (!patientData) return;
    if (patientData.external_id !== selectedUhid) return;
    if (populatedUhidRef.current === selectedUhid) return;
    populatedUhidRef.current = selectedUhid;

    const updates = {
      UHID: patientData.external_id,
      Name: patientData.name || "",
      Gender: patientData.gender || "",
      Mobile: patientData.contactNumber || "",
      FinCategory: patientData.category || "",
      LastVisitDate: patientData.createdAt ? new Date(patientData.createdAt).toISOString().split("T")[0] : "",
      VisitType: patientData?.VisitType || "N/A"
    };

    if (patientData.dateOfBirthOrAge) {
      const dobValue = parseDOB(patientData.dateOfBirthOrAge);
      updates.DOB = dobValue;

      const dob = new Date(dobValue);
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

      updates.Age = `${years}y ${months}m ${days}d`;
    }

    // Set all values at once
    formik.setValues({ ...formik.values, ...updates }, false);
  }, [patientData, selectedUhid]); // Only these two dependencies


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

  useEffect(() => {
    const total = Number(formik.values.TotalAmount) || 0;
    const paid = Number(formik.values.PaidAmount) || 0;
    const due = total - paid;
    formik.setFieldValue("DueAmount", due > 0 ? due.toFixed(2) : "0.00");
  }, [formik.values.TotalAmount, formik.values.PaidAmount]);

  const handlePrintForm = () => {
    window.open("/print-opd-form", "_blank");
  };
  console.log(uhidSearch, formik.values.UHID)
  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-5 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-sky-700 mb-5 text-center">
        💳 OPD Billing Form
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Patient
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <label className="text-sm text-gray-600 block mb-1">UHID</label>

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


            <DiseaseSelect
              label="Complaint"
              value={formik.values.ChiefComplaint}
              onChange={(selected) => formik.setFieldValue("diseases", selected)}
              required
            />
            <Input
              label="Name"
              {...formik.getFieldProps("Name")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />
            <Input
              label="Mobile"
              {...formik.getFieldProps("Mobile")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />

            <Input
              label="Gender"
              {...formik.getFieldProps("Gender")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            >
            </Input>

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
              className="bg-gray-100 cursor-not-allowed"
            />


            <Select {...formik.getFieldProps("Department")} label="Department">
              <option value="">Select Department</option>
              {department?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>


            <Select {...formik.getFieldProps("Doctor")} label="Doctor">
              <option value="">Consulting Doctor</option>
              {doctors?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name || d.doctor_name}
                </option>
              ))}
            </Select>


            <Input {...formik.getFieldProps("FinCategory")} className="bg-gray-100 cursor-not-allowed" label="Category" readOnly>

            </Input>

            <Select {...formik.getFieldProps("ReferBy")} label="Refer By">
              <option value="">Refer By</option>
              {collectedBy?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>


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

        {/* ================= SERVICE DETAILS ================= */}
        <section>
          <ServiceSection
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            // uhid={uhidSearch || formik.values.UHID}
            department={formik.values.Department}
            consultingDoctor={formik.values.Doctor}
            payMode={formik.values.PayMode}
            setBillingTotals={(total) => formik.setFieldValue("TotalAmount", total)}
          />
        </section>

        {/* ================= BILLING DETAILS ================= */}
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Billing
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input {...formik.getFieldProps("PreviousDue")} placeholder="Previous Due Amount" disabled label="Previous Due" />
            <Input {...formik.getFieldProps("TotalAmount")} placeholder="Total Amount" disabled label="Total Amount" />
            <Input {...formik.getFieldProps("PaidAmount")} placeholder="Paid Amount" label="Paid Amount" />
            <Input {...formik.getFieldProps("CreditBalance")} placeholder="Credit / Balance Amount" label="Credit Balance" />

            <label className="flex items-center gap-2 text-gray-700 text-sm mt-2">
              <input
                type="checkbox"
                {...formik.getFieldProps("AdjustWithBalance")}
                checked={formik.values.AdjustWithBalance}
                disabled
              />
              Adjust with Balance
            </label>

            <Input {...formik.getFieldProps("DueAmount")} placeholder="Due Amount" disabled label="Due Amount" />

            <Select {...formik.getFieldProps("PayMode")} label="Payment Mode">
              <option value="">Select Pay Mode</option>
              {PAYMENT_TYPES.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </Select>

            <Input {...formik.getFieldProps("CashAmount")} placeholder="Cash Amount" label="Cash Amount" />
            <Input {...formik.getFieldProps("CardAmount")} placeholder="Card / Online / UPI Amount" label="Card / Online / UPI Amount" />
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