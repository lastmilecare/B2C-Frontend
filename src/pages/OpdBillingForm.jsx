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
import { useGetPatientsByUhidQuery, useSearchUHIDQuery, useGetComboQuery, useCreateBillMutation, useUpdateBillMutation } from "../redux/apiSlice";
import { skipToken } from "@reduxjs/toolkit/query";
import { healthAlert } from "../utils/healthSwal";
import PrintOpdForm from "./PrintOpdForm";
import { useReactToPrint } from "react-to-print";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Input, Select, Button, baseInput } from "../components/FormControls";

const OpdBilling = () => {
  const navigate = useNavigate();
  const [isPaidManuallyEdited, setIsPaidManuallyEdited] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [uhidSearch, setUhidSearch] = useState("");
  const debouncedUhid = useDebounce(uhidSearch, 500);
  const [selectedUhid, setSelectedUhid] = useState("");
  const [suggestionsList, setSuggestionsList] = useState([]);
  const { data: doctors, isLoading: doctorsComboLoading } = useGetComboQuery("doctor");
  const { data: department, isLoading: departmentComboLoading } = useGetComboQuery("department");
  const { data: collectedBy, isLoading: collectedComboLoading } = useGetComboQuery("collectedBy");
  const { data: paymode, isLoading: paymodeComboLoading } = useGetComboQuery("paymode");
  const location = useLocation();
  const editData = location.state?.editData;
  const { ID: billNo } = useParams();

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
  const [updateBill] = useUpdateBillMutation();
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

  useEffect(() => {
    if (editData) {
      setUhidSearch(editData.uhid || "");
      setIsPaidManuallyEdited(true);
      setSelectedUhid(editData.uhid || "");
      populatedUhidRef.current = editData.uhid || "";

      formik.setValues({
        ...formik.initialValues,
        UHID: editData.uhid || "",
        Name: editData.patient_name || "",
        Mobile: editData.contactNumber || "",
        Gender: editData.gender || "",
        Age: editData.age || "",
        Department: editData.DepartmentID || 0,
        Doctor: editData.ConsultantDoctorID || 0,
        FinCategory: editData.patient_type || "",
        TotalAmount: editData.TotalServiceAmount || 0,
        PaidAmount: editData.PaidAmount || 0,
        DueAmount: editData.DueAmount || 0,
        PayMode: editData.PayMode || "",
        // VisitType: editData.VisitType || "N/A",
        ChiefComplaint: editData.Disease ? [{ name: editData.Disease }] : [],
      });
      if (editData.opd_billing_data) {
        const mapped = editData.opd_billing_data.map(s => ({
          id: s.ServiceID,
          name: s.ServiceName,
          price: s.ServiceAmount,
          quantity: s.Qty || 1,
          HospitalID: s.HospitalID,
          ServiceTypeID: s.ServiceTypeID
        }));
        setSelectedServices(mapped);
      }
    }
  }, [editData]);

  const parseDOB = (raw) => {
    if (!raw || !raw.includes("-")) return "";

    const [dd, mm, yyyy] = raw.split("-");
    return `${yyyy}-${mm}-${dd}`;
  };
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const buildPayload = (values) => {
    const pData = patientData || editData;
    if (!pData || !selectedServices.length) return null;
    const finalAmount = selectedServices.reduce(
      (sum, s) => sum + (s.ServiceAmount || s.price) * (s.Qty || s.quantity || 1),
      0
    )
    const chiefComplaintStr = Array.isArray(values.ChiefComplaint) && values.ChiefComplaint.length > 0
      ? values.ChiefComplaint.map((e) => e.name).join(", ")
      : "";
    const header = {

      PatientID: pData.PatientID || pData.id,
      PicasoNo: values.UHID,
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
      complaint: chiefComplaintStr,
    };

    const details = selectedServices.map((s) => ({
      ServiceTypeID: s.ServiceTypeID || 1,
      ServiceID: Number(s.id),
      ServiceName: s.name,
      ServiceAmount: Number(s.price),
      Qty: Number(s.quantity || 1),
      HospitalID: Number(s.HospitalID),
      FinancialYearID: currentYear,
      PatientID: pData.PatientID || pData.id,
      NetServiceAmount: Number(s.quantity * s.price),
      PicasoNo: values.UHID || pData.external_id,
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
      // VisitType: "",
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
            text: "Service or Patient detail missing please verify before proceeding.",
            icon: "error",
          });
          return;
        }
        if (editData && billNo) {
          await updateBill({
            id: Number(billNo),
            data: payload
          }).unwrap();
        }

        else {
          await createBill(payload).unwrap();
        }
        healthAlert({
          title: "OPD Billing",
          text: editData ? "Updated Successfully" : "Saved Successfully",
          icon: "success",
        });
        handleFormReset();
        navigate("/opd-billing");


      } catch (err) {
        healthAlert({
          title: "OPD Billing",
          text: err?.data?.message,
          icon: "error",
        });
      }
    },


  });
  const handleFormReset = () => {
    formik.resetForm();
    setSelectedServices([]);
    setUhidSearch("");
    setSelectedUhid("");
    setSuggestionsList([]);
    populatedUhidRef.current = "";
    setIsPaidManuallyEdited(false);
  };
  // Inside your component
  useEffect(() => {
    if (Object.keys(formik.errors).length > 0) {
    }
  }, [formik.errors]);


  useEffect(() => {
    if (!patientData) return;
    if (patientData.external_id !== selectedUhid) return;
    if (populatedUhidRef.current === selectedUhid) return;
    populatedUhidRef.current = selectedUhid;
     formik.setFieldValue(
    "PreviousDue",
    Number(patientData.previousDue || patientData.DueAmount || 0)
  );
    const updates = {
      UHID: patientData.external_id,
      Name: patientData.name || "",
      Gender: patientData.gender || "",
      Mobile: patientData.contactNumber || "",
      FinCategory: patientData.category || "",
      LastVisitDate: patientData.createdAt ? new Date(patientData.createdAt).toISOString().split("T")[0] : "",
      // VisitType: patientData?.VisitType || "N/A"
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


  // Future logic for the calcuation of due
  // useEffect(() => {
  //   const total = Number(formik.values.TotalAmount) || 0;
  //   const paid = Number(formik.values.PaidAmount) || 0;
  //   const due = total - paid;
  //   formik.setFieldValue("DueAmount", due > 0 ? due.toFixed(2) : "0.00");
  // }, [formik.values.TotalAmount, formik.values.PaidAmount]);

  useEffect(() => {
    const total = Number(formik.values.TotalAmount) || 0;
    const paid = Number(formik.values.PaidAmount) || 0;
    const credit = Number(formik.values.CreditBalance) || 0;
    const isAdjusting = formik.values.AdjustWithBalance;
    if (isAdjusting) {
      let due = total - paid - credit;
      if (due < 0) due = 0;
      formik.setFieldValue("DueAmount", due.toFixed(2));
      const amountBeingPaid = paid.toString();
      if (formik.values.PayMode === "1" || formik.values.PayMode === "") {
        formik.setFieldValue("CashAmount", amountBeingPaid);
        formik.setFieldValue("CardAmount", "0");
      } else {
        formik.setFieldValue("CardAmount", amountBeingPaid);
        formik.setFieldValue("CashAmount", "0");
      }
    } else {
      formik.setFieldValue("DueAmount", "0.00");
      const amountBeingPaid = paid.toString();
      if (formik.values.PayMode === "1" || formik.values.PayMode === "") {
        formik.setFieldValue("CashAmount", amountBeingPaid);
        formik.setFieldValue("CardAmount", "0");
      } else {
        formik.setFieldValue("CardAmount", amountBeingPaid);
        formik.setFieldValue("CashAmount", "0");
      }
    }

  }, [
    formik.values.AdjustWithBalance,
    formik.values.TotalAmount,
    formik.values.PaidAmount,
    formik.values.CreditBalance,
    formik.values.PayMode
  ]);


  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-5 rounded-2xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-sky-700 mb-5 text-center">
        {editData ? "📝 Edit OPD Bill" : "💳 OPD Billing Form"}
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
                className={`${baseInput} ${editData ? "bg-sky-50 cursor-not-allowed" : ""}`}
                placeholder="Search UHID (e.g., LMC-123)"
                value={uhidSearch || formik.values.UHID}
                readOnly={!!editData}
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
              onChange={(selected) => formik.setFieldValue("ChiefComplaint", selected)}
              required
            />

            <Input
              label="Name"
              {...formik.getFieldProps("Name")}
              readOnly
              className="bg-sky-50 cursor-not-allowed"
            />
            <Input
              label={
                <span>
                  Mobile <span className="text-red-500">*</span>
                </span>
              }
              {...formik.getFieldProps("Mobile")}
              readOnly
              className="bg-sky-50 cursor-not-allowed"
              error={formik.touched.Mobile && formik.errors.Mobile}
            />

            <Input
              label="Gender"
              {...formik.getFieldProps("Gender")}
              readOnly
              className="bg-sky-50 cursor-not-allowed"
            >
            </Input>

            <Input
              label="Date of Birth"
              type="date"
              {...formik.getFieldProps("DOB")}
              readOnly
              className="bg-sky-50 cursor-not-allowed"
              onChange={handleDOBChange}
              max={new Date().toISOString().split("T")[0]}
            />
            <Input
              label="Age"
              {...formik.getFieldProps("Age")}
              readOnly
              className="bg-sky-50 cursor-not-allowed"
            />


            <Select {...formik.getFieldProps("Department")}

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
              error={formik.touched.Doctor && formik.errors.Doctor}
              
              >
              <option value="">Consulting Doctor</option>
              {doctors?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name || d.doctor_name}
                  
                </option>
                
              ))}
            </Select>


            <Input {...formik.getFieldProps("FinCategory")} className="bg-sky-50 cursor-not-allowed" label="Category" readOnly>

            </Input>

            <Select {...formik.getFieldProps("ReferBy")} label="Refer By">
              <option value="">Refer By</option>
              {collectedBy?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>


            {/* <Input
              label="Visit Type"
              {...formik.getFieldProps("VisitType")}
              className="bg-gray-100 cursor-not-allowed"
              readOnly
            >
            </Input> */}

            <Input
              label="Last Visit Date"
              type="date"
              {...formik.getFieldProps("LastVisitDate")}
              max={new Date().toISOString().split("T")[0]}
              className="bg-sky-50 cursor-not-allowed"
              readOnly
            />
          </div>
        </section>
        <section>
          <ServiceSection
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            department={formik.values.Department}
            consultingDoctor={formik.values.Doctor}
            payMode={formik.values.PayMode}
            setBillingTotals={(total) => {
              const amount = Number(total || 0);
              formik.setFieldValue("TotalAmount", amount);
              if (!editData && !isPaidManuallyEdited) {
                formik.setFieldValue("PaidAmount", amount);
                if (formik.values.PayMode === "1" || formik.values.PayMode === "") {
                  formik.setFieldValue("CashAmount", amount);
                  formik.setFieldValue("CardAmount", 0);
                } else {
                  formik.setFieldValue("CardAmount", amount);
                  formik.setFieldValue("CashAmount", 0);
                }
              }
            }}

          />
        </section>

        {/* ================= BILLING DETAILS ================= */}
        <section>
          <h3 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-600 rounded-full"></span> Billing
            Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input {...formik.getFieldProps("PreviousDue")} placeholder="Previous Due Amount" className="bg-sky-50 cursor-not-allowed" disabled label="Previous Due" />
            <Input {...formik.getFieldProps("TotalAmount")} placeholder="Total Amount" className="bg-sky-50 cursor-not-allowed" disabled label="Total Amount" />
            <Input
              label="Paid Amount"
              inputMode="numeric"
              type="text"
              value={formik.values.PaidAmount}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                setIsPaidManuallyEdited(true);
                formik.setFieldValue("PaidAmount", Number(onlyNumbers || 0));
              }}
            />
            <Input
              label="Credit Balance"
              inputMode="numeric"
              type="text"
              value={formik.values.CreditBalance}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, "");
                formik.setFieldValue("CreditBalance", Number(onlyNumbers || 0));
              }}
            />


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

            <Input {...formik.getFieldProps("DueAmount")} placeholder="Due Amount" className="bg-sky-50 cursor-not-allowed" disabled label="Due Amount" />

            <Select {...formik.getFieldProps("PayMode")}
              label="Payment Mode"
              required
              // error={formik.touched.PayMode && formik.errors.PayMode}
              onChange={(e) => {
                const mode = e.target.value;
                formik.setFieldValue("PayMode", mode);


                const currentPaid = formik.values.PaidAmount;

                if (mode === "1") {
                  formik.setFieldValue("CashAmount", currentPaid);
                  formik.setFieldValue("CardAmount", "0");
                } else {
                  formik.setFieldValue("CardAmount", currentPaid);
                  formik.setFieldValue("CashAmount", "0");
                }
              }}
            >
              <option value="">Select Pay Mode</option>
              {paymode?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </Select>

            <Input
              {...formik.getFieldProps("CashAmount")}
              placeholder="Cash Amount"
              label="Cash Amount"
              readOnly
              className="bg-sky-50 cursor-not-allowed"
            />

            <Input
              {...formik.getFieldProps("CardAmount")}
              placeholder="Card / Online / UPI Amount"
              label="Card / Online / UPI Amount"
              readOnly
              className="bg-sky-50 cursor-not-allowed"
            />
          </div>
        </section>
        <div className="flex justify-center flex-wrap gap-3 pt-6 border-t border-gray-100">
          <Button type="submit" variant="sky">
            <CheckCircleIcon className="w-5 h-5 inline mr-1" /> {editData ? "Update" : "Save"}
          </Button>
          <Button type="button" variant="gray" onClick={handleFormReset}>
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

export default OpdBilling;
