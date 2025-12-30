import React, { useState, useEffect, useRef } from "react";
import { Formik, useFormik } from "formik";
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
import { useGetPatientsByUhidQuery, useSearchUHIDQuery, useGetComboQuery, useCreateBillMutation } from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { healthAlert, healthAlerts } from "../utils/healthSwal";
import PrintOpdForm from "./PrintOpdForm";
import { useReactToPrint } from "react-to-print";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";

const baseInput =
  "border border-gray-300 rounded-lg px-3 py-2 w-full text-sm " +
  "focus:ring-2 focus:ring-sky-400 focus:border-sky-500 " +
  "transition";
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
  const [selectedServices, setSelectedServices] = useState([]);
  const [uhidSearch, setUhidSearch] = useState("");
  const debouncedUhid = useDebounce(uhidSearch, 500);
  const [selectedUhid, setSelectedUhid] = useState("");
  const [suggestionsList, setSuggestionsList] = useState([]);
  const { data: doctors, isLoading: doctorsComboLoading } = useGetComboQuery("doctor");
  const { data: department, isLoading: departmentComboLoading } = useGetComboQuery("department");
  const { data: collectedBy, isLoading: collectedComboLoading } = useGetComboQuery("collectedBy");
  const { data: paymode, isLoading: paymodeComboLoading } = useGetComboQuery("paymode");
  const [prescriptionList, setPrescriptionList] = useState([]);

  // Track if we've already populated data for this UHID
  const populatedUhidRef = useRef("");

  const [printRow, setPrintRow] = useState(null);
  const printRef = useRef();
  useEffect(() => {
    if (printRow && printRef.current) {
      handlePrint();

      setTimeout(() => {
        setPrintRow(null);
      }, 300);
    }
  }, [printRow]);

  const onPrintCS = (row) => {
    setPrintRow(row);
  };
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "Opd"
  });

  const { data: patientData, isFetching } = useGetPatientsByUhidQuery(
    selectedUhid && selectedUhid.trim() !== ""
      ? { uhid: selectedUhid }
      : skipToken
  );

  const [createBill, { isLoading: isCreating, error: createError }] = useCreateBillMutation();

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
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const buildPayload = (values) => {

    if (!patientData || !selectedServices.length) return null;
    const finalAmount = selectedServices.reduce(
      (sum, s) => sum + (s.ServiceAmount || s.price) * (s.Qty || s.quantity || 1),
      0
    )
    const chiefComplaintStr = Array.isArray(values.ChiefComplaint) && values.ChiefComplaint.length > 0
      ? values.ChiefComplaint.map((e) => e.name).join(", ")
      : "";
    const header = {
      PatientID: patientData.id,
      PicasoNo: values.UHID || patientData.external_id,
      Mobile: values.Mobile,
      ServiceTypeID: selectedServices[0]?.ServiceTypeID || 1,
      PatientType: values.FinCategory == "BPL" ? 1 : 2,   // NEED TO CHECK VALUE
      PaidAmount: Number(values.PaidAmount || 0),
      CashAmount: Number(values.CashAmount || 0),
      CardAmount: Number(values.CardAmount || 0),
      PayMode: Number(values.PayMode),
      DueAmount: Number(values.DueAmount || 0),
      AddedBy: 178, // this need to add user id
      DepartmentID: values.Department,
      ConsultantDoctorID: Number(values.Doctor),
      DoctorId: Number(values.Doctor),
      TotalServiceAmount: finalAmount,
      HospitalID: selectedServices[0]?.HospitalID || 1,
      FinancialYearID: currentYear,
      CenterID: 49, // Need to manage Center id
      ReferTo: Number(values.ReferBy || 0),
      IsActive: true,
      complaint: chiefComplaintStr
    };

    const details = selectedServices.map((s) => ({
      ServiceTypeID: s.ServiceTypeID || 1,
      ServiceID: Number(s.id),
      ServiceName: s.name,
      ServiceAmount: Number(s.price),
      Qty: Number(s.quantity || 1),
      HospitalID: Number(s.HospitalID),
      FinancialYearID: currentYear,
      PatientID: patientData.id,
      NetServiceAmount: Number(s.quantity * s.price),
      PicasoNo: values.UHID || patientData.external_id,
      HospitalCharge: 0,
      DoctorCharge: 0,
      Discount: 0,
      Isdiscount: false,
      DiscountBy: 0,
      DoctorID: Number(values.Doctor),
      AddedBy: 1, //Need to manage this
      MonthID: currentMonth,
      IsActive: true
    }));

    return { header, details };
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
    formik.setValues({ ...formik.values, ...updates }, false);
  }, [patientData, selectedUhid]);

  useEffect(() => {
    const total = Number(formik.values.TotalAmount) || 0;
    const paid = Number(formik.values.PaidAmount) || 0;
    const credit = Number(formik.values.CreditBalance) || 0;
    const isAdjusting = formik.values.AdjustWithBalance;
    if (isAdjusting) {
      let due = total - paid - credit;
      if (due < 0) due = 0;

      formik.setFieldValue("DueAmount", due.toFixed(2));
    } else {
      formik.setFieldValue("DueAmount", "0.00");
    }

  }, [
    formik.values.AdjustWithBalance,
    formik.values.TotalAmount,
    formik.values.PaidAmount,
    formik.values.CreditBalance
  ]);
  const handleAddPrescription = () => {
    const {
      medicine,
      typemedicine,
      dosage,
      dosageinstructions,
      preferredtime,
      duration
    } = formik.values;
    if (
      !medicine ||
      !typemedicine ||
      !dosage ||
      !duration
    ) {

      healthAlerts.warning("Please fill all mandatory medicine fields");
      return;
    }

    const newItem = {
      medicine,
      type: typemedicine,
      dosage,
      instructions: dosageinstructions,
      preferredTime: preferredtime,
      duration,
    };

    setPrescriptionList((prev) => [...prev, newItem]);

    // Clear only prescription fields
    formik.setValues({
      ...formik.values,
      medicine: "",
      typemedicine: "",
      dosage: "",
      dosageinstructions: "",
      preferredtime: "",
      duration: "",
    });
  };
  const handleDeletePrescription = (index) => {
    setPrescriptionList((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };


  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-6 rounded-2xl shadow border border-gray-200">
      <h2 className="text-2xl font-bold text-sky-700 mb-5 text-center">
        💳 Prescription Form
      </h2>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Patient
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <label className="text-sm text-gray-600 block mb-1">Bill No <span className="text-red-500">*</span></label>

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

            <Input
              label="Name"
              {...formik.getFieldProps("Name")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            />

            <Input
              label="UHID"
              {...formik.getFieldProps("uhid")}
              readOnly
              className="bg-gray-100 cursor-not-allowed"
            >
            </Input>

            <Input
              label="Age"
              {...formik.getFieldProps("Age")}
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
            <Input {...formik.getFieldProps("FinCategory")} className="bg-gray-100 cursor-not-allowed" label="Category" readOnly>
            </Input>


            {/* <Input {...formik.getFieldProps("bpsystolic")} className="bg-gray-100 cursor-not-allowed" label="BP Systolic" >
            </Input>
            <Input {...formik.getFieldProps("bpdiastolic")} className="bg-gray-100 cursor-not-allowed" label="BP Diastolic" >
            </Input>
            <Input {...formik.getFieldProps("pulserate")} className="bg-gray-100 cursor-not-allowed" label="Pulse Rate" >
            </Input>
            <Input {...formik.getFieldProps("spo2")} className="bg-gray-100 cursor-not-allowed" label="SPO2" >
            </Input>
            <Input {...formik.getFieldProps("temprature")} className="bg-gray-100 cursor-not-allowed" label="Temperature" >
            </Input>
            <Input {...formik.getFieldProps("height")} className="bg-gray-100 cursor-not-allowed" label="Height" >
            </Input>
            <Input {...formik.getFieldProps("weight")} className="bg-gray-100 cursor-not-allowed" label="Weight" >
            </Input> */}
          </div>
        </section>
        <section className="mt-6">
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span>
            Vitals & Examination
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input {...formik.getFieldProps("bpsystolic")} label="BP Systolic (mmHg)" />
            <Input {...formik.getFieldProps("bpdiastolic")} label="BP Diastolic (mmHg)" />
            <Input {...formik.getFieldProps("pulserate")} label="Pulse (bpm)" />
            <Input {...formik.getFieldProps("spo2")} label="SPO2 (%)" />
            <Input {...formik.getFieldProps("temprature")} label="Temperature (°C)" />
            <Input {...formik.getFieldProps("height")} label="Height (cm)" />
            <Input {...formik.getFieldProps("weight")} label="Weight (kg)" />
          </div>
        </section>


        {/* ================= BILLING DETAILS ================= */}        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Prescription
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input {...formik.getFieldProps("otherinstrution")} placeholder="Other Instructions " className="bg-gray-100 cursor-not-allowed" label="Other Instructions" />
            <DiseaseSelect
              label="Complaint"
              value={formik.values.ChiefComplaint}
              onChange={(selected) => formik.setFieldValue("ChiefComplaint", selected)}
              required
            />
            <Input {...formik.getFieldProps("labs")} placeholder="Labs" className="bg-gray-100 cursor-not-allowed"  label="Labs" />
            <Input {...formik.getFieldProps("otherlabs")} placeholder="Other Labs" label="Other Labs" />
            <Input {...formik.getFieldProps("followup")} placeholder="Next Follow-up days" label="Next Follow-up days" />
            <Input {...formik.getFieldProps("advice")} placeholder="Preventive Advice" label="Preventive Advice" />
            <Input {...formik.getFieldProps("history")} placeholder="History" label="History" />
          </div>
        </section>
        {/* ================= Medical Prescription DETAILS ================= */}
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Medical Prescription
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input {...formik.getFieldProps("medicine")} placeholder="Name of Medicine" label="Name of Medicine *" />
            <Input {...formik.getFieldProps("typemedicine")} placeholder="Type of Medicine" label="Type of Medicine *" />
            <Input {...formik.getFieldProps("dosage")} placeholder="Dosage pills " label="Dosage pills*" />
            <Input {...formik.getFieldProps("dosageinstructions")} placeholder="Instructions " label="Instructions *" />
            <Input {...formik.getFieldProps("preferredtime")} placeholder="Preferred Time" label="Preferred Time *" />
            <Input {...formik.getFieldProps("duration")} placeholder="Duration (in days)" label="Duration (in days) *" />
            <button
              type="button"
              onClick={handleAddPrescription}
              title="Add medicine"
              className="h-9 w-9 flex items-center justify-center rounded-full
             bg-emerald-600 text-white hover:bg-emerald-700
             focus:ring-2 focus:ring-emerald-500"
            >
              <PlusIcon className="h-5 w-5" />
            </button>


            {prescriptionList.length > 0 && (
              <div className="mt-4 rounded-lg border bg-white shadow-sm">
                <div className="px-4 py-2 font-semibold text-gray-700 border-b bg-gray-50">
                  Prescribed Medicines
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                      <tr>
                        <th className="px-3 py-2 text-left">SL No</th>
                        <th className="px-3 py-2 text-left">Medicine</th>
                        <th className="px-3 py-2 text-left">Type</th>
                        <th className="px-3 py-2 text-left">Dosage</th>
                        <th className="px-3 py-2 text-left">Time</th>
                        <th className="px-3 py-2 text-left">Days</th>
                        <th className="px-3 py-2 text-center">Delete</th>
                      </tr>
                    </thead>

                    <tbody>
                      {prescriptionList.map((item, index) => (
                        <tr
                          key={index}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2 font-medium">
                            {item.medicine}
                          </td>
                          <td className="px-3 py-2">{item.type}</td>
                          <td className="px-3 py-2">{item.dosage}</td>
                          <td className="px-3 py-2">{item.preferredTime || "-"}</td>
                          <td className="px-3 py-2">{item.duration}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeletePrescription(index)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}




          </div>
        </section>

        <div className="flex justify-center flex-wrap gap-3 pt-6 border-t border-gray-100">
          <Button type="submit" variant="sky">
            <CheckCircleIcon className="w-5 h-5 inline mr-1" /> Save
          </Button>
          <Button type="button" variant="gray" onClick={formik.handleReset}>
            <ArrowPathIcon className="w-5 h-5 inline mr-1" /> Reset
          </Button>
          <Button type="button" variant="outline" onClick={onPrintCS}>
            Print CS
          </Button>
        </div>
      </form>
      {printRow && (
        <div style={{ display: 'none' }}>
          <PrintOpdForm ref={printRef} data={printRow} />
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;
